'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/app/supabase'
import { useLanguage } from '@/app/context/LanguageContext'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const filenames = (searchParams.get('filenames') || searchParams.get('filename') || '').split(',').filter(Boolean)
  const eventId = searchParams.get('eventId') || ''
  const [event, setEvent] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [kartenNummer, setKartenNummer] = useState('')
  const [kartenName, setKartenName] = useState('')
  const [ablaufdatum, setAblaufdatum] = useState('')
  const [cvv, setCvv] = useState('')
  const { lang } = useLanguage()

  const t = {
    creditCard: lang === 'de' ? 'Kreditkarte' : 'Credit Card',
    cardholder: lang === 'de' ? 'Karteninhaber' : 'Cardholder',
    cardNumber: lang === 'de' ? 'Kartennummer' : 'Card Number',
    expiry: lang === 'de' ? 'Ablaufdatum' : 'Expiry Date',
    cvv: lang === 'de' ? 'Prüfziffer (CVV)' : 'Security Code (CVV)',
    buyNow: lang === 'de' ? 'Jetzt kaufen' : 'Buy Now',
    stripeHint: lang === 'de' ? '🔒 Bezahlung via Stripe – kommt bald' : '🔒 Payment via Stripe – coming soon',
    photo: lang === 'de' ? 'Foto' : 'Photo',
    loading: lang === 'de' ? 'Lade...' : 'Loading...',
  }

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

  const formatKartenNummer = (val: string) => {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  const formatAblaufdatum = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4)
    if (clean.length > 2) return clean.slice(0, 2) + '/' + clean.slice(2)
    return clean
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

  const inputStyle = {
    width: '100%', padding: '12px', fontSize: '15px',
    background: '#131e2a', border: '1px solid #1c2a38',
    borderRadius: '6px', color: '#e8eef4',
    boxSizing: 'border-box' as any, outline: 'none'
  }

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>

      {lightboxIndex !== null && (
        <div onClick={() => setLightboxIndex(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          )}
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={getImageUrl(filenames[lightboxIndex])} alt={`${t.photo} ${lightboxIndex + 1}`} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }} />
            <Watermark />
            <Logo />
          </div>
          {lightboxIndex < filenames.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          )}
          <div style={{ position: 'absolute', bottom: 20, color: '#667788', fontSize: 14 }}>{lightboxIndex + 1} / {filenames.length}</div>
        </div>
      )}

      <div style={{ maxWidth: 700, margin: '60px auto 0', padding: '40px 24px' }}>

        {event && (
          <div style={{ textAlign: 'center', marginBottom: 16, color: '#8899aa', fontSize: 13 }}>
            {event.home_team} · {new Date(event.date).toLocaleDateString(lang === 'de' ? 'de-CH' : 'en-GB')}
          </div>
        )}

        <div style={{ background: 'linear-gradient(135deg, #0d1219 0%, #131e2a 100%)', border: '1px solid #e8ff00', borderRadius: 12, padding: '24px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#e8eef4', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>
            {filenames.length} {t.photo}{filenames.length > 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#e8ff00' }}>
€ {total}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 32 }}>
          {filenames.map((filename, i) => (
            <div key={i} onClick={() => setLightboxIndex(i)} style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', aspectRatio: '1', cursor: 'zoom-in' }}>
              <img src={getImageUrl(filename)} alt={`${t.photo} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Watermark />
              <Logo />
            </div>
          ))}
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#667788', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
            {t.creditCard}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#667788', marginBottom: 6 }}>{t.cardholder}</div>
            <input type="text" placeholder="Max Mustermann" value={kartenName}
              onChange={(e) => setKartenName(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#667788', marginBottom: 6 }}>{t.cardNumber}</div>
            <input type="text" placeholder="1234 5678 9012 3456" value={kartenNummer}
              onChange={(e) => setKartenNummer(formatKartenNummer(e.target.value))} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: '#667788', marginBottom: 6 }}>{t.expiry}</div>
              <input type="text" placeholder="MM/YY" value={ablaufdatum}
                onChange={(e) => setAblaufdatum(formatAblaufdatum(e.target.value))} style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#667788', marginBottom: 6 }}>{t.cvv}</div>
              <input type="text" placeholder="123" value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} style={inputStyle} />
            </div>
          </div>

          <button disabled style={{
            width: '100%', background: '#e8ff00', color: '#070b0f',
            border: 'none', borderRadius: 4, padding: '14px',
            fontWeight: 900, fontSize: 15, cursor: 'not-allowed',
            letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.5
          }}>
            {t.buyNow}
          </button>
          <p style={{ color: '#445566', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
            {t.stripeHint}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p style={{ padding: '40px', color: '#e8eef4' }}>Loading...</p>}>
      <CheckoutContent />
    </Suspense>
  )
}