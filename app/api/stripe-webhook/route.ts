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

        const photoIds = pendingCheckout.filenames || ''
        const eventId = pendingCheckout.event_id || null
        const userId = pendingCheckout.user_id
        const amount = (session.amount_total || 0) / 100

        const { data: existing } = await supabase
          .from('purchases')
          .select('id')
          .eq('user_id', userId)
          .eq('photo_ids', photoIds)
          .eq('amount', amount)
          .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
          .limit(1)

        if (!existing || existing.length === 0) {
          let email = ''
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(userId)
            email = userData?.user?.email || ''
          } catch (e) {
            console.error('Could not fetch user email:', e)
          }

          const { error } = await supabase.from('purchases').insert({
            event_id: eventId,
            email: email,
            photo_ids: photoIds,
            amount: amount,
            status: 'completed',
            user_id: userId,
          })

          if (error) {
            console.error('Webhook: Fehler beim Speichern des Kaufs:', error)
          } else {
            console.log(`Webhook: Kauf gespeichert fuer User ${userId}`)
          }
        } else {
          console.log(`Webhook: Kauf bereits gespeichert, ueberspringe`)
        }
      }
    } catch (e) {
      console.error('Webhook processing error:', e)
    }
  }

  return NextResponse.json({ received: true })
}