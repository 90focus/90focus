'use client'

import { useState } from 'react'

export default function TestCombinedPage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [faceMatches, setFaceMatches] = useState<any[]>([])
  const [colorMatches, setColorMatches] = useState<any[]>([])
  const [dominantColor, setDominantColor] = useState('')
  const [loading, setLoading] = useState(false)
  const [threshold, setThreshold] = useState(50)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const EVENT_ID = 'd97b2ad4-97a9-4df2-b670-f0596e560c23'

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const maxSize = 1200
        let width = img.width
        let height = img.height
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const runSearch = async (base64: string, th: number) => {
    setLoading(true)
    setFaceMatches([])
    setColorMatches([])
    try {
      const res = await fetch('/api/combined-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: EVENT_ID, selfieBase64: base64, threshold: th }),
      })
      const data = await res.json()
      setFaceMatches(data.faceMatches || [])
      setColorMatches(data.colorMatches || [])
      setDominantColor(data.dominantColor || '')
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await compressImage(file)
    setPreview(base64)
    await runSearch(base64, threshold)
  }

  const handleThresholdChange = async (val: number) => {
    setThreshold(val)
    if (preview) await runSearch(preview, val)
  }

  const getImageUrl = (foto: any) => {
    const key = foto.thumbnail_key && foto.thumbnail_key !== 'FAILED' ? foto.thumbnail_key : foto.filename
    return `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(key)}`
  }

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', minHeight: '100vh', padding: '40px 24px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>🔬 Kombinierte Suche: Gesicht + Farbe</h1>

      <div style={{ marginBottom: 20 }}>
        <input type="range" min="30" max="99" value={threshold} onChange={(e) => handleThresholdChange(Number(e.target.value))} style={{ width: 200 }} />
        <div style={{ marginTop: 6, fontSize: 14, color: '#e8ff00', fontWeight: 700 }}>
          Schwelle: {threshold}%
        </div>
      </div>

      <label style={{ display: 'inline-block', padding: '12px 24px', background: '#e8ff00', color: '#070b0f', borderRadius: 6, cursor: 'pointer', fontWeight: 900, marginBottom: 24 }}>
        📷 Foto hochladen
        <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </label>

      {preview && (
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={preview} alt="Selfie" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
          {dominantColor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 4, background: dominantColor, border: '1px solid #445566' }} />
              <span style={{ fontSize: 12, color: '#8899aa' }}>Erkannte Farbe: {dominantColor}</span>
            </div>
          )}
        </div>
      )}

      {loading && <p>Suche läuft...</p>}

      {!loading && faceMatches.length > 0 && (
        <>
          <h2 style={{ fontSize: 16, marginBottom: 12, color: '#e8ff00' }}>👤 Per Gesicht gefunden: {faceMatches.length}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, marginBottom: 32 }}>
             {faceMatches.map((m, i) => (
              <div key={i} onClick={() => setLightboxUrl(getImageUrl(m))} style={{ cursor: 'zoom-in' }}>
                <img src={getImageUrl(m)} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6, border: '2px solid #e8ff00' }} />
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && colorMatches.length > 0 && (
        <>
          <h2 style={{ fontSize: 16, marginBottom: 12, color: '#ff88ff' }}>🎽 Zusätzlich per Farbe gefunden: {colorMatches.length}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
            {colorMatches.map((m, i) => (
              <div key={i} onClick={() => setLightboxUrl(getImageUrl(m))} style={{ cursor: 'zoom-in' }}>
                <img src={getImageUrl(m)} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6, border: '2px solid #ff88ff' }} />
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && preview && faceMatches.length === 0 && colorMatches.length === 0 && (
        <p style={{ color: '#667788' }}>Keine Treffer gefunden.</p>
      )}

      {lightboxUrl && (
        <div onClick={() => setLightboxUrl(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={lightboxUrl} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} />
        </div>
      )}
    </div>
  )
}