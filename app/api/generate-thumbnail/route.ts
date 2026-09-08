import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const s3 = new S3Client({
  region: 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { filename } = await req.json()

    if (!filename) {
      return NextResponse.json({ error: 'Kein Dateiname' }, { status: 400 })
    }

    const s3Url = `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`
    const res = await fetch(s3Url)
    if (!res.ok) {
      return NextResponse.json({ error: 'Original nicht gefunden' }, { status: 404 })
    }
    const buffer = Buffer.from(await res.arrayBuffer())

    const metadata = await sharp(buffer).metadata()

    let processedImage = sharp(buffer)
    if (metadata.orientation && metadata.orientation !== 1) {
      processedImage = processedImage.rotate()
    }

    const thumbnailBuffer = await processedImage
      .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
      .withMetadata({ orientation: undefined })
      .jpeg({ quality: 80 })
      .toBuffer()

    const thumbnailKey = `thumbnails/${filename}`

    await s3.send(new PutObjectCommand({
      Bucket: '90focus-fotos-ireland',
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: 'image/jpeg',
    }))

    await supabase
      .from('event_fotos')
      .update({ thumbnail_key: thumbnailKey })
      .eq('filename', filename)

    return NextResponse.json({ success: true, thumbnailKey })
  } catch (error: any) {
    console.error('Thumbnail generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}