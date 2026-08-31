'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/context/LanguageContext'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [eventName, setEventName] = useState('')
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [date, setDate] = useState('')
  const [liga, setLiga] = useState('')
const [ort, setOrt] = useState('')
  const [preis, setPreis] = useState('19.90')
  const [fotosFreigegeben, setFotosFreigegeben] = useState(false)
  const [showConfirmComplete, setShowConfirmComplete] = useState(false)
  const [eventBild, setEventBild] = useState<File | null>(null)
  const [eventBildPreview, setEventBildPreview] = useState<string | null>(null)
  const [eventBildName, setEventBildName] = useState('')
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)
  const [createdEventName, setCreatedEventName] = useState<string>('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [fileNames, setFileNames] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { lang } = useLanguage()

  const t = {
    admin: 'Admin',
    createEvent: lang === 'de' ? 'Event erstellen' : 'Create Event',
    selectSport: lang === 'de' ? 'Sportart auswählen...' : 'Select sport...',
    homeTeam: lang === 'de' ? 'Heimteam *' : 'Home Team *',
    awayTeam: lang === 'de' ? 'Gastteam *' : 'Away Team *',
    eventName: lang === 'de' ? 'Eventname *' : 'Event Name *',
location: lang === 'de' ? 'Ort (optional)' : 'Location (optional)',
    price: lang === 'de' ? 'Preis pro Foto-Paket (EUR)' : 'Price per Photo Package (EUR)',
    eventImage: lang === 'de' ? '🖼️ Event Bild (optional)' : '🖼️ Event Image (optional)',
    recommendedSize: lang === 'de' ? 'Empfohlene Grösse: 1200 × 900 Pixel (4:3)' : 'Recommended size: 1200 × 900 pixels (4:3)',
    selectImage: lang === 'de' ? '📁 Bild auswählen' : '📁 Choose Image',
    uploadPhotos: lang === 'de' ? '📸 Fotos hochladen' : '📸 Upload Photos',
    createFirst: lang === 'de' ? 'Erstelle zuerst ein Event um Fotos hochzuladen.' : 'Create an event first to upload photos.',
    selectFiles: lang === 'de' ? '📁 Dateien auswählen' : '📁 Choose Files',
    uploading: lang === 'de' ? 'Lädt...' : 'Uploading...',
    uploadBtn: lang === 'de' ? 'Fotos hochladen' : 'Upload Photos',
    uploaded: lang === 'de' ? 'hochgeladen' : 'uploaded',
    loading: lang === 'de' ? 'Lade...' : 'Loading...',
    requiredTeams: lang === 'de' ? 'Heimteam, Gastteam und Datum sind Pflichtfelder!' : 'Home team, away team and date are required!',
    requiredName: lang === 'de' ? 'Eventname und Datum sind Pflichtfelder!' : 'Event name and date are required!',
    uploadingImage: lang === 'de' ? 'Event Bild wird hochgeladen...' : 'Uploading event image...',
    errorPrefix: lang === 'de' ? 'Fehler: ' : 'Error: ',
    eventCreated: lang === 'de' ? '✅ Event erstellt! Jetzt kannst du Fotos hochladen.' : '✅ Event created! You can now upload photos.',
    selectPhotos: lang === 'de' ? 'Bitte Fotos auswählen!' : 'Please select photos!',
    createFirstMsg: lang === 'de' ? 'Bitte zuerst ein Event erstellen!' : 'Please create an event first!',
    loadingPhotos: (n: number) => lang === 'de' ? `Lade ${n} Foto(s) hoch...` : `Uploading ${n} photo(s)...`,
    uploadingProgress: (i: number, n: number) => lang === 'de' ? `Lade hoch: ${i} / ${n}` : `Uploading: ${i} / ${n}`,
    processing: lang === 'de' ? 'Fotos werden verarbeitet...' : 'Processing photos...',
    done: lang === 'de' ? 'Fertig!' : 'Done!',
    uploadError: lang === 'de' ? 'Fehler beim Hochladen!' : 'Error uploading!',
    filesSelected: (n: number) => lang === 'de' ? `${n} Dateien ausgewählt` : `${n} files selected`,
  }

useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login') } else { setUser(session.user) }
      } catch (e) {
        console.error('checkUser error:', e)
      }
      setLoading(false)
    }
    checkUser()

    const failsafe = setTimeout(() => setLoading(false), 5000)
    return () => clearTimeout(failsafe)
  }, [router])

  const handleEventBild = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setEventBild(file); setEventBildPreview(URL.createObjectURL(file)); setEventBildName(file.name) }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files
    if (f && f.length > 0) { setFiles(f); setFileNames(f.length === 1 ? f[0].name : t.filesSelected(f.length)) }
  }

  const uploadEventBild = async (file: File): Promise<string | null> => {
    const filename = `event_${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('sponsor-logos').upload(filename, file, { contentType: file.type })
    if (error) return null
    const { data: urlData } = supabase.storage.from('sponsor-logos').getPublicUrl(filename)
    return urlData.publicUrl
  }

const createEvent = async () => {
    const isTeamSport = liga === 'Fussball' || liga === 'Handball'
    const finalName = isTeamSport && homeTeam && awayTeam ? `${homeTeam} vs ${awayTeam}` : eventName
    if (!finalName || !date) { setMessage(isTeamSport ? t.requiredTeams : t.requiredName); return }
    try {
      let bildUrl = null
      if (eventBild) { setMessage(t.uploadingImage); bildUrl = await uploadEventBild(eventBild) }
const { data, error } = await supabase.from('events').insert({
        home_team: finalName, away_team: '', date, liga, ort,
        bild_url: bildUrl, user_id: user.id, preis: parseFloat(preis) || 19.90,
        fotos_freigegeben: fotosFreigegeben,
      }).select().single()
      if (error) {
        setMessage(t.errorPrefix + error.message)
      } else {
        setCreatedEventId(data.id)
        setCreatedEventName(finalName)
        setMessage(t.eventCreated)
        setEventName(''); setHomeTeam(''); setAwayTeam(''); setDate(''); setLiga(''); setOrt(''); setPreis('19.90'); setFotosFreigegeben(false)
        setEventBild(null); setEventBildPreview(null); setEventBildName('')
      }
    } catch (e) {
      console.error('createEvent error:', e)
      setMessage(t.errorPrefix + 'Verbindungsfehler, bitte erneut versuchen.')
    }
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) { setMessage(t.selectPhotos); return }
    if (!createdEventId) { setMessage(t.createFirstMsg); return }
    setUploading(true)
    setUploadProgress({ current: 0, total: files.length })
    setMessage(t.loadingPhotos(files.length))

    try {
      const filenames = Array.from(files).map(f => f.name)
      const presignRes = await fetch('/api/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: createdEventId, filenames })
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
        body: JSON.stringify({ eventId: createdEventId, keys: uploadedKeys })
      })
      const data = await completeRes.json()
      setMessage(data.message || t.done)
      setFiles(null); setFileNames('')
      setShowConfirmComplete(true)
    } catch (err) {
      setMessage(t.uploadError)
    } finally {
      setUploading(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  }

  const confirmPhotosComplete = async () => {
    if (!createdEventId) return
    const { error } = await supabase.from('events').update({ fotos_freigegeben: true }).eq('id', createdEventId)
    if (!error) {
      setMessage(lang === 'de' ? '✅ Suche für Nutzer freigeschaltet!' : '✅ Search enabled for users!')
      setShowConfirmComplete(false)
    }
  }

  if (loading) return <p style={{ padding: '40px' }}>{t.loading}</p>

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '24px 16px', maxWidth: '700px', margin: '60px auto 0' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{t.admin}</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>📅 {t.createEvent}</h1>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <select value={liga} onChange={(e) => setLiga(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }}>
            <option value="">{t.selectSport}</option>
            <option value="Fussball">Fussball</option>
            <option value="Handball">Handball</option>
            <option value="Hybrid Sport">Hybrid Sport</option>
            <option value="Laufsport">Laufsport</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Basketball">Basketball</option>
            <option value="Sonstige">Sonstige</option>
          </select>

          {liga === 'Fussball' || liga === 'Handball' ? (
            <>
              <input type="text" placeholder={t.homeTeam} value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)}
                style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
              <input type="text" placeholder={t.awayTeam} value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)}
                style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
            </>
          ) : (
            <input type="text" placeholder={t.eventName} value={eventName} onChange={(e) => setEventName(e.target.value)}
              style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
          )}

          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />

<input type="text" placeholder={t.location} value={ort} onChange={(e) => setOrt(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />

<div style={{ position: 'relative', margin: '8px 0' }}>
            <input type="number" step="0.10" placeholder={t.price} value={preis} onChange={(e) => setPreis(e.target.value)}
              style={{ width: '100%', padding: '12px', paddingRight: '52px', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#667788', fontSize: 14, fontWeight: 700, pointerEvents: 'none' }}>EUR</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0', padding: '12px', background: '#131e2a', borderRadius: 6, border: '1px solid #1c2a38' }}>
            <input type="checkbox" checked={fotosFreigegeben} onChange={(e) => setFotosFreigegeben(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }} id="fotosFreigegeben" />
            <label htmlFor="fotosFreigegeben" style={{ cursor: 'pointer', fontSize: 14, color: '#e8eef4' }}>
              {lang === 'de' ? 'Fotos vollständig hochgeladen (Suche freischalten)' : 'Photos fully uploaded (enable search)'}
            </label>
          </div>



          <div style={{ borderTop: '1px solid #1c2a38', marginTop: '16px', paddingTop: '16px' }}>
            <h3 style={{ margin: '0 0 4px 0', color: '#e8eef4' }}>{t.eventImage}</h3>
            <p style={{ margin: '0 0 12px 0', color: '#667788', fontSize: 12 }}>{t.recommendedSize}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1c2a38', color: '#e8eef4', borderRadius: 6, cursor: 'pointer', fontSize: 14, border: '1px solid #2a3a4a', fontWeight: 600 }}>
                {t.selectImage}
                <input type="file" accept="image/*" onChange={handleEventBild} style={{ display: 'none' }} />
              </label>
              {eventBildName && <span style={{ color: '#667788', fontSize: 13 }}>✓ {eventBildName}</span>}
            </div>
            {eventBildPreview && (
              <img src={eventBildPreview} alt="Preview"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '12px', borderRadius: '8px' }} />
            )}
          </div>

          <button onClick={createEvent}
            style={{ padding: '12px 32px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 900, marginTop: '16px', textTransform: 'uppercase', letterSpacing: 1 }}>
            {t.createEvent}
          </button>
        </div>

        <div style={{ background: '#0d1219', border: `1px solid ${createdEventId ? '#e8ff00' : '#1c2a38'}`, padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
          <h2 style={{ marginTop: 0, color: '#e8eef4' }}>{t.uploadPhotos}</h2>
          {createdEventId ? (
            <div style={{ background: '#131e2a', border: '1px solid #1c2a38', borderRadius: 6, padding: '10px 16px', marginBottom: 16, fontSize: 14, color: '#e8ff00', fontWeight: 700 }}>
              📅 {createdEventName}
            </div>
          ) : (
            <div style={{ color: '#445566', fontSize: 14, marginBottom: 16 }}>{t.createFirst}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1c2a38', color: '#e8eef4', borderRadius: 6, cursor: 'pointer', fontSize: 14, border: '1px solid #2a3a4a', fontWeight: 600, opacity: createdEventId ? 1 : 0.5 }}>
              {t.selectFiles}
              <input type="file" multiple accept="image/*" onChange={handleFileChange} disabled={!createdEventId} style={{ display: 'none' }} />
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
                {uploadProgress.current} / {uploadProgress.total} {t.uploaded}
              </div>
            </div>
          )}

          <button onClick={handleUpload} disabled={uploading || !createdEventId}
            style={{ padding: '12px 32px', background: createdEventId ? '#e8ff00' : '#1c2a38', color: createdEventId ? '#070b0f' : '#445566', border: 'none', borderRadius: '6px', cursor: createdEventId ? 'pointer' : 'not-allowed', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
            {uploading ? t.uploading : t.uploadBtn}
          </button>

          {showConfirmComplete && (
            <div style={{ marginTop: 20, padding: '16px', background: 'rgba(232,255,0,0.08)', border: '1px solid #e8ff00', borderRadius: 8 }}>
              <p style={{ color: '#e8eef4', fontSize: 14, marginBottom: 12, fontWeight: 700 }}>
                {lang === 'de' ? 'Sind das ALLE Fotos für dieses Event, oder lädst du noch mehr hoch?' : 'Is this ALL the photos for this event, or are you uploading more?'}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={confirmPhotosComplete}
                  style={{ flex: 1, padding: '10px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 6, fontWeight: 900, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase' }}>
                  {lang === 'de' ? '✓ Ja, alle Fotos - Suche freischalten' : '✓ Yes, all photos - enable search'}
                </button>
                <button onClick={() => setShowConfirmComplete(false)}
                  style={{ flex: 1, padding: '10px', background: 'transparent', color: '#8899aa', border: '1px solid #1c2a38', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
                  {lang === 'de' ? 'Noch nicht, ich lade weiter hoch' : 'Not yet, still uploading'}
                </button>
              </div>
            </div>
          )}
        </div>

        {message && (
          <div style={{ padding: '16px', background: message.startsWith('Fehler') || message.startsWith('Error') ? 'rgba(255,68,68,0.1)' : 'rgba(68,255,136,0.1)', border: `1px solid ${message.startsWith('Fehler') || message.startsWith('Error') ? '#ff4444' : '#44ff88'}`, borderRadius: '8px', color: message.startsWith('Fehler') || message.startsWith('Error') ? '#ff4444' : '#44ff88', fontWeight: 'bold' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}