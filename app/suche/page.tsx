'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/app/supabase'

function SucheContent() {
  const [selfie, setSelfie] = useState<File | null>(null)
  const [searching, setSearching] = useState(false)
  const [matches, setMatches] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [event, setEvent] = useState<any>(null)
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')

  useEffect(() => {
    if (eventId) {
      const loadEvent = async () => {
        const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
        setEvent(data)
      }
      loadEvent()
    }
  }, [eventId])

  const handleSelfie = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelfie(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSearch = async () => {
    if (!selfie) {
      setMessage('Bitte zuerst ein Selfie aufnehmen!')
      return
    }
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

  const watermarkText = event?.sponsor_logo_url ? null : '90focus ⚽'

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', background: '#070b0f', minHeight: '100vh', color: '#e8eef4', fontFamily: 'sans-serif' }}>

      {/* NAV */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
        </div>
        <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
      </div>

      {event && (
        <div style={{ marginBottom: '24px', padding: '16px 20px', background: '#0d1219', borderRadius: '8px', border: '1px solid #1c2a38' }}>
          <div style={{ fontSize: 10, color: '#e8ff00', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>{event.liga}</div>
          <strong style={{ fontSize: 18 }}>{event.home_team} vs {event.away_team}</strong><br />
          <span style={{ color: '#445566', fontSize: 13 }}>📅 {event.date} {event.ort && `— 📍 ${event.ort}`}</span>
          {event.sponsor_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, background: '#131e2a', padding: '6px 12px', borderRadius: 4, width: 'fit-content' }}>
              {event.sponsor_logo_url && (
                <img src={event.sponsor_logo_url} alt={event.sponsor_name} style={{ height: '20px', objectFit: 'contain' }} />
              )}
              <span style={{ fontSize: 12, color: '#e8eef4', fontWeight: 700 }}>⭐ Powered by {event.sponsor_name}</span>
            </div>
          )}
        </div>
      )}

      <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>🔍 Meine Fotos finden</h1>
      <p style={{ color: '#667788', marginBottom: 24 }}>Mach ein Selfie oder lade ein Foto von dir hoch!</p>

      <input type="file" accept="image/*" capture="user" onChange={handleSelfie}
        style={{ margin: '20px 0', display: 'block', color: '#e8eef4' }} />

      {preview && (
        <img src={preview} alt="Vorschau"
          style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', marginBottom: '20px', border: '3px solid #e8ff00' }} />
      )}

      <button onClick={handleSearch} disabled={searching}
        style={{ padding: '12px 32px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase' }}>
        {searching ? 'Suche...' : '🔍 Fotos suchen'}
      </button>

      {message && <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#e8ff00' }}>{message}</p>}

      {matches.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', marginBottom: 16 }}>Deine Fotos:</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {matches.map((filename, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                {/* FOTO */}
                <img
                  src={`https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`}
                  alt={`Foto ${i + 1}`}
                  style={{ width: '100%', display: 'block', borderRadius: '8px' }}
                />

                {/* WASSERZEICHEN DIAGONAL */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-around',
                  pointerEvents: 'none', overflow: 'hidden',
                }}>
                  {[...Array(6)].map((_, row) => (
                    <div key={row} style={{
                      display: 'flex', gap: '40px',
                      transform: 'rotate(-30deg) translateX(-20%)',
                      whiteSpace: 'nowrap',
                      marginLeft: row % 2 === 0 ? '0px' : '60px',
                    }}>
                      {[...Array(5)].map((_, col) => (
                        <span key={col} style={{
                          fontSize: '13px', fontWeight: 800,
                          color: 'rgba(255,255,255,0.25)',
                          letterSpacing: 1, userSelect: 'none',
                          fontFamily: 'sans-serif',
                        }}>
                          90focus ⚽
                        </span>
                      ))}
                    </div>
                  ))}
                </div>

                {/* SPONSOR LOGO unten rechts */}
                {event?.sponsor_logo_url && (
                  <div style={{
                    position: 'absolute', bottom: 8, right: 8,
                    background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: '4px 8px',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <img src={event.sponsor_logo_url} alt={event.sponsor_name}
                      style={{ height: '20px', objectFit: 'contain', opacity: 0.9 }} />
                  </div>
                )}

                {/* 90FOCUS LOGO unten rechts wenn kein Sponsor */}
                {!event?.sponsor_logo_url && (
                  <div style={{
                    position: 'absolute', bottom: 8, right: 8,
                    background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '4px 8px',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <div style={{ width: 18, height: 18, background: '#e8ff00', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 9 }}>90</span>
                    </div>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 11, letterSpacing: 1 }}>FOCUS</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
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