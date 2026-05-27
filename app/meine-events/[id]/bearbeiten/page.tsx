'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function EventBearbeitenPage() {
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
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      await loadEvent(session.user.id)
      setLoading(false)
    }
    init()
  }, [eventId])

  const loadEvent = async (userId: string) => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single()
    if (!data) { router.push('/meine-events'); return }
    setHomeTeam(data.home_team || '')
    setAwayTeam(data.away_team || '')
    setDate(data.date || '')
    setTime(data.time || '')
    setLiga(data.liga || '')
    setOrt(data.ort || '')
    setSponsorName(data.sponsor_name || '')
    setCurrentLogoUrl(data.sponsor_logo_url || null)
  }

  const handleSponsorLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSponsorLogo(file)
      setSponsorLogoPreview(URL.createObjectURL(file))
      setSponsorLogoName(file.name)
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

  const saveEvent = async () => {
    if (!homeTeam || !awayTeam || !date) {
      setMessage('Heimteam, Gastteam und Datum sind Pflichtfelder!')
      return
    }
    let sponsorLogoUrl = currentLogoUrl
    if (sponsorLogo) {
      setMessage('Logo wird hochgeladen...')
      sponsorLogoUrl = await uploadSponsorLogo(sponsorLogo)
    }
    const { error } = await supabase
      .from('events')
      .update({
        home_team: homeTeam,
        away_team: awayTeam,
        date: date,
        time: time,
        liga: liga,
        ort: ort,
        sponsor_name: sponsorName,
        sponsor_logo_url: sponsorLogoUrl,
      })
      .eq('id', eventId)

    if (error) {
      setMessage('Fehler: ' + error.message)
    } else {
      setMessage('✅ Event gespeichert!')
      setTimeout(() => router.push('/meine-events'), 1500)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>Lade...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <nav style={{ background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <button onClick={() => router.push(`/meine-events/${eventId}`)}
          style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>
          ← Zurück
        </button>
      </nav>

      <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Event</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>✏️ Bearbeiten</h1>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <input type="text" placeholder="Heimteam" value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <input type="text" placeholder="Gastteam" value={awayTeam}
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
            <h3 style={{ margin: '0 0 12px 0', color: '#e8eef4' }}>🏢 Sponsor</h3>
            <input type="text" placeholder="Sponsor Name" value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
            {currentLogoUrl && !sponsorLogoPreview && (
              <div style={{ marginBottom: 8 }}>
                <p style={{ color: '#667788', fontSize: 13, margin: '4px 0' }}>Aktuelles Logo:</p>
                <img src={currentLogoUrl} alt="Logo" style={{ height: 50, objectFit: 'contain', background: '#131e2a', padding: 4, borderRadius: 4 }} />
              </div>
            )}
            <label style={{ display: 'block', margin: '8px 0 4px', fontSize: '14px', color: '#667788' }}>
              Neues Logo hochladen (optional):
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1c2a38', color: '#e8eef4', borderRadius: 6, cursor: 'pointer', fontSize: 14, border: '1px solid #2a3a4a', fontWeight: 600 }}>
                📁 Logo auswählen
                <input type="file" accept="image/*" onChange={handleSponsorLogo} style={{ display: 'none' }} />
              </label>
              {sponsorLogoName && <span style={{ color: '#667788', fontSize: 13 }}>✓ {sponsorLogoName}</span>}
            </div>
            {sponsorLogoPreview && (
              <img src={sponsorLogoPreview} alt="Vorschau" style={{ height: 50, marginTop: 8, objectFit: 'contain', background: '#131e2a', padding: 4, borderRadius: 4 }} />
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button onClick={saveEvent}
              style={{ padding: '12px 32px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
              Speichern
            </button>
            <button onClick={() => router.push('/meine-events')}
              style={{ padding: '12px 32px', background: 'transparent', color: '#667788', border: '1px solid #1c2a38', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>
              Abbrechen
            </button>
          </div>
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