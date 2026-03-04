'use client'
// src/components/layout/CartDrawer.tsx

import { useCart } from '@/lib/cart-context'
import { loadStripe } from '@stripe/stripe-js'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CartDrawer() {
  const { items, removeItem, changeQty, total, clearCart } = useCart()
  const router = useRouter()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      const drawer = document.getElementById('cart-drawer')
      if (drawer?.classList.contains('open') && !drawer.contains(e.target as Node)) {
        drawer.classList.remove('open')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleCheckout() {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) {
      document.getElementById('cart-drawer')?.classList.remove('open')
      router.push('/auth/login?redirect=/shop')
      return
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    const { url, error } = await res.json()
    if (error) { alert('Checkout error: ' + error); return }
    window.location.href = url
  }

  return (
    <>
      {/* Backdrop */}
      <div
        id="cart-backdrop"
        style={{
          position: 'fixed', inset: 0, zIndex: 1400,
          background: 'rgba(13,31,23,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'none',
          cursor: 'pointer',
        }}
        onClick={() => document.getElementById('cart-drawer')?.classList.remove('open')}
      />

      <div
        id="cart-drawer"
        ref={drawerRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1500,
          width: 400, background: 'var(--white)',
          boxShadow: '-20px 0 60px rgba(14,102,64,0.15)',
          transform: 'translateX(100%)', transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
        }}
        className="cart-drawer-el"
      >
        {/* Inject open class logic via CSS trick */}
        <style>{`
          .cart-drawer-el.open { transform: none !important; }
          .cart-drawer-el.open ~ * #cart-backdrop { display: block !important; }
          #cart-drawer.open { transform: none !important; }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--cream-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h3 className="font-serif" style={{ fontSize: '1.3rem' }}>Your Cart 🛒</h3>
          <button
            onClick={() => document.getElementById('cart-drawer')?.classList.remove('open')}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
          >✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
              <p>Your cart is empty.</p>
              <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>Add some gear to get started!</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: '1rem 0', borderBottom: '1px solid var(--cream-dark)',
            }}>
              <div style={{
                width: 64, height: 64, background: 'var(--cream-dark)', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', flexShrink: 0,
              }}>{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 3 }}>{item.name}</div>
                <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--green-brand)' }}>
                  ${(item.price / 100).toFixed(2)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  {[[-1,'−'],[1,'+']].map(([d, label]) => (
                    <button key={String(d)} onClick={() => changeQty(item.id, Number(d))} style={{
                      width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--cream-dark)',
                      background: 'none', cursor: 'pointer', fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{label}</button>
                  ))}
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}>🗑</button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '1.25rem', borderTop: '1px solid var(--cream-dark)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>
              <span>Total</span>
              <span className="font-mono" style={{ color: 'var(--green-brand)' }}>${(total / 100).toFixed(2)}</span>
            </div>
            <button className="btn btn-green btn-full btn-lg" onClick={handleCheckout}>
              Checkout with Stripe →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
