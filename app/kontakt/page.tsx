'use client'

import { useState } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'

export default function KontaktPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [betreff, setBetreff] = useState('')
  const [nachricht, setNachricht] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { lang } = useLanguage()

  const t = {
    title: lang === 'de' ? 'Kontakt' : 'Contact',
    sentTitle: lang === 'de' ? 'Nachricht gesendet!' : 'Message sent!',
    sentText: lang === 'de' ? 'Wir melden uns innert 24 Stunden bei dir.' : "We'll get back to you within 24 hours.",
    name: lang === 'de' ? 'Name' : 'Name',
    email: 'Email',
    betreff: lang === 'de' ? 'Betreff' : 'Subject',
    nachricht: lang === 'de' ? 'Nachricht' : 'Message',
    senden: lang === 'de' ? 'Senden' : 'Send',
    sending: lang === 'de' ? 'Senden...' : 'Sending...',
    required: lang === 'de' ? 'Bitte alle Pflichtfelder ausfüllen!' : 'Please fill in all required fields!',
    sendError: lang === 'de' ? 'Fehler beim Senden!' : 'Error sending message!',
    responseTime: lang === 'de' ? 'Antwort innert 24 Stunden' : 'Response within 24 hours',
  }

  const handleSubmit = async () => {
    if (!name || !email || !nachricht) { setError(t.required); return }
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
        setError(t.sendError)
      }
    } catch {
      setError(t.sendError)
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
      <div style={{ maxWidth: 1000, margin: '60px auto 0', padding: '40px 20px' }}>
        <div style={{ color: '#fff', fontSize: 28, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>{t.title}</div>

        {sent ? (
          <div style={{ background: 'rgba(68,255,136,0.08)', border: '1px solid #44ff88', borderRadius: 12, padding: '28px 20px', textAlign: 'center', maxWidth: 420 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(68,255,136,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#44ff88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#44ff88', marginBottom: 6 }}>{t.sentTitle}</div>
            <div style={{ color: '#8899aa', fontSize: 13 }}>{t.sentText}</div>
          </div>
        ) : (
          <div className="kontakt-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 48, alignItems: 'start' }}>

            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#e8eef4', marginBottom: 6, display: 'block' }}>{t.name} <span style={{ color: '#ff4444' }}>*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#e8eef4', marginBottom: 6, display: 'block' }}>{t.email} <span style={{ color: '#ff4444' }}>*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#e8eef4', marginBottom: 6, display: 'block' }}>{t.betreff}</label>
                <input type="text" value={betreff} onChange={(e) => setBetreff(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: '#e8eef4', marginBottom: 6, display: 'block' }}>{t.nachricht} <span style={{ color: '#ff4444' }}>*</span></label>
                <textarea value={nachricht} onChange={(e) => setNachricht(e.target.value)} rows={6}
                  style={{ ...inputStyle, resize: 'vertical' as any }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={handleSubmit} disabled={loading}
                  style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '14px 60px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  {loading ? t.sending : t.senden}
                </button>
              </div>

              {error && <p style={{ color: '#ff4444', marginTop: 16, fontSize: 14 }}>{error}</p>}
            </div>

            <div className="kontakt-info" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8ff00" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                <span style={{ fontSize: 15 }}>info@sport-shot.ch</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8ff00" strokeWidth="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
                <span style={{ fontSize: 15 }}>{t.responseTime}</span>
              </div>

              <div style={{ display: 'flex', gap: 18 }}>
                <a href="https://www.instagram.com/90focus_official/" target="_blank" rel="noopener noreferrer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.2" cy="6.8" r="0.9" fill="#fff" stroke="none"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/90focus" target="_blank" rel="noopener noreferrer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                    <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.24-1.46 1.5-1.46h1.6V4.46C16.3 4.32 15.4 4.24 14.35 4.24c-2.4 0-4.05 1.46-4.05 4.15v2.31H7.8v3h2.5V21h3.2z"/>
                  </svg>
                </a>
                <a href="mailto:info@sport-shot.ch" style={{ color: '#e8eef4' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                </a>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}