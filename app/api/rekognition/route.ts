import { RekognitionClient, IndexFacesCommand, SearchFacesByImageCommand, CreateCollectionCommand } from '@aws-sdk/client-rekognition'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

const COLLECTION_ID = '90focus-gesichter'

export async function POST(req: NextRequest) {
  const { filename } = await req.json()
  const externalImageId = filename.replace(/[^a-zA-Z0-9_\-:]/g, '_')

  try {
    try {
      await rekognition.send(new CreateCollectionCommand({ CollectionId: COLLECTION_ID }))
    } catch {}

    const indexResult = await rekognition.send(new IndexFacesCommand({
      CollectionId: COLLECTION_ID,
      Image: { S3Object: { Bucket: '90focus-fotos-ireland', Name: filename } },
      ExternalImageId: externalImageId,
      DetectionAttributes: [],
    }))

    const indexedCount = indexResult.FaceRecords?.length || 0
    const unindexedCount = indexResult.UnindexedFaces?.length || 0
    console.log(`Indexed for ${filename}: ${indexedCount} faces indexed, ${unindexedCount} faces skipped`, JSON.stringify(indexResult.UnindexedFaces))

    return NextResponse.json({ success: true, indexedCount, unindexedCount })
  } catch (error) {
    console.error('Rekognition error:', error)
    return NextResponse.json({ error: 'Fehler beim Indexieren' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('selfie') as File
  const eventId = formData.get('eventId') as string

  if (!file) return NextResponse.json({ error: 'Kein Selfie!' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const result = await rekognition.send(new SearchFacesByImageCommand({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: buffer },
      MaxFaces: 100,
      FaceMatchThreshold: 80,
    }))

    const allMatches = result.FaceMatches?.map(m => {
      const id = m.Face?.ExternalImageId || ''
      return id
    }) || []

    if (eventId && allMatches.length > 0) {
      const { data: eventFotos } = await supabase
        .from('event_fotos')
        .select('filename')
        .eq('event_id', eventId)

      const eventFilenames = eventFotos?.map(f =>
        f.filename.replace(/[^a-zA-Z0-9_\-:]/g, '_')
      ) || []

      const filtered = allMatches.filter(f => eventFilenames.includes(f))
      const originalFilenames = filtered.map(f => {
        const match = eventFotos?.find(ef =>
          ef.filename.replace(/[^a-zA-Z0-9_\-:]/g, '_') === f
        )
        return match?.filename || f
      })
      return NextResponse.json({ matches: originalFilenames })
    }

    return NextResponse.json({ matches: allMatches })
  } catch (error) {
    console.error('Rekognition search error:', error)
    return NextResponse.json({ error: 'Fehler bei der Suche' }, { status: 500 })
  }
}