import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function processKey(eventId: string, key: string) {
  await supabase.from('event_fotos').insert({
    event_id: eventId,
    filename: key,
  })

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/rekognition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: key }),
    })
    if (!res.ok) {
      console.error(`Rekognition indexing failed for ${key}:`, await res.text())
    }
  } catch (e) {
    console.error(`Rekognition indexing error for ${key}:`, e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { eventId, keys } = await req.json()

    if (eventId && keys && keys.length > 0) {
      await Promise.allSettled(keys.map((key: string) => processKey(eventId, key)))
    }

    return NextResponse.json({ message: `${keys.length} Foto(s) erfolgreich verarbeitet!` })
  } catch (error: any) {
    return NextResponse.json({ message: 'Fehler: ' + error.message }, { status: 500 })
  }
}