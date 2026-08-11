'use client'

import { useState } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/context/LanguageContext'

export default function RegisterPage() {
  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [geburtsdatum, setGeburtsdatum] = useState('')
  const [datenschutz, setDatenschutz] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [modalUrl, setModalUrl] = useState<string | null>(null)
  const router = useRouter()
  const { lang } = useLanguage()

  const t = {
    createAccount: lang === 'de' ? 'Konto erstellen' : 'Create Account',
    subtitle: lang === 'de' ? 'Registriere dich um deine Fotos zu kaufen und zu verwalten.' : 'Register to buy and manage your photos.',
    vorname: lang === 'de' ? 'Vorname' : 'First Name',
    nachname: lang === 'de' ? 'Nachname' : 'Last Name',
    email: 'Email',
    password: lang === 'de' ? 'Passwort' : 'Password',
    passwordHint: lang === 'de' ? '(min. 6 Zeichen)' : '(min. 6 characters)',
    geburtsdatum: lang === 'de' ? 'Geburtsdatum' : 'Date of Birth',
    agbText1: lang === 'de' ? 'Ich habe die' : 'I have read and accept the',
    agb: 'AGB',
    agbText2: lang === 'de' ? 'und' : 'and',
    datenschutz: lang === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy',
    agbText3: lang === 'de' ? 'gelesen und akzeptiere diese.' : '.',
    registering: lang === 'de' ? 'Registrierung...' : 'Registering...',
    createBtn: lang === 'de' ? 'Konto erstellen' : 'Create Account',
    alreadyAccount: lang === 'de' ? 'Bereits ein Konto?' : 'Already have an account?',
    login: lang === 'de' ? 'Einloggen' : 'Log In',
    successTitle: lang === 'de' ? 'Registrierung erfolgreich!' : 'Registration successful!',
    successText: lang === 'de' ? 'Bitte prüfe deine Email und bestätige dein Konto.' : 'Please check your email and confirm your account.',
    spamHint: lang === 'de' ? 'Schau auch im Spam-Ordner nach.' : 'Also check your spam folder.',
    requiredFields: lang === 'de' ? 'Vorname, Nachname, Email, Passwort und Geburtsdatum sind Pflichtfelder!' : 'First name, last name, email, password and date of birth are required!',
    passwordTooShort: lang === 'de' ? 'Passwort muss mindestens 6 Zeichen haben!' : 'Password must be at least 6 characters!',
    acceptPrivacy: lang === 'de' ? 'Bitte akzeptiere die Datenschutzerklärung!' : 'Please accept the Privacy Policy!',
    alreadyRegistered: lang === 'de' ? 'Diese Email ist bereits registriert! Bitte einloggen.' : 'This email is already registered! Please log in.',
    errorPrefix: lang === 'de' ? 'Fehler: ' : 'Error: ',
  }

const handleRegister = async () => {
    if (!vorname || !nachname || !email || !password || !geburtsdatum) {
      setError(t.requiredFields)
      return
    }
    if (password.length < 6) { setError(t.passwordTooShort); return }
    if (!datenschutz) { setError(t.acceptPrivacy); return }
    setLoading(true)
    setError('')

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { role: 'customer', vorname, nachname, geburtsdatum, lang, agb_datenschutz_akzeptiert_am: new Date().toISOString() }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError(t.alreadyRegistered)
        } else {
          setError(t.errorPrefix + signUpError.message)
        }
        return
      }

      setSent(true)
    } catch (e) {
      console.error('handleRegister error:', e)
      setError(t.errorPrefix + 'Verbindungsfehler, bitte erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', width: '100%', overflowX: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', marginTop: 60, boxSizing: 'border-box' as any }}>
        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: '12px', padding: '32px 24px', width: '100%', maxWidth: '480px', boxSizing: 'border-box' as any }}>
          <div style={{ marginBottom: 32 }}>
            <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1, fontStyle: 'italic' }}>
              <span style={{ color: '#e8eef4' }}>SPORT</span><span style={{ color: '#e8ff00' }}>SHOT</span>
            </span>
          </div>

          {sent ? (
            <div style={{ background: 'rgba(68,255,136,0.08)', border: '1px solid #44ff88', borderRadius: 12, padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(68,255,136,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#44ff88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#44ff88', marginBottom: 8 }}>{t.successTitle}</div>
              <div style={{ color: '#8899aa', fontSize: 14, marginBottom: 8 }}>{t.successText}</div>
              <div style={{ color: '#e8ff00', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>{t.spamHint}</div>
            </div>
          ) : (
            <>
              <h1 style={{ color: '#e8eef4', fontSize: 24, fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>{t.createAccount}</h1>
              <p style={{ color: '#e8eef4', fontSize: 14, marginBottom: 24 }}>{t.subtitle}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12, minWidth: 0 }}>
                <input type="text" placeholder={`${t.vorname} *`} value={vorname} onChange={(e) => setVorname(e.target.value)}
                  style={{ width: '100%', minWidth: 0, padding: '12px', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />
                <input type="text" placeholder={`${t.nachname} *`} value={nachname} onChange={(e) => setNachname(e.target.value)}
                  style={{ width: '100%', minWidth: 0, padding: '12px', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />
              </div>

              <input type="email" placeholder={`${t.email} *`} value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', margin: '6px 0', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />

              <input type="password" placeholder={`${t.password} * ${t.passwordHint}`} value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', margin: '6px 0', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />

              <div style={{ margin: '6px 0' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#e8eef4', marginBottom: 4 }}>{t.geburtsdatum} *</label>
                <input type="date" value={geburtsdatum} onChange={(e) => setGeburtsdatum(e.target.value)}
                  style={{ width: '100%', padding: '12px', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, margin: '16px 0', padding: '16px', background: '#131e2a', borderRadius: 8, border: datenschutz ? '1px solid #e8ff00' : '1px solid #1c2a38' }}>
                <input type="checkbox" id="datenschutz" checked={datenschutz} onChange={(e) => setDatenschutz(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', marginTop: 2, flexShrink: 0 }} />
                <label htmlFor="datenschutz" style={{ color: '#e8eef4', fontSize: 14, cursor: 'pointer', lineHeight: 1.5 }}>
                  {t.agbText1}{' '}
                  <span style={{ color: '#e8ff00', textDecoration: 'underline', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); setModalUrl('/agb-embed') }}>
                    {t.agb}
                  </span>
                  {' '}{t.agbText2}{' '}
                  <span style={{ color: '#e8ff00', textDecoration: 'underline', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); setModalUrl('/datenschutz-embed') }}>
                    {t.datenschutz}
                  </span>
                  {' '}{t.agbText3} *
                </label>
              </div>

              <button onClick={handleRegister} disabled={loading}
                style={{ width: '100%', padding: '14px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: '8px' }}>
                {loading ? t.registering : t.createBtn}
              </button>

              {error && <p style={{ color: '#ff4444', marginTop: '12px', fontSize: 14 }}>{error}</p>}

              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <span style={{ color: '#e8eef4', fontSize: 14 }}>{t.alreadyAccount} </span>
                <button onClick={() => router.push('/login')}
                  style={{ background: 'none', border: 'none', color: '#e8ff00', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                  {t.login}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {modalUrl && (
        <div onClick={() => setModalUrl(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#070b0f', border: '1px solid #1c2a38', borderRadius: 12, width: '95vw', maxWidth: 900, height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', borderBottom: '1px solid #1c2a38' }}>
              <button onClick={() => setModalUrl(null)} style={{ background: 'transparent', border: 'none', color: '#e8eef4', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
            <iframe src={modalUrl} style={{ border: 'none', flex: 1, width: '100%' }} />
          </div>
        </div>
      )}
    </div>
  )
}