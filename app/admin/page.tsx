'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [events, setEvents] = useState<any[]>([])
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [liga, setLiga] = useState('')
  const [ort, setOrt] = useState('')
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
    const { data } = await supabase.from('events').select('*').order('date', { ascending: false })
    setEvents(data || [])
  }

  const createEvent = async () => {
    if (!homeTeam || !awayTeam || !date) {
      setMessage('Heimteam, Gastteam und Datum sind Pflichtfelder!')
      return
    }
    const { error } = await supabase.from('events').insert({
      home_team: homeTeam,
      away_team: awayTeam,
      date: date,
      time: time,
      liga: liga,
      ort: ort,
    })
    if (error) {
      console.error(error)
      setMessage('Fehler: ' + error.message)
    } else {
      setMessage('✅ Spiel erstellt!')
      setHomeTeam('')
      setAwayTeam('')
      setDate('')
      setTime('')
      setLiga('')
      setOrt('')
      loadEvents()
    }
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage('Bitte Fotos auswählen!')
      return
    }
    if (!selectedEvent) {
      setMessage('Bitte Spiel auswählen!')
      return
    }
    setUploading(true)
    setMessage('Fotos werden hochgeladen...')
    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('files', file))
    formData.append('eventId', selectedEvent)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
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
        <h2>⚽ Spiel erstellen</h2>
        <input
          type="text"
          placeholder="Heimteam (z.B. FC Kickers Luzern)"
          value={homeTeam}
          onChange={(e) => setHomeTeam(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' }}
        />
        <input
          type="text"
          placeholder="Gastteam (z.B. FC Brunnen)"
          value={awayTeam}
          onChange={(e) => setAwayTeam(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' }}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' }}
        />
        <input
          type="text"
          placeholder="Liga (z.B. 4. Liga)"
          value={liga}
          onChange={(e) => setLiga(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' }}
        />
        <input
          type="text"
          placeholder="Ort (optional)"
          value={ort}
          onChange={(e) => setOrt(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' }}
        />
        <button
          onClick={createEvent}
          style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
        >
          Spiel erstellen
        </button>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2>📸 Fotos hochladen</h2>
        <select
          value={selectedEvent || ''}
          onChange={(e) => setSelectedEvent(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' }}
        >
          <option value="">Spiel auswählen...</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.home_team} vs {event.away_team} — {event.date}
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

      {message && <p style={{ fontWeight: 'bold', color: message.startsWith('Fehler') ? 'red' : 'green' }}>{message}</p>}

      <div>
        <h2>Alle Spiele</h2>
        {events.length === 0 && <p>Noch keine Spiele.</p>}
        {events.map((event) => (
          <div key={event.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px' }}>
            <strong>⚽ {event.home_team} vs {event.away_team}</strong><br />
            📅 {event.date} {event.time && `🕐 ${event.time}`}<br />
            {event.liga && `🏆 ${event.liga}`} {event.ort && `— 📍 ${event.ort}`}
          </div>
        ))}
      </div>
    </div>
  )
}