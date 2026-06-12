import { NextRequest, NextResponse } from 'next/server'
import { createCanvas, loadImage } from 'canvas'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const heimLogo = formData.get('heimLogo') as File
    const gastLogo = formData.get('gastLogo') as File
    const sponsorLogo = formData.get('sponsorLogo') as File | null

    const WIDTH = 800
    const HEIGHT = 450
    const canvas = createCanvas(WIDTH, HEIGHT)
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
    gradient.addColorStop(0, '#0a0f14')
    gradient.addColorStop(0.5, '#111820')
    gradient.addColorStop(1, '#0a0f14')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 1
    for (let i = 0; i < WIDTH; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, HEIGHT); ctx.stroke()
    }
    for (let i = 0; i < HEIGHT; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(WIDTH, i); ctx.stroke()
    }

    ctx.fillStyle = '#e8ff00'
    ctx.fillRect(0, 0, WIDTH, 4)

    const heimBuffer = Buffer.from(await heimLogo.arrayBuffer())
    const heimImg = await loadImage(heimBuffer)
    const logoSize = 160
    const heimX = 80
    const heimY = (HEIGHT - logoSize) / 2 - 40
    ctx.save()
    ctx.beginPath()
    ctx.arc(heimX + logoSize / 2, heimY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(heimImg, heimX, heimY, logoSize, logoSize)
    ctx.restore()

    const gastBuffer = Buffer.from(await gastLogo.arrayBuffer())
    const gastImg = await loadImage(gastBuffer)
    const gastX = WIDTH - 80 - logoSize
    const gastY = (HEIGHT - logoSize) / 2 - 40
    ctx.save()
    ctx.beginPath()
    ctx.arc(gastX + logoSize / 2, gastY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(gastImg, gastX, gastY, logoSize, logoSize)
    ctx.restore()

    ctx.fillStyle = '#e8ff00'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('VS', WIDTH / 2, HEIGHT / 2 - 20)

    if (sponsorLogo) {
      const boxW = 320
      const boxH = 80
      const boxX = (WIDTH - boxW) / 2
      const boxY = HEIGHT - boxH - 30
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.beginPath()
      ctx.roundRect(boxX, boxY, boxW, boxH, 8)
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = 'bold 11px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('SPONSORED BY', WIDTH / 2, boxY + 22)

      const sponsorBuffer = Buffer.from(await sponsorLogo.arrayBuffer())
      const sponsorImg = await loadImage(sponsorBuffer)
      const sLogoH = 40
      const sLogoW = (sponsorImg.width / sponsorImg.height) * sLogoH
      ctx.drawImage(sponsorImg, (WIDTH - sLogoW) / 2, boxY + 30, sLogoW, sLogoH)
    }

    const buffer = canvas.toBuffer('image/png')
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="event.png"'
      }
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fehler beim Generieren' }, { status: 500 })
  }
}