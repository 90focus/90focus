import { NextRequest, NextResponse } from 'next/server'
import { RekognitionClient, SearchFacesByImageCommand } from '@aws-sdk/client-rekognition'
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

function hexDistance(hex1: string, hex2: string): number {
  if (!hex1 || !hex2) return 999
  const r1 = parseInt(hex1.slice(1, 3), 16)
  const g1 = parseInt(hex1.slice(3, 5), 16)
  const b1 = parseInt(hex1.slice(5, 7), 16)
  const r2 = parseInt(hex2.slice(1, 3), 16)
  const g2 = parseInt(hex2.slice(3, 5), 16)
  const b2 = parseInt(hex2.slice(5, 7), 16)
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

export async function POST(req: NextRequest) {
  try {
    const { eventId, selfieBase64, threshold } = await req.json()

    const base64Data = selfieBase64.includes(',') ? selfieBase64.split(',')[1] : selfieBase64
    const buffer = Buffer.from(base64Data, 'base64')

    // Schritt 1: normale Gesichtssuche
    const result = await rekognition.send(new SearchFacesByImageCommand({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: buffer },
      MaxFaces: 4096,
      FaceMatchThreshold: threshold || 50,
    }))

    const faceMatchIds = result.FaceMatches?.map(m => m.Face?.ExternalImageId || '') || []

    const { data: allEventFotos } = await supabase
      .from('event_fotos')
      .select('id, filename, thumbnail_key, detected_colors')
      .eq('event_id', eventId)

    const filenameMap = new Map<string, any>()
    allEventFotos?.forEach(f => {
      const sanitized = f.filename.replace(/[^a-zA-Z0-9_\-:]/g, '_')
      filenameMap.set(sanitized, f)
    })

    const faceMatches = faceMatchIds
      .filter(id => filenameMap.has(id))
      .map(id => filenameMap.get(id))

    // Schritt 2: häufigste Farbe unter den Gesichts-Treffern ermitteln
    const colorCounts = new Map<string, number>()
    faceMatches.forEach(f => {
      if (f.detected_colors) {
        colorCounts.set(f.detected_colors, (colorCounts.get(f.detected_colors) || 0) + 1)
      }
    })

    let dominantColor = ''
    let maxCount = 0
    colorCounts.forEach((count, color) => {
      if (count > maxCount) { maxCount = count; dominantColor = color }
    })

    // Schritt 3: zusätzliche Fotos mit ähnlicher Farbe finden (nur wenn Farbe klar dominant, z.B. min 2x)
    let colorMatches: any[] = []
    if (dominantColor && maxCount >= 2) {
      const faceMatchFilenames = new Set(faceMatches.map(f => f.filename))
      colorMatches = (allEventFotos || []).filter(f =>
        !faceMatchFilenames.has(f.filename) &&
        f.detected_colors &&
        hexDistance(f.detected_colors, dominantColor) < 15
      )
    }

    return NextResponse.json({
      faceMatches,
      colorMatches,
      dominantColor,
      totalFaceMatches: faceMatches.length,
      totalColorMatches: colorMatches.length,
    })
  } catch (error: any) {
    console.error('Combined search error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}