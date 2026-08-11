import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
const { filenames, eventId, userId, lang } = await req.json()

    let preis = 19.90
    if (eventId) {
      const { data: eventData } = await supabase.from('events').select('preis').eq('id', eventId).single()
      if (eventData?.preis) preis = eventData.preis
    }
    const unitAmount = Math.round(preis * 100)

const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      locale: lang === 'de' ? 'de' : 'en',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'SportShot Foto-Paket',
              description: `${filenames.length} Foto(s)`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&filenames=${encodeURIComponent(filenames.join(','))}&eventId=${eventId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?filenames=${encodeURIComponent(filenames.join(','))}&eventId=${eventId}`,
      metadata: {
        filenames: filenames.join(','),
        eventId: eventId || '',
        userId: userId || '',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}