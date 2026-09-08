import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { filenames, eventId, userId, lang } = await req.json()

    let preis = 19.90
    if (eventId) {
      const { data: eventData } = await supabase
        .from('events')
        .select('preis, tier1_max, tier1_preis, tier2_max, tier2_preis, tier3_max, tier3_preis')
        .eq('id', eventId)
        .single()

      if (eventData) {
        const tier1Max = eventData.tier1_max || 12
        const tier1Preis = eventData.tier1_preis || 25
        const tier2Max = eventData.tier2_max || 20
        const tier2Preis = eventData.tier2_preis || 35
        const tier3Max = eventData.tier3_max || 30
        const tier3Preis = eventData.tier3_preis || 45

        const count = filenames.length

        if (count > tier3Max) {
          return NextResponse.json({ error: `Maximal ${tier3Max} Fotos pro Kauf erlaubt.` }, { status: 400 })
        }

        if (count <= tier1Max) preis = tier1Preis
        else if (count <= tier2Max) preis = tier2Preis
        else preis = tier3Preis
      }
    }
    const unitAmount = Math.round(preis * 100)

    const { data: pendingCheckout, error: insertError } = await supabase
      .from('pending_checkouts')
      .insert({
        filenames: filenames.join(','),
        event_id: eventId || null,
        user_id: userId || null,
      })
      .select()
      .single()

    if (insertError || !pendingCheckout) {
      console.error('Pending checkout insert error:', insertError)
      return NextResponse.json({ error: 'Failed to prepare checkout' }, { status: 500 })
    }

    const checkoutId = pendingCheckout.id

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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&checkoutId=${checkoutId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?filenames=${encodeURIComponent(filenames.join(','))}&eventId=${eventId}`,
      metadata: {
        checkoutId: checkoutId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}