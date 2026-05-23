'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    }
    checkUser()
  }, [router])

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage('Bitte Fotos auswählen!')
      return
    }

    setUploading(true)
    setMessage('Fotos werden hochgeladen...')

    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append('files', file)
    })

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      setMessage(data.message || 'Fertig!')
    } catch {
      setMessage('Fehler beim Hochladen!')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <p style={{ padding: '40px' }}>Lade...</p>

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>📸 Fotos hochladen</h1>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setFiles(e.target.files)}
        style={{ margin: '20px 0', display: 'block' }}
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          padding: '12px 24px',
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        {uploading ? 'Lädt...' : 'Hochladen'}
      </button>
      {message && <p style={{ marginTop: '20px' }}>{message}</p>}
    </div>
  )
}