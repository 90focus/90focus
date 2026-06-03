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
      <nav style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, background: "rgba(7,11,15,0.7)", borderBottom: "1px solid rgba(255,255,255,0.05)", height: 56, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => router.push('/')}>
          <div style={{ width: 30, height: 30, background: "#e8ff00", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#070b0f", fontWeight: 900, fontSize: 13 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: "transparent", color: "#e8ff00", border: "1px solid #e8ff00", borderRadius: 2, padding: "6px 14px", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
            onClick={() => router.push('/')}>Home</button>
          <button style={{ background: "transparent", color: "#e8eef4", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, padding: "6px 14px", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
            onClick={() => router.push('/spiele')}>Alle Spiele</button>
          {user ? (
            <>
              <button style={{ background: "transparent", color: "#e8eef4", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, padding: "6px 14px", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => router.push('/kunden-dashboard')}>Meine Fotos</button>
              <button style={{ background: "transparent", color: "#e8eef4", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, padding: "6px 14px", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => router.push('/kunden-profil')}>Profil</button>
              <button style={{ background: "transparent", color: "#ff4444", border: "1px solid #ff4444", borderRadius: 2, padding: "6px 14px", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={handleLogout}>Abmelden</button>
            </>
          ) : (
            <>
              <button style={{ background: "transparent", color: "#e8eef4", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, padding: "6px 14px", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => router.push('/login')}>Login</button>
              <button style={{ background: "transparent", color: "#e8ff00", border: "1px solid #e8ff00", borderRadius: 2, padding: "6px 14px", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => router.push('/register')}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO MIT SLIDESHOW - kompakter */}
      <section style={{ position: "relative", height: "320px", overflow: "hidden" }}>
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

        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 32px", paddingTop: 56 }}>
          <div style={{ color: "#e8ff00", fontSize: 10, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
            Luzern · Amateurliga · Saison 2025/26
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, lineHeight: 1, letterSpacing: -2, textTransform: "uppercase", marginBottom: 14 }}>
            DEIN SPIEL.<br />
            <span style={{ color: "#e8ff00" }}>DEINE BILDER.</span>
          </h1>
          <p style={{ color: "#aabbcc", fontSize: 14, maxWidth: 380, lineHeight: 1.6, marginBottom: 20 }}>
            Professionelle Spielfotos für die Amateurliga. Gesichtserkennung findet automatisch alle Bilder von dir.
          </p>
          <div>
            <button style={{ background: "#e8ff00", color: "#070b0f", border: "none", borderRadius: 2, padding: "11px 28px", fontWeight: 900, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}
              onClick={() => user ? router.push('/kunden-dashboard') : router.push('/suche')}>
              {user ? 'Fotos verwalten →' : 'Meine Fotos finden →'}
            </button>
          </div>
        </div>

        {heroBilder.length > 1 && (
          <div style={{ position: "absolute", bottom: 12, left: 32, zIndex: 3, display: "flex", gap: 6 }}>
            {heroBilder.map((_, i) => (
              <div key={i} onClick={() => setSlideIndex(i)} style={{
                width: i === slideIndex ? 20 : 6, height: 6,
                background: i === slideIndex ? "#e8ff00" : "rgba(255,255,255,0.3)",
                borderRadius: 3, cursor: "pointer",
                transition: "all 0.3s ease"
              }} />
            ))}
          </div>
        )}
      </section>

      {/* WIE ES FUNKTIONIERT - kompakter */}
      <section style={{ padding: "28px 32px", background: "#0a0e14", borderTop: "1px solid #1c2a38" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { n: "01", title: "Spiel auswählen", desc: "Wähle das Spiel bei dem du dabei warst." },
              { n: "02", title: "Selfie hochladen", desc: "Unsere KI findet automatisch alle Bilder von dir." },
              { n: "03", title: "Fotos kaufen", desc: "Kaufe und lade sie ohne Wasserzeichen herunter." },
            ].map((step) => (
              <div key={step.n} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px", background: "#0d1219", border: "1px solid #1c2a38", borderRadius: 6 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#e8ff00", letterSpacing: -1, flexShrink: 0 }}>{step.n}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>{step.title}</div>
                  <div style={{ color: "#445566", fontSize: 12, lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section style={{ padding: "28px 32px", borderTop: "1px solid #131e2a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ color: "#e8ff00", fontSize: 10, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>Neueste Events</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: -1, margin: 0 }}>Events</h2>
            </div>
            <button style={{ background: "transparent", color: "#e8ff00", border: "1px solid #e8ff00", borderRadius: 2, padding: "6px 14px", fontWeight: 800, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
              onClick={() => router.push('/spiele')}>Alle Spiele →</button>
          </div>

          {events.length === 0 ? (
            <div style={{ color: "#445566", fontSize: 14, padding: "20px 0" }}>Noch keine Events. 🎯</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {events.map((ev) => (
                <div key={ev.id} style={{ background: "#0d1219", border: "1px solid #1c2a38", borderRadius: 6, overflow: "hidden", cursor: "pointer" }}
                  onClick={() => user ? router.push('/kunden-dashboard') : router.push(`/suche?eventId=${ev.id}`)}>
                  <div style={{ width: "100%", paddingBottom: "75%", position: "relative", background: "#131e2a" }}>
                    {ev.bild_url ? (
                      <img src={ev.bild_url} alt={`${ev.home_team} vs ${ev.away_team}`}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 32 }}>⚽</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", top: 6, left: 6, background: "#e8ff00", color: "#070b0f", fontSize: 8, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", padding: "2px 5px", borderRadius: 2 }}>
                      {ev.liga}
                    </div>
                  </div>
                  <div style={{ padding: "10px" }}>
                    <div style={{ fontSize: 10, color: "#445566", marginBottom: 3 }}>📅 {ev.date}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", marginBottom: 8, lineHeight: 1.2 }}>{ev.home_team} vs {ev.away_team}</div>
                    <button style={{ width: "100%", background: "#e8ff00", color: "#070b0f", border: "none", borderRadius: 2, padding: "7px", fontWeight: 900, fontSize: 10, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1 }}>
                      Fotos finden →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button style={{ background: "transparent", color: "#667788", border: "1px solid #1c2a38", borderRadius: 2, padding: "10px 28px", fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
              onClick={() => router.push('/spiele')}>Alle Spiele anzeigen →</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #131e2a", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 24, height: 24, background: "#e8ff00", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#070b0f", fontWeight: 900, fontSize: 10 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 12, color: "#445566" }}>
          <span style={{ cursor: "pointer" }} onClick={() => router.push('/impressum')}>Impressum</span>
          <span style={{ cursor: "pointer" }} onClick={() => router.push('/datenschutz')}>Datenschutz</span>
          <span style={{ cursor: "pointer" }} onClick={() => router.push('/kontakt')}>Kontakt</span>
        </div>
        <div style={{ color: "#1c2a38", fontSize: 11 }}>© 2026 90Focus - Luzern</div>
      </footer>
    </main>
  )
}