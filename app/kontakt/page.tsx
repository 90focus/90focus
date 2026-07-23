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

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '60px auto 0', padding: '60px 24px' }}>
        <div style={{ color: '#e8ff00', fontSize: 14, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Kontakt</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 40 }}>Schreib uns</h1>

        {sent ? (
          <div style={{ background: 'rgba(68,255,136,0.08)', border: '1px solid #44ff88', borderRadius: 12, padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(68,255,136,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#44ff88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#44ff88', marginBottom: 8 }}>Nachricht gesendet!</div>
            <div style={{ color: '#8899aa', fontSize: 14 }}>Wir melden uns innert 24 Stunden bei dir.</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="text" placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '16px', fontSize: '15px', background: '#0d1219', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />
              <input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '16px', fontSize: '15px', background: '#0d1219', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />
              <input type="text" placeholder="Betreff" value={betreff} onChange={(e) => setBetreff(e.target.value)}
                style={{ width: '100%', padding: '16px', fontSize: '15px', background: '#0d1219', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />
              <textarea placeholder="Nachricht *" value={nachricht} onChange={(e) => setNachricht(e.target.value)} rows={6}
                style={{ width: '100%', padding: '16px', fontSize: '15px', background: '#0d1219', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any, resize: 'vertical' as any }} />
              <button onClick={handleSubmit} disabled={loading}
                style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '12px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                {loading ? 'Senden...' : 'Nachricht senden'}
              </button>
            </div>

            {error && <p style={{ color: '#ff4444', marginTop: 16, fontSize: 14 }}>{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}