import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const files = formData.getAll('files') as File[]

  if (!files || files.length === 0) {
    return NextResponse.json({ message: 'Keine Dateien!' }, { status: 400 })
  }

  const uploaded: string[] = []

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${Date.now()}-${file.name}`

    await s3.send(
      new PutObjectCommand({
        Bucket: '90focus-fotos',
        Key: filename,
        Body: buffer,
        ContentType: file.type,
      })
    )

    uploaded.push(filename)
  }

  return NextResponse.json({
    message: `${uploaded.length} Foto(s) erfolgreich hochgeladen!`,
    files: uploaded,
  })
}