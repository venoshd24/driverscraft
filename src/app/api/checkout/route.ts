// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { items } = await req.json()
    if (!items?.length) return NextResponse.json({ error: 'No items' }, { status: 400 })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Build Stripe line items
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || undefined,
          metadata: { product_id: item.id, emoji: item.emoji },
        },
        unit_amount: item.price, // already in cents
      },
      quantity: item.qty,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items,
      metadata: {
        user_id: user.id,
        items: JSON.stringify(items.map((i: any) => ({
          product_id: i.id,
          product_name: i.name,
          product_emoji: i.emoji,
          quantity: i.qty,
          unit_price: i.price,
        }))),
      },
      success_url: `${siteUrl}/account?order=success`,
      cancel_url: `${siteUrl}/shop`,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'MY', 'SG'] },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
