'use client'

export default function AgbEmbedPage() {
  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32, whiteSpace: 'nowrap' }}>Allgemeine Geschäftsbedingungen</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>1. Geltungsbereich</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen und Käufe über die Plattform SportShot (www.sport-shot.ch). Mit der Nutzung der Plattform und dem Kauf von Fotos akzeptieren Sie diese AGB.
            </p>
          </div>

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>2. Leistungsbeschreibung</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              SportShot bietet Sportfotografie-Dienstleistungen für Sportevents jeder Art an. Über die Plattform können Nutzer mittels Gesichtserkennung oder Startnummer Fotos von sich selbst finden und als digitale Datei kaufen.
            </p>
          </div>

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>3. Vertragsabschluss</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              Mit Abschluss des Bestellvorgangs und erfolgter Zahlung kommt ein verbindlicher Kaufvertrag zwischen dem Nutzer und SportShot zustande. Die Bezahlung erfolgt über den Zahlungsdienstleister Stripe.
            </p>
          </div>

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>4. Preise und Zahlung</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              Alle Preise sind in Schweizer Franken (CHF) angegeben. Der Kaufpreis ist sofort nach Bestellung fällig und wird über die hinterlegte Zahlungsmethode abgebucht.
            </p>
          </div>

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>5. Lieferung digitaler Inhalte</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              Nach erfolgreichem Zahlungseingang erhält der Nutzer sofortigen Zugriff auf die gekauften Fotos in digitaler Form ohne Wasserzeichen. Eine physische Lieferung erfolgt nicht.
            </p>
          </div>

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>6. Widerrufsrecht</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              Da es sich um digitale Inhalte handelt, die unmittelbar nach Kauf zum Download bereitgestellt werden, erlischt das Widerrufsrecht mit Beginn der Ausführung des Vertrags, sofern der Nutzer dem ausdrücklich zugestimmt hat.
            </p>
          </div>

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>7. Nutzungsrechte</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              Mit dem Kauf erhält der Nutzer ein einfaches, nicht übertragbares Nutzungsrecht für private Zwecke. Eine kommerzielle Nutzung oder Weiterverbreitung der Fotos ist ohne ausdrückliche schriftliche Zustimmung von SportShot nicht gestattet.
            </p>
          </div>

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>8. Haftung</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              SportShot haftet nicht für die Vollständigkeit der Gesichtserkennungssuche. Es kann nicht garantiert werden, dass alle Fotos eines Nutzers gefunden werden. Eine Haftung für indirekte Schäden ist ausgeschlossen, soweit gesetzlich zulässig.
            </p>
          </div>

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>9. Anwendbares Recht</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              Es gilt ausschliesslich Schweizer Recht. Gerichtsstand ist der Sitz von SportShot, soweit gesetzlich zulässig.
            </p>
          </div>

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Kontakt</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              Bei Fragen zu diesen AGB kontaktieren Sie uns unter: <span style={{ color: '#e8ff00' }}>info@sport-shot.ch</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}