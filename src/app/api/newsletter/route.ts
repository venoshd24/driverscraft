// src/app/api/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}))

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Upsert — silently succeed if already subscribed
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: email.toLowerCase(), active: true }, { onConflict: 'email' })

  if (error) {
    console.error('[newsletter] DB error:', error.message)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }

  // Send welcome email
  try {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, NEXT_PUBLIC_SITE_URL } = process.env
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      const nodemailer = (await import('nodemailer')).default
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST, port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        tls: { rejectUnauthorized: false },
      })
      await transporter.sendMail({
        from: SMTP_FROM || `driversCraft <${SMTP_USER}>`,
        to: email,
        subject: '🏁 Welcome to the driversCraft grid',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f0f5ec;padding:2rem;">
            <div style="background:#1a4a35;padding:1.5rem 2rem;border-radius:8px 8px 0 0;">
              <h1 style="color:#f0f5ec;font-family:Georgia,serif;margin:0;font-size:1.5rem;">
                drivers<span style="color:#c8a84b;">Craft</span>.
              </h1>
            </div>
            <div style="background:#fff;padding:2rem;border-radius:0 0 8px 8px;border:1px solid #e2ead9;">
              <p style="color:#2a4035;font-size:1.1rem;font-weight:700;">You're on the grid. 🏎️</p>
              <p style="color:#2a4035;line-height:1.7;">
                Thanks for subscribing to driversCraft. You'll hear from us when new drops land,
                articles go live, and Kickback meets are announced.
              </p>
              <p style="color:#5a7a6a;font-size:0.9rem;line-height:1.7;">No spam. No noise. Just the good stuff.</p>
              <a href="${NEXT_PUBLIC_SITE_URL || 'https://driverscraft.vercel.app'}"
                 style="display:inline-block;margin-top:1.25rem;background:#0e6640;color:#f0f5ec;
                        padding:0.75rem 1.75rem;border-radius:4px;text-decoration:none;
                        font-weight:600;font-size:0.9rem;">
                Visit driversCraft →
              </a>
              <p style="color:#9ab;font-size:0.72rem;margin-top:2rem;border-top:1px solid #e2ead9;padding-top:1rem;">
                You subscribed at driverscraft.vercel.app. To unsubscribe, reply with "unsubscribe".
              </p>
            </div>
          </div>
        `,
      })
    }
  } catch (e) {
    console.warn('[newsletter] Email send failed (non-critical):', e)
  }

  return NextResponse.json({ ok: true })
}
