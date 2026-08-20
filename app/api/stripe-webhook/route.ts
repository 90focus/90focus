import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const checkoutId = session.metadata?.checkoutId

      if (checkoutId) {
        const { data: pendingCheckout, error: fetchError } = await supabase
          .from('pending_checkouts')
          .select('*')
          .eq('id', checkoutId)
          .single()

        if (fetchError || !pendingCheckout) {
          console.error('Webhook: pending_checkout nicht gefunden:', fetchError)
          return NextResponse.json({ received: true })
        }

        const filenames = (pendingCheckout.filenames || '').split(',').filter(Boolean)
        const eventId = pendingCheckout.event_id || null
        const userId = pendingCheckout.user_id

        if (filenames.length > 0 && userId) {
          const preisProFoto = (session.amount_total || 1990) / 100 / filenames.length

          const { data: existing } = await supabase
            .from('purchases')
            .select('id')
            .eq('stripe_session_id', session.id)
            .limit(1)

          if (!existing || existing.length === 0) {
            const rows = filenames.map((filename: string) => ({
              user_id: userId,
              foto_filename: filename,
              event_id: eventId,
              preis: preisProFoto,
              stripe_session_id: session.id,
            }))

            const { error } = await supabase.from('purchases').insert(rows)
            if (error) {
              console.error('Webhook: Fehler beim Speichern des Kaufs:', error)
            } else {
              console.log(`Webhook: ${rows.length} Foto(s) gespeichert fuer Session ${session.id}`)
            }
          } else {
            console.log(`Webhook: Kauf fuer Session ${session.id} bereits gespeichert, ueberspringe`)
          }
        }
      }
    } catch (e) {
      console.error('Webhook processing error:', e)
    }
  }

  return NextResponse.json({ received: true })
}