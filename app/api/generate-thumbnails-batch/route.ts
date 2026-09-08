import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json()

    if (!eventId) {
      return NextResponse.json({ error: 'Keine eventId angegeben' }, { status: 400 })
    }

    const { data: event } = await supabase
      .from('events')
      .select('sponsor_name')
      .eq('id', eventId)
      .single()

    const BATCH_SIZE = 10

    const { data: fotos, error } = await supabase
      .from('event_fotos')
      .select('filename')
      .eq('event_id', eventId)
      .is('thumbnail_key', null)
      .range(0, BATCH_SIZE - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!fotos || fotos.length === 0) {
      return NextResponse.json({ done: true, processed: 0 })
    }

    const results = await Promise.allSettled(
      fotos.map(async (f) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/generate-thumbnail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: f.filename, sponsorName: event?.sponsor_name || null }),
        })
        if (!res.ok) {
          // Markiere als fehlgeschlagen, damit es nicht endlos erneut versucht wird
          await supabase
            .from('event_fotos')
            .update({ thumbnail_key: 'FAILED' })
            .eq('filename', f.filename)
        }
        return res
      })
    )

    const successCount = results.filter((r) => r.status === 'fulfilled').length

    return NextResponse.json({
      done: fotos.length < BATCH_SIZE,
      processed: fotos.length,
      success: successCount,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}