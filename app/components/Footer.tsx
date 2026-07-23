'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Footer() {
  const [hoveredFooter, setHoveredFooter] = useState<string | null>(null)
  const router = useRouter()

  const footerLink = (key: string) => ({
    color: hoveredFooter === key ? '#e8ff00' : '#e8eef4',
    fontSize: 14, cursor: 'pointer',
    transition: 'color 0.15s ease'
  })

  return (
    <footer style={{ borderTop: "1px solid #1c2a38", padding: "40px 48px 32px", background: "#070b0f" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1, fontStyle: "italic" }}>
                <span style={{ color: "#e8eef4" }}>SPORT</span><span style={{ color: "#e8ff00" }}>SHOT</span>
              </span>
            </div>
            <p style={{ color: "#e8eef4", fontSize: 13, maxWidth: 260, lineHeight: 1.6 }}>
              Deine Momente für immer festgehalten.
            </p>
          </div>

          <div>
            <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Links</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={footerLink('home')} onMouseEnter={() => setHoveredFooter('home')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/')}>Home</span>
              <span style={footerLink('spiele')} onMouseEnter={() => setHoveredFooter('spiele')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/spiele')}>Alle Events</span>
              <span style={footerLink('faq')} onMouseEnter={() => setHoveredFooter('faq')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/faq')}>FAQ</span>
              <span style={footerLink('kontakt')} onMouseEnter={() => setHoveredFooter('kontakt')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/kontakt')}>Kontakt</span>
            </div>
          </div>

          <div>
            <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Rechtliches</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={footerLink('impressum')} onMouseEnter={() => setHoveredFooter('impressum')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/impressum')}>Impressum</span>
              <span style={footerLink('datenschutz')} onMouseEnter={() => setHoveredFooter('datenschutz')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/datenschutz')}>Datenschutz</span>
            </div>
          </div>

          <div>
            <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Social Media</div>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="https://www.instagram.com/90focus_official/" target="_blank" rel="noopener noreferrer">
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="igGradFooter" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#feda75"/>
                      <stop offset="25%" stopColor="#fa7e1e"/>
                      <stop offset="50%" stopColor="#d62976"/>
                      <stop offset="75%" stopColor="#962fbf"/>
                      <stop offset="100%" stopColor="#4f5bd5"/>
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#igGradFooter)"/>
                  <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="1.8"/>
                  <circle cx="17.3" cy="6.7" r="1.2" fill="#fff"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/90focus" target="_blank" rel="noopener noreferrer">
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="11" fill="#1877F2"/>
                  <path d="M15.5 8.5h-1.7c-.4 0-.8.4-.8.9v1.4h2.4l-.3 2.4h-2.1v6h-2.5v-6H8.5v-2.4h1.9V9.1c0-1.6 1.1-3 3-3h2.1v2.4z" fill="#fff"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1c2a38", paddingTop: 20 }}>
          <span style={{ color: "#e8eef4", fontSize: 13 }}>© 2026 SportShot</span>
        </div>
      </div>
    </footer>
  )
}