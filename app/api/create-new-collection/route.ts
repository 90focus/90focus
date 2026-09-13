import { NextResponse } from 'next/server'
import { RekognitionClient, CreateCollectionCommand } from '@aws-sdk/client-rekognition'

const rekognition = new RekognitionClient({
  region: 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST() {
  try {
    const result = await rekognition.send(new CreateCollectionCommand({
      CollectionId: '90focus-gesichter-v2',
    }))

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error('Create collection error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}