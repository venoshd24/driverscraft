// src/app/api/notify-soldout/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, items, firstName } = await request.json()
    if (!email || !items?.length) return NextResponse.json({ ok: true })

    // Only send if SMTP env vars are configured
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.log('SMTP not configured — skipping sold-out email to', email)
      return NextResponse.json({ ok: true })
    }

    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587'),
      secure: SMTP_PORT === '465',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })

    const name = firstName || 'there'
    const itemsHtml = items
      .map((n: string) => `<p style="color:#c0392b;margin:0.3rem 0;font-weight:600;">✕ ${n}</p>`)
      .join('')

    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: email,
      subject: '⚠️ Item in your driversCraft cart is sold out',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem;background:#f0f5ec;">
          <div style="background:#1a4a35;padding:1.5rem 2rem;border-radius:8px 8px 0 0;">
            <h1 style="color:#f0f5ec;font-family:Georgia,serif;margin:0;font-size:1.5rem;">
              drivers<span style="color:#c8a84b;">Craft</span>.
            </h1>
          </div>
          <div style="background:#fff;padding:2rem;border-radius:0 0 8px 8px;border:1px solid #e2ead9;">
            <p style="color:#2a4035;">Hey ${name},</p>
            <p style="color:#2a4035;line-height:1.7;">
              Unfortunately the following item(s) in your cart have sold out:
            </p>
            <div style="background:#fff5f5;border:1px solid #fcc;border-radius:6px;padding:1rem 1.25rem;margin:1.25rem 0;">
              ${itemsHtml}
            </div>
            <p style="color:#5a7a6a;font-size:0.9rem;line-height:1.7;">
              These items are greyed out in your cart and you won't be charged for them.
              Remove them to continue to checkout with any remaining items.
            </p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop"
               style="display:inline-block;margin-top:1.25rem;background:#0e6640;color:#f0f5ec;
                      padding:0.75rem 1.75rem;border-radius:4px;text-decoration:none;
                      font-weight:600;font-size:0.9rem;">
              Browse Other Gear →
            </a>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('notify-soldout error:', err)
    return NextResponse.json({ ok: true }) // non-critical, never fail
  }
}
