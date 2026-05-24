'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [events, setEvents] = useState<any[]>([])
  const [eventName, setEventName] = useState('')
  const [eventDatum, setEventDatum] = useState('')
  const [eventOrt, setEventOrt] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setLoading(false)
        loadEvents()
      }
    }
    checkUser()
  }, [router])

  const loadEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('datum', { ascending: false })
    setEvents(data || [])
  }

  const createEvent = async () => {
    if (!eventName || !eventDatum) {
      setMessage('Name und Datum sind Pflichtfelder!')
      return
    }
    const { error } = await supabase.from('events').insert({
      name: eventName,
      datum: eventDatum,
      ort: eventOrt,
    })
    if (error) {
      setMessage('Fehler beim Erstellen!')
    } else {
      setMessage('Event erstellt!')
      setEventName('')
      setEventDatum('')
      setEventOrt('')
      loadEvents()
    }
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage('Bitte Fotos auswählen!')
      return
    }
    if (!selectedEvent) {
      setMessage('Bitte Event auswählen!')
      return
    }

    setUploading(true)
    setMessage('Fotos werden hochgeladen...')

    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('files', file))
    formData.append('eventId', selectedEvent)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      setMessage(data.message || 'Fertig!')
    } catch {
      setMessage('Fehler beim Hochladen!')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <p style={{ padding: '40px' }}>Lade...</p>

  return (
    <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>⚙️ Admin</h1>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2>Event erstellen</h2>
        <input
          type="text"
          placeholder="Event Name (z.B. FC Basel vs YB)"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' }}
        />
        <input
          type="date"
          value={eventDatum}
          onChange={(e) => setEventDatum(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' }}
        />
        <input
          type="text"
          placeholder="Ort (optional)"
          value={eventOrt}
          onChange={(e) => setEventOrt(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' }}
        />
        <button
          onClick={createEvent}
          style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
        >
          Event erstellen
        </button>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2>Fotos hochladen</h2>
        <select
          value={selectedEvent || ''}
          onChange={(e) => setSelectedEvent(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' }}
        >
          <option value="">Event auswählen...</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name} — {event.datum}
            </option>
          ))}
        </select>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(e.target.files)}
          style={{ margin: '10px 0', display: 'block' }}
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
        >
          {uploading ? 'Lädt...' : 'Fotos hochladen'}
        </button>
      </div>

      {message && <p style={{ fontWeight: 'bold', color: 'green' }}>{message}</p>}

      <div>
        <h2>Alle Events</h2>
        {events.length === 0 && <p>Noch keine Events.</p>}
        {events.map((event) => (
          <div key={event.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px' }}>
            <strong>{event.name}</strong><br />
            📅 {event.datum} {event.ort && `— 📍 ${event.ort}`}
          </div>
        ))}
      </div>
    </div>
  )
}