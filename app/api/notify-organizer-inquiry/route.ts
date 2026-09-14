import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const result = await resend.emails.send({
      from: 'SportShot <onboarding@resend.dev>',
      to: 'info@aktienakademie.ch',
      subject: `Neue Organisator-Anfrage: ${data.event_name}`,
      text: `
Neue Organisator-Anfrage!

Event: ${data.event_name}
Von: ${data.date_from || '-'} Bis: ${data.date_to || '-'}
Ort: ${data.location}
Teilnehmer: ${data.participant_count || '-'}
Gewünschte Leistungen: ${data.services || '-'}
Bemerkungen: ${data.remarks || '-'}
      `,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (error: any) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}