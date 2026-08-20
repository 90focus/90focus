'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/context/LanguageContext'

export default function KundenProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [purchaseCount, setPurchaseCount] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { lang } = useLanguage()

  const t = {
    myProfile: lang === 'de' ? 'Mein Profil' : 'My Profile',
    accountInfo: lang === 'de' ? 'Konto Info' : 'Account Info',
    name: lang === 'de' ? 'Name' : 'Name',
    email: 'Email',
    memberSince: lang === 'de' ? 'Mitglied seit' : 'Member since',
    myPurchases: lang === 'de' ? 'Meine Käufe' : 'My Purchases',
    noPurchases: lang === 'de' ? 'Keine Käufe vorhanden' : 'No purchases yet',
    buyNow: lang === 'de' ? 'Jetzt Fotos kaufen' : 'Buy photos now',
    invoices: lang === 'de' ? 'Rechnungen' : 'Invoices',
    noInvoices: lang === 'de' ? 'Keine Rechnungen vorhanden' : 'No invoices yet',
    changePassword: lang === 'de' ? 'Passwort ändern' : 'Change Password',
    oldPassword: lang === 'de' ? 'Altes Passwort' : 'Old Password',
    newPassword: lang === 'de' ? 'Neues Passwort (min. 6 Zeichen)' : 'New Password (min. 6 characters)',
    fillBoth: lang === 'de' ? 'Bitte beide Felder ausfüllen!' : 'Please fill in both fields!',
    tooShort: lang === 'de' ? 'Neues Passwort muss mindestens 6 Zeichen haben!' : 'New password must be at least 6 characters!',
    wrongOld: lang === 'de' ? 'Altes Passwort ist falsch!' : 'Old password is incorrect!',
    changeError: lang === 'de' ? 'Fehler beim Ändern!' : 'Error changing password!',
    changeSuccess: lang === 'de' ? '✅ Passwort erfolgreich geändert!' : '✅ Password changed successfully!',
    loading: lang === 'de' ? 'Lade...' : 'Loading...',
  }

useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }
        setUser(session.user)
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        setProfile(prof)

        const { data: purchaseRows, error: purchaseError } = await supabase.from('purchases').select('photo_ids').eq('user_id', session.user.id)
        if (purchaseError) {
          console.error('Purchases fetch error:', purchaseError)
        }
        const totalPhotos = (purchaseRows || []).reduce((sum, row) => sum + ((row.photo_ids || []).length), 0)
        setPurchaseCount(totalPhotos)
      } catch (e) {
        console.error('init error:', e)
      }
      setLoading(false)
    }
    init()

    const failsafe = setTimeout(() => setLoading(false), 5000)
    return () => clearTimeout(failsafe)
  }, [router])

  const handlePassword = async () => {
    if (!oldPassword || !newPassword) { setError(t.fillBoth); return }
    if (newPassword.length < 6) { setError(t.tooShort); return }
    setMessage(''); setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: oldPassword })
    if (signInError) { setError(t.wrongOld); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setError(t.changeError); return }
    setMessage(t.changeSuccess)
    setOldPassword(''); setNewPassword('')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>{t.loading}</p>
    </div>
  )

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '40px 32px', maxWidth: '700px', margin: '60px auto 0', width: '100%' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{t.myProfile}</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>
          {profile?.vorname} {profile?.nachname}
        </h1>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px', marginBottom: 24 }}>
          <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{t.accountInfo}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e8eef4' }}>{t.name}</span>
              <span>{profile?.vorname} {profile?.nachname}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e8eef4' }}>{t.email}</span>
              <span>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e8eef4' }}>{t.memberSince}</span>
              <span>{new Date(user?.created_at).toLocaleDateString(lang === 'de' ? 'de-CH' : 'en-GB')}</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px', marginBottom: 24 }}>
          <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{t.myPurchases}</div>
          {purchaseCount === 0 ? (
            <div style={{ color: '#e8eef4', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
              {t.noPurchases}<br />
              <button onClick={() => router.push('/spiele')}
                style={{ background: 'transparent', color: '#e8ff00', border: 'none', cursor: 'pointer', fontSize: 14, marginTop: 8, textDecoration: 'underline' }}>
                {t.buyNow}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <span style={{ color: '#e8eef4', fontSize: 14 }}>{purchaseCount} {lang === 'de' ? 'Foto(s)' : 'Photo(s)'}</span>
              <button onClick={() => router.push('/kunden-kaeufe')}
                style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 900, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase' }}>
                {lang === 'de' ? 'Anzeigen' : 'View'}
              </button>
            </div>
          )}
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px', marginBottom: 24 }}>
          <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{t.invoices}</div>
          <div style={{ color: '#e8eef4', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
            {t.noInvoices}
          </div>
        </div>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px', marginBottom: 24 }}>
          <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{t.changePassword}</div>
          <input type="password" placeholder={t.oldPassword} value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any, marginBottom: 12 }} />
          <input type="password" placeholder={t.newPassword} value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', fontSize: '15px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4', boxSizing: 'border-box' as any, marginBottom: 16 }} />
          <button onClick={handlePassword}
            style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '10px 24px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>
            {t.changePassword}
          </button>
          {message && <p style={{ color: '#44ff88', fontSize: 14, marginTop: 12 }}>{message}</p>}
          {error && <p style={{ color: '#ff4444', fontSize: 14, marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    </div>
  )
}