'use client'

import { useState } from 'react'

export default function SuchePage() {
  const [selfie, setSelfie] = useState<File | null>(null)
  const [searching, setSearching] = useState(false)
  const [matches, setMatches] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  const handleSelfie = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelfie(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSearch = async () => {
    if (!selfie) {
      setMessage('Bitte zuerst ein Selfie aufnehmen!')
      return
    }

    setSearching(true)
    setMessage('Suche läuft...')
    setMatches([])

    const formData = new FormData()
    formData.append('selfie', selfie)

    try {
      const res = await fetch('/api/rekognition', {
        method: 'PUT',
        body: formData,
      })
      const data = await res.json()

      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches)
        setMessage(`${data.matches.length} Foto(s) gefunden!`)
      } else {
        setMessage('Keine Fotos gefunden.')
      }
    } catch {
      setMessage('Fehler bei der Suche!')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🔍 Meine Fotos finden</h1>
      <p>Mach ein Selfie oder lade ein Foto von dir hoch — wir finden alle deine Eventfotos!</p>

      <input
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleSelfie}
        style={{ margin: '20px 0', display: 'block' }}
      />

      {preview && (
        <img
          src={preview}
          alt="Vorschau"
          style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', marginBottom: '20px' }}
        />
      )}

      <button
        onClick={handleSearch}
        disabled={searching}
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
        {searching ? 'Suche...' : '🔍 Fotos suchen'}
      </button>

      {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}

      {matches.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2>Deine Fotos:</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {matches.map((filename, i) => (
              <img
                key={i}
                src={`https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${filename}`}
                alt={`Foto ${i + 1}`}
                style={{ width: '100%', borderRadius: '8px' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}