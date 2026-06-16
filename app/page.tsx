'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [events, setEvents] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [slideIndex, setSlideIndex] = useState(0)
  const [heroBilder, setHeroBilder] = useState<string[]>([])
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)
  const [hoveredHeroBtn, setHoveredHeroBtn] = useState(false)
  const [hoveredAlleSpiele1, setHoveredAlleSpiele1] = useState(false)
  const [hoveredAlleSpiele2, setHoveredAlleSpiele2] = useState(false)
  const [hoveredFooter, setHoveredFooter] = useState<string | null>(null)
  const router = useRouter()

  const LOGO_URL = "https://gqhmgbkqemiqbocazvkj.supabase.co/storage/v1/object/public/sponsor-logos/logo-90focus.png.png"

  useEffect(() => {
    const fetchEvents = async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase.from('events').select('*')
        .gte('date', today).order('date', { ascending: true }).limit(6)
      if (data) {
        setEvents(data)
        const bilder = data.filter((e: any) => e.bild_url).map((e: any) => e.bild_url)
        setHeroBilder(bilder)
      }
    }
    fetchEvents()
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        if (profile?.role === 'photographer') {
          router.push('/meine-events')
          setLoading(false)
          return
        }
        setUser(session.user)
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  useEffect(() => {
    if (heroBilder.length <= 1) return
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroBilder.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [heroBilder])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const footerLink = (key: string) => ({
    color: hoveredFooter === key ? '#e8ff00' : '#e8eef4',
    fontSize: 14, cursor: 'pointer',
    transition: 'color 0.15s ease'
  })

  const footerA = (key: string) => ({
    color: hoveredFooter === key ? '#e8ff00' : '#e8eef4',
    fontSize: 14, textDecoration: 'none',
    display: 'flex', alignItems: 'center', gap: 8,
    transition: 'color 0.15s ease'
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>Lade...</p>
    </div>
  )

  return (
    <main style={{ minHeight: "100vh", background: "#070b0f", color: "#e8eef4", fontFamily: "sans-serif", padding: "0" }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(7,11,15,0.97)", borderBottom: "1px solid #131e2a", height: 60, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => router.push('/')}>
          <img src={LOGO_URL} alt="90Focus" style={{ height: 36, objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ background: "transparent", color: "#e8ff00", border: "1px solid #e8ff00", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
            onClick={() => router.push('/')}>Home</button>
          <button style={{ background: "transparent", color: "#e8eef4", border: "1px solid #1c2a38", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
            onClick={() => router.push('/spiele')}>Alle Spiele</button>
          {user ? (
            <>
              <button style={{ background: "transparent", color: "#e8eef4", border: "1px solid #1c2a38", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => router.push('/kunden-dashboard')}>Meine Fotos</button>
              <button style={{ background: "transparent", color: "#e8eef4", border: "1px solid #1c2a38", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => router.push('/kunden-profil')}>Profil</button>
              <button style={{ background: "transparent", color: "#ff4444", border: "1px solid #ff4444", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={handleLogout}>Abmelden</button>
            </>
          ) : (
            <>
              <button style={{ background: "transparent", color: "#e8eef4", border: "1px solid #1c2a38", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => router.push('/login')}>Login</button>
              <button style={{ background: "transparent", color: "#e8ff00", border: "1px solid #e8ff00", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => router.push('/register')}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      <section style={{ position: "relative", height: "380px", overflow: "hidden", marginTop: 60 }}>
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
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(7,11,15,0.88) 45%, rgba(7,11,15,0.3) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 48px" }}>
          <div style={{ color: "#e8ff00", fontSize: 16, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
            PROFESSIONELLE SPORTFOTOGRAFIE
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: -2, textTransform: "uppercase", marginBottom: 18 }}>
            DEIN SPIEL<br />
            <span style={{ color: "#e8ff00" }}>DEINE MOMENTE</span>
          </h1>
          <p style={{ color: "#e8eef4", fontSize: 14, fontWeight: 800, maxWidth: 400, lineHeight: 1.6, marginBottom: 24, letterSpacing: 0.5 }}>
            Jeder Augenblick zählt. Wir halten ihn fest.
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
              Meine Fotos finden →
            </button>
          </div>
        </div>
        {heroBilder.length > 1 && (
          <div style={{ position: "absolute", bottom: 16, left: 48, zIndex: 3, display: "flex", gap: 8 }}>
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

      <section style={{ padding: "32px 48px 40px", borderTop: "1px solid #131e2a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
            <button
              onMouseEnter={() => setHoveredAlleSpiele1(true)}
              onMouseLeave={() => setHoveredAlleSpiele1(false)}
              style={{
                background: hoveredAlleSpiele1 ? "#d4e800" : "#e8ff00",
                color: "#070b0f", border: "none", borderRadius: 2,
                padding: "10px 20px", fontWeight: 900, fontSize: 12,
                letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
                transform: hoveredAlleSpiele1 ? "scale(1.03)" : "scale(1)",
                transition: "all 0.15s ease"
              }}
              onClick={() => router.push('/spiele')}>Alle Spiele →</button>
          </div>

          {events.length === 0 ? (
            <div style={{ color: "#445566", fontSize: 16, padding: "40px 0" }}>Keine kommenden Events. 🎯</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {events.map((ev) => (
                <div key={ev.id}
                  onMouseEnter={() => setHoveredCard(ev.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: "#0d1219", border: hoveredCard === ev.id ? "1px solid #e8ff00" : "1px solid #1c2a38",
                    borderRadius: 8, overflow: "hidden", cursor: "pointer",
                    transform: hoveredCard === ev.id ? "translateY(-4px)" : "translateY(0)",
                    transition: "all 0.2s ease"
                  }}
                  onClick={() => router.push(`/suche?eventId=${ev.id}`)}>
                  <div style={{ height: 180, background: "#131e2a", position: "relative", overflow: "hidden" }}>
                    {ev.bild_url ? (
                      <img src={ev.bild_url} alt={`${ev.home_team} vs ${ev.away_team}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 48 }}>⚽</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", top: 10, left: 10, background: "#e8ff00", color: "#070b0f", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 8px", borderRadius: 2 }}>
                      {ev.liga}
                    </div>
                  </div>
                  <div style={{ padding: "16px" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, textTransform: "uppercase", marginBottom: 8 }}>{ev.home_team} vs {ev.away_team}</div>
                    <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 12 }}>📅 {ev.date} {ev.ort && `· 📍 ${ev.ort}`}</div>
                    {ev.sponsor_name && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, background: "#131e2a", padding: "4px 8px", borderRadius: 4, width: "fit-content" }}>
                        {ev.sponsor_logo_url && <img src={ev.sponsor_logo_url} alt={ev.sponsor_name} style={{ height: "16px", objectFit: "contain" }} />}
                        <span style={{ fontSize: 11, color: "#e8eef4", fontWeight: 700 }}>⭐ {ev.sponsor_name}</span>
                      </div>
                    )}
                    <button
                      onMouseEnter={() => setHoveredBtn(ev.id)}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={{
                        width: "100%", background: hoveredBtn === ev.id ? "#d4e800" : "#e8ff00",
                        color: "#070b0f", border: "none", borderRadius: 2, padding: "10px",
                        fontWeight: 900, fontSize: 12, cursor: "pointer", textTransform: "uppercase",
                        letterSpacing: 1, transform: hoveredBtn === ev.id ? "scale(1.02)" : "scale(1)",
                        transition: "all 0.15s ease"
                      }}>
                      Zu den Fotos →
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
              onClick={() => router.push('/spiele')}>Alle Spiele →</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1c2a38", padding: "40px 48px 32px", background: "#070b0f" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>

            {/* LOGO + BESCHREIBUNG */}
            <div>
              <div style={{ marginBottom: 12 }}>
                <img src={LOGO_URL} alt="90Focus" style={{ height: 32, objectFit: "contain" }} />
              </div>
              <p style={{ color: "#e8eef4", fontSize: 13, maxWidth: 260, lineHeight: 1.6 }}>
                Deine Momente für immer festgehalten.
              </p>
            </div>

            {/* LINKS */}
            <div>
              <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={footerLink('home')} onMouseEnter={() => setHoveredFooter('home')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/')}>Home</span>
                <span style={footerLink('spiele')} onMouseEnter={() => setHoveredFooter('spiele')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/spiele')}>Alle Spiele</span>
                <span style={footerLink('faq')} onMouseEnter={() => setHoveredFooter('faq')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/faq')}>FAQ</span>
                <span style={footerLink('kontakt')} onMouseEnter={() => setHoveredFooter('kontakt')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/kontakt')}>Kontakt</span>
              </div>
            </div>

            {/* RECHTLICHES */}
            <div>
              <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Rechtliches</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={footerLink('impressum')} onMouseEnter={() => setHoveredFooter('impressum')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/impressum')}>Impressum</span>
                <span style={footerLink('datenschutz')} onMouseEnter={() => setHoveredFooter('datenschutz')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/datenschutz')}>Datenschutz</span>
                <span style={footerLink('agb')} onMouseEnter={() => setHoveredFooter('agb')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/agb')}>AGB</span>
              </div>
            </div>

            {/* SOCIAL MEDIA */}
            <div>
              <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Social Media</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="https://www.instagram.com/90focus" target="_blank" rel="noopener noreferrer"
                  style={footerA('instagram') as any}
                  onMouseEnter={() => setHoveredFooter('instagram')}
                  onMouseLeave={() => setHoveredFooter(null)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                  Instagram
                </a>
                <a href="https://www.facebook.com/90focus" target="_blank" rel="noopener noreferrer"
                  style={footerA('facebook') as any}
                  onMouseEnter={() => setHoveredFooter('facebook')}
                  onMouseLeave={() => setHoveredFooter(null)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  Facebook
                </a>
              </div>
            </div>
          </div>

          {/* UNTERE ZEILE */}
          <div style={{ borderTop: "1px solid #1c2a38", paddingTop: 20 }}>
            <span style={{ color: "#e8eef4", fontSize: 13 }}>© 2026 90Focus</span>
          </div>
        </div>
      </footer>
    </main>
  )
}