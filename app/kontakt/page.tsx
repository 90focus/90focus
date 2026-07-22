'use client'

import { useState } from 'react'

export default function KontaktPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [nachricht, setNachricht] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name || !email || !nachricht) { setError('Bitte alle Felder ausfüllen!'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, nachricht })
      })
      if (res.ok) {
        setMessage('✅ Nachricht gesendet! Wir melden uns bald.')
        setName(''); setEmail(''); setNachricht('')
      } else {
        setError('Fehler beim Senden!')
      }
    } catch {
      setError('Fehler beim Senden!')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 600, margin: '60px auto 0', padding: '60px 24px', flex: 1 }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Kontakt</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>Schreib uns</h1>
        <p style={{ color: '#445566', marginBottom: 40 }}>Wir antworten dir so schnell wie möglich.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '14px', fontSize: '15px', background: '#0d1219', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '14px', fontSize: '15px', background: '#0d1219', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any }} />
          <textarea placeholder="Nachricht" value={nachricht} onChange={(e) => setNachricht(e.target.value)} rows={6}
            style={{ width: '100%', padding: '14px', fontSize: '15px', background: '#0d1219', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any, resize: 'vertical' as any }} />
          <button onClick={handleSubmit} disabled={loading}
            style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '14px', fontWeight: 900, fontSize: 16, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            {loading ? 'Senden...' : 'Nachricht senden'}
          </button>
        </div>

        {message && <p style={{ color: '#44ff88', marginTop: 16, fontSize: 14 }}>{message}</p>}
        {error && <p style={{ color: '#ff4444', marginTop: 16, fontSize: 14 }}>{error}</p>}

        <div style={{ marginTop: 48, padding: '24px', background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8 }}>
          <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Direkt erreichen</div>
          <div style={{ color: '#667788', fontSize: 14 }}>📧 info@90focus.ch</div>
        </div>
      </div>
    </div>
  )
}