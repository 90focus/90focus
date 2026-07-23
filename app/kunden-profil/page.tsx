'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function KundenProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(prof)
      setLoading(false)
    }
    init()
  }, [router])

  const handlePassword = async () => {
    if (!oldPassword || !newPassword) { setError('Bitte beide Felder ausfüllen!'); return }
    if (newPassword.length < 6) { setError('Neues Passwort muss mindestens 6 Zeichen haben!'); return }
    setMessage(''); setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: oldPassword })
    if (signInError) { setError('Altes Passwort ist falsch!'); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setError('Fehler beim Ändern!'); return }
    setMessage('✅ Passwort erfolgreich geändert!')
    setOldPassword(''); setNewPassword('')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>Lade...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '40px 32px', maxWidth: '700px', margin: '60px auto 0', flex: 1, width: '100%' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Mein Profil</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>
          {profile?.vorname} {profile?.nachname}
        </h1>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px', marginBottom: 24 }}>
          <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Konto Info</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e8eef4' }}>Name</span>
              <span>{profile?.vorname} {profile?.nachname}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e8eef4' }}>Email</span>
              <span>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e8eef4' }}>Mitglied seit</span>
              <span>{new Date(user?.created_at).toLocaleDateString('de-CH')}</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px', marginBottom: 24 }}>
          <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Meine Käufe</div>
          <div style={{ color: '#e8eef4', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
            Keine Käufe vorhanden<br />
            <button onClick={() => router.push('/spiele')}
              style={{ background: 'transparent', color: '#e8ff00', border: 'none', cursor: 'pointer', fontSize: 14, marginTop: 8, textDecoration: 'underline' }}>
              Jetzt Fotos kaufen
            </button>
          </div>
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px', marginBottom: 24 }}>
          <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Rechnungen</div>
          <div style={{ color: '#e8eef4', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
            Keine Rechnungen vorhanden
          </div>
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px', marginBottom: 24 }}>
          <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Passwort ändern</div>
          <input type="password" placeholder="Altes Passwort" value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any, marginBottom: 12 }} />
          <input type="password" placeholder="Neues Passwort (min. 6 Zeichen)" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any, marginBottom: 16 }} />
          <button onClick={handlePassword}
            style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '10px 24px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>
            Passwort ändern
          </button>
          {message && <p style={{ color: '#44ff88', fontSize: 14, marginTop: 12 }}>{message}</p>}
          {error && <p style={{ color: '#ff4444', fontSize: 14, marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    </div>
  )
}