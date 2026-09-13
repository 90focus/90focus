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

    let allEventFotos: any[] = []
    let from = 0
    const pageSize = 1000
    let keepGoing = true

    while (keepGoing) {
      const { data } = await supabase
        .from('event_fotos')
        .select('filename')
        .eq('event_id', eventId)
        .range(from, from + pageSize - 1)

      if (data && data.length > 0) {
        allEventFotos = [...allEventFotos, ...data]
        from += pageSize
        keepGoing = data.length === pageSize
      } else {
        keepGoing = false
      }
    }

    const expectedSanitized = new Set(
      allEventFotos.map(f => f.filename.replace(/[^a-zA-Z0-9_\-:]/g, '_'))
    )

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