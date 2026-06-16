'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AgbPage() {
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
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/')}>Home</button>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/spiele')}>Alle Spiele</button>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/login')}>Login</button>
          <button style={{ background: 'transparent', color: '#e8ff00', border: '1px solid #e8ff00', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/register')}>Sign Up</button>
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: '60px auto 0', padding: '60px 24px', flex: 1 }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Rechtliches</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, textTransform: 'uppercase', marginBottom: 40 }}>AGB</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>1. Geltungsbereich</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen und Käufe über die Plattform 90Focus (www.90focus.ch). Mit der Nutzung der Plattform und dem Kauf von Fotos akzeptieren Sie diese AGB.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>2. Leistungsbeschreibung</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              90Focus bietet Sportfotografie-Dienstleistungen an. Über die Plattform können Nutzer mittels Gesichtserkennung Fotos von sich selbst finden und als digitale Datei kaufen.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>3. Vertragsabschluss</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Mit Abschluss des Bestellvorgangs und erfolgter Zahlung kommt ein verbindlicher Kaufvertrag zwischen dem Nutzer und 90Focus zustande. Die Bezahlung erfolgt über den Zahlungsdienstleister Stripe.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>4. Preise und Zahlung</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Alle Preise sind in Schweizer Franken (CHF) angegeben. Der Kaufpreis ist sofort nach Bestellung fällig und wird über die hinterlegte Zahlungsmethode abgebucht.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>5. Lieferung digitaler Inhalte</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Nach erfolgreichem Zahlungseingang erhält der Nutzer sofortigen Zugriff auf die gekauften Fotos in digitaler Form ohne Wasserzeichen. Eine physische Lieferung erfolgt nicht.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>6. Widerrufsrecht</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Da es sich um digitale Inhalte handelt, die unmittelbar nach Kauf zum Download bereitgestellt werden, erlischt das Widerrufsrecht mit Beginn der Ausführung des Vertrags, sofern der Nutzer dem ausdrücklich zugestimmt hat.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>7. Nutzungsrechte</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Mit dem Kauf erhält der Nutzer ein einfaches, nicht übertragbares Nutzungsrecht für private Zwecke. Eine kommerzielle Nutzung oder Weiterverbreitung der Fotos ist ohne ausdrückliche schriftliche Zustimmung von 90Focus nicht gestattet.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>8. Haftung</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              90Focus haftet nicht für die Vollständigkeit der Gesichtserkennungssuche. Es kann nicht garantiert werden, dass alle Fotos eines Nutzers gefunden werden. Eine Haftung für indirekte Schäden ist ausgeschlossen, soweit gesetzlich zulässig.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>9. Anwendbares Recht</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Es gilt ausschliesslich Schweizer Recht. Gerichtsstand ist der Sitz von 90Focus, soweit gesetzlich zulässig.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Kontakt</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Bei Fragen zu diesen AGB kontaktieren Sie uns unter: <span style={{ color: '#e8ff00' }}>info@90focus.ch</span>
            </p>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid #1c2a38", padding: "40px 48px 32px", background: "#070b0f" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, background: "#e8ff00", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#070b0f", fontWeight: 900, fontSize: 14 }}>90</span>
                </div>
                <span style={{ color: "#e8eef4", fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
              </div>
              <p style={{ color: "#e8eef4", fontSize: 13, maxWidth: 260, lineHeight: 1.6 }}>
                Deine Momente für immer festgehalten.
              </p>
            </div>

            <div>
              <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={footerLink('home')} onMouseEnter={() => setHoveredFooter('home')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/')}>Home</span>
                <span style={footerLink('spiele')} onMouseEnter={() => setHoveredFooter('spiele')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/spiele')}>Alle Spiele</span>
                <span style={footerLink('faq')} onMouseEnter={() => setHoveredFooter('faq')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/faq')}>FAQ</span>
                <span style={footerLink('kontakt')} onMouseEnter={() => setHoveredFooter('kontakt')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/kontakt')}>Kontakt</span>
              </div>
            </div>

            <div>
              <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Rechtliches</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={footerLink('impressum')} onMouseEnter={() => setHoveredFooter('impressum')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/impressum')}>Impressum</span>
                <span style={footerLink('datenschutz')} onMouseEnter={() => setHoveredFooter('datenschutz')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/datenschutz')}>Datenschutz</span>
                <span style={footerLink('agb')} onMouseEnter={() => setHoveredFooter('agb')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/agb')}>AGB</span>
              </div>
            </div>

            <div>
              <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Social Media</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="https://www.instagram.com/90focus" target="_blank" rel="noopener noreferrer"
                  style={footerA('instagram') as any}
                  onMouseEnter={() => setHoveredFooter('instagram')} onMouseLeave={() => setHoveredFooter(null)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                  Instagram
                </a>
                <a href="https://www.facebook.com/90focus" target="_blank" rel="noopener noreferrer"
                  style={footerA('facebook') as any}
                  onMouseEnter={() => setHoveredFooter('facebook')} onMouseLeave={() => setHoveredFooter(null)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  Facebook
                </a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #1c2a38", paddingTop: 20 }}>
            <span style={{ color: "#e8eef4", fontSize: 13 }}>© 2026 90Focus</span>
          </div>
        </div>
      </footer>
    </div>
  )
}