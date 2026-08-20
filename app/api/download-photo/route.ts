import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const filename = req.nextUrl.searchParams.get('filename')
  if (!filename) {
    return NextResponse.json({ error: 'Kein Dateiname angegeben' }, { status: 400 })
  }

  try {
    const s3Url = `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`
    const response = await fetch(s3Url)

    if (!response.ok) {
      return NextResponse.json({ error: 'Bild nicht gefunden' }, { status: 404 })
    }

    const blob = await response.blob()
    const shortName = filename.split('/').pop() || filename

    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Content-Disposition': `attachment; filename="${shortName}"`,
      },
    })
  } catch (error) {
    console.error('Download proxy error:', error)
    return NextResponse.json({ error: 'Fehler beim Download' }, { status: 500 })
  }
}