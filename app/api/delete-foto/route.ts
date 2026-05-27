import { RekognitionClient, DeleteFacesCommand, ListFacesCommand } from '@aws-sdk/client-rekognition'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const rekognition = new RekognitionClient({
  region: 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

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

const COLLECTION_ID = '90focus-gesichter'

export async function DELETE(req: NextRequest) {
  const { filename, fotoId } = await req.json()

  try {
    // 1. Aus S3 löschen
    await s3.send(new DeleteObjectCommand({
      Bucket: '90focus-fotos-ireland',
      Key: filename,
    }))

    // 2. Aus Rekognition löschen
    const externalImageId = filename.replace(/[^a-zA-Z0-9_\-:]/g, '_')
    const listResult = await rekognition.send(new ListFacesCommand({
      CollectionId: COLLECTION_ID,
    }))
    const facesToDelete = listResult.Faces?.filter(
      f => f.ExternalImageId === externalImageId
    ).map(f => f.FaceId!) || []

    if (facesToDelete.length > 0) {
      await rekognition.send(new DeleteFacesCommand({
        CollectionId: COLLECTION_ID,
        FaceIds: facesToDelete,
      }))
    }

    // 3. Aus Supabase löschen
    if (fotoId) {
      await supabase.from('event_fotos').delete().eq('id', fotoId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}