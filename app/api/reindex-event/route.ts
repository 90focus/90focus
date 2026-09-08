import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function reindexOne(key: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/rekognition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: key }),
    })
    return res.ok
  } catch (e) {
    console.error(`Reindex error for ${key}:`, e)
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
      .select('filename')
      .eq('event_id', eventId)
      .range(start, start + BATCH_SIZE - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!fotos || fotos.length === 0) {
      return NextResponse.json({ done: true, processed: 0 })
    }

    await Promise.allSettled(fotos.map((f) => reindexOne(f.filename)))

    return NextResponse.json({
      done: fotos.length < BATCH_SIZE,
      processed: fotos.length,
      nextOffset: start + fotos.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}