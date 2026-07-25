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

    setMessage('✅ Registrierung erfolgreich! Bitte prüfe deine Email und bestätige dein Konto.')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', marginTop: 60 }}>
        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '480px' }}>
          <div style={{ marginBottom: 32 }}>
            <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1, fontStyle: 'italic' }}>
              <span style={{ color: '#e8eef4' }}>SPORT</span><span style={{ color: '#e8ff00' }}>SHOT</span>
            </span>
          </div>

          <h1 style={{ color: '#e8eef4', fontSize: 24, fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>Konto erstellen</h1>
          <p style={{ color: '#e8eef4', fontSize: 14, marginBottom: 24 }}>Registriere dich um deine Fotos zu kaufen und zu verwalten.</p>

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
            <label style={{ display: 'block', fontSize: '13px', color: '#e8eef4', marginBottom: 4 }}>Geburtsdatum *</label>
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
            <span style={{ color: '#e8eef4', fontSize: 14 }}>Bereits ein Konto? </span>
            <button onClick={() => router.push('/login')}
              style={{ background: 'none', border: 'none', color: '#e8ff00', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              Einloggen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}