import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkPhoto(filename: string): Promise<{ filename: string; match: boolean; probability?: number }> {
  const imageUrl = `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`
  const formData = new FormData()
  formData.append('photo', imageUrl)
  formData.append('collections', 'samobor_test')

  try {
    const res = await fetch('https://api.luxand.cloud/photo/search/v2', {
      method: 'POST',
      headers: { 'token': process.env.LUXAND_API_TOKEN! },
      body: formData,
    })
    const data = await res.json()
    if (data.data && data.data.length > 0) {
      return { filename, match: true, probability: data.data[0].probability }
    }
    return { filename, match: false }
  } catch (e) {
    console.error(`Luxand check error for ${filename}:`, e)
    return { filename, match: false }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { eventId, offset } = await req.json()
    const BATCH_SIZE = 10
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
      return NextResponse.json({ done: true, matches: [] })
    }

    const results = await Promise.all(fotos.map((f) => checkPhoto(f.filename)))
    const matches = results.filter((r) => r.match)

    return NextResponse.json({
      done: fotos.length < BATCH_SIZE,
      processed: fotos.length,
      matches: matches.map(m => ({ filename: m.filename, probability: m.probability })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}