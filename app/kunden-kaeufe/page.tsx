'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/context/LanguageContext'

export default function KundenKaeufePage() {
  const [user, setUser] = useState<any>(null)
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { lang } = useLanguage()

  const t = {
    myPurchases: lang === 'de' ? 'Meine Käufe' : 'My Purchases',
    purchasedPhotos: lang === 'de' ? 'Gekaufte Fotos' : 'Purchased Photos',
    noPurchases: lang === 'de' ? 'Keine Käufe vorhanden' : 'No purchases yet',
    buyNow: lang === 'de' ? 'Jetzt Fotos kaufen' : 'Buy photos now',
    loading: lang === 'de' ? 'Lade...' : 'Loading...',
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data } = await supabase.from('purchases').select('*, events(home_team, away_team, date)').eq('user_id', session.user.id).order('datum', { ascending: false })
      setPurchases(data || [])
      setLoading(false)
    }
    init()
  }, [router])

  const getImageUrl = (filename: string) =>
    `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>{t.loading}</p>
    </div>
  )

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '60px auto 0', width: '100%' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{t.myPurchases}</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>{t.purchasedPhotos}</h1>

        {purchases.length === 0 ? (
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '40px', textAlign: 'center' }}>
            <div style={{ color: '#e8eef4', fontSize: 16, marginBottom: 16 }}>{t.noPurchases}</div>
            <button onClick={() => router.push('/spiele')}
              style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '12px 24px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase' }}>
              {t.buyNow}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {purchases.map((purchase) => (
              <div key={purchase.id} style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, overflow: 'hidden' }}>
                <img src={getImageUrl(purchase.foto_filename)} alt="Photo" style={{ width: '100%', display: 'block' }} />
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: 12, color: '#445566', marginBottom: 4 }}>
                    {purchase.events?.home_team} · {purchase.events?.date}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<span style={{ color: '#e8ff00', fontWeight: 700 }}>€ {purchase.preis?.toFixed(2)}</span>
                    <a href={getImageUrl(purchase.foto_filename)} download
                      style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 900, fontSize: 13, cursor: 'pointer', textDecoration: 'none', textTransform: 'uppercase' }}>
                      ⬇ Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}