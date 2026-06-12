'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
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
  const [eventBild, setEventBild] = useState<File | null>(null)
  const [eventBildPreview, setEventBildPreview] = useState<string | null>(null)
  const [eventBildName, setEventBildName] = useState('')
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)
  const [createdEventName, setCreatedEventName] = useState<string>('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [fileNames, setFileNames] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login') } else { setUser(session.user); setLoading(false) }
    }
    checkUser()
  }, [router])

  const handleSponsorLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setSponsorLogo(file); setSponsorLogoPreview(URL.createObjectURL(file)); setSponsorLogoName(file.name) }
  }

  const handleEventBild = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setEventBild(file); setEventBildPreview(URL.createObjectURL(file)); setEventBildName(file.name) }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files
    if (f && f.length > 0) { setFiles(f); setFileNames(f.length === 1 ? f[0].name : `${f.length} Dateien ausgewählt`) }
  }

  const uploadSponsorLogo = async (file: File): Promise<string | null> => {
    const filename = `sponsor_${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('sponsor-logos').upload(filename, file, { contentType: file.type })
    if (error) return null
    const { data: urlData } = supabase.storage.from('sponsor-logos').getPublicUrl(filename)
    return urlData.publicUrl
  }

  const uploadEventBild = async (file: File): Promise<string | null> => {
    const filename = `event_${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('sponsor-logos').upload(filename, file, { contentType: file.type })
    if (error) return null
    const { data: urlData } = supabase.storage.from('sponsor-logos').getPublicUrl(filename)
    return urlData.publicUrl
  }

  const createEvent = async () => {
    if (!homeTeam || !awayTeam || !date) { setMessage('Heimteam, Gastteam und Datum sind Pflichtfelder!'); return }
    let sponsorLogoUrl = null
    let bildUrl = null
    if (sponsorLogo) { setMessage('Sponsor Logo wird hochgeladen...'); sponsorLogoUrl = await uploadSponsorLogo(sponsorLogo) }
    if (eventBild) { setMessage('Event Bild wird hochgeladen...'); bildUrl = await uploadEventBild(eventBild) }
    const { data, error } = await supabase.from('events').insert({
      home_team: homeTeam, away_team: awayTeam, date, time, liga, ort,
      sponsor_name: sponsorName, sponsor_logo_url: sponsorLogoUrl,
      bild_url: bildUrl, user_id: user.id,
    }).select().single()
    if (error) {
      setMessage('Fehler: ' + error.message)
    } else {
      setCreatedEventId(data.id)
      setCreatedEventName(`${homeTeam} vs ${awayTeam}`)
      setMessage('✅ Spiel erstellt! Jetzt kannst du Fotos hochladen.')
      setHomeTeam(''); setAwayTeam(''); setDate(''); setTime(''); setLiga(''); setOrt('')
      setSponsorName(''); setSponsorLogo(null); setSponsorLogoPreview(null); setSponsorLogoName('')
      setEventBild(null); setEventBildPreview(null); setEventBildName('')
    }
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) { setMessage('Bitte Fotos auswählen!'); return }
    if (!createdEventId) { setMessage('Bitte zuerst ein Spiel erstellen!'); return }
    setUploading(true)
    setMessage('Fotos werden hochgeladen...')
    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('files', file))
    formData.append('eventId', createdEventId)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      setMessage(data.message || 'Fertig!')
      setFiles(null); setFileNames('')
    } catch {
      setMessage('Fehler beim Hochladen!')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <p style={{ padding: '40px' }}>Lade...</p>

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/meine-events')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/meine-events')}>Meine Events</button>
          <button style={{ background: 'transparent', color: '#e8ff00', border: '1px solid #e8ff00', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/admin')}>+ Spiel erstellen</button>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/profil')}>Profil</button>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}>
            Abmelden
          </button>
        </div>
      </nav>

      <div style={{ padding: '40px', maxWidth: '700px', margin: '60px auto 0' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Admin</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>⚽ Spiel erstellen</h1>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <input type="text" placeholder="Heimteam *" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <input type="text" placeholder="Gastteam *" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <select value={liga} onChange={(e) => setLiga(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }}>
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
          <input type="text" placeholder="Ort (optional)" value={ort} onChange={(e) => setOrt(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />

          <div style={{ borderTop: '1px solid #1c2a38', marginTop: '16px', paddingTop: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#e8eef4' }}>🖼️ Event Bild (optional)</h3>
            <p style={{ color: '#445566', fontSize: 13, marginBottom: 12 }}>Wird auf der Homepage und Spiele-Seite angezeigt.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1c2a38', color: '#e8eef4', borderRadius: 6, cursor: 'pointer', fontSize: 14, border: '1px solid #2a3a4a', fontWeight: 600 }}>
                📁 Bild auswählen
                <input type="file" accept="image/*" onChange={handleEventBild} style={{ display: 'none' }} />
              </label>
              {eventBildName && <span style={{ color: '#667788', fontSize: 13 }}>✓ {eventBildName}</span>}
            </div>
            {eventBildPreview && (
              <img src={eventBildPreview} alt="Bild Vorschau"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '12px', borderRadius: '8px' }} />
            )}
          </div>

          <div style={{ borderTop: '1px solid #1c2a38', marginTop: '16px', paddingTop: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#e8eef4' }}>🏢 Sponsor (optional)</h3>
            <input type="text" placeholder="Sponsor Name" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)}
              style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1c2a38', color: '#e8eef4', borderRadius: 6, cursor: 'pointer', fontSize: 14, border: '1px solid #2a3a4a', fontWeight: 600 }}>
                📁 Logo auswählen
                <input type="file" accept="image/*" onChange={handleSponsorLogo} style={{ display: 'none' }} />
              </label>
              {sponsorLogoName && <span style={{ color: '#667788', fontSize: 13 }}>✓ {sponsorLogoName}</span>}
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

        <div style={{ background: '#0d1219', border: `1px solid ${createdEventId ? '#e8ff00' : '#1c2a38'}`, padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <h2 style={{ marginTop: 0, color: '#e8eef4' }}>📸 Fotos hochladen</h2>
          {createdEventId ? (
            <div style={{ background: '#131e2a', border: '1px solid #1c2a38', borderRadius: 6, padding: '10px 16px', marginBottom: 16, fontSize: 14, color: '#e8ff00', fontWeight: 700 }}>
              ⚽ {createdEventName}
            </div>
          ) : (
            <div style={{ color: '#445566', fontSize: 14, marginBottom: 16 }}>Erstelle zuerst ein Spiel um Fotos hochzuladen.</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1c2a38', color: '#e8eef4', borderRadius: 6, cursor: 'pointer', fontSize: 14, border: '1px solid #2a3a4a', fontWeight: 600, opacity: createdEventId ? 1 : 0.5 }}>
              📁 Dateien auswählen
              <input type="file" multiple accept="image/*" onChange={handleFileChange} disabled={!createdEventId} style={{ display: 'none' }} />
            </label>
            {fileNames && <span style={{ color: '#667788', fontSize: 13 }}>✓ {fileNames}</span>}
          </div>
          <button onClick={handleUpload} disabled={uploading || !createdEventId}
            style={{ padding: '12px 32px', background: createdEventId ? '#e8ff00' : '#1c2a38', color: createdEventId ? '#070b0f' : '#445566', border: 'none', borderRadius: '6px', cursor: createdEventId ? 'pointer' : 'not-allowed', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
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