import { NextRequest, NextResponse } from 'next/server'
import { RekognitionClient, IndexFacesCommand, SearchFacesCommand, DeleteFacesCommand } from '@aws-sdk/client-rekognition'
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
    const { eventId, selfieUrl, threshold } = await req.json()

    const selfieRes = await fetch(selfieUrl)
    const selfieBuffer = Buffer.from(await selfieRes.arrayBuffer())

    const indexResult = await rekognition.send(new IndexFacesCommand({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: selfieBuffer },
      ExternalImageId: 'TEMP_SEARCH_SELFIE',
      DetectionAttributes: [],
      QualityFilter: 'NONE',
      MaxFaces: 1,
    }))

    const faceId = indexResult.FaceRecords?.[0]?.Face?.FaceId

    if (!faceId) {
      return NextResponse.json({ error: 'Kein Gesicht im Selfie indexiert' }, { status: 400 })
    }

    const searchResult = await rekognition.send(new SearchFacesCommand({
      CollectionId: COLLECTION_ID,
      FaceId: faceId,
      MaxFaces: 4096,
      FaceMatchThreshold: threshold || 30,
    }))

    const allMatches = searchResult.FaceMatches?.map(m => ({
      externalImageId: m.Face?.ExternalImageId || '',
      similarity: m.Similarity,
    })) || []

    await rekognition.send(new DeleteFacesCommand({
      CollectionId: COLLECTION_ID,
      FaceIds: [faceId],
    }))

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

    return NextResponse.json({ matches, totalRawMatches: allMatches.length, faceIdUsed: faceId })
  } catch (error: any) {
    console.error('Search via FaceId error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}