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
<div style={{ display: "flex", gap: 16 }}>
              <a href="https://www.instagram.com/90focus_official/" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.2" cy="6.8" r="0.9" fill="#fff" stroke="none"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/90focus" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                  <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.24-1.46 1.5-1.46h1.6V4.46C16.3 4.32 15.4 4.24 14.35 4.24c-2.4 0-4.05 1.46-4.05 4.15v2.31H7.8v3h2.5V21h3.2z"/>
                </svg>
              </a>
              <a href="mailto:info@sportshot.ch">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                  <rect x="3" y="5" width="18" height="14" rx="2"/>
                  <path d="M3 7l9 6 9-6"/>
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