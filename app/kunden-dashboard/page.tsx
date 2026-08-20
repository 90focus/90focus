'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/context/LanguageContext'

export default function KundenDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState(0)
  const [hoveredSpiele, setHoveredSpiele] = useState(false)
  const [hoveredFotos, setHoveredFotos] = useState(false)
  const router = useRouter()
  const { lang } = useLanguage()

  const t = {
    hey: lang === 'de' ? 'Hey' : 'Hey',
    boughtPhotos: lang === 'de' ? 'Gekaufte Fotos' : 'Purchased Photos',
    photosInCollection: lang === 'de' ? 'Fotos in deiner Sammlung' : 'Photos in your collection',
    myPurchases: lang === 'de' ? 'Meine Käufe' : 'My Purchases',
    toMyPhotos: lang === 'de' ? 'Zu meinen Fotos' : 'To My Photos',
    view: lang === 'de' ? 'Anzeigen' : 'View',
    downloadAll: lang === 'de' ? 'Alle Fotos herunterladen' : 'Download all photos',
    findMoment: 'Find your Moment',
    toEvents: lang === 'de' ? 'Zu den Events' : 'To the Events',
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
          console.error('Purchases count error:', purchaseError)
        }
        const totalPhotos = (purchaseRows || []).reduce((sum, row) => sum + ((row.photo_ids || []).length), 0)
        setPurchases(totalPhotos)
      } catch (e) {
        console.error('init error:', e)
      }
      setLoading(false)
    }
    init()

    const failsafe = setTimeout(() => setLoading(false), 5000)
    return () => clearTimeout(failsafe)
  }, [router])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1, fontStyle: 'italic' }}>
          <span style={{ color: '#e8eef4' }}>SPORT</span><span style={{ color: '#e8ff00' }}>SHOT</span>
        </span>
        <p style={{ color: '#445566', marginTop: 16 }}>{t.loading}</p>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '48px 32px', maxWidth: '960px', margin: '0 auto', width: '100%', marginTop: 60 }}>

        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 42, fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
            {t.hey}, {profile?.vorname}! 👋
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 40 }}>
          <div style={{ background: 'linear-gradient(135deg, #0d1219 0%, #131e2a 100%)', border: '1px solid #1c2a38', borderRadius: 12, padding: '28px 24px' }}>
            <div style={{ color: '#e8eef4', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{t.boughtPhotos}</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#e8ff00', lineHeight: 1 }}>{purchases}</div>
            <div style={{ color: '#e8eef4', fontSize: 12, marginTop: 8 }}>{t.photosInCollection}</div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #0d1219 0%, #131e2a 100%)', border: '1px solid #1c2a38', borderRadius: 12, padding: '28px 24px' }}>
            <div style={{ color: '#e8eef4', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>{t.myPurchases}</div>
            <button
              onClick={() => router.push('/kunden-kaeufe')}
              onMouseEnter={() => setHoveredFotos(true)}
              onMouseLeave={() => setHoveredFotos(false)}
              style={{
                background: hoveredFotos ? '#d4e800' : '#e8ff00',
                color: '#070b0f', border: 'none', borderRadius: 4,
                padding: '10px 28px', fontWeight: 900, fontSize: 12,
                cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase',
                transform: hoveredFotos ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.15s ease',
                boxShadow: hoveredFotos ? '0 0 20px rgba(232,255,0,0.3)' : 'none',
              }}>
              {t.toMyPhotos}
            </button>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #0d1219 0%, #131e2a 100%)',
          border: '1px solid #1c2a38', borderRadius: 12, padding: '32px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, textTransform: 'uppercase', letterSpacing: -1, marginBottom: 20, marginTop: -4 }}>
            {t.findMoment}
          </h2>

          <button
            onClick={() => router.push('/spiele')}
            onMouseEnter={() => setHoveredSpiele(true)}
            onMouseLeave={() => setHoveredSpiele(false)}
            style={{
              background: hoveredSpiele ? '#d4e800' : '#e8ff00',
              color: '#070b0f', border: 'none', borderRadius: 4,
              padding: '10px 28px', fontWeight: 900, fontSize: 12,
              cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase',
              transform: hoveredSpiele ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.15s ease',
              boxShadow: hoveredSpiele ? '0 0 20px rgba(232,255,0,0.3)' : 'none',
              marginTop: 4
            }}>
            {t.toEvents}
          </button>
        </div>
      </div>
    </div>
  )
}