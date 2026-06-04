'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      setName(session.user.user_metadata?.name || '')
      setLoading(false)
    }
    init()
  }, [router])

  const saveName = async () => {
    const { error } = await supabase.auth.updateUser({ data: { name: name } })
    if (error) { setMessage('Fehler: ' + error.message) } else { setMessage('✅ Name gespeichert!') }
  }

  const savePassword = async () => {
    if (!newPassword) { setPasswordMessage('Bitte neues Passwort eingeben!'); return }
    if (newPassword !== confirmPassword) { setPasswordMessage('Passwörter stimmen nicht überein!'); return }
    if (newPassword.length < 6) { setPasswordMessage('Passwort muss mindestens 6 Zeichen haben!'); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPasswordMessage('Fehler: ' + error.message) } else {
      setPasswordMessage('✅ Passwort geändert!')
      setNewPassword(''); setConfirmPassword('')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>Lade...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      {/* NAV FIXED */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/meine-events')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={{ background: 'transparent', color: '#e8ff00', border: '1px solid #e8ff00', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/meine-events')}>Meine Events</button>
          <button style={{ background: 'transparent', color: '#e8ff00', border: '1px solid #e8ff00', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/admin')}>+ Spiel erstellen</button>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/profil')}>Profil</button>
          <button onClick={handleLogout}
            style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}>
            Abmelden
          </button>
        </div>
      </nav>

      <div style={{ padding: '40px', maxWidth: '600px', margin: '60px auto 0' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Konto</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>👤 Profil</h1>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '24px', borderRadius: '8px', marginBottom: '16px' }}>
          <div style={{ color: '#445566', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Email</div>
          <div style={{ fontSize: 16, color: '#e8eef4' }}>{user?.email}</div>
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '24px', borderRadius: '8px', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#e8eef4' }}>Name ändern</h3>
          <input type="text" placeholder="Dein Name" value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <button onClick={saveName}
            style={{ padding: '10px 24px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 900, marginTop: 8 }}>
            Name speichern
          </button>
          {message && <p style={{ color: message.startsWith('Fehler') ? '#ff4444' : '#44ff88', marginTop: 8, fontSize: 14 }}>{message}</p>}
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '24px', borderRadius: '8px', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#e8eef4' }}>🔑 Passwort ändern</h3>
          <input type="password" placeholder="Neues Passwort" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <input type="password" placeholder="Passwort bestätigen" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <button onClick={savePassword}
            style={{ padding: '10px 24px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 900, marginTop: 8 }}>
            Passwort ändern
          </button>
          {passwordMessage && <p style={{ color: passwordMessage.startsWith('Fehler') || passwordMessage.includes('nicht') || passwordMessage.includes('mindestens') ? '#ff4444' : '#44ff88', marginTop: 8, fontSize: 14 }}>{passwordMessage}</p>}
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#e8eef4' }}>Abmelden</h3>
          <p style={{ color: '#445566', fontSize: 14, marginBottom: 16 }}>Du wirst zur Login-Seite weitergeleitet.</p>
          <button onClick={handleLogout}
            style={{ padding: '10px 24px', background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
            Abmelden
          </button>
        </div>
      </div>
    </div>
  )
}