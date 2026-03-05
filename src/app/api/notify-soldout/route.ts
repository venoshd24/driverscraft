// src/app/api/notify-soldout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, items } = await request.json()
    if (!email || !items?.length) return NextResponse.json({ ok: true })

    const supabase = createClient()

    // Get the user to personalise the message
    const { data: { user } } = await supabase.auth.getUser()
    const firstName = user?.user_metadata?.first_name || 'there'

    const itemList = items.map((name: string) => `• ${name}`).join('\n')

    // Send via Supabase auth admin email (uses your SMTP settings)
    // Falls back to a simple log if no SMTP configured
    const { error } = await supabase.auth.admin.sendRawEmail({
      to: email,
      subject: '⚠️ Item in your driversCraft cart is sold out',
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 2rem; background: #f0f5ec;">
          <div style="background: #1a4a35; padding: 1.5rem 2rem; border-radius: 8px 8px 0 0;">
            <h1 style="color: #f0f5ec; font-family: Georgia, serif; margin: 0; font-size: 1.5rem;">
              drivers<span style="color: #c8a84b;">Craft</span>.
            </h1>
          </div>
          <div style="background: #fff; padding: 2rem; border-radius: 0 0 8px 8px; border: 1px solid #e2ead9;">
            <p style="color: #2a4035; font-size: 1rem;">Hey ${firstName},</p>
            <p style="color: #2a4035; line-height: 1.7;">
              Unfortunately the following item(s) in your cart have sold out:
            </p>
            <div style="background: #fff5f5; border: 1px solid #fcc; border-radius: 6px; padding: 1rem 1.25rem; margin: 1.25rem 0;">
              ${items.map((name: string) => `<p style="color: #c0392b; margin: 0.3rem 0; font-weight: 600;">✕ ${name}</p>`).join('')}
            </div>
            <p style="color: #5a7a6a; font-size: 0.9rem; line-height: 1.7;">
              These items have been greyed out in your cart and you won't be charged for them. 
              You can remove them and continue to checkout with any remaining items.
            </p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" 
               style="display: inline-block; margin-top: 1.25rem; background: #0e6640; color: #f0f5ec; 
                      padding: 0.75rem 1.75rem; border-radius: 4px; text-decoration: none; 
                      font-weight: 600; font-size: 0.9rem;">
              Browse Other Gear →
            </a>
            <p style="color: #5a7a6a; font-size: 0.8rem; margin-top: 2rem; border-top: 1px solid #e2ead9; padding-top: 1rem;">
              You're receiving this because you have an account at driversCraft.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      // Silently log — don't fail the request over a notification
      console.error('Sold-out email error:', error.message)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('notify-soldout error:', err)
    return NextResponse.json({ ok: true }) // always return ok — non-critical
  }
}
