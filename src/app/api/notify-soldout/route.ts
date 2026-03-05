// src/app/api/notify-soldout/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, items, firstName } = await request.json()
    if (!email || !items?.length) return NextResponse.json({ ok: true })

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn('[notify-soldout] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in env vars.')
      return NextResponse.json({ ok: true, skipped: 'no smtp config' })
    }

    // Dynamic import to avoid bundling issues
    const nodemailer = (await import('nodemailer')).default

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: { rejectUnauthorized: false }, // needed for some SMTP hosts
    })

    // Verify connection before sending
    await transporter.verify()

    const name = firstName || 'there'
    const itemsHtml = items
      .map((n: string) => `<p style="color:#c0392b;margin:0.3rem 0;font-weight:600;">✕ ${n}</p>`)
      .join('')

    const info = await transporter.sendMail({
      from: SMTP_FROM || `driversCraft <${SMTP_USER}>`,
      to: email,
      subject: '⚠️ Item in your driversCraft cart is sold out',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f0f5ec;padding:2rem;">
          <div style="background:#1a4a35;padding:1.5rem 2rem;border-radius:8px 8px 0 0;">
            <h1 style="color:#f0f5ec;font-family:Georgia,serif;margin:0;font-size:1.5rem;">
              drivers<span style="color:#c8a84b;">Craft</span>.
            </h1>
          </div>
          <div style="background:#fff;padding:2rem;border-radius:0 0 8px 8px;border:1px solid #e2ead9;">
            <p style="color:#2a4035;font-size:1rem;">Hey ${name},</p>
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
            <p style="color:#5a7a6a;font-size:0.78rem;margin-top:2rem;border-top:1px solid #e2ead9;padding-top:1rem;">
              You're receiving this because you have a driversCraft account.
            </p>
          </div>
        </div>
      `,
    })

    console.log('[notify-soldout] Email sent:', info.messageId)
    return NextResponse.json({ ok: true, messageId: info.messageId })

  } catch (err: any) {
    // Log the actual error so you can debug from Vercel logs
    console.error('[notify-soldout] Error:', err?.message || err)
    return NextResponse.json({ ok: true, error: err?.message }) // always 200 — non-critical
  }
}
