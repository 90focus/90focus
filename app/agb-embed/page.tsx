'use client'

import { useLanguage } from '../context/LanguageContext'

export default function AgbEmbedPage() {
  const { lang } = useLanguage()

  const content = lang === 'de' ? {
    title: 'Allgemeine Geschäftsbedingungen',
    sections: [
      { h: '1. Geltungsbereich', p: 'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen und Käufe über die Plattform SportShot (www.sport-shot.ch). Mit der Nutzung der Plattform und dem Kauf von Fotos akzeptieren Sie diese AGB.' },
      { h: '2. Leistungsbeschreibung', p: 'SportShot bietet Sportfotografie-Dienstleistungen für Sportevents jeder Art an. Über die Plattform können Nutzer mittels Gesichtserkennung oder Startnummer Fotos von sich selbst finden und als digitale Datei kaufen.' },
      { h: '3. Vertragsabschluss', p: 'Mit Abschluss des Bestellvorgangs und erfolgter Zahlung kommt ein verbindlicher Kaufvertrag zwischen dem Nutzer und SportShot zustande. Die Bezahlung erfolgt über den Zahlungsdienstleister Stripe.' },
      { h: '4. Preise und Zahlung', p: 'Alle Preise sind in Schweizer Franken (CHF) angegeben. Der Kaufpreis ist sofort nach Bestellung fällig und wird über die hinterlegte Zahlungsmethode abgebucht.' },
      { h: '5. Lieferung digitaler Inhalte', p: 'Nach erfolgreichem Zahlungseingang erhält der Nutzer sofortigen Zugriff auf die gekauften Fotos in digitaler Form ohne Wasserzeichen. Eine physische Lieferung erfolgt nicht.' },
      { h: '6. Widerrufsrecht', p: 'Da es sich um digitale Inhalte handelt, die unmittelbar nach Kauf zum Download bereitgestellt werden, erlischt das Widerrufsrecht mit Beginn der Ausführung des Vertrags, sofern der Nutzer dem ausdrücklich zugestimmt hat.' },
      { h: '7. Nutzungsrechte', p: 'Mit dem Kauf erhält der Nutzer ein einfaches, nicht übertragbares Nutzungsrecht für private Zwecke. Eine kommerzielle Nutzung oder Weiterverbreitung der Fotos ist ohne ausdrückliche schriftliche Zustimmung von SportShot nicht gestattet.' },
      { h: '8. Haftung', p: 'SportShot haftet nicht für die Vollständigkeit der Gesichtserkennungssuche. Es kann nicht garantiert werden, dass alle Fotos eines Nutzers gefunden werden. Eine Haftung für indirekte Schäden ist ausgeschlossen, soweit gesetzlich zulässig.' },
      { h: '9. Anwendbares Recht', p: 'Es gilt ausschliesslich Schweizer Recht. Gerichtsstand ist der Sitz von SportShot, soweit gesetzlich zulässig.' },
    ],
    contactLabel: 'Kontakt',
    contactText: 'Bei Fragen zu diesen AGB kontaktieren Sie uns unter:'
  } : {
    title: 'Terms and Conditions',
    sections: [
      { h: '1. Scope', p: 'These Terms and Conditions apply to all orders and purchases made through the SportShot platform (www.sport-shot.ch). By using the platform and purchasing photos, you accept these Terms.' },
      { h: '2. Service Description', p: 'SportShot provides sports photography services for events of all kinds. Through the platform, users can find their own photos using facial recognition or a bib number and purchase them as digital files.' },
      { h: '3. Conclusion of Contract', p: 'A binding purchase agreement between the user and SportShot is formed upon completion of the order process and successful payment. Payment is processed through the payment provider Stripe.' },
      { h: '4. Prices and Payment', p: 'All prices are listed in Swiss Francs (CHF). The purchase price is due immediately upon ordering and will be charged to the payment method on file.' },
      { h: '5. Delivery of Digital Content', p: 'Upon successful payment, the user receives immediate access to the purchased photos in digital form, without watermark. No physical delivery takes place.' },
      { h: '6. Right of Withdrawal', p: 'As this concerns digital content made available for download immediately after purchase, the right of withdrawal expires once performance of the contract begins, provided the user has expressly consented.' },
      { h: '7. Usage Rights', p: 'Upon purchase, the user receives a simple, non-transferable license for private use. Commercial use or redistribution of the photos is not permitted without express written consent from SportShot.' },
      { h: '8. Liability', p: 'SportShot is not liable for the completeness of the facial recognition search. It cannot be guaranteed that all photos of a user will be found. Liability for indirect damages is excluded to the extent permitted by law.' },
      { h: '9. Governing Law', p: 'These Terms are governed exclusively by Swiss law. The place of jurisdiction is the registered seat of SportShot, to the extent permitted by law.' },
    ],
    contactLabel: 'Contact',
    contactText: 'For questions about these Terms, please contact us at:'
  }

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 'clamp(15px, 4.5vw, 22px)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 32, whiteSpace: 'nowrap' }}>{content.title}</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {content.sections.map((s, i) => (
            <div key={i}>
              <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>{s.h}</div>
              <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>{s.p}</p>
            </div>
          ))}

          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>{content.contactLabel}</div>
            <p style={{ color: '#667788', lineHeight: 1.7, fontSize: 14 }}>
              {content.contactText} <span style={{ color: '#e8ff00' }}>info@sport-shot.ch</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}