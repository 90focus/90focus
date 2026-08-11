'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/app/supabase'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const filenames = (searchParams.get('filenames') || '').split(',').filter(Boolean)
  const eventId = searchParams.get('eventId') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const savePurchase = async () => {
      if (!sessionId || filenames.length === 0) {
        setStatus('error')
        return
      }
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }

        const rows = filenames.map((filename) => ({
          user_id: session.user.id,
          foto_filename: filename,
          event_id: eventId || null,
          preis: 19.90 / filenames.length,
          stripe_session_id: sessionId,
        }))

        const { error } = await supabase.from('purchases').insert(rows)
        if (error) throw error

        setStatus('success')
      } catch (e) {
        console.error('savePurchase error:', e)
        setStatus('error')
      }
    }
    savePurchase()
  }, [sessionId, eventId, router])

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Einen Moment...</h1>
            <p style={{ color: '#8899aa' }}>Wir schliessen deinen Kauf ab.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>Kauf erfolgreich!</h1>
            <p style={{ color: '#8899aa', marginBottom: 28 }}>
              Deine Fotos sind jetzt in voller Qualität, ohne Wasserzeichen, verfügbar.
            </p>
            <button onClick={() => router.push('/kunden-kaeufe')}
              style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '14px 32px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>
              Meine Käufe ansehen
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Etwas ist schiefgelaufen</h1>
            <p style={{ color: '#8899aa', marginBottom: 28 }}>
              Deine Zahlung war erfolgreich, aber wir konnten den Kauf nicht automatisch speichern. Bitte kontaktiere uns unter info@sport-shot.ch mit deiner Bestellnummer: {sessionId}
            </p>
            <button onClick={() => router.push('/kontakt')}
              style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '14px 32px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>
              Kontakt aufnehmen
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<p style={{ padding: '40px', color: '#e8eef4' }}>Lade...</p>}>
      <SuccessContent />
    </Suspense>
  )
}