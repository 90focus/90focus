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

function buildWatermarkSvg(width: number, height: number, sponsorText: string | null): string {
  const rows = Math.ceil(height / 80)
  const cols = Math.ceil(width / 140)
  let diagonalText = ''
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * 140 + (r % 2 === 0 ? 0 : 70)
      const y = r * 80
      diagonalText += `<text x="${x}" y="${y}" font-family="Arial" font-weight="800" font-size="11" fill="rgba(255,255,255,0.25)" transform="rotate(-20 ${x} ${y})">SPORTSHOT</text>`
    }
  }

  const label = sponsorText || 'SPORTSHOT'
  const boxWidth = Math.min(width * 0.35, 150)
  const boxX = width - boxWidth - 10
  const boxY = height - 34

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${diagonalText}
      <rect x="${boxX}" y="${boxY}" width="${boxWidth}" height="24" rx="4" fill="rgba(0,0,0,0.6)" />
      <text x="${boxX + boxWidth / 2}" y="${boxY + 16}" font-family="Arial" font-weight="900" font-size="11" fill="#e8ff00" text-anchor="middle">${label}</text>
    </svg>
  `
}

export async function POST(req: NextRequest) {
  try {
    const { filename, sponsorName } = await req.json()

    if (!filename) {
      return NextResponse.json({ error: 'Kein Dateiname' }, { status: 400 })
    }

    const s3Url = `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`
    const res = await fetch(s3Url)
    if (!res.ok) {
      return NextResponse.json({ error: 'Original nicht gefunden' }, { status: 404 })
    }
    const buffer = Buffer.from(await res.arrayBuffer())

    const resizedBuffer = await sharp(buffer)
      .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
      .toBuffer()

    const metadata = await sharp(resizedBuffer).metadata()
    const width = metadata.width || 500
    const height = metadata.height || 500

    const watermarkSvg = buildWatermarkSvg(width, height, sponsorName)
    const watermarkBuffer = await sharp(Buffer.from(watermarkSvg)).resize(width, height).png().toBuffer()

    const thumbnailBuffer = await sharp(resizedBuffer)
      .composite([{ input: watermarkBuffer, top: 0, left: 0 }])
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