import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const { name, email, nachricht } = await req.json()

  const transporter = nodemailer.createTransport({
    host: 'asmtp.mail.hostpoint.ch',
    port: 465,
    secure: true,
    auth: {
      user: 'info@90focus.ch',
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  try {
    await transporter.sendMail({
      from: 'info@90focus.ch',
      to: 'info@90focus.ch',
      subject: `Neue Kontaktanfrage von ${name}`,
      html: `
        <h2>Neue Kontaktanfrage</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Nachricht:</strong></p>
        <p>${nachricht}</p>
      `,
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Senden' }, { status: 500 })
  }
}