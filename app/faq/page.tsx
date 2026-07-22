'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const faqs = [
  { frage: 'Wie finde ich meine Fotos?', antwort: 'Geh auf das Event, lade ein Selfie hoch und unsere KI findet dich automatisch auf allen Fotos.' },
  { frage: 'Was kostet ein Foto?', antwort: 'CHF 4.90 pro Foto. Du kaufst nur die Fotos auf denen du drauf bist.' },
  { frage: 'Wie bezahle ich?', antwort: 'Per Kreditkarte via Stripe. Sicher und einfach.' },
  { frage: 'Wann sind die Fotos verfügbar?', antwort: 'In der Regel innerhalb von 24 Stunden nach dem Event.' },
  { frage: 'Bekomme ich die Fotos ohne Wasserzeichen?', antwort: 'Ja, nach dem Kauf erhältst du sofort die Originalfotos ohne Wasserzeichen.' },
  { frage: 'Welche Bildqualität haben die Fotos?', antwort: 'Alle Fotos sind in professioneller Qualität und eignen sich zum Drucken.' },
  { frage: 'Was ist wenn ich mich nicht finde?', antwort: 'Wenn die Suche keine Ergebnisse zeigt, kontaktiere uns über das Kontaktformular.' },
  { frage: 'Muss ich ein Konto erstellen?', antwort: 'Du kannst Fotos suchen ohne Konto. Für den Kauf brauchst du ein kostenloses Konto.' },
  { frage: 'Welche Events werden fotografiert?', antwort: 'Wir fotografieren Sportevents jeder Art, vom Breitensport bis zu grossen Wettkämpfen.' },
  { frage: 'Kann ich Fotos zurückgeben?', antwort: 'Da es sich um digitale Produkte handelt, ist eine Rückgabe nach dem Download nicht möglich.' },
]

export default function FaqPage() {
  const [offen, setOffen] = useState<number | null>(null)
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 720, margin: '60px auto 0', padding: '60px 24px', flex: 1 }}>
        <div style={{ color: '#e8ff00', fontSize: 14, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>FAQ</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: -2, marginBottom: 48 }}>Häufige Fragen</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: '#0d1219', border: offen === i ? '1px solid #e8ff00' : '1px solid #1c2a38', borderRadius: 8, overflow: 'hidden', transition: 'border 0.2s ease' }}>
              <div onClick={() => setOffen(offen === i ? null : i)}
                style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{faq.frage}</span>
                <span style={{ color: '#e8ff00', fontSize: 20, fontWeight: 900, flexShrink: 0, transition: 'transform 0.2s ease', transform: offen === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
              </div>
              {offen === i && (
                <div style={{ padding: '0 24px 20px', color: '#8899aa', fontSize: 14, lineHeight: 1.7 }}>
                  {faq.antwort}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: '24px', background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, textAlign: 'center' }}>
          <p style={{ color: '#e8eef4', fontSize: 15, marginBottom: 16 }}>Noch eine Frage? Wir helfen gerne!</p>
          <button onClick={() => router.push('/kontakt')}
            style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '12px 28px', fontWeight: 900, fontSize: 13, cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Kontakt aufnehmen
          </button>
        </div>
      </div>
    </div>
  )
}