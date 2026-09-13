import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { personUuid } = await req.json()

    if (!personUuid) {
      return NextResponse.json({ error: 'personUuid erforderlich' }, { status: 400 })
    }

    const response = await fetch(`https://api.luxand.cloud/person/${personUuid}`, {
      method: 'DELETE',
      headers: {
        'token': process.env.LUXAND_API_TOKEN!,
      },
    })

    const data = await response.json()

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Luxand delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}