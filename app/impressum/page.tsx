'use client'

import { useLanguage } from '../context/LanguageContext'

export default function ImpressumPage() {
  const { lang } = useLanguage()

  const content = lang === 'de' ? {
    label: 'Rechtliches',
    title: 'Impressum',
    companyLabel: 'Unternehmen',
    disclaimerLabel: 'Haftungsausschluss',
    disclaimerText: 'Die Inhalte dieser Website wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.',
    copyrightLabel: 'Urheberrecht',
    copyrightText: 'Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung ausserhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.',
  } : {
    label: 'Legal',
    title: 'Imprint',
    companyLabel: 'Company',
    disclaimerLabel: 'Disclaimer',
    disclaimerText: 'The content of this website has been created with the greatest care. However, we cannot guarantee the accuracy, completeness, or timeliness of the content.',
    copyrightLabel: 'Copyright',
    copyrightText: 'The content and works created by the site operators on these pages are subject to copyright law. Reproduction, editing, distribution, and any form of use outside the limits of copyright law require the written consent of the respective author or creator.',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '60px auto 0', padding: '60px 24px' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{content.label}</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, textTransform: 'uppercase', marginBottom: 40 }}>{content.title}</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{content.companyLabel}</div>
            <div style={{ color: '#667788', lineHeight: 1.8 }}>
              <div style={{ color: '#e8eef4', fontWeight: 700, marginBottom: 8 }}>SportShot (Brzovic Business)</div>
              <div>Langensandstrasse 73</div>
              <div>6005 Luzern, {lang === 'de' ? 'Schweiz' : 'Switzerland'}</div>
              <div>info@sport-shot.ch</div>
              <div>www.sport-shot.ch</div>
            </div>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{content.disclaimerLabel}</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>{content.disclaimerText}</p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>{content.copyrightLabel}</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>{content.copyrightText}</p>
          </div>
        </div>
      </div>
    </div>
  )
}