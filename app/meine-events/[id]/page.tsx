'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function EventDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const [fotos, setFotos] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [selectMode, setSelectMode] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [files, setFiles] = useState<FileList | null>(null)
  const [fileNames, setFileNames] = useState<string>('')
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      await loadEvent(session.user.id)
      await loadFotos()
      setLoading(false)
    }
    init()
  }, [eventId])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? Math.min(i + 1, fotos.length - 1) : null)
      if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null ? Math.max(i - 1, 0) : null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, fotos.length])

  const loadEvent = async (userId: string) => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single()
    if (!data) { router.push('/meine-events'); return }
    setEvent(data)
  }

  const loadFotos = async () => {
    const { data } = await supabase
      .from('event_fotos')
      .select('*')
      .eq('event_id', eventId)
      .order('erstellt_am', { ascending: false })
    setFotos(data || [])
  }

  const handleFotoClick = (index: number, fotoId: string) => {
    if (selectMode) {
      setSelected(prev =>
        prev.includes(fotoId) ? prev.filter(s => s !== fotoId) : [...prev, fotoId]
      )
    } else {
      setLightboxIndex(index)
    }
  }

  const selectAll = () => {
    if (selected.length === fotos.length) {
      setSelected([])
    } else {
      setSelected(fotos.map(f => f.id))
    }
  }

  const cancelSelect = () => {
    setSelectMode(false)
    setSelected([])
  }

  const deleteEvent = async () => {
    if (!confirm('Event und alle Fotos löschen?')) return
    await supabase.from('event_fotos').delete().eq('event_id', eventId)
    await supabase.from('events').delete().eq('id', eventId)
    router.push('/meine-events')
  }

  const deleteSelected = async () => {
    if (selected.length === 0) return
    if (!confirm(`${selected.length} Foto(s) löschen?`)) return
    setDeleting(true)
    setMessage('Fotos werden gelöscht...')
    const fotosToDelete = fotos.filter(f => selected.includes(f.id))
    for (const foto of fotosToDelete) {
      try {
        await fetch('/api/delete-foto', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: foto.filename, fotoId: foto.id })
        })
      } catch (e) {
        console.error('Delete error:', e)
      }
    }
    setMessage(`✅ ${selected.length} Foto(s) gelöscht!`)
    setSelected([])
    setSelectMode(false)
    setDeleting(false)
    loadFotos()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files
    if (f && f.length > 0) {
      setFiles(f)
      setFileNames(f.length === 1 ? f[0].name : `${f.length} Dateien ausgewählt`)
    }
  }

  // NEUER UPLOAD MIT PRESIGNED URLS
  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage('Bitte Fotos auswählen!')
      return
    }
    setUploading(true)
    setUploadProgress({ current: 0, total: files.length })
    setMessage(`Lade ${files.length} Foto(s) hoch...`)

    try {
      const filenames = Array.from(files).map(f => f.name)
      const presignRes = await fetch('/api/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, filenames })
      })
      const { urls } = await presignRes.json()

      const uploadedKeys: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const { url, key } = urls[i]

        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        })

        uploadedKeys.push(key)
        setUploadProgress({ current: i + 1, total: files.length })
        setMessage(`Lade hoch: ${i + 1} / ${files.length}`)
      }

      setMessage('Fotos werden verarbeitet...')
      const completeRes = await fetch('/api/upload-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, keys: uploadedKeys })
      })
      const data = await completeRes.json()
      setMessage(data.message || 'Fertig!')
      setFiles(null)
      setFileNames('')
      loadFotos()
    } catch {
      setMessage('Fehler beim Hochladen!')
    } finally {
      setUploading(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  }

  const getImageUrl = (filename: string) =>
    `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>Lade...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      {lightboxIndex !== null && (
        <div onClick={() => setLightboxIndex(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 36, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer' }}>‹</button>
          )}
          <img src={getImageUrl(fotos[lightboxIndex].filename)} alt="Foto" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }} />
          {lightboxIndex < fotos.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 36, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer' }}>›</button>
          )}
          <div style={{ position: 'absolute', bottom: 20, color: '#667788', fontSize: 14 }}>{lightboxIndex + 1} / {fotos.length}</div>
        </div>
      )}

      <nav style={{ background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <button onClick={() => router.push('/meine-events')} style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>← Meine Events</button>
      </nav>

      <div style={{ padding: '40px 32px', maxWidth: '1000px', margin: '0 auto' }}>
        {event && (
          <div style={{ marginBottom: 32, background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, color: '#e8ff00', fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{event.liga}</div>
                <h1 style={{ fontSize: 28, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8, margin: 0 }}>{event.home_team} vs {event.away_team}</h1>
                <div style={{ color: '#445566', fontSize: 14, marginTop: 8 }}>📅 {event.date} {event.time && `· 🕐 ${event.time}`} {event.ort && `· 📍 ${event.ort}`}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => router.push(`/meine-events/${eventId}/bearbeiten`)}
                  style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
                  ✏️ Bearbeiten
                </button>
                <button onClick={deleteEvent}
                  style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                  🗑 Event löschen
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '20px 24px', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#e8eef4' }}>📸 Fotos hochladen</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1c2a38', color: '#e8eef4', borderRadius: 6, cursor: 'pointer', fontSize: 14, border: '1px solid #2a3a4a', fontWeight: 600 }}>
              📁 Dateien auswählen
              <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            {fileNames && <span style={{ color: '#667788', fontSize: 13 }}>✓ {fileNames}</span>}
          </div>

          {uploading && uploadProgress.total > 0 && (
            <div style={{ margin: '12px 0' }}>
              <div style={{ background: '#131e2a', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                <div style={{
                  background: '#e8ff00', height: '100%',
                  width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ color: '#667788', fontSize: 12, marginTop: 4 }}>
                {uploadProgress.current} / {uploadProgress.total} hochgeladen
              </div>
            </div>
          )}

          <button onClick={handleUpload} disabled={uploading} style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 6, padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 900, marginTop: 12 }}>
            {uploading ? 'Lädt...' : 'Fotos hochladen'}
          </button>
        </div>

        {message && (
          <div style={{ padding: '16px', background: message.startsWith('Fehler') ? 'rgba(255,68,68,0.1)' : 'rgba(68,255,136,0.1)', border: `1px solid ${message.startsWith('Fehler') ? '#ff4444' : '#44ff88'}`, borderRadius: '8px', color: message.startsWith('Fehler') ? '#ff4444' : '#44ff88', fontWeight: 'bold', marginBottom: 24 }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Fotos ({fotos.length})</h2>
          {fotos.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {!selectMode ? (
                <button onClick={() => setSelectMode(true)} style={{ background: '#ff4444', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>🗑 Löschen</button>
              ) : (
                <>
                  <button onClick={selectAll} style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
                    {selected.length === fotos.length ? 'Alle abwählen' : 'Alle auswählen'}
                  </button>
                  {selected.length > 0 && (
                    <button onClick={deleteSelected} disabled={deleting} style={{ background: '#ff4444', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                      {deleting ? 'Löscht...' : `${selected.length} löschen`}
                    </button>
                  )}
                  <button onClick={cancelSelect} style={{ background: 'transparent', color: '#667788', border: '1px solid #1c2a38', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>Abbrechen</button>
                </>
              )}
            </div>
          )}
        </div>

        {fotos.length === 0 ? (
          <div style={{ color: '#445566', padding: '40px 0', textAlign: 'center' }}>Noch keine Fotos hochgeladen.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {fotos.map((foto, index) => (
              <div key={foto.id} onClick={() => handleFotoClick(index, foto.id)} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', cursor: selectMode ? 'pointer' : 'zoom-in', border: selected.includes(foto.id) ? '3px solid #e8ff00' : '3px solid transparent', transition: 'border 0.1s' }}>
                <img src={getImageUrl(foto.filename)} alt="Foto" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                {selectMode && selected.includes(foto.id) && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: '#e8ff00', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#070b0f' }}>✓</div>
                )}
                {selectMode && (
                  <div style={{ position: 'absolute', inset: 0, background: selected.includes(foto.id) ? 'rgba(232,255,0,0.1)' : 'transparent', transition: 'background 0.1s' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}