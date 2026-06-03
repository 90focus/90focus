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
  const router = useRouter()

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*').order('date', { ascending: false }).limit(8)
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
          router.push('/dashboard')
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

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>Lade...</p>
    </div>
  )

  return (
    <main style={{ minHeight: "100vh", background: "#070b0f", color: "#e8eef4", fontFamily: "sans-serif", padding: "0" }}>
      {/* NAV */}
      <nav style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, background: "rgba(7,11,15,0.7)", borderBottom: "1px solid rgba(255,255,255,0.05)", height: 60, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => router.push('/')}>
          <div style={{ width: 34, height: 34, background: "#e8ff00", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#070b0f", fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ background: "transparent", color: "#e8ff00", border: "1px solid #e8ff00", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
            onClick={() => router.push('/')}>Home</button>
          <button style={{ background: "transparent", color: "#e8eef4", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
            onClick={() => router.push('/spiele')}>Alle Spiele</button>
          {user ? (
            <>
              <button style={{ background: "transparent", color: "#e8eef4", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => router.push('/kunden-dashboard')}>Meine Fotos</button>
              <button style={{ background: "transparent", color: "#e8eef4", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => router.push('/kunden-profil')}>Profil</button>
              <button style={{ background: "transparent", color: "#ff4444", border: "1px solid #ff4444", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={handleLogout}>Abmelden</button>
            </>
          ) : (
            <>
              <button style={{ background: "transparent", color: "#e8eef4", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => router.push('/login')}>Login</button>
              <button style={{ background: "transparent", color: "#e8ff00", border: "1px solid #e8ff00", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => router.push('/register')}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO MIT SLIDESHOW */}
      <section style={{ position: "relative", height: "520px", overflow: "hidden" }}>
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
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(7,11,15,0.85) 40%, rgba(7,11,15,0.3) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 48px", paddingTop: 60 }}>
          <div style={{ color: "#e8ff00", fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>
            Luzern · Amateurliga · Saison 2025/26
          </div>
          <h1 style={{ fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: -3, textTransform: "uppercase", marginBottom: 24 }}>
            DEIN SPIEL.<br />
            <span style={{ color: "#e8ff00" }}>DEINE BILDER.</span>
          </h1>
          <p style={{ color: "#aabbcc", fontSize: 17, maxWidth: 440, lineHeight: 1.7, marginBottom: 36 }}>
            Professionelle Spielfotos für die Amateurliga. Gesichtserkennung findet automatisch alle Bilder von dir.
          </p>
          <div>
            <button style={{ background: "#e8ff00", color: "#070b0f", border: "none", borderRadius: 2, padding: "15px 36px", fontWeight: 900, fontSize: 16, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}
              onClick={() => user ? router.push('/kunden-dashboard') : router.push('/suche')}>
              {user ? 'Fotos verwalten →' : 'Meine Fotos finden →'}
            </button>
          </div>
        </div>

        {heroBilder.length > 1 && (
          <div style={{ position: "absolute", bottom: 20, left: 48, zIndex: 3, display: "flex", gap: 8 }}>
            {heroBilder.map((_, i) => (
              <div key={i} onClick={() => setSlideIndex(i)} style={{
                width: i === slideIndex ? 24 : 8, height: 8,
                background: i === slideIndex ? "#e8ff00" : "rgba(255,255,255,0.3)",
                borderRadius: 4, cursor: "pointer",
                transition: "all 0.3s ease"
              }} />
            ))}
          </div>
        )}
      </section>

      {/* EVENTS */}
      <section style={{ padding: "60px 48px", borderTop: "1px solid #131e2a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
            <div>
              <div style={{ color: "#e8ff00", fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Neueste Events</div>
              <h2 style={{ fontSize: 36, fontWeight: 900, textTransform: "uppercase", letterSpacing: -1, margin: 0 }}>Events</h2>
            </div>
            <button style={{ background: "transparent", color: "#e8ff00", border: "1px solid #e8ff00", borderRadius: 2, padding: "10px 20px", fontWeight: 800, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
              onClick={() => router.push('/spiele')}>Alle Spiele →</button>
          </div>

          {events.length === 0 ? (
            <div style={{ color: "#445566", fontSize: 16, padding: "40px 0" }}>Noch keine Events. 🎯</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {events.map((ev) => (
                <div key={ev.id} style={{ background: "#0d1219", border: "1px solid #1c2a38", borderRadius: 6, overflow: "hidden", cursor: "pointer" }}
                  onClick={() => user ? router.push('/kunden-dashboard') : router.push(`/suche?eventId=${ev.id}`)}>
                  <div style={{ width: "100%", paddingBottom: "100%", position: "relative", background: "#131e2a" }}>
                    {ev.bild_url ? (
                      <img src={ev.bild_url} alt={`${ev.home_team} vs ${ev.away_team}`}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 40 }}>⚽</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", top: 8, left: 8, background: "#e8ff00", color: "#070b0f", fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", padding: "3px 6px", borderRadius: 2 }}>
                      {ev.liga}
                    </div>
                  </div>
                  <div style={{ padding: "12px" }}>
                    <div style={{ fontSize: 11, color: "#445566", marginBottom: 4 }}>📅 {ev.date}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", marginBottom: 8, lineHeight: 1.2 }}>{ev.home_team} vs {ev.away_team}</div>
                    <button style={{ width: "100%", background: "#e8ff00", color: "#070b0f", border: "none", borderRadius: 2, padding: "8px", fontWeight: 900, fontSize: 11, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1 }}>
                      Fotos finden →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <button style={{ background: "transparent", color: "#667788", border: "1px solid #1c2a38", borderRadius: 2, padding: "12px 32px", fontWeight: 700, fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
              onClick={() => router.push('/spiele')}>Alle Spiele anzeigen →</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #131e2a", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, background: "#e8ff00", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#070b0f", fontWeight: 900, fontSize: 11 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#445566" }}>
          <span style={{ cursor: "pointer" }} onClick={() => router.push('/impressum')}>Impressum</span>
          <span style={{ cursor: "pointer" }} onClick={() => router.push('/datenschutz')}>Datenschutz</span>
          <span style={{ cursor: "pointer" }} onClick={() => router.push('/kontakt')}>Kontakt</span>
        </div>
        <div style={{ color: "#1c2a38", fontSize: 12 }}>© 2026 90Focus - Luzern</div>
      </footer>
    </main>
  )
}