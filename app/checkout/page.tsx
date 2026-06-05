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

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      if (eventId) {
        const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
        setEvent(data)
      }
    }
    init()
  }, [eventId, router])

  const getImageUrl = (filename: string) =>
    `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`

  const preisProFoto = 4.90
  const total = (filenames.length * preisProFoto).toFixed(2)

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <button onClick={() => router.back()}
          style={{ background: 'transparent', color: '#667788', border: '1px solid #1c2a38', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>
          ← Zurück
        </button>
      </nav>

      <div style={{ maxWidth: 600, margin: '60px auto 0', padding: '40px 24px' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Checkout</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>Fotos kaufen</h1>

        {/* FOTOS VORSCHAU */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
          {filenames.map((filename, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', aspectRatio: '1' }}>
              <img src={getImageUrl(filename)} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', pointerEvents: 'none', overflow: 'hidden' }}>
                {[...Array(4)].map((_, row) => (
                  <div key={row} style={{ display: 'flex', gap: '20px', transform: 'rotate(-30deg) translateX(-20%)', whiteSpace: 'nowrap' }}>
                    {[...Array(3)].map((_, col) => (
                      <span key={col} style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: 1, userSelect: 'none' }}>90focus</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* EVENT INFO */}
        {event && (
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: '#e8ff00', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>{event.liga}</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{event.home_team} vs {event.away_team}</div>
            <div style={{ color: '#445566', fontSize: 13, marginTop: 4 }}>📅 {event.date} {event.ort && `— 📍 ${event.ort}`}</div>
          </div>
        )}

        {/* PREIS */}
        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#667788' }}>{filenames.length} Foto(s) × CHF {preisProFoto.toFixed(2)}</span>
            <span style={{ fontWeight: 700 }}>CHF {total}</span>
          </div>
          <div style={{ borderTop: '1px solid #1c2a38', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 900, fontSize: 18 }}>Total</span>
            <span style={{ fontWeight: 900, fontSize: 24, color: '#e8ff00' }}>CHF {total}</span>
          </div>
        </div>

        {/* STRIPE BUTTON */}
        <button disabled style={{ width: '100%', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '16px', fontWeight: 900, fontSize: 16, cursor: 'not-allowed', letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.5 }}>
          💳 Jetzt bezahlen (CHF {total}) – Bald verfügbar
        </button>
        <p style={{ color: '#445566', fontSize: 13, textAlign: 'center', marginTop: 12 }}>
          Bezahlung via Stripe kommt bald. Nach dem Kauf erhältst du alle Fotos ohne Wasserzeichen.
        </p>
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