'use client'

import { useState } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Falsche Email oder Passwort!')
      setLoading(false)
      return
    }

    // Wenn redirect Parameter vorhanden direkt dorthin
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

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
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
          <button style={{ background: 'transparent', color: '#e8ff00', border: '1px solid #e8ff00', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/login')}>Login</button>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/register')}>Sign Up</button>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', marginTop: 60 }}>
        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, background: '#e8ff00', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 16 }}>90</span>
            </div>
            <span style={{ color: '#e8eef4', fontWeight: 900, fontSize: 22, letterSpacing: 2 }}>FOCUS</span>
          </div>

          <h1 style={{ color: '#e8eef4', fontSize: 24, fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>
            {mode === 'login' ? '🔐 Login' : '🔑 Passwort vergessen'}
          </h1>
          <p style={{ color: '#445566', fontSize: 14, marginBottom: 24 }}>
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
                  style={{ background: 'none', border: 'none', color: '#445566', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>
                  Passwort vergessen?
                </button>
                <div style={{ borderTop: '1px solid #131e2a', paddingTop: 16 }}>
                  <span style={{ color: '#445566', fontSize: 14 }}>Noch kein Konto? </span>
                  <button onClick={() => router.push('/register')}
                    style={{ background: 'none', border: 'none', color: '#e8ff00', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                    Jetzt registrieren →
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => { setMode('login'); setError(''); setMessage('') }}
                style={{ background: 'none', border: 'none', color: '#445566', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>
                Zurück zum Login
              </button>
            )}
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid #131e2a', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, background: '#e8ff00', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 11 }}>90</span>
          </div>
          <span style={{ color: '#e8eef4', fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#445566' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/impressum')}>Impressum</span>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/datenschutz')}>Datenschutz</span>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/kontakt')}>Kontakt</span>
        </div>
        <div style={{ color: '#1c2a38', fontSize: 12 }}>© 2026 90Focus - Luzern</div>
      </footer>
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