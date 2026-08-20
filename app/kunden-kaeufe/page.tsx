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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
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
    photosCount: (n: number) => lang === 'de' ? `${n} Foto${n !== 1 ? 's' : ''}` : `${n} Photo${n !== 1 ? 's' : ''}`,
    back: lang === 'de' ? '← Zurück' : '← Back',
  }

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }
        setUser(session.user)
        const { data, error } = await supabase.from('purchases').select('*, events(home_team, away_team, date, bild_url)').eq('user_id', session.user.id).order('created_at', { ascending: false })
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
      const photos = selectedEvent?.photos || []
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? Math.min(i + 1, photos.length - 1) : null)
      if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null ? Math.max(i - 1, 0) : null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const getImageUrl = (filename: string) =>
    `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`

  // Gruppiere Käufe nach Event
  const eventGroups: Record<string, any> = {}
  purchases.forEach((p) => {
    const key = p.event_id || 'unknown'
    if (!eventGroups[key]) {
      eventGroups[key] = {
        eventId: p.event_id,
        event: p.events,
        photos: [] as string[],
        totalAmount: 0,
      }
    }
    eventGroups[key].photos.push(...(p.photo_ids || []))
    eventGroups[key].totalAmount += p.amount || 0
  })
  const eventList = Object.values(eventGroups)
  const selectedEvent: any = eventList.find((e: any) => e.eventId === selectedEventId)

  const downloadOneFile = async (filename: string) => {
    const a = document.createElement('a')
    a.href = `/api/download-photo?filename=${encodeURIComponent(filename)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleDownloadAll = async () => {
    if (!selectedEvent) return
    setDownloading(true)
    for (let i = 0; i < selectedEvent.photos.length; i++) {
      try {
        await downloadOneFile(selectedEvent.photos[i])
      } catch (e) {
        console.error('Download error for', selectedEvent.photos[i], e)
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

      {lightboxIndex !== null && selectedEvent && (
        <div onClick={() => setLightboxIndex(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          )}
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={getImageUrl(selectedEvent.photos[lightboxIndex])} alt={`Foto ${lightboxIndex + 1}`} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }} />
          </div>
          {lightboxIndex < selectedEvent.photos.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          )}
          <div style={{ position: 'absolute', bottom: 20, color: '#667788', fontSize: 14 }}>{lightboxIndex + 1} / {selectedEvent.photos.length}</div>
        </div>
      )}

      <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '60px auto 0', width: '100%' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{t.myPurchases}</div>

        {!selectedEventId ? (
          <>
            <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>{t.purchasedPhotos}</h1>

            {eventList.length === 0 ? (
              <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '40px', textAlign: 'center' }}>
                <div style={{ color: '#e8eef4', fontSize: 16, marginBottom: 16 }}>{t.noPurchases}</div>
                <button onClick={() => router.push('/spiele')}
                  style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '12px 24px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase' }}>
                  {t.buyNow}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {eventList.map((group: any) => (
                  <div key={group.eventId}
                    onMouseEnter={() => setHoveredCard(group.eventId)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      background: '#0d1219', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, overflow: 'hidden',
                      transform: hoveredCard === group.eventId ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                      boxShadow: hoveredCard === group.eventId ? '0 0 20px rgba(232,255,0,0.15)' : 'none',
                    }}>
                    <div style={{ aspectRatio: '4 / 3', background: '#131e2a', position: 'relative', overflow: 'hidden' }}>
                      {group.event?.bild_url ? (
                        <img src={group.event.bild_url} alt={group.event.home_team} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%' }} />
                      )}
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6, color: '#fff' }}>{group.event?.home_team}</div>
                      <div style={{ fontSize: 12, color: '#e8eef4', marginBottom: 12 }}>{group.event?.date}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div style={{ color: '#e8ff00', fontWeight: 700, fontSize: 13 }}>{t.photosCount(group.photos.length)}</div>
                        <button onClick={() => setSelectedEventId(group.eventId)}
                          style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 900, fontSize: 12, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                          {t.toPhotos}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button onClick={() => setSelectedEventId(null)}
              style={{ background: 'transparent', color: '#e8eef4', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}>
              {t.back}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{selectedEvent?.event?.home_team}</h1>
                <div style={{ fontSize: 13, color: '#e8eef4', marginTop: 4 }}>{selectedEvent?.event?.date}</div>
              </div>
              <button onClick={handleDownloadAll} disabled={downloading}
                style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '10px 20px', fontWeight: 900, fontSize: 13, cursor: downloading ? 'wait' : 'pointer', textTransform: 'uppercase', letterSpacing: 1, opacity: downloading ? 0.7 : 1 }}>
                {downloading ? t.downloading : t.downloadAll}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
              {selectedEvent?.photos.map((filename: string, i: number) => (
                <div key={filename + i} onClick={() => setLightboxIndex(i)}
                  style={{ position: 'relative', display: 'block', aspectRatio: '1', overflow: 'hidden', borderRadius: 4, cursor: 'zoom-in' }}>
                  <img src={getImageUrl(filename)} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}