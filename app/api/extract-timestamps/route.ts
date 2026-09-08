import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import exifr from 'exifr'

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function extractOne(foto: { id: string; filename: string }) {
  try {
    const s3Url = `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(foto.filename)}`
    const res = await fetch(s3Url)
    if (!res.ok) return false

    const buffer = Buffer.from(await res.arrayBuffer())
    const exifData = await exifr.parse(buffer, ['DateTimeOriginal', 'CreateDate', 'ModifyDate'])

    const takenAt = exifData?.DateTimeOriginal || exifData?.CreateDate || exifData?.ModifyDate

    if (takenAt) {
      await supabase
        .from('event_fotos')
        .update({ aufgenommen_am: new Date(takenAt).toISOString() })
        .eq('id', foto.id)
      return true
    }
    return false
  } catch (e) {
    console.error(`Timestamp extraction error for ${foto.filename}:`, e)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const { eventId, offset } = await req.json()

    if (!eventId) {
      return NextResponse.json({ error: 'Keine eventId angegeben' }, { status: 400 })
    }

    const BATCH_SIZE = 20
    const start = offset || 0

    const { data: fotos, error } = await supabase
      .from('event_fotos')
      .select('id, filename')
      .eq('event_id', eventId)
      .is('aufgenommen_am', null)
      .range(0, BATCH_SIZE - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!fotos || fotos.length === 0) {
      return NextResponse.json({ done: true, processed: 0 })
    }

    const results = await Promise.allSettled(fotos.map((f) => extractOne(f)))
    const successCount = results.filter((r) => r.status === 'fulfilled' && r.value).length

    return NextResponse.json({
      done: fotos.length < BATCH_SIZE,
      processed: fotos.length,
      success: successCount,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}