'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function Home() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*')
      if (data) setEvents(data)
    }
    fetchEvents()
  }, [])

  return (
    <main style={{
      minHeight: "100vh",
      background: "#070b0f",
      color: "#e8eef4",
      fontFamily: "sans-serif",
      padding: "0",
    }}>
      {/* NAV */}
      <nav style={{
        background: "rgba(7,11,15,0.97)",
        borderBottom: "1px solid #131e2a",
        height: 60, padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "#e8ff00", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#070b0f", fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <button style={{
          background: "#e8ff00", color: "#070b0f", border: "none",
          borderRadius: 2, padding: "8px 18px", fontWeight: 900,
          fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
        }}>Meine Fotos →</button>
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
        <button style={{
          background: "#e8ff00", color: "#070b0f", border: "none",
          borderRadius: 2, padding: "15px 36px", fontWeight: 900,
          fontSize: 16, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
        }}>Meine Fotos finden →</button>
      </section>

      {/* EVENTS */}
      <section style={{ padding: "60px 32px", borderTop: "1px solid #131e2a" }}>
        <div style={{ color: "#e8ff00", fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Aktuelle Spiele</div>
        <h2 style={{ fontSize: 40, fontWeight: 900, textTransform: "uppercase", letterSpacing: -1, marginBottom: 32 }}>Events</h2>

        {events.length === 0 ? (
          <div style={{ color: "#445566", fontSize: 16, padding: "40px 0" }}>
            Noch keine Events verfügbar. Bald kommen die ersten Spiele! ⚽
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {events.map((ev) => (
              <div key={ev.id} style={{
                background: "#0d1219", border: "1px solid #1c2a38",
                borderRadius: 4, padding: "20px 24px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 10, color: "#e8ff00", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{ev.liga}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, textTransform: "uppercase" }}>{ev.home_team} vs {ev.away_team}</div>
                  <div style={{ color: "#445566", fontSize: 13, marginTop: 4 }}>📍 {ev.ort} · {ev.date}</div>
                </div>
                <button style={{
                  background: "#e8ff00", color: "#070b0f", border: "none",
                  borderRadius: 2, padding: "10px 20px", fontWeight: 900,
                  fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                }}>Fotos finden →</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #131e2a", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, background: "#e8ff00", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#070b0f", fontWeight: 900, fontSize: 11 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ color: "#1c2a38", fontSize: 12 }}>© 2026 90focus · Luzern</div>
      </footer>
    </main>
  )
}