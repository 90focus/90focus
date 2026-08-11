'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/app/supabase'
import { useLanguage } from '@/app/context/LanguageContext'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const filenames = (searchParams.get('filenames') || '').split(',').filter(Boolean)
  const eventId = searchParams.get('eventId') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const { lang } = useLanguage()

  const t = {
    loadingTitle: lang === 'de' ? 'Einen Moment...' : 'One moment...',
    loadingText: lang === 'de' ? 'Wir schliessen deinen Kauf ab.' : 'We are completing your purchase.',
    successTitle: lang === 'de' ? 'Kauf erfolgreich!' : 'Purchase successful!',
    successText: lang === 'de' ? 'Deine Fotos sind jetzt in voller Qualität, ohne Wasserzeichen, verfügbar.' : 'Your photos are now available in full quality, without watermark.',
    myPurchases: lang === 'de' ? 'Meine Käufe ansehen' : 'View My Purchases',
    errorTitle: lang === 'de' ? 'Etwas ist schiefgelaufen' : 'Something went wrong',
    errorText: (id: string) => lang === 'de'
      ? `Deine Zahlung war erfolgreich, aber wir konnten den Kauf nicht automatisch speichern. Bitte kontaktiere uns unter info@sport-shot.ch mit deiner Bestellnummer: ${id}`
      : `Your payment was successful, but we could not automatically save the purchase. Please contact us at info@sport-shot.ch with your order number: ${id}`,
    contact: lang === 'de' ? 'Kontakt aufnehmen' : 'Contact Us',
    loading: lang === 'de' ? 'Lade...' : 'Loading...',
  }

useEffect(() => {
    const checkSession = async () => {
      if (!sessionId) {
        setStatus('error')
        return
      }
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }
        setStatus('success')
      } catch (e) {
        console.error('checkSession error:', e)
        setStatus('error')
      }
    }
    checkSession()
  }, [sessionId, router])

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
{status === 'loading' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>{t.loadingTitle}</h1>
            <p style={{ color: '#8899aa' }}>{t.loadingText}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>{t.successTitle}</h1>
            <p style={{ color: '#8899aa', marginBottom: 28 }}>
              {t.successText}
            </p>
            <button onClick={() => router.push('/kunden-kaeufe')}
              style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '14px 32px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>
              {t.myPurchases}
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>{t.errorTitle}</h1>
            <p style={{ color: '#8899aa', marginBottom: 28 }}>
              {t.errorText(sessionId || '')}
            </p>
            <button onClick={() => router.push('/kontakt')}
              style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '14px 32px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>
              {t.contact}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<p style={{ padding: '40px', color: '#e8eef4' }}>Loading...</p>}>
      <SuccessContent />
    </Suspense>
  )
}