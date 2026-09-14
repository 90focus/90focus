'use client'

import { useState } from 'react'
import { supabase } from '@/app/supabase'
import { useLanguage } from '@/app/context/LanguageContext'

export default function OrganisatorenPage() {
  const { lang } = useLanguage()
  const [eventName, setEventName] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [timeFrom, setTimeFrom] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [location, setLocation] = useState('')
  const [participants, setParticipants] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [remarks, setRemarks] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleService = (s: string) => {
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const packages = [
    { key: 'package1', de: 'Paket 1 — Free Promo', en: 'Package 1 — Free Promo' },
    { key: 'package2', de: 'Paket 2 — Ihr verkauft', en: 'Package 2 — You Sell' },
    { key: 'package3', de: 'Paket 3 — Alles gratis', en: 'Package 3 — All Free' },
  ]

  const handleSubmit = async () => {
    if (!eventName || !dateFrom || !dateTo || !timeFrom || !timeTo || !location || !participants || services.length === 0 || !selectedPackage) {
      alert(lang === 'de' ? 'Bitte alle Felder ausfüllen' : 'Please fill in all fields')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('organizer_inquiries').insert({
      event_name: eventName,
      date_from: dateFrom,
      date_to: dateTo,
      location,
      participant_count: participants,
      services: services.join(', '),
      remarks: `${remarks ? remarks + ' | ' : ''}Zeit: ${timeFrom}-${timeTo} | Paket: ${packages.find(p => p.key === selectedPackage)?.[lang === 'de' ? 'de' : 'en']}`,
    })

    if (!error) {
      try {
        await fetch('/api/notify-organizer-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_name: eventName,
            date_from: dateFrom,
            date_to: dateTo,
            time_from: timeFrom,
            time_to: timeTo,
            location,
            participant_count: participants,
            services: services.join(', '),
            selected_package: packages.find(p => p.key === selectedPackage)?.[lang === 'de' ? 'de' : 'en'],
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
            {lang === 'de' ? 'Wir melden uns bald mit einer Offerte bei dir.' : "We'll get back to you soon with an offer."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', minHeight: '100vh', padding: '60px 24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
          {lang === 'de' ? 'Für Organisatoren' : 'For Organizers'}
        </h1>
        <p style={{ color: '#8899aa', marginBottom: 40, fontSize: 15 }}>
          {lang === 'de' ? 'Plant ihr ein Sport-Event? Wir kümmern uns um die Fotografie.' : 'Planning a sports event? We handle the photography.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div>
            <label style={labelStyle}>{lang === 'de' ? 'Name des Events *' : 'Event name *'}</label>
            <input required style={inputStyle} value={eventName} onChange={e => setEventName(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>{lang === 'de' ? 'Datum von *' : 'Date from *'}</label>
              <input required type="date" style={inputStyle} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>{lang === 'de' ? 'Datum bis *' : 'Date to *'}</label>
              <input required type="date" style={inputStyle} value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>{lang === 'de' ? 'Uhrzeit von *' : 'Time from *'}</label>
              <input required type="time" style={inputStyle} value={timeFrom} onChange={e => setTimeFrom(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>{lang === 'de' ? 'Uhrzeit bis *' : 'Time to *'}</label>
              <input required type="time" style={inputStyle} value={timeTo} onChange={e => setTimeTo(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>{lang === 'de' ? 'Ort des Events *' : 'Event location *'}</label>
            <input required style={inputStyle} value={location} onChange={e => setLocation(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>{lang === 'de' ? 'Geplante Teilnehmerzahl *' : 'Expected number of participants *'}</label>
            <input required style={inputStyle} value={participants} onChange={e => setParticipants(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>{lang === 'de' ? 'Was möchtet ihr von uns? *' : 'What do you need from us? *'}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {[
                { key: 'participants', de: 'Teilnehmer fotografieren', en: 'Photograph participants' },
                { key: 'podium', de: 'Podium fotografieren', en: 'Photograph podium' },
                { key: 'audience', de: 'Publikum fotografieren', en: 'Photograph audience' },
                { key: 'video', de: 'Video/Highlights', en: 'Video/Highlights' },
              ].map(s => (
                <button key={s.key} type="button" onClick={() => toggleService(lang === 'de' ? s.de : s.en)}
                  style={{
                    padding: '8px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                    border: services.includes(lang === 'de' ? s.de : s.en) ? '1px solid #e8ff00' : '1px solid #1c2a38',
                    background: services.includes(lang === 'de' ? s.de : s.en) ? 'rgba(232,255,0,0.1)' : 'transparent',
                    color: services.includes(lang === 'de' ? s.de : s.en) ? '#e8ff00' : '#c5d0da',
                  }}>
                  {lang === 'de' ? s.de : s.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>{lang === 'de' ? 'Welches Paket interessiert euch? *' : 'Which package interests you? *'}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              {packages.map(p => (
                <div key={p.key} onClick={() => setSelectedPackage(p.key)}
                  style={{
                    padding: '14px 16px', borderRadius: 8, cursor: 'pointer',
                    border: selectedPackage === p.key ? '1px solid #e8ff00' : '1px solid #1c2a38',
                    background: selectedPackage === p.key ? 'rgba(232,255,0,0.08)' : '#0d1219',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid #445566', background: selectedPackage === p.key ? '#e8ff00' : 'transparent', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: selectedPackage === p.key ? '#e8ff00' : '#e8eef4' }}>
                    {lang === 'de' ? p.de : p.en}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>{lang === 'de' ? 'Bemerkungen' : 'Remarks'}</label>
            <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' as any }} value={remarks} onChange={e => setRemarks(e.target.value)} />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 6, padding: '14px', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', marginTop: 12 }}>
            {loading ? (lang === 'de' ? 'Senden...' : 'Sending...') : (lang === 'de' ? 'Anfrage senden' : 'Send inquiry')}
          </button>

        </div>
      </div>
    </div>
  )
}