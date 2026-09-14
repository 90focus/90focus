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

function mostCommonColor(fotos: any[], field: string): { color: string; count: number } {
  const items = fotos.filter(f => f[field])
  let bestColor = ''
  let maxCount = 0
  items.forEach(f => {
    const count = items.filter(f2 => hexDistance(f[field], f2[field]) < 25).length
    if (count > maxCount) { maxCount = count; bestColor = f[field] }
  })
  return { color: bestColor, count: maxCount }
}

export async function POST(req: NextRequest) {
  try {
    const { eventId, selfieBase64, threshold } = await req.json()

    const base64Data = selfieBase64.includes(',') ? selfieBase64.split(',')[1] : selfieBase64
    const buffer = Buffer.from(base64Data, 'base64')

    const result = await rekognition.send(new SearchFacesByImageCommand({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: buffer },
      MaxFaces: 4096,
      FaceMatchThreshold: threshold || 50,
    }))

    const faceMatchIds = result.FaceMatches?.map(m => m.Face?.ExternalImageId || '') || []

    const { data: allEventFotos } = await supabase
      .from('event_fotos')
      .select('id, filename, thumbnail_key, detected_colors, shorts_color, shoe_color, has_sunglasses, has_eyeglasses')
      .eq('event_id', eventId)

    const filenameMap = new Map<string, any>()
    allEventFotos?.forEach(f => {
      const sanitized = f.filename.replace(/[^a-zA-Z0-9_\-:]/g, '_')
      filenameMap.set(sanitized, f)
    })

    const faceMatches = faceMatchIds
      .filter(id => filenameMap.has(id))
      .map(id => filenameMap.get(id))

    if (faceMatches.length === 0) {
      return NextResponse.json({ faceMatches: [], profileMatches: [], profile: null })
    }

    // Profil aus den Gesichts-Treffern erstellen
    const shirt = mostCommonColor(faceMatches, 'detected_colors')
    const shorts = mostCommonColor(faceMatches, 'shorts_color')
    const shoes = mostCommonColor(faceMatches, 'shoe_color')
    const sunglassesCount = faceMatches.filter(f => f.has_sunglasses).length
    const eyeglassesCount = faceMatches.filter(f => f.has_eyeglasses).length

    const profile = {
      shirtColor: shirt.count >= 2 ? shirt.color : null,
      shortsColor: shorts.count >= 2 ? shorts.color : null,
      shoeColor: shoes.count >= 2 ? shoes.color : null,
      hasSunglasses: sunglassesCount >= faceMatches.length * 0.5,
      hasEyeglasses: eyeglassesCount >= faceMatches.length * 0.5,
    }

    // Alle anderen Fotos gegen das Profil scoren
    const faceMatchFilenames = new Set(faceMatches.map(f => f.filename))
    const candidates = (allEventFotos || []).filter(f => !faceMatchFilenames.has(f.filename))

    const scored = candidates.map(f => {
      let score = 0
      if (profile.shirtColor && hexDistance(f.detected_colors, profile.shirtColor) < 15) score++
      if (profile.shortsColor && hexDistance(f.shorts_color, profile.shortsColor) < 15) score++
      if (profile.shoeColor && hexDistance(f.shoe_color, profile.shoeColor) < 15) score++
      if (profile.hasSunglasses && f.has_sunglasses) score++
      if (profile.hasEyeglasses && f.has_eyeglasses) score++
      return { ...f, score }
    })

    // Mindestens 3 Merkmale müssen übereinstimmen, engere Farbtoleranz
    const profileMatches = scored.filter(f => f.score >= 3).sort((a, b) => b.score - a.score)

    return NextResponse.json({
      faceMatches,
      profileMatches,
      profile,
      totalFaceMatches: faceMatches.length,
      totalProfileMatches: profileMatches.length,
    })
  } catch (error: any) {
    console.error('Combined search error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}