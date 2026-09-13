import { NextRequest, NextResponse } from 'next/server'
import { RekognitionClient, ListFacesCommand } from '@aws-sdk/client-rekognition'
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
    const { eventId } = await req.json()

    const { data: eventFotos } = await supabase
      .from('event_fotos')
      .select('filename')
      .eq('event_id', eventId)

    const expectedSanitized = new Set(
      eventFotos?.map(f => f.filename.replace(/[^a-zA-Z0-9_\-:]/g, '_')) || []
    )

    let indexedIds = new Set<string>()
    let nextToken: string | undefined = undefined

    do {
      const result = await rekognition.send(new ListFacesCommand({
        CollectionId: COLLECTION_ID,
        MaxResults: 4096,
        NextToken: nextToken,
      }))

      result.Faces?.forEach(f => {
        if (f.ExternalImageId) indexedIds.add(f.ExternalImageId)
      })

      nextToken = result.NextToken
    } while (nextToken)

    const missing = [...expectedSanitized].filter(id => !indexedIds.has(id))

    return NextResponse.json({
      totalExpected: expectedSanitized.size,
      totalIndexedInCollection: indexedIds.size,
      missingCount: missing.length,
      missingSample: missing.slice(0, 20),
    })
  } catch (error: any) {
    console.error('Check indexing error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}