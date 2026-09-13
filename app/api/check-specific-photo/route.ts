import { NextRequest, NextResponse } from 'next/server'
import { RekognitionClient, DetectFacesCommand, ListFacesCommand, CompareFacesCommand } from '@aws-sdk/client-rekognition'

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
    const { filename, selfieUrl } = await req.json()

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

    let directSimilarity: any = null
    if (selfieUrl) {
      try {
        const selfieRes = await fetch(selfieUrl)
        const selfieBuffer = Buffer.from(await selfieRes.arrayBuffer())
        const compareResult = await rekognition.send(new CompareFacesCommand({
          SourceImage: { Bytes: selfieBuffer },
          TargetImage: { Bytes: buffer },
          SimilarityThreshold: 0,
        }))
        directSimilarity = compareResult.FaceMatches?.map(m => m.Similarity) || []
      } catch (e: any) {
        console.error('Compare error:', e)
        directSimilarity = { error: e.message }
      }
    }

    const matchingFaceRecords = result.Faces?.filter((f: any) => f.ExternalImageId === sanitized) || []
    let indexedFacesCount = 0
    // Re-list all to count how many faces share this exact ExternalImageId
    let allFacesWithThisId: any[] = []
    let nt2: string | undefined = undefined
    let r2: any
    do {
      r2 = await rekognition.send(new ListFacesCommand({
        CollectionId: COLLECTION_ID,
        MaxResults: 4096,
        NextToken: nt2,
      }))
      r2.Faces?.forEach((f: any) => {
        if (f.ExternalImageId === sanitized) allFacesWithThisId.push(f)
      })
      nt2 = r2.NextToken
    } while (nt2)

    return NextResponse.json({
      filename,
      sanitized,
      isIndexed: indexedIds.has(sanitized),
      indexedFaceCount: allFacesWithThisId.length,
      facesDetectedNow: detectResult.FaceDetails?.length || 0,
      faceDetails: detectResult.FaceDetails?.map(f => ({
        confidence: f.Confidence,
        boundingBox: f.BoundingBox,
      })),
      directSimilarity,
    })
  } catch (error: any) {
    console.error('Check specific photo error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}