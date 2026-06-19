'use client'

import { useState } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [geburtsdatum, setGeburtsdatum] = useState('')
  const [datenschutz, setDatenschutz] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [hoveredFooter, setHoveredFooter] = useState<string | null>(null)
  const router = useRouter()

  const handleRegister = async () => {
    if (!vorname || !nachname || !email || !password || !geburtsdatum) {
      setError('Vorname, Nachname, Email, Passwort und Geburtsdatum sind Pflichtfelder!')
      return
    }
    if (password.length < 6) { setError('Passwort muss mindestens 6 Zeichen haben!'); return }
    if (!datenschutz) { setError('Bitte akzeptiere die Datenschutzerklärung!'); return }
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { role: 'customer', vorname, nachname, geburtsdatum }
      }
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Diese Email ist bereits registriert! Bitte einloggen.')
      } else {
        setError('Fehler: ' + signUpError.message)
      }
      setLoading(false)
      return
    }

    if (!data.user || data.user.identities?.length === 0) {
      setError('Diese Email ist bereits registriert! Bitte einloggen.')
      setLoading(false)
      return
    }

    setMessage('✅ Registrierung erfolgreich! Bitte prüfe deine Email und bestätige dein Konto.')
    setLoading(false)
  }

  const footerLink = (key: string) => ({
    color: hoveredFooter === key ? '#e8ff00' : '#e8eef4',
    fontSize: 14, cursor: 'pointer',
    transition: 'color 0.15s ease'
  })

  const footerA = (key: string) => ({
    color: hoveredFooter === key ? '#e8ff00' : '#e8eef4',
    fontSize: 14, textDecoration: 'none',
    display: 'flex', alignItems: 'center', gap: 8,
    transition: 'color 0.15s ease'
  })

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
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/login')}>Login</button>
          <button style={{ background: 'transparent', color: '#e8ff00', border: '1px solid #e8ff00', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/register')}>Sign Up</button>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', marginTop: 60 }}>
        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, background: '#e8ff00', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 16 }}>90</span>
            </div>
            <span style={{ color: '#e8eef4', fontWeight: 900, fontSize: 22, letterSpacing: 2 }}>FOCUS</span>
          </div>

          <h1 style={{ color: '#e8eef4', fontSize: 24, fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>Konto erstellen</h1>
          <p style={{ color: '#445566', fontSize: 14, marginBottom: 24 }}>Registriere dich um deine Fotos zu kaufen und zu verwalten.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <input type="text" placeholder="Vorname *" value={vorname} onChange={(e) => setVorname(e.target.value)}
              style={{ padding: '12px', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />
            <input type="text" placeholder="Nachname *" value={nachname} onChange={(e) => setNachname(e.target.value)}
              style={{ padding: '12px', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />
          </div>

          <input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '6px 0', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />

          <input type="password" placeholder="Passwort * (min. 6 Zeichen)" value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '6px 0', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />

          <div style={{ margin: '6px 0' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#667788', marginBottom: 4 }}>Geburtsdatum *</label>
            <input type="date" value={geburtsdatum} onChange={(e) => setGeburtsdatum(e.target.value)}
              style={{ width: '100%', padding: '12px', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, margin: '16px 0', padding: '16px', background: '#131e2a', borderRadius: 8, border: datenschutz ? '1px solid #e8ff00' : '1px solid #1c2a38' }}>
            <input type="checkbox" id="datenschutz" checked={datenschutz} onChange={(e) => setDatenschutz(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer', marginTop: 2, flexShrink: 0 }} />
            <label htmlFor="datenschutz" style={{ color: '#e8eef4', fontSize: 14, cursor: 'pointer', lineHeight: 1.5 }}>
              Ich habe die{' '}
              <span style={{ color: '#e8ff00', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => window.open('/datenschutz', '_blank')}>
                Datenschutzerklärung
              </span>
              {' '}gelesen und akzeptiere diese. *
            </label>
          </div>

          <button onClick={handleRegister} disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: '8px' }}>
            {loading ? 'Registrierung...' : 'Konto erstellen'}
          </button>

          {error && <p style={{ color: '#ff4444', marginTop: '12px', fontSize: 14 }}>{error}</p>}
          {message && <p style={{ color: '#44ff88', marginTop: '12px', fontSize: 14 }}>{message}</p>}

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <span style={{ color: '#445566', fontSize: 14 }}>Bereits ein Konto? </span>
            <button onClick={() => router.push('/login')}
              style={{ background: 'none', border: 'none', color: '#e8ff00', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              Einloggen
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1c2a38", padding: "40px 48px 32px", background: "#070b0f" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, background: "#e8ff00", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#070b0f", fontWeight: 900, fontSize: 14 }}>90</span>
                </div>
                <span style={{ color: "#e8eef4", fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
              </div>
              <p style={{ color: "#e8eef4", fontSize: 13, maxWidth: 260, lineHeight: 1.6 }}>
                Deine Momente für immer festgehalten.
              </p>
            </div>

            <div>
              <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={footerLink('home')} onMouseEnter={() => setHoveredFooter('home')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/')}>Home</span>
                <span style={footerLink('spiele')} onMouseEnter={() => setHoveredFooter('spiele')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/spiele')}>Alle Spiele</span>
                <span style={footerLink('faq')} onMouseEnter={() => setHoveredFooter('faq')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/faq')}>FAQ</span>
                <span style={footerLink('kontakt')} onMouseEnter={() => setHoveredFooter('kontakt')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/kontakt')}>Kontakt</span>
              </div>
            </div>

            <div>
              <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Rechtliches</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={footerLink('impressum')} onMouseEnter={() => setHoveredFooter('impressum')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/impressum')}>Impressum</span>
                <span style={footerLink('datenschutz')} onMouseEnter={() => setHoveredFooter('datenschutz')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/datenschutz')}>Datenschutz</span>
              </div>
            </div>

            <div>
              <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Social Media</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="https://www.instagram.com/90focus" target="_blank" rel="noopener noreferrer"
                  style={footerA('instagram') as any}
                  onMouseEnter={() => setHoveredFooter('instagram')} onMouseLeave={() => setHoveredFooter(null)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                  Instagram
                </a>
                <a href="https://www.facebook.com/90focus" target="_blank" rel="noopener noreferrer"
                  style={footerA('facebook') as any}
                  onMouseEnter={() => setHoveredFooter('facebook')} onMouseLeave={() => setHoveredFooter(null)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  Facebook
                </a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #1c2a38", paddingTop: 20 }}>
            <span style={{ color: "#e8eef4", fontSize: 13 }}>© 2026 90Focus</span>
          </div>
        </div>
      </footer>
    </div>
  )
}