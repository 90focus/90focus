'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/app/supabase'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const filenames = (searchParams.get('filenames') || searchParams.get('filename') || '').split(',').filter(Boolean)
  const eventId = searchParams.get('eventId') || ''
  const [event, setEvent] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }
        setUser(session.user)
        if (eventId) {
          const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
          setEvent(data)
        }
      } catch (e) {
        console.error('init error:', e)
      }
    }
    init()
  }, [eventId, router])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? Math.min(i + 1, filenames.length - 1) : null)
      if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null ? Math.max(i - 1, 0) : null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, filenames.length])

  const getImageUrl = (filename: string) =>
    `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`

  const paketPreis = 19.90
  const total = paketPreis.toFixed(2)

  const handleCheckout = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenames, eventId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Fehler beim Erstellen der Zahlung. Bitte erneut versuchen.')
      }
    } catch (e) {
      console.error('Checkout error:', e)
      setError('Fehler beim Erstellen der Zahlung. Bitte erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>

      {lightboxIndex !== null && (
        <div onClick={() => setLightboxIndex(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          )}
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={getImageUrl(filenames[lightboxIndex])} alt={`Foto ${lightboxIndex + 1}`} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }} />
            <Watermark />
            <Logo />
          </div>
          {lightboxIndex < filenames.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          )}
          <div style={{ position: 'absolute', bottom: 20, color: '#667788', fontSize: 14 }}>{lightboxIndex + 1} / {filenames.length}</div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '60px auto 0', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>

        <div>
          <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
            Deine Fotos ({filenames.length})
          </div>

          {event && (
            <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{event.home_team}</div>
              <div style={{ color: '#445566', fontSize: 12, marginTop: 2 }}>📅 {event.date} {event.ort && `— 📍 ${event.ort}`}</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {filenames.map((filename, i) => (
              <div key={i} onClick={() => setLightboxIndex(i)} style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', aspectRatio: '1', cursor: 'zoom-in' }}>
                <img src={getImageUrl(filename)} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <Watermark />
                <Logo />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
            Bezahlung
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#667788' }}>{filenames.length} Foto(s) — Paket</span>
              <span style={{ fontWeight: 700 }}>€ {total}</span>
            </div>
            <div style={{ borderTop: '1px solid #1c2a38', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: 16 }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: 22, color: '#e8ff00' }}>€ {total}</span>
            </div>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <p style={{ color: '#8899aa', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              Du wirst zur sicheren Bezahlseite von Stripe weitergeleitet, um deinen Kauf abzuschliessen.
            </p>

            <button onClick={handleCheckout} disabled={loading} style={{
              width: '100%', background: '#e8ff00', color: '#070b0f',
              border: 'none', borderRadius: 4, padding: '14px',
              fontWeight: 900, fontSize: 15, cursor: loading ? 'wait' : 'pointer',
              letterSpacing: 1.5, textTransform: 'uppercase', opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Einen Moment...' : 'Jetzt kaufen'}
            </button>
            {error && <p style={{ color: '#ff4444', fontSize: 13, textAlign: 'center', marginTop: 12 }}>{error}</p>}
            <p style={{ color: '#445566', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
              🔒 Sichere Bezahlung via Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p style={{ padding: '40px', color: '#e8eef4' }}>Lade...</p>}>
      <CheckoutContent />
    </Suspense>
  )
}