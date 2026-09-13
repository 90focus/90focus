import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, name } = await req.json()

    if (!imageUrl || !name) {
      return NextResponse.json({ error: 'imageUrl und name erforderlich' }, { status: 400 })
    }

    const formData = new FormData()
    formData.append('name', name)
    formData.append('photos', imageUrl)
    formData.append('store', '1')
    formData.append('collections', 'samobor_test')

    const response = await fetch('https://api.luxand.cloud/v2/person', {
      method: 'POST',
      headers: {
        'token': process.env.LUXAND_API_TOKEN!,
      },
      body: formData,
    })

    const data = await response.json()

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Luxand test error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}