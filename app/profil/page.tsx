'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/context/LanguageContext'

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const router = useRouter()
  const { lang } = useLanguage()

  const t = {
    account: lang === 'de' ? 'Konto' : 'Account',
    profile: lang === 'de' ? '👤 Profil' : '👤 Profile',
    email: 'Email',
    changeName: lang === 'de' ? 'Name ändern' : 'Change Name',
    yourName: lang === 'de' ? 'Dein Name' : 'Your Name',
    saveName: lang === 'de' ? 'Name speichern' : 'Save Name',
    changePassword: lang === 'de' ? '🔑 Passwort ändern' : '🔑 Change Password',
    newPassword: lang === 'de' ? 'Neues Passwort' : 'New Password',
    confirmPassword: lang === 'de' ? 'Passwort bestätigen' : 'Confirm Password',
    changePwBtn: lang === 'de' ? 'Passwort ändern' : 'Change Password',
    logout: lang === 'de' ? 'Abmelden' : 'Log Out',
    logoutText: lang === 'de' ? 'Du wirst zur Login-Seite weitergeleitet.' : "You'll be redirected to the login page.",
    loading: lang === 'de' ? 'Lade...' : 'Loading...',
    errorPrefix: lang === 'de' ? 'Fehler: ' : 'Error: ',
    nameSaved: lang === 'de' ? '✅ Name gespeichert!' : '✅ Name saved!',
    enterPassword: lang === 'de' ? 'Bitte neues Passwort eingeben!' : 'Please enter a new password!',
    noMatch: lang === 'de' ? 'Passwörter stimmen nicht überein!' : 'Passwords do not match!',
    tooShort: lang === 'de' ? 'Passwort muss mindestens 6 Zeichen haben!' : 'Password must be at least 6 characters!',
    pwChanged: lang === 'de' ? '✅ Passwort geändert!' : '✅ Password changed!',
  }

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
    if (error) { setMessage(t.errorPrefix + error.message) } else { setMessage(t.nameSaved) }
  }

  const savePassword = async () => {
    if (!newPassword) { setPasswordMessage(t.enterPassword); return }
    if (newPassword !== confirmPassword) { setPasswordMessage(t.noMatch); return }
    if (newPassword.length < 6) { setPasswordMessage(t.tooShort); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPasswordMessage(t.errorPrefix + error.message) } else {
      setPasswordMessage(t.pwChanged)
      setNewPassword(''); setConfirmPassword('')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>{t.loading}</p>
    </div>
  )

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '24px 16px', maxWidth: '600px', margin: '60px auto 0' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{t.account}</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>{t.profile}</h1>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '24px', borderRadius: '8px', marginBottom: '16px' }}>
          <div style={{ color: '#445566', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{t.email}</div>
          <div style={{ fontSize: 16, color: '#e8eef4' }}>{user?.email}</div>
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '24px', borderRadius: '8px', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#e8eef4' }}>{t.changeName}</h3>
          <input type="text" placeholder={t.yourName} value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <button onClick={saveName}
            style={{ padding: '10px 24px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 900, marginTop: 8 }}>
            {t.saveName}
          </button>
          {message && <p style={{ color: message.startsWith('Fehler') || message.startsWith('Error') ? '#ff4444' : '#44ff88', marginTop: 8, fontSize: 14 }}>{message}</p>}
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '24px', borderRadius: '8px', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#e8eef4' }}>{t.changePassword}</h3>
          <input type="password" placeholder={t.newPassword} value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <input type="password" placeholder={t.confirmPassword} value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          <button onClick={savePassword}
            style={{ padding: '10px 24px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 900, marginTop: 8 }}>
            {t.changePwBtn}
          </button>
          {passwordMessage && <p style={{ color: passwordMessage.startsWith('Fehler') || passwordMessage.startsWith('Error') || passwordMessage.includes('nicht') || passwordMessage.includes('mindestens') || passwordMessage.includes('not match') || passwordMessage.includes('at least') ? '#ff4444' : '#44ff88', marginTop: 8, fontSize: 14 }}>{passwordMessage}</p>}
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#e8eef4' }}>{t.logout}</h3>
          <p style={{ color: '#445566', fontSize: 14, marginBottom: 16 }}>{t.logoutText}</p>
          <button onClick={handleLogout}
            style={{ padding: '10px 24px', background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  )
}