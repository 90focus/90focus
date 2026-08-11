'use client'

import { useLanguage } from '../context/LanguageContext'

export default function DatenschutzPage() {
  const { lang } = useLanguage()

  const content = lang === 'de' ? {
    label: 'Rechtliches',
    title: 'Datenschutz',
    generalLabel: 'Allgemein',
    generalText: 'Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Wir verarbeiten Ihre Daten ausschliesslich auf Grundlage der gesetzlichen Bestimmungen des Schweizer Datenschutzgesetzes (DSG).',
    dataLabel: 'Welche Daten wir sammeln',
    dataItems: ['Name und Email-Adresse bei der Registrierung', 'Geburtsdatum', 'Hochgeladene Selfies für die Gesichtserkennung', 'Kaufhistorie'],
    faceLabel: 'Gesichtserkennung',
faceText: 'Wir nutzen eine Gesichtserkennungstechnologie, um Ihre Fotos zu finden. Hochgeladene Bilder werden ausschliesslich zur Suche nach Ihren Fotos verwendet und nicht dauerhaft gespeichert. Die Verarbeitung erfolgt verschlüsselt und sicher.',
    rightsLabel: 'Ihre Rechte',
    rightsItems: ['Recht auf Auskunft über Ihre gespeicherten Daten', 'Recht auf Berichtigung unrichtiger Daten', 'Recht auf Löschung Ihrer Daten', 'Recht auf Widerruf der Einwilligung'],
    contactLabel: 'Kontakt',
    contactText: 'Bei Fragen zum Datenschutz kontaktieren Sie uns unter:'
  } : {
    label: 'Legal',
    title: 'Privacy Policy',
    generalLabel: 'General',
    generalText: 'Protecting your personal data is important to us. We process your data exclusively based on the legal provisions of the Swiss Data Protection Act (DPA).',
    dataLabel: 'What Data We Collect',
    dataItems: ['Name and email address upon registration', 'Date of birth', 'Uploaded selfies for facial recognition', 'Purchase history'],
    faceLabel: 'Facial Recognition',
faceText: 'We use facial recognition technology to find your photos. Uploaded images are used exclusively to search for your photos and are not permanently stored. Processing is encrypted and secure.',
    rightsLabel: 'Your Rights',
    rightsItems: ['Right to access your stored data', 'Right to correct inaccurate data', 'Right to erasure of your data', 'Right to withdraw consent'],
    contactLabel: 'Contact',
    contactText: 'For questions about privacy, please contact us at:'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '60px auto 0', padding: '60px 24px' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{content.label}</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, textTransform: 'uppercase', marginBottom: 40 }}>{content.title}</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{content.generalLabel}</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>{content.generalText}</p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{content.dataLabel}</div>
            <ul style={{ color: '#667788', lineHeight: 2, fontSize: 14, paddingLeft: 20 }}>
              {content.dataItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{content.faceLabel}</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>{content.faceText}</p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{content.rightsLabel}</div>
            <ul style={{ color: '#667788', lineHeight: 2, fontSize: 14, paddingLeft: 20 }}>
              {content.rightsItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{content.contactLabel}</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              {content.contactText} <span style={{ color: '#e8ff00' }}>info@sport-shot.ch</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}