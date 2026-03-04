// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const supabase = createServiceClient()

    try {
      const metadata = session.metadata!
      const userId = metadata.user_id
      const items = JSON.parse(metadata.items)
      const total = session.amount_total!

      // Create order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string,
          status: 'paid',
          total,
          shipping_address: session.shipping_details?.address || null,
        })
        .select()
        .single()

      if (orderErr) throw orderErr

      // Create order items
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_emoji: item.product_emoji,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))

      await supabase.from('order_items').insert(orderItems)

      // Decrement stock
      for (const item of items) {
        try {
          await supabase.rpc('decrement_stock', { product_id: item.product_id, qty: item.quantity })
        } catch (_) {}
      }

      console.log(`Order created: ${order.id} for user ${userId}`)
    } catch (err) {
      console.error('Failed to create order:', err)
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
