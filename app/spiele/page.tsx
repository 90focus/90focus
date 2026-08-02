'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/context/LanguageContext'

export default function SpielePage() {
  const [events, setEvents] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])


const [nameFilter, setNameFilter] = useState('')
  const [nameInput, setNameInput] = useState('')
const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const router = useRouter()
  const { lang } = useLanguage()

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*').order('date', { ascending: false })
      if (data) { setEvents(data); setFiltered(data) }
    }
    fetchEvents()
  }, [])

useEffect(() => {
    let result = events
if (nameFilter) result = result.filter((ev) => ev.home_team.toLowerCase().includes(nameFilter.toLowerCase()))
    setFiltered(result)
  }, [nameFilter, events])

  return (
    <main style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
<section className="events-section" style={{ padding: '32px 48px 40px', maxWidth: 1200, margin: '60px auto 0' }}>
<h1 style={{ fontSize: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: -2, marginBottom: 40 }}>{lang === 'de' ? 'Alle Events' : 'All Events'}</h1>

<div style={{ marginBottom: 24, maxWidth: 500, position: 'relative' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8899aa" strokeWidth="2" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
<input type="text" placeholder={lang === 'de' ? 'Finde dein Event' : 'Find your Event'} value={nameInput}
            className="search-input-white"
            onChange={(e) => {
              setNameInput(e.target.value)
              if (e.target.value === '') setNameFilter('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && setNameFilter(nameInput)}
            style={{ width: '100%', background: '#0d1219', color: '#fff', border: '1px solid #1c2a38', borderRadius: 6, padding: '14px 18px 14px 46px', fontSize: 15, boxSizing: 'border-box' as any }} />
        </div>



        {filtered.length === 0 ? (
<div style={{ color: '#445566', fontSize: 16, padding: '40px 0' }}>{lang === 'de' ? 'Keine Events gefunden.' : 'No events found.'}</div>
        ) : (
<div className="events-grid">
{filtered.map((ev) => (
              <div key={ev.id}
                onMouseEnter={() => setHoveredCard(ev.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: '#0d1219',
                  border: hoveredCard === ev.id ? '1px solid #e8ff00' : '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                  transform: hoveredCard === ev.id ? 'translateY(-4px)' : 'translateY(0)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => router.push(`/suche?eventId=${ev.id}`)}>
<div style={{ aspectRatio: '4 / 3', background: '#131e2a', position: 'relative', overflow: 'hidden' }}>
                  {ev.bild_url ? (
<img src={ev.bild_url} alt={ev.home_team}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                    </div>
                  )}

                </div>
                <div style={{ padding: '16px' }}>
<div style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8, color: '#fff' }}>{ev.home_team}</div>
<div style={{ fontSize: 12, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e8eef4" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>{new Date(ev.date).toLocaleDateString('de-CH')}</span>
                    {ev.ort && (
                      <>
                        <span style={{ color: '#334455' }}>·</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e8eef4" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span>{ev.ort}</span>
                      </>
                    )}
                  </div>
                  {ev.sponsor_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, background: '#131e2a', padding: '4px 8px', borderRadius: 4, width: 'fit-content' }}>
                      {ev.sponsor_logo_url && <img src={ev.sponsor_logo_url} alt={ev.sponsor_name} style={{ height: '16px', objectFit: 'contain' }} />}
                      <span style={{ fontSize: 11, color: '#e8eef4', fontWeight: 700 }}>⭐ {ev.sponsor_name}</span>
                    </div>
                  )}
<button className="card-btn" style={{
                    width: '100%',
                    background: hoveredCard === ev.id ? '#d4e800' : '#e8ff00',
                    color: '#070b0f', border: 'none', borderRadius: 2, padding: '10px',
                    fontWeight: 900, fontSize: 12, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1,
                    transform: hoveredCard === ev.id ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.15s ease'
                  }}>
{lang === 'de' ? 'Zu den Fotos' : 'Show Photos'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}