'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const [checkingSession, setCheckingSession] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        if (redirectTo) { router.push(decodeURIComponent(redirectTo)); return }
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        if (profile?.role === 'photographer') { router.push('/meine-events') }
        else { router.push('/kunden-dashboard') }
        return
      }
      setCheckingSession(false)
    }
    check()
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Falsche Email oder Passwort!')
      setLoading(false)
      return
    }
    if (redirectTo) {
      router.push(decodeURIComponent(redirectTo))
      setLoading(false)
      return
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role === 'photographer') {
      router.push('/meine-events')
    } else if (profile?.role === 'customer') {
      router.push('/kunden-dashboard')
    } else {
      router.push('/meine-events')
    }
    setLoading(false)
  }

  const handleForgot = async () => {
    if (!email) { setError('Bitte Email eingeben!'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError('Fehler beim Senden!') } else { setMessage('✅ Email gesendet! Prüfe dein Postfach.') }
    setLoading(false)
  }

if (checkingSession) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>Lade...</p>
    </div>
  )

if (checkingSession) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>Lade...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', marginTop: 60 }}>
        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: 32 }}>
            <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1, fontStyle: 'italic' }}>
              <span style={{ color: '#e8eef4' }}>SPORT</span><span style={{ color: '#e8ff00' }}>SHOT</span>
            </span>
          </div>

          <h1 style={{ color: '#e8eef4', fontSize: 24, fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>
            {mode === 'login' ? '🔐 Login' : '🔑 Passwort vergessen'}
          </h1>
          <p style={{ color: '#e8eef4', fontSize: 14, marginBottom: 24 }}>
            {mode === 'login' ? 'Melde dich mit deinen Zugangsdaten an.' : 'Wir senden dir einen Reset-Link per Email.'}
          </p>

          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />

          {mode === 'login' && (
            <input type="password" placeholder="Passwort" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />
          )}

          <button onClick={mode === 'login' ? handleLogin : handleForgot} disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: '8px' }}>
            {loading ? 'Lädt...' : mode === 'login' ? 'Einloggen' : 'Reset-Link senden'}
          </button>

          {error && <p style={{ color: '#ff4444', marginTop: '12px', fontSize: 14 }}>{error}</p>}
          {message && <p style={{ color: '#44ff88', marginTop: '12px', fontSize: 14 }}>{message}</p>}

          <div style={{ marginTop: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mode === 'login' ? (
              <>
                <button onClick={() => { setMode('forgot'); setError(''); setMessage('') }}
                  style={{ background: 'none', border: 'none', color: '#e8eef4', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>
                  Passwort vergessen?
                </button>
                <div style={{ borderTop: '1px solid #131e2a', paddingTop: 16 }}>
                  <span style={{ color: '#e8eef4', fontSize: 14 }}>Noch kein Konto? </span>
                  <button onClick={() => router.push('/register')}
                    style={{ background: 'none', border: 'none', color: '#e8ff00', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                    Jetzt registrieren
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => { setMode('login'); setError(''); setMessage('') }}
                style={{ background: 'none', border: 'none', color: '#e8eef4', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>
                Zurück zum Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#070b0f' }} />}>
      <LoginContent />
    </Suspense>
  )
}