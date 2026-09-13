'use client'

import { useState } from 'react'

export default function TestSelfiePage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [threshold, setThreshold] = useState(50)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const base64 = await compressImage(file)
    setPreview(base64)
    setLoading(true)
    setMatches([])

    try {
      const res = await fetch('/api/aws-compare-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: EVENT_ID, selfieBase64: base64, threshold }),
      })
      const data = await res.json()
      setMatches(data.matches || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const getImageUrl = (foto: any) => {
    const key = foto.thumbnail_key && foto.thumbnail_key !== 'FAILED' ? foto.thumbnail_key : foto.filename
    return `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(key)}`
  }

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', minHeight: '100vh', padding: '40px 24px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>🧪 AWS Selfie-Suche Test</h1>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#8899aa' }}>
          Schwelle: {threshold}%
        </label>
        <input type="range" min="30" max="99" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} style={{ width: 200 }} />
      </div>

      <label style={{ display: 'inline-block', padding: '12px 24px', background: '#e8ff00', color: '#070b0f', borderRadius: 6, cursor: 'pointer', fontWeight: 900, marginBottom: 24 }}>
        📷 Selfie hochladen
        <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </label>

      {preview && (
        <div style={{ marginBottom: 24 }}>
          <img src={preview} alt="Selfie" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
        </div>
      )}

      {loading && <p>Suche läuft...</p>}

      {!loading && matches.length > 0 && (
        <>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>{matches.length} Treffer gefunden:</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {matches.map((m, i) => (
              <div key={i} onClick={() => setLightboxIndex(i)} style={{ cursor: 'zoom-in' }}>
                <img src={getImageUrl(m)} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6 }} />
                <div style={{ fontSize: 11, color: '#8899aa', marginTop: 4 }}>{m.similarity?.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </>
      )}

      {lightboxIndex !== null && matches[lightboxIndex] && (
        <div onClick={() => setLightboxIndex(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer' }}>‹</button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <img src={getImageUrl(matches[lightboxIndex])} alt="" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }} />
            <div style={{ textAlign: 'center', color: '#e8ff00', marginTop: 12, fontSize: 14 }}>
              {matches[lightboxIndex].similarity?.toFixed(1)}% Übereinstimmung
            </div>
          </div>
          {lightboxIndex < matches.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer' }}>›</button>
          )}
        </div>
      )}
    </div>
  )
}