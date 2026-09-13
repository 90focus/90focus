import { NextRequest, NextResponse } from 'next/server'
import { RekognitionClient, ListFacesCommand, DeleteFacesCommand, IndexFacesCommand } from '@aws-sdk/client-rekognition'

const rekognition = new RekognitionClient({
  region: 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const COLLECTION_ID = '90focus-gesichter'

export async function POST(req: NextRequest) {
  try {
    const { filename } = await req.json()
    const sanitized = filename.replace(/[^a-zA-Z0-9_\-:]/g, '_')

    let faceIdsToDelete: string[] = []
    let nextToken: string | undefined = undefined
    let result: any
    do {
      result = await rekognition.send(new ListFacesCommand({
        CollectionId: COLLECTION_ID, MaxResults: 4096, NextToken: nextToken,
      }))
      result.Faces?.forEach((f: any) => {
        if (f.ExternalImageId === sanitized) faceIdsToDelete.push(f.FaceId)
      })
      nextToken = result.NextToken
    } while (nextToken)

    if (faceIdsToDelete.length > 0) {
      await rekognition.send(new DeleteFacesCommand({
        CollectionId: COLLECTION_ID, FaceIds: faceIdsToDelete,
      }))
    }

    const s3Url = `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`
    const imgRes = await fetch(s3Url)
    const buffer = Buffer.from(await imgRes.arrayBuffer())

    const indexResult = await rekognition.send(new IndexFacesCommand({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: buffer },
      ExternalImageId: sanitized,
      DetectionAttributes: [],
      QualityFilter: 'NONE',
    }))

    return NextResponse.json({
      deletedCount: faceIdsToDelete.length,
      newlyIndexed: indexResult.FaceRecords?.length || 0,
    })
  } catch (error: any) {
    console.error('Force reindex error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}