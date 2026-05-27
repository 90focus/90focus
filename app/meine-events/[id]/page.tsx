'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function EventDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const [fotos, setFotos] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
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

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selected.length === fotos.length) {
      setSelected([])
    } else {
      setSelected(fotos.map(f => f.id))
    }
  }

  const deleteSelected = async () => {
    if (selected.length === 0) return
    if (!confirm(`${selected.length} Foto(s) löschen?`)) return

    const fotosToDelete = fotos.filter(f => selected.includes(f.id))
    for (const foto of fotosToDelete) {
      await supabase.from('event_fotos').delete().eq('id', foto.id)
    }
    setMessage(`✅ ${selected.length} Foto(s) gelöscht!`)
    setSelected([])
    loadFotos()
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage('Bitte Fotos auswählen!')
      return
    }
    setUploading(true)
    setMessage('Fotos werden hochgeladen...')
    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('files', file))
    formData.append('eventId', eventId)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      setMessage(data.message || 'Fertig!')
      loadFotos()
    } catch {
      setMessage('Fehler beim Hochladen!')
    } finally {
      setUploading(false)
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
      {/* NAV */}
      <nav style={{ background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <button onClick={() => router.push('/meine-events')}
          style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>
          ← Meine Events
        </button>
      </nav>

      <div style={{ padding: '40px 32px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* EVENT INFO */}
        {event && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, color: '#e8ff00', fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{event.liga}</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
              {event.home_team} vs {event.away_team}
            </h1>
            <div style={{ color: '#445566', fontSize: 14 }}>
              📅 {event.date} {event.time && `· 🕐 ${event.time}`} {event.ort && `· 📍 ${event.ort}`}
            </div>
          </div>
        )}

        {/* UPLOAD */}
        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '20px 24px', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#e8eef4' }}>📸 Fotos hochladen</h3>
          <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)}
            style={{ margin: '8px 0', display: 'block', color: '#e8eef4' }} />
          <button onClick={handleUpload} disabled={uploading}
            style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 900, marginTop: 8 }}>
            {uploading ? 'Lädt...' : 'Fotos hochladen'}
          </button>
        </div>

        {message && (
          <div style={{ padding: '16px', background: message.startsWith('Fehler') ? 'rgba(255,68,68,0.1)' : 'rgba(68,255,136,0.1)', border: `1px solid ${message.startsWith('Fehler') ? '#ff4444' : '#44ff88'}`, borderRadius: '8px', color: message.startsWith('Fehler') ? '#ff4444' : '#44ff88', fontWeight: 'bold', marginBottom: 24 }}>
            {message}
          </div>
        )}

        {/* FOTOS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>
            Fotos ({fotos.length})
          </h2>
          {fotos.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={selectAll}
                style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
                {selected.length === fotos.length ? 'Alle abwählen' : 'Alle auswählen'}
              </button>
              {selected.length > 0 && (
                <button onClick={deleteSelected}
                  style={{ background: '#ff4444', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                  {selected.length} Foto(s) löschen
                </button>
              )}
            </div>
          )}
        </div>

        {fotos.length === 0 ? (
          <div style={{ color: '#445566', padding: '40px 0', textAlign: 'center' }}>
            Noch keine Fotos hochgeladen.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {fotos.map((foto) => (
              <div key={foto.id}
                onClick={() => toggleSelect(foto.id)}
                style={{
                  position: 'relative', borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                  border: selected.includes(foto.id) ? '3px solid #e8ff00' : '3px solid transparent',
                  transition: 'border 0.1s'
                }}>
                <img
                  src={getImageUrl(foto.filename)}
                  alt="Foto"
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                />
                {selected.includes(foto.id) && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: '#e8ff00', borderRadius: '50%', width: 24, height: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 14, color: '#070b0f'
                  }}>✓</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}