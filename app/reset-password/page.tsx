'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async () => {
    if (!password) {
      setMessage('Bitte Passwort eingeben!')
      return
    }
    if (password !== confirmPassword) {
      setMessage('Passwörter stimmen nicht überein!')
      return
    }
    if (password.length < 6) {
      setMessage('Passwort muss mindestens 6 Zeichen haben!')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage('Fehler: ' + error.message)
    } else {
      setMessage('✅ Passwort erfolgreich geändert!')
      setTimeout(() => router.push('/dashboard'), 2000)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#070b0f', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#0d1219', border: '1px solid #1c2a38',
        borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '400px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, background: '#e8ff00', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 16 }}>90</span>
          </div>
          <span style={{ color: '#e8eef4', fontWeight: 900, fontSize: 22, letterSpacing: 2 }}>FOCUS</span>
        </div>

        <h1 style={{ color: '#e8eef4', fontSize: 24, fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>
          🔑 Neues Passwort
        </h1>
        <p style={{ color: '#445566', fontSize: 14, marginBottom: 24 }}>
          Gib dein neues Passwort ein.
        </p>

        <input type="password" placeholder="Neues Passwort" value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' }} />

        <input type="password" placeholder="Passwort bestätigen" value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleReset()}
          style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' }} />

        <button onClick={handleReset} disabled={loading}
          style={{ width: '100%', padding: '14px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: '8px' }}>
          {loading ? 'Speichert...' : 'Passwort speichern'}
        </button>

        {message && (
          <p style={{ color: message.startsWith('Fehler') || message.includes('nicht') || message.includes('mindestens') ? '#ff4444' : '#44ff88', marginTop: '12px', fontSize: 14 }}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}