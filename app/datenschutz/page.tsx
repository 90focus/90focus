'use client'

import { useRouter } from 'next/navigation'

export default function DatenschutzPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      {/* NAV */}
      <nav style={{ background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <button style={{ background: 'transparent', color: '#667788', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          onClick={() => router.back()}>← Zurück</button>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Rechtliches</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, textTransform: 'uppercase', marginBottom: 40 }}>Datenschutz</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Allgemein</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Wir verarbeiten Ihre Daten ausschliesslich auf Grundlage der gesetzlichen Bestimmungen des Schweizer Datenschutzgesetzes (DSG).
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Welche Daten wir sammeln</div>
            <ul style={{ color: '#667788', lineHeight: 2, fontSize: 14, paddingLeft: 20 }}>
              <li>Name und Email-Adresse bei der Registrierung</li>
              <li>Geburtsdatum</li>
              <li>Hochgeladene Selfies für die Gesichtserkennung</li>
              <li>Kaufhistorie</li>
            </ul>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Gesichtserkennung</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Wir nutzen AWS Rekognition zur Gesichtserkennung. Hochgeladene Selfies werden ausschliesslich zur Suche nach Ihren Fotos verwendet und nicht dauerhaft gespeichert. Die Verarbeitung erfolgt verschlüsselt und sicher.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Ihre Rechte</div>
            <ul style={{ color: '#667788', lineHeight: 2, fontSize: 14, paddingLeft: 20 }}>
              <li>Recht auf Auskunft über Ihre gespeicherten Daten</li>
              <li>Recht auf Berichtigung unrichtiger Daten</li>
              <li>Recht auf Löschung Ihrer Daten</li>
              <li>Recht auf Widerruf der Einwilligung</li>
            </ul>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Kontakt</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Bei Fragen zum Datenschutz kontaktieren Sie uns unter: <span style={{ color: '#e8ff00' }}>info@90focus.ch</span>
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #131e2a', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, background: '#e8ff00', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 11 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#445566' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/impressum')}>Impressum</span>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/datenschutz')}>Datenschutz</span>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/kontakt')}>Kontakt</span>
        </div>
        <div style={{ color: '#1c2a38', fontSize: 12 }}>© 2026 90Focus - Luzern</div>
      </footer>
    </div>
  )
}