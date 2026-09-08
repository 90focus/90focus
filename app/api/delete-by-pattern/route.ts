import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const s3 = new S3Client({
  region: 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { eventId, pattern } = await req.json()

    if (!eventId || !pattern) {
      return NextResponse.json({ error: 'eventId und pattern erforderlich' }, { status: 400 })
    }

    const BATCH_SIZE = 20

    const { data: fotos, error } = await supabase
      .from('event_fotos')
      .select('id, filename, thumbnail_key')
      .eq('event_id', eventId)
      .ilike('filename', `%${pattern}%`)
      .range(0, BATCH_SIZE - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!fotos || fotos.length === 0) {
      return NextResponse.json({ done: true, processed: 0 })
    }

    for (const foto of fotos) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: '90focus-fotos-ireland', Key: foto.filename }))
        if (foto.thumbnail_key && foto.thumbnail_key !== 'FAILED') {
          await s3.send(new DeleteObjectCommand({ Bucket: '90focus-fotos-ireland', Key: foto.thumbnail_key }))
        }
      } catch (e) {
        console.error(`S3 delete error for ${foto.filename}:`, e)
      }
      await supabase.from('event_fotos').delete().eq('id', foto.id)
    }

    return NextResponse.json({
      done: fotos.length < BATCH_SIZE,
      processed: fotos.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}