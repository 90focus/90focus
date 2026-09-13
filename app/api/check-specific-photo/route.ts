import { NextRequest, NextResponse } from 'next/server'
import { RekognitionClient, DetectFacesCommand, ListFacesCommand } from '@aws-sdk/client-rekognition'

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

    const s3Url = `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`
    const imgRes = await fetch(s3Url)
    const buffer = Buffer.from(await imgRes.arrayBuffer())

    const detectResult = await rekognition.send(new DetectFacesCommand({
      Image: { Bytes: buffer },
      Attributes: ['DEFAULT'],
    }))

    let indexedIds = new Set<string>()
    let nextToken: string | undefined = undefined
    let result: any

    do {
      result = await rekognition.send(new ListFacesCommand({
        CollectionId: COLLECTION_ID,
        MaxResults: 4096,
        NextToken: nextToken,
      }))

      result.Faces?.forEach((f: any) => {
        if (f.ExternalImageId) indexedIds.add(f.ExternalImageId)
      })

      nextToken = result.NextToken
    } while (nextToken)

    return NextResponse.json({
      filename,
      sanitized,
      isIndexed: indexedIds.has(sanitized),
      facesDetectedNow: detectResult.FaceDetails?.length || 0,
      faceDetails: detectResult.FaceDetails?.map(f => ({
        confidence: f.Confidence,
        boundingBox: f.BoundingBox,
      })),
    })
  } catch (error: any) {
    console.error('Check specific photo error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}