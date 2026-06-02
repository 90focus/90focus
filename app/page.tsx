'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [events, setEvents] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*').order('date', { ascending: false }).limit(6)
      if (data) setEvents(data)
    }
    fetchEvents()
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <main style={{ minHeight: "100vh", background: "#070b0f", color: "#e8eef4", fontFamily: "sans-serif", padding: "0" }}>
      {/* NAV */}
      <nav style={{ background: "rgba(7,11,15,0.97)", borderBottom: "1px solid #131e2a", height: 60, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => router.push('/')}>
          <div style={{ width: 34, height: 34, background: "#e8ff00", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#070b0f", fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
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

      {/* HERO */}
      <section style={{ padding: "80px 32px 60px" }}>
        <div style={{ color: "#e8ff00", fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>
          Luzern · Amateurliga · Saison 2025/26
        </div>
        <h1 style={{ fontSize: "clamp(48px, 10vw, 110px)", fontWeight: 900, lineHeight: 0.9, letterSpacing: -3, textTransform: "uppercase", marginBottom: 24 }}>
          DEIN SPIEL.<br />
          <span style={{ color: "#e8ff00" }}>DEINE BILDER.</span>
        </h1>
        <p style={{ color: "#667788", fontSize: 17, maxWidth: 440, lineHeight: 1.7, marginBottom: 36 }}>
          Professionelle Spielfotos für die Amateurliga. Gesichtserkennung findet automatisch alle Bilder von dir.
        </p>
        <button style={{ background: "#e8ff00", color: "#070b0f", border: "none", borderRadius: 2, padding: "15px 36px", fontWeight: 900, fontSize: 16, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}
          onClick={() => user ? router.push('/kunden-dashboard') : router.push('/suche')}>
          {user ? 'Fotos verwalten →' : 'Meine Fotos finden →'}
        </button>
      </section>

      {/* WIE ES FUNKTIONIERT */}
      <section style={{ padding: "60px 32px", borderTop: "1px solid #131e2a" }}>
        <div style={{ color: "#e8ff00", fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>So einfach</div>
        <h2 style={{ fontSize: 40, fontWeight: 900, textTransform: "uppercase", letterSpacing: -1, marginBottom: 40 }}>Wie es funktioniert</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            { n: "01", title: "Spiel auswählen", desc: "Wähle das Spiel bei dem du dabei warst aus der Liste." },
            { n: "02", title: "Selfie hochladen", desc: "Lade ein Selfie hoch – unsere KI findet automatisch alle Bilder von dir." },
            { n: "03", title: "Fotos kaufen", desc: "Kaufe deine Fotos und lade sie ohne Wasserzeichen herunter." },
          ].map((step) => (
            <div key={step.n} style={{ background: "#0d1219", border: "1px solid #1c2a38", borderRadius: 8, padding: "32px 24px" }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: "#e8ff00", marginBottom: 16, letterSpacing: -2 }}>{step.n}</div>
              <div style={{ fontSize: 18, fontWeight: 800, textTransform: "uppercase", marginBottom: 12 }}>{step.title}</div>
              <div style={{ color: "#445566", fontSize: 14, lineHeight: 1.7 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* EVENTS */}
      <section style={{ padding: "60px 32px", borderTop: "1px solid #131e2a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <div style={{ color: "#e8ff00", fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Neueste Events</div>
            <h2 style={{ fontSize: 40, fontWeight: 900, textTransform: "uppercase", letterSpacing: -1, margin: 0 }}>Events</h2>
          </div>
          <button style={{ background: "transparent", color: "#e8ff00", border: "1px solid #e8ff00", borderRadius: 2, padding: "10px 20px", fontWeight: 800, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
            onClick={() => router.push('/spiele')}>Alle Spiele →</button>
        </div>

        {events.length === 0 ? (
          <div style={{ color: "#445566", fontSize: 16, padding: "40px 0" }}>Noch keine Events. 🎯</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {events.map((ev) => (
              <div key={ev.id} style={{ background: "#0d1219", border: "1px solid #1c2a38", borderRadius: 8, overflow: "hidden", cursor: "pointer" }}
                onClick={() => user ? router.push('/kunden-dashboard') : router.push(`/suche?eventId=${ev.id}`)}>
                <div style={{ height: 180, background: "#131e2a", position: "relative", overflow: "hidden" }}>
                  {ev.bild_url ? (
                    <img src={ev.bild_url} alt={`${ev.home_team} vs ${ev.away_team}`}
                      style={{ width: "100%", height: "100%", objectFit: "contain", background: "#131e2a" }} />
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
                  <div style={{ color: "#445566", fontSize: 12, marginBottom: 12 }}>📅 {ev.date} {ev.ort && `· 📍 ${ev.ort}`}</div>
                  {ev.sponsor_name && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, background: "#131e2a", padding: "4px 8px", borderRadius: 4, width: "fit-content" }}>
                      {ev.sponsor_logo_url && <img src={ev.sponsor_logo_url} alt={ev.sponsor_name} style={{ height: "16px", objectFit: "contain" }} />}
                      <span style={{ fontSize: 11, color: "#e8eef4", fontWeight: 700 }}>⭐ {ev.sponsor_name}</span>
                    </div>
                  )}
                  <button style={{ width: "100%", background: "#e8ff00", color: "#070b0f", border: "none", borderRadius: 2, padding: "10px", fontWeight: 900, fontSize: 12, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1 }}>
                    {user ? 'Fotos verwalten →' : 'Fotos finden →'}
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
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #131e2a", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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