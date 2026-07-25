'use client'

export default function DatenschutzPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '60px auto 0', padding: '60px 24px' }}>
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
              Bei Fragen zum Datenschutz kontaktieren Sie uns unter: <span style={{ color: '#e8ff00' }}>info@sport-shot.ch</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}