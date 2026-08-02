import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { eventId, keys } = await req.json()

    if (eventId && keys) {
      for (const key of keys) {
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
    }

    return NextResponse.json({ message: `${keys.length} Foto(s) erfolgreich verarbeitet!` })
  } catch (error: any) {
    return NextResponse.json({ message: 'Fehler: ' + error.message }, { status: 500 })
  }
}