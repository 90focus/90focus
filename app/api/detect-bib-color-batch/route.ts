import { NextRequest, NextResponse } from 'next/server'
import { RekognitionClient, DetectTextCommand, DetectFacesCommand } from '@aws-sdk/client-rekognition'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

export const maxDuration = 60

const rekognition = new RekognitionClient({
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

async function sampleColor(buffer: Buffer, left: number, top: number, width: number, height: number, imgWidth: number, imgHeight: number): Promise<string> {
  try {
    const safeLeft = Math.max(0, Math.min(left, imgWidth - 1))
    const safeTop = Math.max(0, Math.min(top, imgHeight - 1))
    const safeWidth = Math.max(1, Math.min(width, imgWidth - safeLeft))
    const safeHeight = Math.max(1, Math.min(height, imgHeight - safeTop))
    const { data } = await sharp(buffer)
      .extract({ left: safeLeft, top: safeTop, width: safeWidth, height: safeHeight })
      .resize(1, 1).raw().toBuffer({ resolveWithObject: true })
    return `#${data[0].toString(16).padStart(2, '0')}${data[1].toString(16).padStart(2, '0')}${data[2].toString(16).padStart(2, '0')}`
  } catch {
    return ''
  }
}

async function processOne(filename: string, fotoId: string) {
  try {
    const s3Url = `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`
    const imgRes = await fetch(s3Url)
    const originalBuffer = Buffer.from(await imgRes.arrayBuffer())

    const buffer = await sharp(originalBuffer)
      .resize(1500, 1500, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer()

    const textResult = await rekognition.send(new DetectTextCommand({ Image: { Bytes: buffer } }))
    const numbers = textResult.TextDetections
      ?.filter(t => t.Type === 'LINE' && /^\d{1,5}$/.test(t.DetectedText || ''))
      .map(t => t.DetectedText)
      .join(', ') || ''

    const faceResult = await rekognition.send(new DetectFacesCommand({ Image: { Bytes: buffer }, Attributes: ['ALL'] }))

    let shirtColor = ''
    let shortsColor = ''
    let shoeColor = ''
    let hasSunglasses = false
    let hasEyeglasses = false

    if (faceResult.FaceDetails && faceResult.FaceDetails.length > 0) {
      const face = faceResult.FaceDetails[0]
      hasSunglasses = face.Sunglasses?.Value || false
      hasEyeglasses = face.Eyeglasses?.Value || false

      const box = face.BoundingBox
      const metadata = await sharp(buffer).metadata()
      const imgWidth = metadata.width || 1000
      const imgHeight = metadata.height || 1000

      if (box) {
        const faceBottom = Math.round((box.Top! + box.Height!) * imgHeight)
        const faceLeft = Math.round(box.Left! * imgWidth)
        const faceWidth = Math.round(box.Width! * imgWidth)
        const faceHeightPx = Math.round(box.Height! * imgHeight)

        // Shirt: kurz unterhalb des Gesichts
        shirtColor = await sampleColor(buffer, faceLeft, faceBottom + 20, faceWidth, 60, imgWidth, imgHeight)

        // Shorts: ca. 3x Gesichtshöhe unterhalb des Gesichts
        const shortsTop = faceBottom + faceHeightPx * 3
        shortsColor = await sampleColor(buffer, faceLeft, shortsTop, faceWidth, 60, imgWidth, imgHeight)

        // Schuhe: ganz unten im Bild, falls im Rahmen
        const shoeTop = imgHeight - 60
        if (shoeTop > faceBottom) {
          shoeColor = await sampleColor(buffer, faceLeft, shoeTop, faceWidth, 50, imgWidth, imgHeight)
        }
      }
    }

    await supabase.from('event_fotos').update({
      detected_bib_numbers: numbers,
      detected_colors: shirtColor,
      shorts_color: shortsColor,
      shoe_color: shoeColor,
      has_sunglasses: hasSunglasses,
      has_eyeglasses: hasEyeglasses,
    }).eq('id', fotoId)
    return true
  } catch (e) {
    console.error(`Detect error for ${filename}:`, e)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json()
    const BATCH_SIZE = 10

    const { data: fotos, error } = await supabase
      .from('event_fotos')
      .select('id, filename')
      .eq('event_id', eventId)
      .is('shorts_color', null)
      .range(0, BATCH_SIZE - 1)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!fotos || fotos.length === 0) return NextResponse.json({ done: true, processed: 0 })

    await Promise.allSettled(fotos.map(f => processOne(f.filename, f.id)))

    return NextResponse.json({ done: fotos.length < BATCH_SIZE, processed: fotos.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}