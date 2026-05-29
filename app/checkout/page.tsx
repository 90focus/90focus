'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/app/supabase'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const filename = searchParams.get('filename') || ''
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

  const imageUrl = `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`
  const preis = 4.90

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      {/* NAV */}
      <nav style={{ background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Checkout</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>Foto kaufen</h1>

        {/* FOTO VORSCHAU */}
        <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
          <img src={imageUrl} alt="Foto" style={{ width: '100%', display: 'block', maxHeight: 400, objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', pointerEvents: 'none', overflow: 'hidden' }}>
            {[...Array(6)].map((_, row) => (
              <div key={row} style={{ display: 'flex', gap: '40px', transform: 'rotate(-30deg) translateX(-20%)', whiteSpace: 'nowrap', marginLeft: row % 2 === 0 ? '0px' : '60px' }}>
                {[...Array(5)].map((_, col) => (
                  <span key={col} style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: 1, userSelect: 'none' }}>90focus ⚽</span>
                ))}
              </div>
            ))}
          </div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#667788' }}>Foto (ohne Wasserzeichen)</span>
            <span style={{ fontWeight: 700 }}>CHF {preis.toFixed(2)}</span>
          </div>
          <div style={{ borderTop: '1px solid #1c2a38', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 900, fontSize: 18 }}>Total</span>
            <span style={{ fontWeight: 900, fontSize: 24, color: '#e8ff00' }}>CHF {preis.toFixed(2)}</span>
          </div>
        </div>

        {/* STRIPE BUTTON */}
        <button disabled style={{ width: '100%', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '16px', fontWeight: 900, fontSize: 16, cursor: 'not-allowed', letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.5 }}>
          💳 Jetzt bezahlen (CHF {preis.toFixed(2)}) – Bald verfügbar
        </button>
        <p style={{ color: '#445566', fontSize: 13, textAlign: 'center', marginTop: 12 }}>
          Bezahlung via Stripe kommt bald. Nach dem Kauf erhältst du das Foto ohne Wasserzeichen.
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