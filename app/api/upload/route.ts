import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const s3 = new S3Client({
  region: 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const eventId = formData.get('eventId') as string

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'Keine Dateien!' }, { status: 400 })
    }

    const uploaded: string[] = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const timestamp = Date.now()
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')

      // Mit Event-Ordner wenn eventId vorhanden
      const filename = eventId
        ? `events/${eventId}/${timestamp}-${cleanName}`
        : `${timestamp}-${cleanName}`

      await s3.send(
        new PutObjectCommand({
          Bucket: '90focus-fotos-ireland',
          Key: filename,
          Body: buffer,
          ContentType: file.type,
        })
      )

      if (eventId) {
        await supabase.from('event_fotos').insert({
          event_id: eventId,
          filename: filename,
        })
      }

      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/rekognition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename }),
        })
      } catch {}

      uploaded.push(filename)
    }

    return NextResponse.json({
      message: `${uploaded.length} Foto(s) erfolgreich hochgeladen!`,
      files: uploaded,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ message: 'Fehler: ' + error.message }, { status: 500 })
  }
}