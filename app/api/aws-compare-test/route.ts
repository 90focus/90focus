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
    const { eventId, selfieUrl } = await req.json()

    const imgRes = await fetch(selfieUrl)
    const buffer = Buffer.from(await imgRes.arrayBuffer())

    const result = await rekognition.send(new SearchFacesByImageCommand({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: buffer },
      MaxFaces: 200,
      FaceMatchThreshold: 70,
    }))

    const allMatches = result.FaceMatches?.map(m => ({
      externalImageId: m.Face?.ExternalImageId || '',
      similarity: m.Similarity,
    })) || []

    const { data: eventFotos } = await supabase
      .from('event_fotos')
      .select('filename')
      .eq('event_id', eventId)

    const filenameMap = new Map<string, string>()
    eventFotos?.forEach(f => {
      const sanitized = f.filename.replace(/[^a-zA-Z0-9_\-:]/g, '_')
      filenameMap.set(sanitized, f.filename)
    })

    const matches = allMatches
      .filter(m => filenameMap.has(m.externalImageId))
      .map(m => ({ filename: filenameMap.get(m.externalImageId)!, similarity: m.similarity }))

    return NextResponse.json({ matches, totalRawMatches: allMatches.length })
  } catch (error: any) {
    console.error('AWS compare error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}