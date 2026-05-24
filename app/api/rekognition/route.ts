import { RekognitionClient, IndexFacesCommand, SearchFacesByImageCommand, CreateCollectionCommand } from '@aws-sdk/client-rekognition'
import { NextRequest, NextResponse } from 'next/server'

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const COLLECTION_ID = '90focus-gesichter'

// Gesicht in Sammlung hinzufügen (nach Upload)
export async function POST(req: NextRequest) {
  const { filename } = await req.json()

  try {
    // Collection erstellen falls nicht vorhanden
    try {
      await rekognition.send(new CreateCollectionCommand({ CollectionId: COLLECTION_ID }))
    } catch {}

    // Gesicht indexieren
    await rekognition.send(new IndexFacesCommand({
      CollectionId: COLLECTION_ID,
      Image: { S3Object: { Bucket: '90focus-fotos', Name: filename } },
      ExternalImageId: filename,
      DetectionAttributes: [],
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Indexieren' }, { status: 500 })
  }
}

// Gesicht suchen (für Kunde)
export async function PUT(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('selfie') as File

  if (!file) return NextResponse.json({ error: 'Kein Selfie!' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const result = await rekognition.send(new SearchFacesByImageCommand({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: buffer },
      MaxFaces: 50,
      FaceMatchThreshold: 80,
    }))

    const matches = result.FaceMatches?.map(m => m.Face?.ExternalImageId) || []
    return NextResponse.json({ matches })
  } catch (error) {
    return NextResponse.json({ error: 'Fehler bei der Suche' }, { status: 500 })
  }
}