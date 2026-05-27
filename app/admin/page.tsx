'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [liga, setLiga] = useState('')
  const [ort, setOrt] = useState('')
  const [sponsorName, setSponsorName] = useState('')
  const [sponsorLogo, setSponsorLogo] = useState<File | null>(null)
  const [sponsorLogoPreview, setSponsorLogoPreview] = useState<string | null>(null)
  const [sponsorLogoName, setSponsorLogoName] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [files, setFiles] = useState<FileList | null>(null)
  const [fileNames, setFileNames] = useState('')
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
        setUser(session.user)
        setLoading(false)
        loadEvents(session.user.id)
      }
    }
    checkUser()
  }, [router])

  const loadEvents = async (userId: string) => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    setEvents(data || [])
  }

  const handleSponsorLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSponsorLogo(file)
      setSponsorLogoPreview(URL.createObjectURL(file))
      setSponsorLogoName(file.name)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files
    if (f && f.length > 0) {
      setFiles(f)
      setFileNames(f.length === 1 ? f[0].name : `${f.length} Dateien ausgewählt`)
    }
  }

  const uploadSponsorLogo = async (file: File): Promise<string | null> => {
    const filename = `sponsor_${Date.now()}_${file.name}`
    const { error } = await supabase.storage
      .from('sponsor-logos')
      .upload(filename, file, { contentType: file.type })
    if (error) return null
    const { data: urlData } = supabase.storage.from('sponsor-logos').getPublicUrl(filename)
    return urlData.publicUrl
  }

  const createEvent = async () => {
    if (!homeTeam || !awayTeam || !date) {
      setMessage('Heimteam, Gastteam und Datum sind Pflichtfelder!')
      return
    }
    let sponsorLogoUrl = null
    if (sponsorLogo) {
      setMessage('Sponsor Logo wird hochgeladen...')
      sponsorLogoUrl = await uploadSponsorLogo(sponsorLogo)
    }
    const { error } = await supabase.from('events').insert({
      home_team: homeTeam,
      away_team: awayTeam,
      date: date,
      time: time,
      liga: liga,
      ort: ort,
      sponsor_name: sponsorName,
      sponsor_logo_url: sponsorLogoUrl,
      user_id: user.id,
    })
    if (error) {
      setMessage('Fehler: ' + error.message)
    } else {
      setMessage('✅ Spiel erstellt!')
      setHomeTeam('')
      setAwayTeam('')
      setDate('')
      setTime('')
      setLiga('')
      setOrt('')
      setSponsorName('')
      setSponsorLogo(null)
      setSponsorLogoPreview(null)
      setSponsorLogoName('')
      loadEvents(user.id)
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
      setFiles(null)
      setFileNames('')
    } catch {
      setMessage('Fehler beim Hochladen!')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <p style={{ padding: '40px' }}>Lade...</p>

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <nav style={{ background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>
            ← Dashboard
          </button>
          <button onClick={() => router.push('/meine-events')}
            style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>
            Meine Events
          </button>
        </div>
      </nav>

      <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Admin</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>⚽ Spiel erstellen</h1>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <input type="text" placeholder="Heimteam (z.B. FC Kickers Luzern)" value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <input type="text" placeholder="Gastteam (z.B. FC Brunnen)" value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <select value={liga} onChange={(e) => setLiga(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }}>
            <option value="">Liga auswählen...</option>
            <option value="Super League">Super League</option>
            <option value="Challenge League">Challenge League</option>
            <option value="Promotion League">Promotion League</option>
            <option value="1. Liga">1. Liga</option>
            <option value="2. Liga interregional">2. Liga interregional</option>
            <option value="2. Liga regional">2. Liga regional</option>
            <option value="3. Liga">3. Liga</option>
            <option value="4. Liga">4. Liga</option>
            <option value="5. Liga">5. Liga</option>
            <option value="6. Liga">6. Liga</option>
          </select>
          <input type="text" placeholder="Ort (optional)" value={ort}
            onChange={(e) => setOrt(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />

          <div style={{ borderTop: '1px solid #1c2a38', marginTop: '16px', paddingTop: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#e8eef4' }}>🏢 Sponsor (optional)</h3>
            <input type="text" placeholder="Sponsor Name (z.B. Migros)" value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
            <div style={{ margin: '8px 0' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#667788', marginBottom: 8 }}>
                Sponsor Logo (wird als Wasserzeichen verwendet):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1c2a38', color: '#e8eef4', borderRadius: 6, cursor: 'pointer', fontSize: 14, border: '1px solid #2a3a4a', fontWeight: 600 }}>
                  📁 Logo auswählen
                  <input type="file" accept="image/*" onChange={handleSponsorLogo} style={{ display: 'none' }} />
                </label>
                {sponsorLogoName && <span style={{ color: '#667788', fontSize: 13 }}>✓ {sponsorLogoName}</span>}
              </div>
            </div>
            {sponsorLogoPreview && (
              <img src={sponsorLogoPreview} alt="Logo Vorschau"
                style={{ height: '60px', marginTop: '8px', objectFit: 'contain', background: '#131e2a', padding: '4px', borderRadius: '4px' }} />
            )}
          </div>

          <button onClick={createEvent}
            style={{ padding: '12px 32px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 900, marginTop: '16px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Spiel erstellen
          </button>
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <h2 style={{ marginTop: 0, color: '#e8eef4' }}>📸 Fotos hochladen</h2>
          <select value={selectedEvent || ''} onChange={(e) => setSelectedEvent(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }}>
            <option value="">Spiel auswählen...</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.home_team} vs {event.away_team} — {event.date}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1c2a38', color: '#e8eef4', borderRadius: 6, cursor: 'pointer', fontSize: 14, border: '1px solid #2a3a4a', fontWeight: 600 }}>
              📁 Dateien auswählen
              <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            {fileNames && <span style={{ color: '#667788', fontSize: 13 }}>✓ {fileNames}</span>}
          </div>
          <button onClick={handleUpload} disabled={uploading}
            style={{ padding: '12px 32px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
            {uploading ? 'Lädt...' : 'Fotos hochladen'}
          </button>
        </div>

        {message && (
          <div style={{ padding: '16px', background: message.startsWith('Fehler') ? 'rgba(255,68,68,0.1)' : 'rgba(68,255,136,0.1)', border: `1px solid ${message.startsWith('Fehler') ? '#ff4444' : '#44ff88'}`, borderRadius: '8px', color: message.startsWith('Fehler') ? '#ff4444' : '#44ff88', fontWeight: 'bold' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}