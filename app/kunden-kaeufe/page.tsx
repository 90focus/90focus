'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/context/LanguageContext'

export default function KundenKaeufePage() {
  const [user, setUser] = useState<any>(null)
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const router = useRouter()
  const { lang } = useLanguage()

  const t = {
    myPurchases: lang === 'de' ? 'Meine Käufe' : 'My Purchases',
    purchasedPhotos: lang === 'de' ? 'Gekaufte Fotos' : 'Purchased Photos',
    noPurchases: lang === 'de' ? 'Keine Käufe vorhanden' : 'No purchases yet',
    buyNow: lang === 'de' ? 'Jetzt Fotos kaufen' : 'Buy photos now',
    loading: lang === 'de' ? 'Lade...' : 'Loading...',
    downloadAll: lang === 'de' ? 'Alle Fotos herunterladen' : 'Download All Photos',
    downloading: lang === 'de' ? 'Wird heruntergeladen...' : 'Downloading...',
  }

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }
        setUser(session.user)
        const { data, error } = await supabase.from('purchases').select('*, events(home_team, away_team, date)').eq('user_id', session.user.id).order('created_at', { ascending: false })
        if (error) {
          console.error('Purchases fetch error:', error)
        }
        setPurchases(data || [])
      } catch (e) {
        console.error('init error:', e)
      }
      setLoading(false)
    }
    init()

    const failsafe = setTimeout(() => setLoading(false), 5000)
    return () => clearTimeout(failsafe)
  }, [router])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? Math.min(i + 1, allPhotos.length - 1) : null)
      if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null ? Math.max(i - 1, 0) : null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const getImageUrl = (filename: string) =>
    `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`

  const allPhotos: string[] = purchases.flatMap((p) => p.photo_ids || [])

  const downloadOneFile = async (filename: string) => {
    const a = document.createElement('a')
    a.href = `/api/download-photo?filename=${encodeURIComponent(filename)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleDownloadAll = async () => {
    setDownloading(true)
    for (let i = 0; i < allPhotos.length; i++) {
      try {
        await downloadOneFile(allPhotos[i])
      } catch (e) {
        console.error('Download error for', allPhotos[i], e)
      }
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
    setDownloading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>{t.loading}</p>
    </div>
  )

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>

      {lightboxIndex !== null && (
        <div onClick={() => setLightboxIndex(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          )}
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={getImageUrl(allPhotos[lightboxIndex])} alt={`Foto ${lightboxIndex + 1}`} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }} />
          </div>
          {lightboxIndex < allPhotos.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          )}
          <div style={{ position: 'absolute', bottom: 20, color: '#667788', fontSize: 14 }}>{lightboxIndex + 1} / {allPhotos.length}</div>
        </div>
      )}

      <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '60px auto 0', width: '100%' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{t.myPurchases}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{t.purchasedPhotos}</h1>
          {allPhotos.length > 0 && (
            <button onClick={handleDownloadAll} disabled={downloading}
              style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '10px 20px', fontWeight: 900, fontSize: 13, cursor: downloading ? 'wait' : 'pointer', textTransform: 'uppercase', letterSpacing: 1, opacity: downloading ? 0.7 : 1 }}>
              ⬇ {downloading ? t.downloading : t.downloadAll}
            </button>
          )}
        </div>

        {purchases.length === 0 ? (
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '40px', textAlign: 'center' }}>
            <div style={{ color: '#e8eef4', fontSize: 16, marginBottom: 16 }}>{t.noPurchases}</div>
            <button onClick={() => router.push('/spiele')}
              style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '12px 24px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase' }}>
              {t.buyNow}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {purchases.map((purchase) => {
              const photoList: string[] = purchase.photo_ids || []
              return (
                <div key={purchase.id} style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #1c2a38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: '#445566' }}>
                      {purchase.events?.home_team} · {purchase.events?.date}
                    </div>
                    <span style={{ color: '#e8ff00', fontWeight: 700 }}>€ {purchase.amount?.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 4 }}>
                    {photoList.map((filename: string) => {
                      const globalIndex = allPhotos.indexOf(filename)
                      return (
                        <div key={filename} onClick={() => setLightboxIndex(globalIndex)}
                          style={{ position: 'relative', display: 'block', aspectRatio: '1', overflow: 'hidden', borderRadius: 4, cursor: 'zoom-in' }}>
                          <img src={getImageUrl(filename)} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}