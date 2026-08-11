'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from './context/LanguageContext'

export default function Home() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [slideIndex, setSlideIndex] = useState(0)
const [isMobile, setIsMobile] = useState(false)
  const heroBilderDesktop = ['/hero/hero-1.jpg', '/hero/hero-2.jpg', '/hero/hero-3.jpg', '/hero/hero-4.jpg', '/hero/hero-5.jpg', '/hero/hero-6.jpg', '/hero/hero-7.jpg']
const heroBilderMobile = ['/hero/hero-1-mobile.png', '/hero/hero-2-mobile.png', '/hero/hero-3-mobile.png', '/hero/hero-5-mobile.png', '/hero/hero-6-mobile.png', '/hero/hero-7-mobile.png']
  const heroBilder = isMobile ? heroBilderMobile : heroBilderDesktop
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [hoveredHeroBtn, setHoveredHeroBtn] = useState(false)
  const [hoveredAlleSpiele1, setHoveredAlleSpiele1] = useState(false)
const [hoveredAlleSpiele2, setHoveredAlleSpiele2] = useState(false)
  const [notFinishedModal, setNotFinishedModal] = useState(false)
  const router = useRouter()
  const { lang } = useLanguage()

  const today = new Date().toISOString().split('T')[0]

  const handleEventClick = (ev: any) => {
    if (ev.date > today) {
      setNotFinishedModal(true)
    } else {
      router.push(`/suche?eventId=${ev.id}`)
    }
  }

  useEffect(() => {
const fetchEvents = async (retry = true) => {
      try {
const today = new Date().toISOString().split('T')[0]
        const { data: past } = await supabase.from('events').select('*')
          .lte('date', today).order('date', { ascending: false }).limit(8)
        const remaining = 8 - (past?.length || 0)
        let combined = past || []
        if (remaining > 0) {
          const { data: upcoming } = await supabase.from('events').select('*')
            .gt('date', today).order('date', { ascending: true }).limit(remaining)
          combined = [...combined, ...(upcoming || [])]
        }
        const data = combined
        const error = null
        if (error) throw error
        if (data) {
          setEvents(data)
        }
      } catch (e) {
        console.error('fetchEvents error:', e)
        if (retry) {
          setTimeout(() => fetchEvents(false), 2000)
        }
      }
    }
    fetchEvents()
const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
          if (profile?.role === 'photographer') {
            router.push('/meine-events')
            return
          }
        }
      } catch (e) {
        console.error('checkUser error:', e)
      }
      setLoading(false)
    }
    checkUser()

    const failsafe = setTimeout(() => setLoading(false), 5000)
    return () => clearTimeout(failsafe)
  }, [])

useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 700)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setSlideIndex(0)
  }, [isMobile])

  useEffect(() => {
    if (heroBilder.length <= 1) return
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroBilder.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [heroBilder])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>Lade...</p>
    </div>
  )

  return (
    <main style={{ minHeight: "100vh", background: "#070b0f", color: "#e8eef4", fontFamily: "sans-serif", padding: "0" }}>
<section className="hero-section" style={{ position: "relative", aspectRatio: "3.2 / 1", overflow: "hidden", maxWidth: 1450, margin: "0 auto" }}>
        {heroBilder.length > 0 ? (
          heroBilder.map((bild, i) => (
            <div key={i} style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${bild})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: i === slideIndex ? 1 : 0,
              transition: "opacity 1s ease-in-out"
            }} />
          ))
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0d1219 0%, #131e2a 100%)" }} />
        )}
<div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(7,11,15,0.65) 45%, rgba(7,11,15,0.15) 100%)" }} />
<div className="hero-content" style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 48px" }}>
<div className="hero-label hide-mobile" style={{ color: "#e8ff00", fontSize: 16, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
            {lang === 'de' ? 'PROFESSIONELLE SPORTFOTOGRAFIE' : 'PROFESSIONAL SPORTS PHOTOGRAPHY'}
          </div>
          <h1 className="hero-title" style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: -2, textTransform: "uppercase", marginBottom: 18 }}>
            WHERE PERFORMANCE<br />
            <span style={{ color: "#e8ff00" }}>BECOMES MEMORY</span>
          </h1>
<p className="hide-mobile" style={{ color: "#e8eef4", fontSize: 14, fontWeight: 800, maxWidth: 400, lineHeight: 1.6, marginBottom: 24, letterSpacing: 0.5 }}>
{lang === 'de' ? 'Jeder Augenblick zählt, wir halten ihn fest' : 'Every moment matters, we capture it'}
          </p>
<div>
            <button
              onMouseEnter={() => setHoveredHeroBtn(true)}
              onMouseLeave={() => setHoveredHeroBtn(false)}
              style={{
                background: hoveredHeroBtn ? "#d4e800" : "#e8ff00",
                color: "#070b0f", border: "none", borderRadius: 2,
                padding: "12px 28px", fontWeight: 900, fontSize: 14,
                letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
                transform: hoveredHeroBtn ? "scale(1.03)" : "scale(1)",
                transition: "all 0.15s ease"
              }}
onClick={() => router.push('/spiele')}>
              {lang === 'de' ? 'Finde dein Event' : 'Find your Event'}
            </button>
          </div>
        </div>
{heroBilder.length > 1 && (
          <div className="hide-mobile" style={{ position: "absolute", bottom: 16, left: 48, zIndex: 3, display: "flex", gap: 8 }}>
            {heroBilder.map((_, i) => (
              <div key={i} onClick={() => setSlideIndex(i)} style={{
                width: i === slideIndex ? 24 : 8, height: 8,
                background: i === slideIndex ? "#e8ff00" : "rgba(255,255,255,0.3)",
                borderRadius: 4, cursor: "pointer", transition: "all 0.3s ease"
              }} />
            ))}
          </div>
        )}
      </section>

<section className="events-section" style={{ padding: "16px 48px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>


          {events.length === 0 ? (
<div style={{ color: "#445566", fontSize: 16, padding: "40px 0" }}>{lang === 'de' ? 'Keine kommenden Events.' : 'No upcoming events.'}</div>
          ) : (
<div className="events-grid">
              {events.map((ev) => (
                <div key={ev.id}
                  onMouseEnter={() => setHoveredCard(ev.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
background: "#0d1219", border: hoveredCard === ev.id ? "1px solid #e8ff00" : "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 8, overflow: "hidden", cursor: "pointer",
                    transform: hoveredCard === ev.id ? "translateY(-4px)" : "translateY(0)",
                    transition: "all 0.2s ease"
                  }}
onClick={() => handleEventClick(ev)}>
<div style={{ aspectRatio: "4 / 3", background: "#131e2a", position: "relative", overflow: "hidden" }}>
                    {ev.bild_url ? (
                      <img src={ev.bild_url} alt={`${ev.home_team} vs ${ev.away_team}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>

                      </div>
                    )}

                  </div>
                  <div style={{ padding: "16px" }}>
<div style={{ fontSize: 15, fontWeight: 800, textTransform: "uppercase", marginBottom: 8, color: "#fff" }}>{ev.home_team}</div>
<div style={{ fontSize: 12, color: "#fff", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e8eef4" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span>{new Date(ev.date).toLocaleDateString('de-CH')}</span>
                      {ev.ort && (
                        <>
                          <span style={{ color: "#334455" }}>·</span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e8eef4" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span>{ev.ort}</span>
                        </>
                      )}
                    </div>
                    {ev.sponsor_name && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, background: "#131e2a", padding: "4px 8px", borderRadius: 4, width: "fit-content" }}>
                        {ev.sponsor_logo_url && <img src={ev.sponsor_logo_url} alt={ev.sponsor_name} style={{ height: "16px", objectFit: "contain" }} />}
                        <span style={{ fontSize: 11, color: "#e8eef4", fontWeight: 700 }}>⭐ {ev.sponsor_name}</span>
                      </div>
                    )}
<button
className="card-btn"
                      onMouseEnter={() => setHoveredBtn(ev.id)}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={{
                        width: "100%", background: ev.date > today ? "#1c2a38" : (hoveredBtn === ev.id ? "#d4e800" : "#e8ff00"),
                        color: ev.date > today ? "#8899aa" : "#070b0f", border: "none", borderRadius: 2, padding: "10px",
                        fontWeight: 900, fontSize: 12, cursor: "pointer", textTransform: "uppercase",
                        letterSpacing: 1, transform: hoveredBtn === ev.id ? "scale(1.02)" : "scale(1)",
                        transition: "all 0.15s ease"
                      }}>
{ev.date > today ? (lang === 'de' ? 'Demnächst' : 'Coming Soon') : (lang === 'de' ? 'Zu den Fotos' : 'Show Photos')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button
              onMouseEnter={() => setHoveredAlleSpiele2(true)}
              onMouseLeave={() => setHoveredAlleSpiele2(false)}
              style={{
                background: hoveredAlleSpiele2 ? "#d4e800" : "#e8ff00",
                color: "#070b0f", border: "none", borderRadius: 2,
                padding: "10px 20px", fontWeight: 900, fontSize: 12,
                letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
                transform: hoveredAlleSpiele2 ? "scale(1.03)" : "scale(1)",
                transition: "all 0.15s ease"
              }}
onClick={() => router.push('/spiele')}>{lang === 'de' ? 'Alle Events' : 'All Events'}</button>
          </div>
        </div>
</section>

      {notFinishedModal && (
        <div onClick={() => setNotFinishedModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 12, padding: '32px 28px', maxWidth: 380, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>
              {lang === 'de' ? 'Event noch nicht abgeschlossen' : 'Event not finished yet'}
            </div>
            <p style={{ color: '#8899aa', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
              {lang === 'de' ? 'Die Fotos sind erst nach dem Event verfügbar. Schau später nochmal vorbei!' : 'Photos will be available after the event. Please check back later!'}
            </p>
            <button onClick={() => setNotFinishedModal(false)}
              style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '10px 28px', fontWeight: 900, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>
              {lang === 'de' ? 'Verstanden' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}