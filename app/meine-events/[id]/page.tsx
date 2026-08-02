'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/app/context/LanguageContext'

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
  const { lang } = useLanguage()

  const t = {
    myEvents: lang === 'de' ? 'Meine Events' : 'My Events',
    edit: lang === 'de' ? '✏️ Bearbeiten' : '✏️ Edit',
    delete: lang === 'de' ? '🗑 Löschen' : '🗑 Delete',
    uploadPhotos: lang === 'de' ? '📸 Fotos hochladen' : '📸 Upload Photos',
    selectFiles: lang === 'de' ? '📁 Dateien auswählen' : '📁 Choose Files',
    uploading: lang === 'de' ? 'Lädt...' : 'Uploading...',
    uploadBtn: lang === 'de' ? 'Fotos hochladen' : 'Upload Photos',
    uploaded: lang === 'de' ? 'hochgeladen' : 'uploaded',
    photos: lang === 'de' ? 'Fotos' : 'Photos',
    noPhotos: lang === 'de' ? 'Noch keine Fotos hochgeladen.' : 'No photos uploaded yet.',
    selectAll: lang === 'de' ? 'Alle auswählen' : 'Select all',
    deselectAll: lang === 'de' ? 'Alle abwählen' : 'Deselect all',
    deleting: lang === 'de' ? 'Löscht...' : 'Deleting...',
    deleteN: (n: number) => lang === 'de' ? `${n} löschen` : `Delete ${n}`,
    cancel: lang === 'de' ? 'Abbrechen' : 'Cancel',
    loading: lang === 'de' ? 'Lade...' : 'Loading...',
    deleteEventConfirm: lang === 'de' ? 'Event und alle Fotos löschen?' : 'Delete event and all photos?',
    deletePhotosConfirm: (n: number) => lang === 'de' ? `${n} Foto(s) löschen?` : `Delete ${n} photo(s)?`,
    deletingPhotos: lang === 'de' ? 'Fotos werden gelöscht...' : 'Deleting photos...',
    photosDeleted: (n: number) => lang === 'de' ? `✅ ${n} Foto(s) gelöscht!` : `✅ ${n} photo(s) deleted!`,
    selectPhotos: lang === 'de' ? 'Bitte Fotos auswählen!' : 'Please select photos!',
    loadingPhotos: (n: number) => lang === 'de' ? `Lade ${n} Foto(s) hoch...` : `Uploading ${n} photo(s)...`,
    uploadingProgress: (i: number, n: number) => lang === 'de' ? `Lade hoch: ${i} / ${n}` : `Uploading: ${i} / ${n}`,
    processing: lang === 'de' ? 'Fotos werden verarbeitet...' : 'Processing photos...',
    done: lang === 'de' ? 'Fertig!' : 'Done!',
    uploadError: lang === 'de' ? 'Fehler beim Hochladen!' : 'Error uploading!',
    filesSelected: (n: number) => lang === 'de' ? `${n} Dateien ausgewählt` : `${n} files selected`,
  }

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
    if (!confirm(t.deleteEventConfirm)) return
    await supabase.from('event_fotos').delete().eq('event_id', eventId)
    await supabase.from('events').delete().eq('id', eventId)
    router.push('/meine-events')
  }

  const deleteSelected = async () => {
    if (selected.length === 0) return
    if (!confirm(t.deletePhotosConfirm(selected.length))) return
    setDeleting(true)
    setMessage(t.deletingPhotos)
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
    setMessage(t.photosDeleted(selected.length))
    setSelected([])
    setSelectMode(false)
    setDeleting(false)
    loadFotos()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files
    if (f && f.length > 0) {
      setFiles(f)
      setFileNames(f.length === 1 ? f[0].name : t.filesSelected(f.length))
    }
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage(t.selectPhotos)
      return
    }
    setUploading(true)
    setUploadProgress({ current: 0, total: files.length })
    setMessage(t.loadingPhotos(files.length))

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
        setMessage(t.uploadingProgress(i + 1, files.length))
      }

      setMessage(t.processing)
      const completeRes = await fetch('/api/upload-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, keys: uploadedKeys })
      })
      const data = await completeRes.json()
      setMessage(data.message || t.done)
      setFiles(null)
      setFileNames('')
      loadFotos()
    } catch {
      setMessage(t.uploadError)
    } finally {
      setUploading(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  }

  const getImageUrl = (filename: string) =>
    `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>{t.loading}</p>
    </div>
  )

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      {lightboxIndex !== null && (
        <div onClick={() => setLightboxIndex(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 28, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 36, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer' }}>‹</button>
          )}
          <img src={getImageUrl(fotos[lightboxIndex].filename)} alt="Photo" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }} />
          {lightboxIndex < fotos.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 36, width: 50, height: 50, borderRadius: '50%', cursor: 'pointer' }}>›</button>
          )}
          <div style={{ position: 'absolute', bottom: 20, color: '#667788', fontSize: 14 }}>{lightboxIndex + 1} / {fotos.length}</div>
        </div>
      )}

      <nav style={{ background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', minHeight: 60, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/meine-events')}>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1, fontStyle: 'italic' }}>
            <span style={{ color: '#e8eef4' }}>SPORT</span><span style={{ color: '#e8ff00' }}>SHOT</span>
          </span>
        </div>
        <button onClick={() => router.push('/meine-events')} style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>← {t.myEvents}</button>
      </nav>

      <div style={{ padding: '24px 16px', maxWidth: '1000px', margin: '0 auto' }}>
        {event && (
          <div style={{ marginBottom: 24, background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '16px 20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8, margin: 0 }}>{event.home_team}</h1>
                <div style={{ color: '#445566', fontSize: 13, marginTop: 8 }}>📅 {event.date} {event.ort && `· 📍 ${event.ort}`}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => router.push(`/meine-events/${eventId}/bearbeiten`)}
                  style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '8px 14px', cursor: 'pointer', fontSize: 12 }}>
                  {t.edit}
                </button>
                <button onClick={deleteEvent}
                  style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: 4, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                  {t.delete}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#e8eef4', fontSize: 16 }}>{t.uploadPhotos}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1c2a38', color: '#e8eef4', borderRadius: 6, cursor: 'pointer', fontSize: 13, border: '1px solid #2a3a4a', fontWeight: 600 }}>
              {t.selectFiles}
              <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            {fileNames && <span style={{ color: '#667788', fontSize: 12 }}>✓ {fileNames}</span>}
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
                {uploadProgress.current} / {uploadProgress.total} {t.uploaded}
              </div>
            </div>
          )}

          <button onClick={handleUpload} disabled={uploading} style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 6, padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 900, marginTop: 12 }}>
            {uploading ? t.uploading : t.uploadBtn}
          </button>
        </div>

        {message && (
          <div style={{ padding: '16px', background: message.startsWith('Fehler') || message.startsWith('Error') ? 'rgba(255,68,68,0.1)' : 'rgba(68,255,136,0.1)', border: `1px solid ${message.startsWith('Fehler') || message.startsWith('Error') ? '#ff4444' : '#44ff88'}`, borderRadius: '8px', color: message.startsWith('Fehler') || message.startsWith('Error') ? '#ff4444' : '#44ff88', fontWeight: 'bold', marginBottom: 24, fontSize: 13 }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{t.photos} ({fotos.length})</h2>
          {fotos.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {!selectMode ? (
                <button onClick={() => setSelectMode(true)} style={{ background: '#ff4444', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>{t.delete}</button>
              ) : (
                <>
                  <button onClick={selectAll} style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '8px 14px', cursor: 'pointer', fontSize: 12 }}>
                    {selected.length === fotos.length ? t.deselectAll : t.selectAll}
                  </button>
                  {selected.length > 0 && (
                    <button onClick={deleteSelected} disabled={deleting} style={{ background: '#ff4444', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                      {deleting ? t.deleting : t.deleteN(selected.length)}
                    </button>
                  )}
                  <button onClick={cancelSelect} style={{ background: 'transparent', color: '#667788', border: '1px solid #1c2a38', borderRadius: 4, padding: '8px 14px', cursor: 'pointer', fontSize: 12 }}>{t.cancel}</button>
                </>
              )}
            </div>
          )}
        </div>

        {fotos.length === 0 ? (
          <div style={{ color: '#445566', padding: '40px 0', textAlign: 'center' }}>{t.noPhotos}</div>
        ) : (
          <div className="fotos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {fotos.map((foto, index) => (
              <div key={foto.id} onClick={() => handleFotoClick(index, foto.id)} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', cursor: selectMode ? 'pointer' : 'zoom-in', border: selected.includes(foto.id) ? '3px solid #e8ff00' : '3px solid transparent', transition: 'border 0.1s' }}>
                <img src={getImageUrl(foto.filename)} alt="Photo" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
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