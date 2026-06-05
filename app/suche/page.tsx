'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/app/supabase'

function SucheContent() {
  const [selfie, setSelfie] = useState<File | null>(null)
  const [searching, setSearching] = useState(false)
  const [matches, setMatches] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [event, setEvent] = useState<any>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [selfieName, setSelfieName] = useState('')
  const [hoveredUpload, setHoveredUpload] = useState(false)
  const [hoveredSearch, setHoveredSearch] = useState(false)
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  const router = useRouter()

  useEffect(() => {
    if (eventId) {
      const loadEvent = async () => {
        const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
        setEvent(data)
      }
      loadEvent()
    }
  }, [eventId])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? Math.min(i + 1, matches.length - 1) : null)
      if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null ? Math.max(i - 1, 0) : null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, matches.length])

  const handleSelfie = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelfie(file)
      setPreview(URL.createObjectURL(file))
      setSelfieName(file.name)
    }
  }

  const handleSearch = async () => {
    if (!selfie) { setMessage('Bitte zuerst ein Selfie aufnehmen!'); return }
    setSearching(true)
    setMessage('Suche läuft...')
    setMatches([])
    const formData = new FormData()
    formData.append('selfie', selfie)
    if (eventId) formData.append('eventId', eventId)
    try {
      const res = await fetch('/api/rekognition', { method: 'PUT', body: formData })
      const data = await res.json()
      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches)
        setMessage(`${data.matches.length} Foto(s) gefunden!`)
      } else {
        setMessage('Keine Fotos gefunden.')
      }
    } catch {
      setMessage('Fehler bei der Suche!')
    } finally {
      setSearching(false)
    }
  }

  const getImageUrl = (filename: string) =>
    `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`

  const Watermark = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', pointerEvents: 'none', overflow: 'hidden' }}>
      {[...Array(6)].map((_, row) => (
        <div key={row} style={{ display: 'flex', gap: '40px', transform: 'rotate(-30deg) translateX(-20%)', whiteSpace: 'nowrap', marginLeft: row % 2 === 0 ? '0px' : '60px' }}>
          {[...Array(5)].map((_, col) => (
            <span key={col} style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: 1, userSelect: 'none' }}>90focus ⚽</span>
          ))}
        </div>
      ))}
    </div>
  )

  const Logo = () => (
    !event?.sponsor_logo_url ? (
      <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 18, height: 18, background: '#e8ff00', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 9 }}>90</span>
        </div>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 11, letterSpacing: 1 }}>FOCUS</span>
      </div>
    ) : (
      <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: '4px 8px' }}>
        <img src={event.sponsor_logo_url} alt={event.sponsor_name} style={{ height: '20px', objectFit: 'contain', opacity: 0.9 }} />
      </div>
    )
  )

  return (
    <div style={{ background: '#070b0f', minHeight: '100vh', color: '#e8eef4', fontFamily: 'sans-serif' }}>

      {/* LIGHTBOX */}
      {lightboxIndex !== null && (
        <div onClick={() => setLightboxIndex(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          )}
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={getImageUrl(matches[lightboxIndex])} alt={`Foto ${lightboxIndex + 1}`} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }} />
            <Watermark />
            <Logo />
          </div>
          {lightboxIndex < matches.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          )}
          <div style={{ position: 'absolute', bottom: 20, color: '#667788', fontSize: 14 }}>{lightboxIndex + 1} / {matches.length}</div>
        </div>
      )}

      {/* NAV FIXED */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/')}>Home</button>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/spiele')}>Alle Spiele</button>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/login')}>Login</button>
          <button style={{ background: 'transparent', color: '#e8ff00', border: '1px solid #e8ff00', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/register')}>Sign Up</button>
        </div>
      </nav>

      <div style={{ padding: '40px 48px', maxWidth: '600px', margin: '60px auto 0', textAlign: 'center' }}>

        {/* EVENT CARD */}
        {event && (
          <div style={{ marginBottom: 32, background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, overflow: 'hidden', textAlign: 'left' }}>
            <div style={{ height: 180, background: '#131e2a', position: 'relative', overflow: 'hidden' }}>
              {event.bild_url ? (
                <img src={event.bild_url} alt={`${event.home_team} vs ${event.away_team}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 48 }}>⚽</span>
                </div>
              )}
              <div style={{ position: 'absolute', top: 10, left: 10, background: '#e8ff00', color: '#070b0f', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 8px', borderRadius: 2 }}>
                {event.liga}
              </div>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>{event.home_team} vs {event.away_team}</div>
              <div style={{ fontSize: 12, color: '#8899aa', marginBottom: 8 }}>📅 {event.date} {event.ort && `· 📍 ${event.ort}`}</div>
              {event.sponsor_name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#131e2a', padding: '4px 8px', borderRadius: 4, width: 'fit-content' }}>
                  {event.sponsor_logo_url && <img src={event.sponsor_logo_url} alt={event.sponsor_name} style={{ height: '14px', objectFit: 'contain' }} />}
                  <span style={{ fontSize: 10, color: '#e8eef4', fontWeight: 700 }}>⭐ {event.sponsor_name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TITEL */}
        <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>Meine Fotos finden</h1>
        <p style={{ color: '#e8eef4', fontSize: 15, fontWeight: 600, marginBottom: 32 }}>Lade ein Selfie hoch und finde deine Fotos.</p>

        {/* SELFIE UPLOAD */}
        <div style={{ marginBottom: 24 }}>
          <label
            onMouseEnter={() => setHoveredUpload(true)}
            onMouseLeave={() => setHoveredUpload(false)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              background: hoveredUpload ? '#1c2a38' : '#131e2a',
              color: '#e8eef4', borderRadius: 4, cursor: 'pointer',
              fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: 1, border: '1px solid #2a3a4a',
              transform: hoveredUpload ? 'scale(1.03)' : 'scale(1)',
              transition: 'all 0.15s ease'
            }}>
            Foto hochladen
            <input type="file" accept="image/*" capture="user" onChange={handleSelfie} style={{ display: 'none' }} />
          </label>
          {selfieName && <div style={{ color: '#667788', fontSize: 13, marginTop: 8 }}>✓ {selfieName}</div>}
        </div>

        {preview && (
          <img src={preview} alt="Vorschau"
            style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', marginBottom: '24px', border: '3px solid #e8ff00' }} />
        )}

        <div>
          <button
            onClick={handleSearch}
            disabled={searching}
            onMouseEnter={() => setHoveredSearch(true)}
            onMouseLeave={() => setHoveredSearch(false)}
            style={{
              padding: '12px 32px',
              background: hoveredSearch ? '#d4e800' : '#e8ff00',
              color: '#070b0f', border: 'none', borderRadius: '4px',
              cursor: searching ? 'not-allowed' : 'pointer',
              fontSize: '16px', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
              transform: hoveredSearch ? 'scale(1.03)' : 'scale(1)',
              transition: 'all 0.15s ease'
            }}>
            {searching ? 'Suche läuft...' : 'Fotos suchen'}
          </button>
        </div>

        {message && <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#e8ff00' }}>{message}</p>}

        {matches.length > 0 && (
          <div style={{ marginTop: '30px', textAlign: 'left' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', marginBottom: 16 }}>Deine Fotos:</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {matches.map((filename, i) => (
                <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', background: '#0d1219', border: '1px solid #1c2a38' }}>
                  <div onClick={() => setLightboxIndex(i)} style={{ position: 'relative', cursor: 'zoom-in' }}>
                    <img src={getImageUrl(filename)} alt={`Foto ${i + 1}`} style={{ width: '100%', display: 'block' }} />
                    <Watermark />
                    <Logo />
                  </div>
                  <div style={{ padding: '12px' }}>
                    <button
                      onClick={() => {
                        const params = new URLSearchParams()
                        params.set('filename', filename)
                        if (eventId) params.set('eventId', eventId)
                        window.location.href = `/checkout?${params.toString()}`
                      }}
                      style={{ width: '100%', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '10px', fontWeight: 900, fontSize: 14, cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                      💳 Jetzt kaufen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SuchePage() {
  return (
    <Suspense fallback={<p style={{ padding: '40px' }}>Lade...</p>}>
      <SucheContent />
    </Suspense>
  )
}