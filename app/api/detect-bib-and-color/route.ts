import { NextRequest, NextResponse } from 'next/server'
import { RekognitionClient, DetectTextCommand, DetectFacesCommand } from '@aws-sdk/client-rekognition'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

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

export async function POST(req: NextRequest) {
  try {
    const { filename, fotoId } = await req.json()

    const s3Url = `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`
    const imgRes = await fetch(s3Url)
    const buffer = Buffer.from(await imgRes.arrayBuffer())

    const textResult = await rekognition.send(new DetectTextCommand({
      Image: { Bytes: buffer },
    }))

    const numbers = textResult.TextDetections
      ?.filter(t => t.Type === 'LINE' && /^\d{1,5}$/.test(t.DetectedText || ''))
      .map(t => t.DetectedText)
      .join(', ') || ''

    const faceResult = await rekognition.send(new DetectFacesCommand({
      Image: { Bytes: buffer },
    }))

    let colorHex = ''
    if (faceResult.FaceDetails && faceResult.FaceDetails.length > 0) {
      const box = faceResult.FaceDetails[0].BoundingBox
      const metadata = await sharp(buffer).metadata()
      const imgWidth = metadata.width || 1000
      const imgHeight = metadata.height || 1000

      if (box) {
        const faceBottom = Math.round((box.Top! + box.Height!) * imgHeight)
        const faceLeft = Math.round(box.Left! * imgWidth)
        const faceWidth = Math.round(box.Width! * imgWidth)

        const sampleTop = Math.min(faceBottom + 20, imgHeight - 50)
        const sampleHeight = Math.min(60, imgHeight - sampleTop)

        if (sampleHeight > 0 && faceWidth > 0) {
          const { data } = await sharp(buffer)
            .extract({ left: faceLeft, top: sampleTop, width: faceWidth, height: sampleHeight })
            .resize(1, 1)
            .raw()
            .toBuffer({ resolveWithObject: true })

          const r = data[0]
          const g = data[1]
          const b = data[2]
          colorHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
        }
      }
    }

    let faceCropBase64 = ''
    if (faceResult.FaceDetails && faceResult.FaceDetails.length > 0) {
      const box = faceResult.FaceDetails[0].BoundingBox
      const metadata = await sharp(buffer).metadata()
      const imgWidth = metadata.width || 1000
      const imgHeight = metadata.height || 1000
      if (box) {
        const left = Math.max(0, Math.round(box.Left! * imgWidth) - 20)
        const top = Math.max(0, Math.round(box.Top! * imgHeight) - 20)
        const width = Math.min(imgWidth - left, Math.round(box.Width! * imgWidth) + 40)
        const height = Math.min(imgHeight - top, Math.round((box.Height! * imgHeight) * 2))
        const cropBuffer = await sharp(buffer).extract({ left, top, width, height }).jpeg().toBuffer()
        faceCropBase64 = `data:image/jpeg;base64,${cropBuffer.toString('base64')}`
      }
    }

    await supabase
      .from('event_fotos')
      .update({ detected_bib_numbers: numbers, detected_colors: colorHex })
      .eq('id', fotoId)

    return NextResponse.json({ success: true, numbers, colorHex, faceCropBase64 })
  } catch (error: any) {
    console.error('Detect bib/color error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}