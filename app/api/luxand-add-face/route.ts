import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, personUuid } = await req.json()

    if (!imageUrl || !personUuid) {
      return NextResponse.json({ error: 'imageUrl und personUuid erforderlich' }, { status: 400 })
    }

    const formData = new FormData()
    formData.append('photos', imageUrl)
    formData.append('store', '1')

    const response = await fetch(`https://api.luxand.cloud/v2/person/${personUuid}`, {
      method: 'POST',
      headers: {
        'token': process.env.LUXAND_API_TOKEN!,
      },
      body: formData,
    })

    const data = await response.json()

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Luxand add face error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}