import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.luxand.cloud/v2/person', {
      method: 'GET',
      headers: {
        'token': process.env.LUXAND_API_TOKEN!,
      },
    })

    const data = await response.json()

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Luxand list error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}