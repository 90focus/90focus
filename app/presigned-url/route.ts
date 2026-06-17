import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function POST(req: NextRequest) {
  try {
    const { eventId, filenames } = await req.json()

    if (!filenames || filenames.length === 0) {
      return NextResponse.json({ error: 'Keine Dateien!' }, { status: 400 })
    }

    let eventFolder = eventId
    if (eventId) {
      const { data: event } = await supabase
        .from('events')
        .select('home_team, away_team, date')
        .eq('id', eventId)
        .single()

      if (event) {
        const cleanHome = event.home_team.replace(/[^a-zA-Z0-9]/g, '-')
        const cleanAway = event.away_team.replace(/[^a-zA-Z0-9]/g, '-')
        eventFolder = `${cleanHome}-vs-${cleanAway}-${event.date}`
      }
    }

    const urls = await Promise.all(
      filenames.map(async (name: string) => {
        const timestamp = Date.now()
        const cleanName = name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const key = eventId
          ? `events/${eventFolder}/${timestamp}-${cleanName}`
          : `${timestamp}-${cleanName}`

        const command = new PutObjectCommand({
          Bucket: '90focus-fotos-ireland',
          Key: key,
        })

        const url = await getSignedUrl(s3, command, { expiresIn: 300 })
        return { filename: name, key, url }
      })
    )

    return NextResponse.json({ urls })
  } catch (error: any) {
    console.error('Presigned URL error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}