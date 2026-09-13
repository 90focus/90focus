import { NextRequest, NextResponse } from 'next/server'
import { RekognitionClient, SearchFacesByImageCommand } from '@aws-sdk/client-rekognition'
import { createClient } from '@supabase/supabase-js'

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

const COLLECTION_ID = '90focus-gesichter'

export async function POST(req: NextRequest) {
  try {
    const { eventId, selfieBase64, threshold } = await req.json()

    if (!selfieBase64 || typeof selfieBase64 !== 'string') {
      return NextResponse.json({ error: 'Kein gueltiges Selfie-Bild erhalten' }, { status: 400 })
    }

    const base64Data = selfieBase64.includes(',') ? selfieBase64.split(',')[1] : selfieBase64
    const buffer = Buffer.from(base64Data, 'base64')

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Bild-Daten sind leer' }, { status: 400 })
    }

    const result = await rekognition.send(new SearchFacesByImageCommand({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: buffer },
      MaxFaces: 4096,
      FaceMatchThreshold: threshold || 50,
    }))

    const allMatches = result.FaceMatches?.map(m => ({
      externalImageId: m.Face?.ExternalImageId || '',
      similarity: m.Similarity,
    })) || []

    const { data: eventFotos } = await supabase
      .from('event_fotos')
      .select('filename, thumbnail_key')
      .eq('event_id', eventId)

    const filenameMap = new Map<string, { filename: string; thumbnail_key: string | null }>()
    eventFotos?.forEach(f => {
      const sanitized = f.filename.replace(/[^a-zA-Z0-9_\-:]/g, '_')
      filenameMap.set(sanitized, { filename: f.filename, thumbnail_key: f.thumbnail_key })
    })

    const matches = allMatches
      .filter(m => filenameMap.has(m.externalImageId))
      .map(m => ({ ...filenameMap.get(m.externalImageId)!, similarity: m.similarity }))
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))

    return NextResponse.json({ matches, totalRawMatches: allMatches.length })
  } catch (error: any) {
    console.error('AWS compare error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}