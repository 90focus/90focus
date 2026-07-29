'use client'

export default function DatenschutzEmbedPage() {
  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>Datenschutz</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Allgemein</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Wir verarbeiten Ihre Daten ausschliesslich auf Grundlage der gesetzlichen Bestimmungen des Schweizer Datenschutzgesetzes (DSG).
            </p>
          </div>

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Welche Daten wir sammeln</div>
            <ul style={{ color: '#667788', lineHeight: 1.9, fontSize: 14, paddingLeft: 20 }}>
              <li>Name und Email-Adresse bei der Registrierung</li>
              <li>Geburtsdatum</li>
              <li>Hochgeladene Selfies für die Gesichtserkennung</li>
              <li>Kaufhistorie</li>
            </ul>
          </div>

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Gesichtserkennung</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              Wir nutzen AWS Rekognition zur Gesichtserkennung. Hochgeladene Selfies werden ausschliesslich zur Suche nach Ihren Fotos verwendet und nicht dauerhaft gespeichert. Die Verarbeitung erfolgt verschlüsselt und sicher.
            </p>
          </div>

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Ihre Rechte</div>
            <ul style={{ color: '#667788', lineHeight: 1.9, fontSize: 14, paddingLeft: 20 }}>
              <li>Recht auf Auskunft über Ihre gespeicherten Daten</li>
              <li>Recht auf Berichtigung unrichtiger Daten</li>
              <li>Recht auf Löschung Ihrer Daten</li>
              <li>Recht auf Widerruf der Einwilligung</li>
            </ul>
          </div>

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Kontakt</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              Bei Fragen zum Datenschutz kontaktieren Sie uns unter: <span style={{ color: '#e8ff00' }}>info@sport-shot.ch</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}