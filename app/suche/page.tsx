'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/app/supabase'
import { useLanguage } from '@/app/context/LanguageContext'

function SucheContent() {
  const [event, setEvent] = useState<any>(null)
  const [allFotos, setAllFotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [displayCount, setDisplayCount] = useState(60)
  const [showSelection, setShowSelection] = useState(false)
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  const router = useRouter()
  const { lang } = useLanguage()

  const t = {
    choosePeriod: lang === 'de' ? 'Wähle deinen Zeitraum' : 'Choose your time period',
    photosCount: (n: number) => lang === 'de' ? `${n} Foto${n !== 1 ? 's' : ''}` : `${n} photo${n !== 1 ? 's' : ''}`,
    otherPhotos: lang === 'de' ? 'Weitere Fotos' : 'Other Photos',
    back: lang === 'de' ? '← Zurück' : '← Back',
    selected: (n: number) => lang === 'de' ? `${n} Foto${n !== 1 ? 's' : ''} ausgewählt` : `${n} photo${n !== 1 ? 's' : ''} selected`,
    buyNow: lang === 'de' ? 'Jetzt kaufen' : 'Buy Now',
    loadMore: lang === 'de' ? 'Mehr laden' : 'Load more',
    loading: lang === 'de' ? 'Lade...' : 'Loading...',
    noPhotos: lang === 'de' ? 'Noch keine Fotos verfügbar.' : 'No photos available yet.',
    notReadyTitle: lang === 'de' ? 'Fotos noch nicht verfügbar' : 'Photos not yet available',
    notReadyText: lang === 'de' ? 'Wir laden gerade alle Fotos hoch. Das dauert in der Regel 24-48 Stunden nach dem Event. Schau bald wieder vorbei!' : 'We are currently uploading all photos. This usually takes 24-48 hours after the event. Check back soon!',
  }

  useEffect(() => {
    const init = async () => {
      if (!eventId) { setLoading(false); return }
      try {
        const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single()
        setEvent(eventData)

        if (eventData?.fotos_freigegeben) {
          let all: any[] = []
          let from = 0
          const pageSize = 1000
          let keepGoing = true
          while (keepGoing) {
            const { data } = await supabase
              .from('event_fotos')
              .select('id, filename, aufgenommen_am, thumbnail_key, zeitstempel_fehlt')
              .eq('event_id', eventId)
              .range(from, from + pageSize - 1)
            if (data && data.length > 0) {
              all = [...all, ...data]
              from += pageSize
              keepGoing = data.length === pageSize
            } else {
              keepGoing = false
            }
          }
          setAllFotos(all)
        }
      } catch (e) {
        console.error('init error:', e)
      }
      setLoading(false)
    }
    init()
  }, [eventId])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      const photos = folderPhotos
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? Math.min(i + 1, photos.length - 1) : null)
      if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null ? Math.max(i - 1, 0) : null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const Watermark = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', pointerEvents: 'none', overflow: 'hidden' }}>
      {[...Array(16)].map((_, row) => (
        <div key={row} style={{ display: 'flex', gap: '40px', transform: 'rotate(-30deg) translateX(-20%)', whiteSpace: 'nowrap', marginLeft: row % 2 === 0 ? '0px' : '60px' }}>
          {[...Array(12)].map((_, col) => (
            <span key={col} style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: 1, userSelect: 'none' }}>SPORTSHOT</span>
          ))}
        </div>
      ))}
    </div>
  )

  const getThumbUrl = (foto: any) => {
    if (foto.thumbnail_key && foto.thumbnail_key !== 'FAILED') {
      return `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(foto.thumbnail_key)}`
    }
    return `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(foto.filename)}`
  }

  // Gruppiere Fotos nach Stunde
  const folders: { key: string; label: string; fotos: any[] }[] = []
  const hourMap = new Map<number, any[]>()
  const otherFotos: any[] = []
  const MIN_FOLDER_SIZE = 5

  allFotos.forEach((f) => {
    if (f.zeitstempel_fehlt || !f.aufgenommen_am) {
      otherFotos.push(f)
    } else {
      const hour = new Date(f.aufgenommen_am).getHours()
      if (!hourMap.has(hour)) hourMap.set(hour, [])
      hourMap.get(hour)!.push(f)
    }
  })

  Array.from(hourMap.keys()).sort((a, b) => a - b).forEach((hour) => {
    const fotosInHour = hourMap.get(hour)!
    if (fotosInHour.length < MIN_FOLDER_SIZE) {
      otherFotos.push(...fotosInHour)
    } else {
      const label = `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`
      folders.push({ key: String(hour), label, fotos: fotosInHour })
    }
  })

  if (otherFotos.length > 0) {
    folders.push({ key: 'other', label: t.otherPhotos, fotos: otherFotos })
  }

  const folderPhotos = folders.find(f => f.key === selectedFolder)?.fotos || []

  const togglePhoto = (filename: string) => {
    setSelectedPhotos(prev =>
      prev.includes(filename) ? prev.filter(f => f !== filename) : [...prev, filename]
    )
  }

  const handleKaufen = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const params = new URLSearchParams()
    params.set('filenames', selectedPhotos.join(','))
    if (eventId) params.set('eventId', eventId)
    const checkoutUrl = `/checkout?${params.toString()}`
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(checkoutUrl)}`)
      return
    }
    window.location.href = checkoutUrl
  }

  const Logo = () => (
    !event?.sponsor_logo_url ? (
      <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '3px 6px' }}>
        <span style={{ fontWeight: 900, fontSize: 9, letterSpacing: 0.5, fontStyle: 'italic' }}>
          <span style={{ color: '#fff' }}>SPORT</span><span style={{ color: '#e8ff00' }}>SHOT</span>
        </span>
      </div>
    ) : (
      <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: '3px 6px' }}>
        <img src={event.sponsor_logo_url} alt={event.sponsor_name} style={{ height: '14px', objectFit: 'contain', opacity: 0.9 }} />
      </div>
    )
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>{t.loading}</p>
    </div>
  )

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif', minHeight: '100vh' }}>

      {lightboxIndex !== null && folderPhotos[lightboxIndex] && (
        <div onClick={() => setLightboxIndex(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer' }}>‹</button>
          )}
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={getThumbUrl(folderPhotos[lightboxIndex])} alt="Foto" style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8, display: 'block' }} />
              <Watermark />
              <Logo />
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); togglePhoto(folderPhotos[lightboxIndex].filename) }}
              style={{
                marginTop: 16, width: '100%', padding: '12px', border: 'none', borderRadius: 6, fontWeight: 900, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase',
                background: selectedPhotos.includes(folderPhotos[lightboxIndex].filename) ? '#ff4444' : '#e8ff00',
                color: selectedPhotos.includes(folderPhotos[lightboxIndex].filename) ? '#fff' : '#070b0f',
              }}>
              {selectedPhotos.includes(folderPhotos[lightboxIndex].filename)
                ? (lang === 'de' ? '✓ Ausgewählt - Entfernen' : '✓ Selected - Remove')
                : (lang === 'de' ? '+ Auswählen' : '+ Select')}
            </button>
          </div>
          {lightboxIndex < folderPhotos.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer' }}>›</button>
          )}
        </div>
      )}

      <div style={{ padding: '40px 24px 120px', maxWidth: '900px', margin: '60px auto 0' }}>

        {event && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{event.home_team}</h1>
            <div style={{ color: '#8899aa', fontSize: 13, marginTop: 6 }}>
              {new Date(event.date).toLocaleDateString(lang === 'de' ? 'de-CH' : 'en-GB')} {event.ort && `· ${event.ort}`}
            </div>
          </div>
        )}

        {!event?.fotos_freigegeben ? (
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', marginBottom: 12 }}>{t.notReadyTitle}</h2>
            <p style={{ color: '#8899aa', fontSize: 14, lineHeight: 1.6 }}>{t.notReadyText}</p>
          </div>
        ) : !selectedFolder ? (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', marginBottom: 20, textAlign: 'center' }}>{t.choosePeriod}</h2>
            {folders.length === 0 ? (
              <div style={{ color: '#445566', padding: '40px 0', textAlign: 'center' }}>{t.noPhotos}</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {folders.map((folder) => (
                  <div key={folder.key} onClick={() => { setSelectedFolder(folder.key); setDisplayCount(60) }}
                    style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px 16px', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#e8eef4', marginBottom: 6 }}>{folder.label}</div>
                    <div style={{ color: '#e8ff00', fontSize: 13, fontWeight: 700 }}>{t.photosCount(folder.fotos.length)}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button onClick={() => setSelectedFolder(null)}
              style={{ background: 'transparent', color: '#e8eef4', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}>
              {t.back}
            </button>
            <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', marginBottom: 16 }}>
              {folders.find(f => f.key === selectedFolder)?.label}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {folderPhotos.slice(0, displayCount).map((foto, i) => (
                <div key={foto.id} onClick={() => setLightboxIndex(i)}
                  style={{
                    position: 'relative', aspectRatio: '1', borderRadius: 6, overflow: 'hidden', cursor: 'zoom-in',
                    border: selectedPhotos.includes(foto.filename) ? '3px solid #e8ff00' : '3px solid transparent',
                  }}>
                  <img src={getThumbUrl(foto)} alt="Foto" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <Watermark />
                  <Logo />
                  <div onClick={(e) => { e.stopPropagation(); togglePhoto(foto.filename) }}
                    style={{
                      position: 'absolute', top: 6, left: 6, width: 22, height: 22, borderRadius: '50%',
                      background: selectedPhotos.includes(foto.filename) ? '#e8ff00' : 'rgba(0,0,0,0.5)',
                      border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}>
                    {selectedPhotos.includes(foto.filename) && <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 12 }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>

            {displayCount < folderPhotos.length && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button onClick={() => setDisplayCount(c => c + 60)}
                  style={{ background: '#1c2a38', color: '#e8eef4', border: '1px solid #2a3a4a', borderRadius: 6, padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                  {t.loadMore} ({folderPhotos.length - displayCount})
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedPhotos.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0d1219', borderTop: '1px solid #1c2a38', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 500 }}>
          <span onClick={() => setShowSelection(true)} style={{ color: '#e8ff00', fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
            {t.selected(selectedPhotos.length)}
          </span>
          <button onClick={handleKaufen}
            style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 6, padding: '12px 28px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase' }}>
            {t.buyNow}
          </button>
        </div>
      )}

      {showSelection && (
        <div onClick={() => setShowSelection(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 12, maxWidth: 600, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1c2a38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: 15 }}>{t.selected(selectedPhotos.length)}</span>
              <button onClick={() => setShowSelection(false)} style={{ background: 'transparent', border: 'none', color: '#e8eef4', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 16, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {allFotos.filter(f => selectedPhotos.includes(f.filename)).map((foto) => (
                <div key={foto.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 6, overflow: 'hidden' }}>
                  <img src={getThumbUrl(foto)} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div onClick={() => togglePhoto(foto.filename)}
                    style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,68,68,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontWeight: 900, fontSize: 12 }}>
                    ✕
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 16, borderTop: '1px solid #1c2a38' }}>
              <button onClick={handleKaufen}
                style={{ width: '100%', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 6, padding: '14px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase' }}>
                {t.buyNow}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SuchePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#070b0f' }} />}>
      <SucheContent />
    </Suspense>
  )
}