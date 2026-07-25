'use client'

export default function AgbPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '60px auto 0', padding: '60px 24px' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Rechtliches</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, textTransform: 'uppercase', marginBottom: 40 }}>AGB</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>1. Geltungsbereich</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen und Käufe über die Plattform SportShot (www.sport-shot.ch). Mit der Nutzung der Plattform und dem Kauf von Fotos akzeptieren Sie diese AGB.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>2. Leistungsbeschreibung</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              SportShot bietet Sportfotografie-Dienstleistungen für Sportevents jeder Art an. Über die Plattform können Nutzer mittels Gesichtserkennung oder Startnummer Fotos von sich selbst finden und als digitale Datei kaufen.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>3. Vertragsabschluss</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Mit Abschluss des Bestellvorgangs und erfolgter Zahlung kommt ein verbindlicher Kaufvertrag zwischen dem Nutzer und SportShot zustande. Die Bezahlung erfolgt über den Zahlungsdienstleister Stripe.
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
              Mit dem Kauf erhält der Nutzer ein einfaches, nicht übertragbares Nutzungsrecht für private Zwecke. Eine kommerzielle Nutzung oder Weiterverbreitung der Fotos ist ohne ausdrückliche schriftliche Zustimmung von SportShot nicht gestattet.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>8. Haftung</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              SportShot haftet nicht für die Vollständigkeit der Gesichtserkennungssuche. Es kann nicht garantiert werden, dass alle Fotos eines Nutzers gefunden werden. Eine Haftung für indirekte Schäden ist ausgeschlossen, soweit gesetzlich zulässig.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>9. Anwendbares Recht</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Es gilt ausschliesslich Schweizer Recht. Gerichtsstand ist der Sitz von SportShot, soweit gesetzlich zulässig.
            </p>
          </div>

          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Kontakt</div>
            <p style={{ color: '#667788', lineHeight: 1.8, fontSize: 14 }}>
              Bei Fragen zu diesen AGB kontaktieren Sie uns unter: <span style={{ color: '#e8ff00' }}>info@sport-shot.ch</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}