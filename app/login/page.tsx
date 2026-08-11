'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'

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
  const { lang } = useLanguage()

  const t = {
    login: lang === 'de' ? 'Login' : 'Login',
    forgotTitle: lang === 'de' ? 'Passwort vergessen' : 'Forgot Password',
    loginSubtitle: lang === 'de' ? 'Melde dich mit deinen Zugangsdaten an.' : 'Sign in with your credentials.',
    forgotSubtitle: lang === 'de' ? 'Wir senden dir einen Reset-Link per Email.' : "We'll send you a reset link via email.",
    email: 'Email',
    password: lang === 'de' ? 'Passwort' : 'Password',
    loading: lang === 'de' ? 'Lädt...' : 'Loading...',
    loginBtn: lang === 'de' ? 'Einloggen' : 'Log In',
    resetBtn: lang === 'de' ? 'Reset-Link senden' : 'Send Reset Link',
    forgotLink: lang === 'de' ? 'Passwort vergessen?' : 'Forgot password?',
    noAccount: lang === 'de' ? 'Noch kein Konto?' : "Don't have an account?",
    registerNow: lang === 'de' ? 'Jetzt registrieren' : 'Sign up now',
    backToLogin: lang === 'de' ? 'Zurück zum Login' : 'Back to Login',
    wrongCreds: lang === 'de' ? 'Falsche Email oder Passwort!' : 'Wrong email or password!',
    enterEmail: lang === 'de' ? 'Bitte Email eingeben!' : 'Please enter your email!',
    sendError: lang === 'de' ? 'Fehler beim Senden!' : 'Error sending email!',
    emailSent: lang === 'de' ? '✅ Email gesendet! Prüfe dein Postfach.' : '✅ Email sent! Check your inbox.',
  }

useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          if (redirectTo) { router.push(decodeURIComponent(redirectTo)); return }
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
          if (profile?.role === 'photographer') { router.push('/meine-events'); return }
          else { router.push('/kunden-dashboard'); return }
        }
      } catch (e) {
        console.error('check error:', e)
      }
      setCheckingSession(false)
    }
    check()

    const failsafe = setTimeout(() => setCheckingSession(false), 5000)
    return () => clearTimeout(failsafe)
  }, [])

const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(t.wrongCreds)
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
    } catch (e) {
      console.error('handleLogin error:', e)
      setError(t.wrongCreds)
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async () => {
    if (!email) { setError(t.enterEmail); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError(t.sendError) } else { setMessage(t.emailSent) }
    setLoading(false)
  }

  if (checkingSession) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>{lang === 'de' ? 'Lade...' : 'Loading...'}</p>
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

          <h1 style={{ color: '#e8eef4', fontSize: mode === 'login' ? 24 : 17, fontWeight: 900, marginBottom: 8, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {mode === 'login' ? t.login : t.forgotTitle}
          </h1>
          <p style={{ color: '#e8eef4', fontSize: 14, marginBottom: 24 }}>
            {mode === 'login' ? t.loginSubtitle : t.forgotSubtitle}
          </p>

          <input type="email" placeholder={t.email} value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && mode === 'login' && handleLogin()}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />

          {mode === 'login' && (
            <input type="password" placeholder={t.password} value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />
          )}

          <button onClick={mode === 'login' ? handleLogin : handleForgot} disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: '8px' }}>
            {loading ? t.loading : mode === 'login' ? t.loginBtn : t.resetBtn}
          </button>

          {error && <p style={{ color: '#ff4444', marginTop: '12px', fontSize: 14 }}>{error}</p>}
          {message && <p style={{ color: '#44ff88', marginTop: '12px', fontSize: 14 }}>{message}</p>}

          <div style={{ marginTop: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mode === 'login' ? (
              <>
                <button onClick={() => { setMode('forgot'); setError(''); setMessage('') }}
                  style={{ background: 'none', border: 'none', color: '#e8eef4', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>
                  {t.forgotLink}
                </button>
                <div style={{ borderTop: '1px solid #131e2a', paddingTop: 16 }}>
                  <span style={{ color: '#e8eef4', fontSize: 14 }}>{t.noAccount} </span>
                  <button onClick={() => router.push('/register')}
                    style={{ background: 'none', border: 'none', color: '#e8ff00', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                    {t.registerNow}
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => { setMode('login'); setError(''); setMessage('') }}
                style={{ background: 'none', border: 'none', color: '#e8eef4', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>
                {t.backToLogin}
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