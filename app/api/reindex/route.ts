import { RekognitionClient, IndexFacesCommand, CreateCollectionCommand } from '@aws-sdk/client-rekognition'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'

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

const COLLECTION_ID = '90focus-gesichter'

export async function GET() {
  try {
    try {
      await rekognition.send(new CreateCollectionCommand({ CollectionId: COLLECTION_ID }))
    } catch {}

    const listResult = await s3.send(new ListObjectsV2Command({
      Bucket: '90focus-fotos-ireland',
    }))

    const files = listResult.Contents || []
    const results: string[] = []

    for (const file of files) {
      if (!file.Key) continue
      const externalImageId = file.Key.replace(/[^a-zA-Z0-9_\-:]/g, '_')
      try {
        await rekognition.send(new IndexFacesCommand({
          CollectionId: COLLECTION_ID,
          Image: { S3Object: { Bucket: '90focus-fotos-ireland', Name: file.Key } },
          ExternalImageId: externalImageId,
          DetectionAttributes: [],
        }))
        results.push(`✅ ${file.Key}`)
      } catch (e: any) {
        results.push(`❌ ${file.Key}: ${e.message}`)
      }
    }

    return NextResponse.json({ success: true, indexed: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}