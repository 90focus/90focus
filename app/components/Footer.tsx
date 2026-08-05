'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../context/LanguageContext'

export default function Footer() {
const [hoveredFooter, setHoveredFooter] = useState<string | null>(null)
  const router = useRouter()
  const { lang } = useLanguage()

  const footerLink = (key: string) => ({
    color: hoveredFooter === key ? '#e8ff00' : '#e8eef4',
    fontSize: 14, cursor: 'pointer',
    transition: 'color 0.15s ease'
  })

  return (
    <footer style={{ borderTop: "1px solid #1c2a38", padding: "40px 24px 32px", background: "#070b0f" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="footer-columns" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: 'wrap', gap: 32 }}>

          <div className="footer-col">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1, fontStyle: "italic" }}>
                <span style={{ color: "#e8eef4" }}>SPORT</span><span style={{ color: "#e8ff00" }}>SHOT</span>
              </span>
            </div>
<p style={{ color: "#e8eef4", fontSize: 13, maxWidth: 260, lineHeight: 1.6 }}>
              {lang === 'de' ? 'Deine Momente für immer festgehalten.' : 'Your moments, captured forever.'}
            </p>
          </div>

          <div className="footer-col">
<div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>{lang === 'de' ? 'Links' : 'Links'}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={footerLink('home')} onMouseEnter={() => setHoveredFooter('home')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/')}>Home</span>
              <span style={footerLink('spiele')} onMouseEnter={() => setHoveredFooter('spiele')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/spiele')}>{lang === 'de' ? 'Alle Events' : 'All Events'}</span>
              <span style={footerLink('faq')} onMouseEnter={() => setHoveredFooter('faq')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/faq')}>FAQ</span>
              <span style={footerLink('kontakt')} onMouseEnter={() => setHoveredFooter('kontakt')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/kontakt')}>{lang === 'de' ? 'Kontakt' : 'Contact'}</span>
            </div>
          </div>

          <div className="footer-col">
<div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>{lang === 'de' ? 'Rechtliches' : 'Legal'}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
<span style={footerLink('impressum')} onMouseEnter={() => setHoveredFooter('impressum')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/impressum')}>{lang === 'de' ? 'Impressum' : 'Imprint'}</span>
              <span style={footerLink('agb')} onMouseEnter={() => setHoveredFooter('agb')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/agb')}>{lang === 'de' ? 'AGB' : 'Terms'}</span>
              <span style={footerLink('datenschutz')} onMouseEnter={() => setHoveredFooter('datenschutz')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/datenschutz')}>{lang === 'de' ? 'Datenschutz' : 'Privacy'}</span>
            </div>
          </div>

          <div className="footer-col">
            <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Social Media</div>
            <div style={{ display: "flex", gap: 16 }}>
<a href="https://www.instagram.com/sportshot.official/" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.2" cy="6.8" r="0.9" fill="#fff" stroke="none"/>
                </svg>
              </a>
              <a href="mailto:info@sport-shot.ch">
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