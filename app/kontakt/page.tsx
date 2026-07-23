'use client'

import { useState } from 'react'

export default function KontaktPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [betreff, setBetreff] = useState('')
  const [nachricht, setNachricht] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name || !email || !nachricht) { setError('Bitte alle Pflichtfelder ausfüllen!'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, betreff, nachricht })
      })
      if (res.ok) {
        setSent(true)
      } else {
        setError('Fehler beim Senden!')
      }
    } catch {
      setError('Fehler beim Senden!')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '14px', fontSize: '15px',
    background: '#0d1219', border: '1px solid #1c2a38',
    borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any
  }

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 1000, margin: '60px auto 0', padding: '60px 24px' }}>
     <div style={{ color: '#fff', fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 40 }}>Kontakt</div>

        {sent ? (
          <div style={{ background: 'rgba(68,255,136,0.08)', border: '1px solid #44ff88', borderRadius: 12, padding: '48px 32px', textAlign: 'center', maxWidth: 500 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(68,255,136,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#44ff88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#44ff88', marginBottom: 8 }}>Nachricht gesendet!</div>
            <div style={{ color: '#8899aa', fontSize: 14 }}>Wir melden uns innert 24 Stunden bei dir.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 60, alignItems: 'start' }}>

            <div>
              <div style={{ marginBottom: 16 }}>
<label style={{ fontSize: 13, color: '#e8eef4', marginBottom: 6, display: 'block' }}>Name <span style={{ color: '#ff4444' }}>*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ marginBottom: 16 }}>
<label style={{ fontSize: 13, color: '#e8eef4', marginBottom: 6, display: 'block' }}>Email <span style={{ color: '#ff4444' }}>*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#e8eef4', marginBottom: 6, display: 'block' }}>Betreff</label>
                <input type="text" value={betreff} onChange={(e) => setBetreff(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ marginBottom: 24 }}>
<label style={{ fontSize: 13, color: '#e8eef4', marginBottom: 6, display: 'block' }}>Nachricht <span style={{ color: '#ff4444' }}>*</span></label>
                <textarea value={nachricht} onChange={(e) => setNachricht(e.target.value)} rows={6}
                  style={{ ...inputStyle, resize: 'vertical' as any }} />
              </div>

<div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={handleSubmit} disabled={loading}
                  style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '14px 60px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  {loading ? 'Senden...' : 'Senden'}
                </button>
              </div>

              {error && <p style={{ color: '#ff4444', marginTop: 16, fontSize: 14 }}>{error}</p>}
            </div>

            <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8ff00" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                <span style={{ fontSize: 16 }}>info@sportshot.ch</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8ff00" strokeWidth="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
                <span style={{ fontSize: 16 }}>Antwort innert 24 Stunden</span>
              </div>

<div style={{ display: 'flex', gap: 18 }}>
                <a href="https://www.instagram.com/90focus_official/" target="_blank" rel="noopener noreferrer">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.2" cy="6.8" r="0.9" fill="#fff" stroke="none"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/90focus" target="_blank" rel="noopener noreferrer">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
                    <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.24-1.46 1.5-1.46h1.6V4.46C16.3 4.32 15.4 4.24 14.35 4.24c-2.4 0-4.05 1.46-4.05 4.15v2.31H7.8v3h2.5V21h3.2z"/>
                  </svg>
                </a>
                <a href="mailto:info@sportshot.ch" style={{ color: '#e8eef4' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                </a>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}