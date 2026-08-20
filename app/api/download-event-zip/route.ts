import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'

export async function POST(req: NextRequest) {
  try {
    const { filenames } = await req.json()

    if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
      return NextResponse.json({ error: 'Keine Dateien angegeben' }, { status: 400 })
    }

    const zip = new JSZip()

    for (const filename of filenames) {
      const s3Url = `https://90focus-fotos-ireland.s3.eu-west-1.amazonaws.com/${encodeURIComponent(filename)}`
      const response = await fetch(s3Url)
      if (response.ok) {
        const buffer = await response.arrayBuffer()
        const shortName = filename.split('/').pop() || filename
        zip.file(shortName, buffer)
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="sportshot-fotos.zip"',
      },
    })
  } catch (error) {
    console.error('ZIP download error:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen der ZIP-Datei' }, { status: 500 })
  }
}