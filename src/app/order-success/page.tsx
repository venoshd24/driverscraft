// src/app/account/page.tsx already handles ?order=success
// Add a dedicated success page too
// src/app/order-success/page.tsx
import Link from 'next/link'

export default function OrderSuccessPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <div style={{ textAlign: 'center', padding: '3rem', maxWidth: 480 }}>
        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🏁</div>
        <h1 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--green-deep)', marginBottom: '1rem' }}>
          Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Your order has been placed and is being processed. You'll receive a confirmation email from Stripe shortly.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/account" className="btn btn-green btn-lg">View My Orders</Link>
          <Link href="/shop" className="btn btn-outline btn-lg" style={{ color: 'var(--text-dark)', borderColor: 'var(--cream-dark)' }}>Keep Shopping</Link>
        </div>
      </div>
    </div>
  )
}
