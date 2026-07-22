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

  const footerA = (key: string) => ({
    color: hoveredFooter === key ? '#e8ff00' : '#e8eef4',
    fontSize: 14, textDecoration: 'none',
    display: 'flex', alignItems: 'center', gap: 8,
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
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="https://www.instagram.com/90focus_official/" target="_blank" rel="noopener noreferrer"
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

        <div style={{ borderTop: "1px solid #1c2a38", paddingTop: 20 }}>
          <span style={{ color: "#e8eef4", fontSize: 13 }}>© 2026 SportShot</span>
        </div>
      </div>
    </footer>
  )
}