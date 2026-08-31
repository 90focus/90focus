'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/app/supabase'
import { useLanguage } from '@/app/context/LanguageContext'

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
  const [hoveredKaufen, setHoveredKaufen] = useState(false)
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  const router = useRouter()
  const { lang } = useLanguage()



  const t = {
    uploadPrompt: lang === 'de' ? 'Lade ein Selfie hoch und finde deine Fotos' : 'Upload a selfie and find your photos',
    uploadPhoto: lang === 'de' ? 'Foto hochladen' : 'Upload Photo',
    searching: lang === 'de' ? 'Suche läuft...' : 'Searching...',
    notReadyTitle: lang === 'de' ? 'Fotos noch nicht verfügbar' : 'Photos not yet available',
    notReadyText: lang === 'de' ? 'Wir laden gerade alle Fotos hoch. Das dauert in der Regel 24-48 Stunden nach dem Event. Schau bald wieder vorbei!' : 'We are currently uploading all photos. This usually takes 24-48 hours after the event. Check back soon!',
    searchPhotos: lang === 'de' ? 'Fotos suchen' : 'Search Photos',
    noSelfie: lang === 'de' ? 'Bitte zuerst ein Selfie aufnehmen!' : 'Please upload a selfie first!',
    searchError: lang === 'de' ? 'Fehler bei der Suche!' : 'Error during search!',
    noPhotosFound: lang === 'de' ? 'Keine Fotos gefunden.' : 'No photos found.',
    photosFoundMsg: (n: number) => lang === 'de' ? `${n} Foto(s) gefunden!` : `${n} photo(s) found!`,
    photosFound: (n: number) => lang === 'de' ? `${n} Foto${n > 1 ? 's' : ''} gefunden` : `${n} photo${n > 1 ? 's' : ''} found`,
    buyNow: lang === 'de' ? 'Jetzt kaufen' : 'Buy Now',
  }

useEffect(() => {
    if (eventId) {
      const loadEvent = async () => {
        try {
          const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
          setEvent(data)
        } catch (e) {
          console.error('loadEvent error:', e)
        }
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
    if (!selfie) { setMessage(t.noSelfie); return }
    setSearching(true)
    setMessage(t.searching)
    setMatches([])
    const formData = new FormData()
    formData.append('selfie', selfie)
    if (eventId) formData.append('eventId', eventId)
    try {
      const res = await fetch('/api/rekognition', { method: 'PUT', body: formData })
      const data = await res.json()
      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches)
        setMessage(t.photosFoundMsg(data.matches.length))
      } else {
        setMessage(t.noPhotosFound)
      }
    } catch {
      setMessage(t.searchError)
    } finally {
      setSearching(false)
    }
  }

  const handleKaufen = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const params = new URLSearchParams()
    params.set('filenames', matches.join(','))
    if (eventId) params.set('eventId', eventId)
    const checkoutUrl = `/checkout?${params.toString()}`
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(checkoutUrl)}`)
      return
    }
    window.location.href = checkoutUrl
  }

  const getImageUrl = (filename: string) =>
    `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`

const total = (event?.preis || 19.90).toFixed(2)

  const Watermark = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', pointerEvents: 'none', overflow: 'hidden' }}>
      {[...Array(6)].map((_, row) => (
        <div key={row} style={{ display: 'flex', gap: '40px', transform: 'rotate(-30deg) translateX(-20%)', whiteSpace: 'nowrap', marginLeft: row % 2 === 0 ? '0px' : '60px' }}>
          {[...Array(5)].map((_, col) => (
            <span key={col} style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: 1, userSelect: 'none' }}>SPORTSHOT</span>
          ))}
        </div>
      ))}
    </div>
  )

  const Logo = () => (
    !event?.sponsor_logo_url ? (
      <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '4px 8px' }}>
        <span style={{ fontWeight: 900, fontSize: 11, letterSpacing: 0.5, fontStyle: 'italic' }}>
          <span style={{ color: '#fff' }}>SPORT</span><span style={{ color: '#e8ff00' }}>SHOT</span>
        </span>
      </div>
    ) : (
      <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: '4px 8px' }}>
        <img src={event.sponsor_logo_url} alt={event.sponsor_name} style={{ height: '20px', objectFit: 'contain', opacity: 0.9 }} />
      </div>
    )
  )

  const EventCard = () => (
    event && (
      <div style={{ background: '#0d1219', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, overflow: 'hidden', textAlign: 'left', marginBottom: 24 }}>
        <div style={{ aspectRatio: '4 / 3', background: '#131e2a', position: 'relative', overflow: 'hidden' }}>
          {event.bild_url ? (
            <img src={event.bild_url} alt={event.home_team}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%' }}></div>
          )}
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6, color: '#fff' }}>{event.home_team}</div>
          <div style={{ fontSize: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>{new Date(event.date).toLocaleDateString('de-CH')}</span>
            {event.ort && (
              <>
                <span style={{ color: '#556677' }}>·</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{event.ort}</span>
              </>
            )}
          </div>
          {event.sponsor_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, background: '#131e2a', padding: '4px 8px', borderRadius: 4, width: 'fit-content' }}>
              {event.sponsor_logo_url && <img src={event.sponsor_logo_url} alt={event.sponsor_name} style={{ height: '14px', objectFit: 'contain' }} />}
              <span style={{ fontSize: 10, color: '#e8eef4', fontWeight: 700 }}>⭐ {event.sponsor_name}</span>
            </div>
          )}
        </div>
      </div>
    )
)

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>

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

      {matches.length === 0 ? (
        <div style={{ padding: '40px 48px', maxWidth: '600px', margin: '60px auto 0', textAlign: 'center' }}>
          <EventCard />

          {event && !event.fotos_freigegeben ? (
            <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '32px 24px' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
              <h1 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', marginBottom: 12 }}>
                {t.notReadyTitle}
              </h1>
              <p style={{ color: '#8899aa', fontSize: 14, lineHeight: 1.6 }}>{t.notReadyText}</p>
            </div>
          ) : (
            <>
          <h1 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>
            {t.uploadPrompt}
          </h1>

          <div style={{ marginBottom: 24 }}>
            <label onMouseEnter={() => setHoveredUpload(true)} onMouseLeave={() => setHoveredUpload(false)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: hoveredUpload ? '#1c2a38' : '#131e2a', color: '#e8eef4', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, border: '1px solid #2a3a4a', transform: hoveredUpload ? 'scale(1.03)' : 'scale(1)', transition: 'all 0.15s ease' }}>
              {t.uploadPhoto}
              <input type="file" accept="image/*" capture="user" onChange={handleSelfie} style={{ display: 'none' }} />
            </label>
            {selfieName && <div style={{ color: '#667788', fontSize: 12, marginTop: 8 }}>✓ {selfieName}</div>}
          </div>

          {preview ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
              <img src={preview} alt="Preview" style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '50%', border: '3px solid #e8ff00' }} />
              <button onClick={handleSearch} disabled={searching}
                onMouseEnter={() => setHoveredSearch(true)} onMouseLeave={() => setHoveredSearch(false)}
                style={{ padding: '10px 28px', background: hoveredSearch ? '#d4e800' : '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '4px', cursor: searching ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', transform: hoveredSearch ? 'scale(1.03)' : 'scale(1)', transition: 'all 0.15s ease' }}>
                {searching ? t.searching : t.searchPhotos}
              </button>
            </div>
          ) : (
            <button onClick={handleSearch} disabled={searching}
              onMouseEnter={() => setHoveredSearch(true)} onMouseLeave={() => setHoveredSearch(false)}
              style={{ padding: '10px 28px', background: hoveredSearch ? '#d4e800' : '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '4px', cursor: searching ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', transform: hoveredSearch ? 'scale(1.03)' : 'scale(1)', transition: 'all 0.15s ease' }}>
              {searching ? t.searching : t.searchPhotos}
            </button>
          )}

          {message && !searching && <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#e8ff00' }}>{message}</p>}
            </>
          )}
        </div>
      ) : (
        <div style={{ padding: '40px 24px', maxWidth: '700px', margin: '60px auto 0' }}>
          {event && (
            <div style={{ textAlign: 'center', marginBottom: 16, color: '#8899aa', fontSize: 13 }}>
              {event.home_team} · {new Date(event.date).toLocaleDateString('de-CH')}
            </div>
          )}

          <div style={{ background: 'linear-gradient(135deg, #0d1219 0%, #131e2a 100%)', border: '1px solid #e8ff00', borderRadius: 12, padding: '24px', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#e8eef4', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>
              {t.photosFound(matches.length)}
            </div>
<div style={{ fontSize: 28, fontWeight: 900, color: '#e8ff00', marginBottom: 16 }}>
              € {total}
            </div>
            <button onClick={handleKaufen}
              onMouseEnter={() => setHoveredKaufen(true)} onMouseLeave={() => setHoveredKaufen(false)}
              style={{ background: hoveredKaufen ? '#d4e800' : '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '11px 32px', fontWeight: 900, fontSize: 14, cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase', transform: hoveredKaufen ? 'scale(1.03)' : 'scale(1)', transition: 'all 0.15s ease' }}>
              {t.buyNow}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {matches.map((filename, i) => (
              <div key={i} onClick={() => setLightboxIndex(i)} style={{ position: 'relative', cursor: 'zoom-in', borderRadius: 4, overflow: 'hidden', aspectRatio: '1' }}>
                <img src={getImageUrl(filename)} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <Watermark />
                <Logo />
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
    <Suspense fallback={<p style={{ padding: '40px' }}>Loading...</p>}>
      <SucheContent />
    </Suspense>
  )
}