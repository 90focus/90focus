'use client'

import { useState } from 'react'
import { supabase } from '@/app/supabase'
import { useLanguage } from '@/app/context/LanguageContext'

export default function OrganisatorenPage() {
  const { lang } = useLanguage()
  const [step, setStep] = useState(1)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [services, setServices] = useState<string[]>([])

  const [eventName, setEventName] = useState('')
  const [location, setLocation] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [timeFrom, setTimeFrom] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [participants, setParticipants] = useState('')

  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [remarks, setRemarks] = useState('')

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleService = (s: string) => {
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const packages = [
    {
      key: 'package1',
      titleDe: 'Paket 1 — Free Promo',
      titleEn: 'Package 1 — Free Promo',
      descDe: 'Ihr bekommt kostenlose Fotos für Social Media & Promotion. Wir dürfen die Fotos an Teilnehmer verkaufen.',
      descEn: 'You get free photos for social media & promotion. We may sell the photos to participants.',
    },
    {
      key: 'package2',
      titleDe: 'Paket 2 — Ihr verkauft',
      titleEn: 'Package 2 — You Sell',
      descDe: 'Ihr bezahlt uns und verkauft die Fotos selbst über unsere Website. Wir nehmen 5-10% vom Verkauf.',
      descEn: 'You pay us and sell the photos yourself through our website. We take 5-10% of sales.',
    },
    {
      key: 'package3',
      titleDe: 'Paket 3 — Alles gratis',
      titleEn: 'Package 3 — All Free',
      descDe: 'Ihr bezahlt uns, bekommt die Fotos und könnt sie kostenlos an Teilnehmer weitergeben.',
      descEn: 'You pay us, get the photos, and can offer them free to participants.',
    },
  ]

  const getDaysCount = () => {
    if (!dateFrom || !dateTo) return null
    const from = new Date(dateFrom)
    const to = new Date(dateTo)
    const diff = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    if (diff < 1) return null
    return diff
  }

  const getDuration = () => {
    if (!timeFrom || !timeTo) return null
    const [fh, fm] = timeFrom.split(':').map(Number)
    const [th, tm] = timeTo.split(':').map(Number)
    let totalMin = (th * 60 + tm) - (fh * 60 + fm)
    if (totalMin < 0) totalMin += 24 * 60
    const hours = Math.floor(totalMin / 60)
    const mins = totalMin % 60
    return { hours, mins }
  }

  const daysCount = getDaysCount()
  const duration = getDuration()

  const t = {
    next: lang === 'de' ? 'Weiter' : 'Next',
    back: lang === 'de' ? 'Zurück' : 'Back',
    send: lang === 'de' ? 'Anfrage senden' : 'Send inquiry',
    sending: lang === 'de' ? 'Senden...' : 'Sending...',
    fillAll: lang === 'de' ? 'Bitte alle Felder ausfüllen' : 'Please fill in all fields',
  }

  const stepTitles = [
    '',
    lang === 'de' ? 'Deine Kontaktdaten' : 'Your Contact Details',
    lang === 'de' ? 'Was möchtet ihr von uns?' : 'What do you need from us?',
    lang === 'de' ? 'Details zum Event' : 'Event Details',
    lang === 'de' ? 'Wähle ein Paket' : 'Choose a Package',
    lang === 'de' ? 'Letzte Bemerkungen' : 'Final Remarks',
  ]

  const validateStep = (): boolean => {
    if (step === 1) return !!(firstName && lastName && email && phone)
    if (step === 2) return services.length > 0
    if (step === 3) return !!(eventName && location && dateFrom && dateTo && timeFrom && timeTo && participants)
    if (step === 4) return !!selectedPackage
    return true
  }

  const handleNext = () => {
    if (!validateStep()) {
      alert(t.fillAll)
      return
    }
    setStep(s => s + 1)
  }

  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    setLoading(true)
    const pkg = packages.find(p => p.key === selectedPackage)
    const { error } = await supabase.from('organizer_inquiries').insert({
      event_name: eventName,
      date_from: dateFrom,
      date_to: dateTo,
      location,
      participant_count: participants,
      services: services.join(', '),
      remarks: `${remarks ? remarks + ' | ' : ''}Zeit: ${timeFrom}-${timeTo} | Paket: ${lang === 'de' ? pkg?.titleDe : pkg?.titleEn} | Kontakt: ${firstName} ${lastName}, ${email}, ${phone}`,
    })

    if (!error) {
      try {
        await fetch('/api/notify-organizer-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            event_name: eventName,
            date_from: dateFrom,
            date_to: dateTo,
            time_from: timeFrom,
            time_to: timeTo,
            location,
            participant_count: participants,
            services: services.join(', '),
            selected_package: lang === 'de' ? pkg?.titleDe : pkg?.titleEn,
            remarks,
          }),
        })
      } catch (e) {
        console.error('Email notify error:', e)
      }
      setSubmitted(true)
    }
    setLoading(false)
  }

  const inputStyle = { width: '100%', padding: '12px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: 6, color: '#e8eef4', fontSize: 14, boxSizing: 'border-box' as any }
  const labelStyle = { display: 'block', marginBottom: 6, fontSize: 13, color: '#8899aa' }

  if (submitted) {
    return (
      <div style={{ background: '#070b0f', color: '#e8eef4', minHeight: '100vh', padding: '80px 24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px', background: 'rgba(68,255,136,0.1)', border: '1px solid #44ff88', borderRadius: 8 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#44ff88', margin: 0 }}>
            {lang === 'de' ? '✅ Danke für deine Anfrage!' : '✅ Thanks for your inquiry!'}
          </h1>
          <p style={{ color: '#c5d0da', marginTop: 12, fontSize: 14 }}>
            {lang === 'de' ? 'Wir melden uns bald bei dir.' : "We'll get back to you soon."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', minHeight: '100vh', padding: '60px 24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        <h1 style={{ fontSize: 28, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
          {lang === 'de' ? 'Für Organisatoren' : 'For Organizers'}
        </h1>

        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: n <= step ? '#e8ff00' : '#1c2a38' }} />
          ))}
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>{stepTitles[step]}</h2>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>{lang === 'de' ? 'Vorname *' : 'First name *'}</label>
                <input style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'de' ? 'Nachname *' : 'Last name *'}</label>
                <input style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{lang === 'de' ? 'Email *' : 'Email *'}</label>
              <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>{lang === 'de' ? 'Telefonnummer *' : 'Phone number *'}</label>
              <input type="tel" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { key: 'participants', de: 'Teilnehmer fotografieren', en: 'Photograph participants' },
              { key: 'podium', de: 'Podium fotografieren', en: 'Photograph podium' },
              { key: 'audience', de: 'Publikum fotografieren', en: 'Photograph audience' },
              { key: 'video', de: 'Video/Highlights', en: 'Video/Highlights' },
            ].map(s => (
              <button key={s.key} type="button" onClick={() => toggleService(lang === 'de' ? s.de : s.en)}
                style={{
                  padding: '12px 18px', borderRadius: 20, fontSize: 14, cursor: 'pointer',
                  border: services.includes(lang === 'de' ? s.de : s.en) ? '1px solid #e8ff00' : '1px solid #1c2a38',
                  background: services.includes(lang === 'de' ? s.de : s.en) ? 'rgba(232,255,0,0.1)' : 'transparent',
                  color: services.includes(lang === 'de' ? s.de : s.en) ? '#e8ff00' : '#c5d0da',
                }}>
                {lang === 'de' ? s.de : s.en}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>{lang === 'de' ? 'Name des Events *' : 'Event name *'}</label>
              <input style={inputStyle} value={eventName} onChange={e => setEventName(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>{lang === 'de' ? 'Ort des Events *' : 'Event location *'}</label>
              <input style={inputStyle} value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>{lang === 'de' ? 'Datum von *' : 'Date from *'}</label>
                  <input type="date" style={inputStyle} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>{lang === 'de' ? 'Datum bis *' : 'Date to *'}</label>
                  <input type="date" style={inputStyle} value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
              </div>
              {daysCount && (
                <div style={{ color: '#e8ff00', fontSize: 12, marginTop: 6 }}>
                  {daysCount} {daysCount === 1 ? (lang === 'de' ? 'Tag' : 'day') : (lang === 'de' ? 'Tage' : 'days')}
                </div>
              )}
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>{lang === 'de' ? 'Uhrzeit von *' : 'Time from *'}</label>
                  <input type="time" style={inputStyle} value={timeFrom} onChange={e => setTimeFrom(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>{lang === 'de' ? 'Uhrzeit bis *' : 'Time to *'}</label>
                  <input type="time" style={inputStyle} value={timeTo} onChange={e => setTimeTo(e.target.value)} />
                </div>
              </div>
              {duration && (
                <div style={{ color: '#e8ff00', fontSize: 12, marginTop: 6 }}>
                  {duration.hours > 0 && `${duration.hours} ${lang === 'de' ? 'Std' : 'hrs'} `}
                  {duration.mins > 0 && `${duration.mins} ${lang === 'de' ? 'Min' : 'min'}`}
                  {duration.hours === 0 && duration.mins === 0 && (lang === 'de' ? '0 Min' : '0 min')}
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>{lang === 'de' ? 'Geplante Teilnehmerzahl *' : 'Expected number of participants *'}</label>
              <input style={inputStyle} value={participants} onChange={e => setParticipants(e.target.value)} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'grid', gap: 12 }}>
            {packages.map(p => (
              <div key={p.key} onClick={() => setSelectedPackage(p.key)}
                style={{
                  padding: 18, borderRadius: 8, cursor: 'pointer',
                  border: selectedPackage === p.key ? '2px solid #e8ff00' : '1px solid #1c2a38',
                  background: selectedPackage === p.key ? 'rgba(232,255,0,0.08)' : '#0d1219',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid #445566', background: selectedPackage === p.key ? '#e8ff00' : 'transparent', flexShrink: 0 }} />
                  <h3 style={{ color: '#e8ff00', fontSize: 14, margin: 0 }}>{lang === 'de' ? p.titleDe : p.titleEn}</h3>
                </div>
                <p style={{ fontSize: 13, color: '#c5d0da', lineHeight: 1.5, margin: 0, marginLeft: 28 }}>
                  {lang === 'de' ? p.descDe : p.descEn}
                </p>
              </div>
            ))}
          </div>
        )}

        {step === 5 && (
          <div>
            <label style={labelStyle}>{lang === 'de' ? 'Bemerkungen (optional)' : 'Remarks (optional)'}</label>
            <textarea style={{ ...inputStyle, minHeight: 120, resize: 'vertical' as any }} value={remarks} onChange={e => setRemarks(e.target.value)} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {step > 1 && (
            <button onClick={handleBack}
              style={{ flex: 1, background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 6, padding: '14px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {t.back}
            </button>
          )}
          {step < 5 && (
            <button onClick={handleNext}
              style={{ flex: 2, background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 6, padding: '14px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase' }}>
              {t.next}
            </button>
          )}
          {step === 5 && (
            <button onClick={handleSubmit} disabled={loading}
              style={{ flex: 2, background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 6, padding: '14px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase' }}>
              {loading ? t.sending : t.send}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}