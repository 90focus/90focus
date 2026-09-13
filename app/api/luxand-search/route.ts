import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl erforderlich' }, { status: 400 })
    }

    const formData = new FormData()
    formData.append('photo', imageUrl)

    const response = await fetch('https://api.luxand.cloud/photo/search/v2', {
      method: 'POST',
      headers: {
        'token': process.env.LUXAND_API_TOKEN!,
      },
      body: formData,
    })

    const data = await response.json()

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Luxand search error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}