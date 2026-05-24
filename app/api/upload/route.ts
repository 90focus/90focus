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

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const files = formData.getAll('files') as File[]
  const eventId = formData.get('eventId') as string

  if (!files || files.length === 0) {
    return NextResponse.json({ message: 'Keine Dateien!' }, { status: 400 })
  }

  const uploaded: string[] = []

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${Date.now()}-${file.name}`

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
}