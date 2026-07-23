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
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="#141414"/>
                  <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="1.6"/>
                  <circle cx="17" cy="7" r="1" fill="#fff"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/90focus" target="_blank" rel="noopener noreferrer">
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="#141414"/>
                  <path d="M14 8.5h-1.2c-.3 0-.6.3-.6.7v1h1.8l-.25 1.8h-1.55v4.5h-1.9v-4.5H9v-1.8h1.3V9c0-1.2.85-2.3 2.3-2.3H14v1.8z" fill="#fff"/>
                </svg>
              </a>
              <a href="mailto:info@sportshot.ch">
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="#141414"/>
                  <path d="M6 8.5l6 4 6-4" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="6" y="7.5" width="12" height="9" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.5"/>
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