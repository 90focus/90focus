'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/app/context/LanguageContext'

export default function EventBearbeitenPage() {
  const [user, setUser] = useState<any>(null)
  const [eventName, setEventName] = useState('')
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [date, setDate] = useState('')
  const [liga, setLiga] = useState('')
const [ort, setOrt] = useState('')
  const [preis, setPreis] = useState('19.90')
  const [sponsorName, setSponsorName] = useState('')
  const [sponsorLogo, setSponsorLogo] = useState<File | null>(null)
  const [sponsorLogoPreview, setSponsorLogoPreview] = useState<string | null>(null)
  const [sponsorLogoName, setSponsorLogoName] = useState('')
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null)
  const [eventBild, setEventBild] = useState<File | null>(null)
  const [eventBildPreview, setEventBildPreview] = useState<string | null>(null)
  const [eventBildName, setEventBildName] = useState('')
  const [currentBildUrl, setCurrentBildUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const { lang } = useLanguage()

  const isTeamSport = liga === 'Fussball' || liga === 'Handball'

  const t = {
    event: 'Event',
    edit: lang === 'de' ? 'Bearbeiten' : 'Edit',
    selectSport: lang === 'de' ? 'Sportart auswählen...' : 'Select sport...',
    homeTeam: lang === 'de' ? 'Heimteam *' : 'Home Team *',
    awayTeam: lang === 'de' ? 'Gastteam *' : 'Away Team *',
    eventName: lang === 'de' ? 'Eventname *' : 'Event Name *',
location: lang === 'de' ? 'Ort (optional)' : 'Location (optional)',
    price: lang === 'de' ? 'Preis pro Foto-Paket (EUR)' : 'Price per Photo Package (EUR)',
    eventImage: lang === 'de' ? '🖼️ Event Bild' : '🖼️ Event Image',
    recommendedSize: lang === 'de' ? 'Empfohlene Grösse: 1200 × 900 Pixel (4:3)' : 'Recommended size: 1200 × 900 pixels (4:3)',
    currentImage: lang === 'de' ? 'Aktuelles Bild:' : 'Current image:',
    selectImage: lang === 'de' ? '📁 Bild auswählen' : '📁 Choose Image',
    sponsor: lang === 'de' ? '🏢 Sponsor' : '🏢 Sponsor',
    sponsorName: lang === 'de' ? 'Sponsor Name' : 'Sponsor Name',
    currentLogo: lang === 'de' ? 'Aktuelles Logo:' : 'Current logo:',
    selectLogo: lang === 'de' ? '📁 Logo auswählen' : '📁 Choose Logo',
    save: lang === 'de' ? 'Speichern' : 'Save',
    cancel: lang === 'de' ? 'Abbrechen' : 'Cancel',
    loading: lang === 'de' ? 'Lade...' : 'Loading...',
    requiredTeams: lang === 'de' ? 'Heimteam, Gastteam und Datum sind Pflichtfelder!' : 'Home team, away team and date are required!',
    requiredName: lang === 'de' ? 'Eventname und Datum sind Pflichtfelder!' : 'Event name and date are required!',
    uploadingLogo: lang === 'de' ? 'Logo wird hochgeladen...' : 'Uploading logo...',
    uploadingImage: lang === 'de' ? 'Bild wird hochgeladen...' : 'Uploading image...',
    errorPrefix: lang === 'de' ? 'Fehler: ' : 'Error: ',
    eventSaved: lang === 'de' ? '✅ Event gespeichert!' : '✅ Event saved!',
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      await loadEvent(session.user.id)
      setLoading(false)
    }
    init()
  }, [eventId])

  const loadEvent = async (userId: string) => {
    const { data } = await supabase.from('events').select('*').eq('id', eventId).eq('user_id', userId).single()
    if (!data) { router.push('/meine-events'); return }
    const liga = data.liga || ''
    const teamSport = liga === 'Fussball' || liga === 'Handball'
    if (teamSport && data.home_team?.includes(' vs ')) {
      const [h, a] = data.home_team.split(' vs ')
      setHomeTeam(h || '')
      setAwayTeam(a || '')
    } else {
      setEventName(data.home_team || '')
    }
    setDate(data.date || '')
    setLiga(liga)
setOrt(data.ort || '')
    setPreis(data.preis ? String(data.preis) : '19.90')
    setSponsorName(data.sponsor_name || '')
    setCurrentLogoUrl(data.sponsor_logo_url || null)
    setCurrentBildUrl(data.bild_url || null)
  }

  const handleSponsorLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setSponsorLogo(file); setSponsorLogoPreview(URL.createObjectURL(file)); setSponsorLogoName(file.name) }
  }

  const handleEventBild = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setEventBild(file); setEventBildPreview(URL.createObjectURL(file)); setEventBildName(file.name) }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    const filename = `event_${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('sponsor-logos').upload(filename, file, { contentType: file.type })
    if (error) return null
    const { data: urlData } = supabase.storage.from('sponsor-logos').getPublicUrl(filename)
    return urlData.publicUrl
  }

  const saveEvent = async () => {
    const finalName = isTeamSport && homeTeam && awayTeam ? `${homeTeam} vs ${awayTeam}` : eventName
    if (!finalName || !date) { setMessage(isTeamSport ? t.requiredTeams : t.requiredName); return }
    let sponsorLogoUrl = currentLogoUrl
    let bildUrl = currentBildUrl
    if (sponsorLogo) { setMessage(t.uploadingLogo); sponsorLogoUrl = await uploadFile(sponsorLogo) }
    if (eventBild) { setMessage(t.uploadingImage); bildUrl = await uploadFile(eventBild) }

const { error } = await supabase.from('events').update({
      home_team: finalName, away_team: '', date, liga, ort,
      sponsor_name: sponsorName, sponsor_logo_url: sponsorLogoUrl, bild_url: bildUrl,
      preis: parseFloat(preis) || 19.90,
    }).eq('id', eventId)

    if (error) {
      setMessage(t.errorPrefix + error.message)
    } else {
      setMessage(t.eventSaved)
      setTimeout(() => router.push('/meine-events'), 1500)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>{t.loading}</p>
    </div>
  )

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '24px 16px', maxWidth: '700px', margin: '60px auto 0' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{t.event}</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, textTransform: 'uppercase', marginBottom: 24 }}>{t.edit}</h1>

        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
          <select value={liga} onChange={(e) => setLiga(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }}>
            <option value="">{t.selectSport}</option>
            <option value="Fussball">Fussball</option>
            <option value="Handball">Handball</option>
            <option value="Basketball">Basketball</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Hybrid Sport">Hybrid Sport</option>
            <option value="Laufsport">Laufsport</option>
            <option value="Triathlon">Triathlon</option>
            <option value="Radsport">Radsport</option>
            <option value="Schwimmen">Schwimmen</option>
            <option value="Tennis">Tennis</option>
            <option value="Kampfsport">Kampfsport</option>
            <option value="Wintersport">Wintersport</option>
            <option value="Turnen">Turnen</option>
            <option value="Golf">Golf</option>
            <option value="Sonstige">Sonstige</option>
          </select>

          {isTeamSport ? (
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

          <input type="number" step="0.10" placeholder={t.price} value={preis} onChange={(e) => setPreis(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />

          <div style={{ borderTop: '1px solid #1c2a38', marginTop: '16px', paddingTop: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#e8eef4', fontSize: 16 }}>{t.eventImage}</h3>
            <p style={{ margin: '0 0 12px 0', color: '#667788', fontSize: 12 }}>{t.recommendedSize}</p>
            {currentBildUrl && !eventBildPreview && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ color: '#667788', fontSize: 13, margin: '4px 0' }}>{t.currentImage}</p>
                <img src={currentBildUrl} alt="Image" style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 6 }} />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1c2a38', color: '#e8eef4', borderRadius: 6, cursor: 'pointer', fontSize: 13, border: '1px solid #2a3a4a', fontWeight: 600 }}>
                {t.selectImage}
                <input type="file" accept="image/*" onChange={handleEventBild} style={{ display: 'none' }} />
              </label>
              {eventBildName && <span style={{ color: '#667788', fontSize: 12 }}>✓ {eventBildName}</span>}
            </div>
            {eventBildPreview && (
              <img src={eventBildPreview} alt="Preview" style={{ width: '100%', maxHeight: 150, objectFit: 'cover', marginTop: 8, borderRadius: 6 }} />
            )}
          </div>

          <div style={{ borderTop: '1px solid #1c2a38', marginTop: '16px', paddingTop: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#e8eef4', fontSize: 16 }}>{t.sponsor}</h3>
            <input type="text" placeholder={t.sponsorName} value={sponsorName} onChange={(e) => setSponsorName(e.target.value)}
              style={{ width: '100%', padding: '12px', margin: '8px 0', fontSize: '16px', boxSizing: 'border-box' as any, background: '#131e2a', border: '1px solid #1c2a38', borderRadius: '6px', color: '#e8eef4' }} />
            {currentLogoUrl && !sponsorLogoPreview && (
              <div style={{ marginBottom: 8 }}>
                <p style={{ color: '#667788', fontSize: 13, margin: '4px 0' }}>{t.currentLogo}</p>
                <img src={currentLogoUrl} alt="Logo" style={{ height: 50, objectFit: 'contain', background: '#131e2a', padding: 4, borderRadius: 4 }} />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1c2a38', color: '#e8eef4', borderRadius: 6, cursor: 'pointer', fontSize: 13, border: '1px solid #2a3a4a', fontWeight: 600 }}>
                {t.selectLogo}
                <input type="file" accept="image/*" onChange={handleSponsorLogo} style={{ display: 'none' }} />
              </label>
              {sponsorLogoName && <span style={{ color: '#667788', fontSize: 12 }}>✓ {sponsorLogoName}</span>}
            </div>
            {sponsorLogoPreview && (
              <img src={sponsorLogoPreview} alt="Preview" style={{ height: 50, marginTop: 8, objectFit: 'contain', background: '#131e2a', padding: 4, borderRadius: 4 }} />
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button onClick={saveEvent}
              style={{ flex: 1, padding: '12px 24px', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t.save}
            </button>
            <button onClick={() => router.push('/meine-events')}
              style={{ flex: 1, padding: '12px 24px', background: 'transparent', color: '#667788', border: '1px solid #1c2a38', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' }}>
              {t.cancel}
            </button>
          </div>
        </div>

        {message && (
          <div style={{ padding: '16px', background: message.startsWith('Fehler') || message.startsWith('Error') ? 'rgba(255,68,68,0.1)' : 'rgba(68,255,136,0.1)', border: `1px solid ${message.startsWith('Fehler') || message.startsWith('Error') ? '#ff4444' : '#44ff88'}`, borderRadius: '8px', color: message.startsWith('Fehler') || message.startsWith('Error') ? '#ff4444' : '#44ff88', fontWeight: 'bold', fontSize: 13 }}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}