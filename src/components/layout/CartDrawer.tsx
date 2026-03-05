'use client'
// src/components/layout/CartDrawer.tsx

import { useCart } from '@/lib/cart-context'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

export default function CartDrawer() {
  const { items, removeItem, changeQty, total, clearCart, checkStock, hasSoldOut } = useCart()
  const router = useRouter()
  const drawerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [checkingStock, setCheckingStock] = useState(false)

  // Watch for drawer open via class and run stock check
  useEffect(() => {
    const drawer = document.getElementById('cart-drawer')
    if (!drawer) return

    const observer = new MutationObserver(async () => {
      const opened = drawer.classList.contains('open')
      if (opened && !isOpen) {
        setIsOpen(true)
        setCheckingStock(true)
        const result = await checkStock()
        setCheckingStock(false)

        const { hadSoldOut, deletedNames } = result || {}

        // Notify about deleted products
        if (deletedNames?.length) {
          showToast(`🗑 ${deletedNames.length} item(s) removed — no longer available`)
        }

        // Notify about sold-out products and send email
        if (hadSoldOut) {
          showToast('⚠️ Some items in your cart are now sold out')
          const sb = createClient()
          const { data: { user } } = await sb.auth.getUser()
          if (user) {
            // Get sold-out items after state update settles
            setTimeout(async () => {
              const soldOutItems = items.filter(i => i.soldOut)
              if (soldOutItems.length) {
                await fetch('/api/notify-soldout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: user.email,
                    firstName: user.user_metadata?.first_name || '',
                    items: soldOutItems.map(i => i.name),
                  }),
                })
              }
            }, 500)
          }
        }
      } else if (!opened) {
        setIsOpen(false)
      }
    })

    observer.observe(drawer, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [checkStock, items, isOpen])

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
    // Block checkout if sold-out items exist
    if (hasSoldOut) {
      showToast('⚠️ Please remove sold-out items before checking out')
      return
    }

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
          display: 'none', cursor: 'pointer',
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
        <style>{`
          .cart-drawer-el.open { transform: none !important; }
          #cart-drawer.open { transform: none !important; }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--cream-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 className="font-serif" style={{ fontSize: '1.3rem' }}>Your Cart 🛒</h3>
            {checkingStock && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>checking stock…</span>
            )}
          </div>
          <button
            onClick={() => document.getElementById('cart-drawer')?.classList.remove('open')}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
          >✕</button>
        </div>

        {/* Sold-out banner */}
        {hasSoldOut && (
          <div style={{
            background: 'rgba(192,57,43,0.08)', borderBottom: '1px solid rgba(192,57,43,0.15)',
            padding: '0.75rem 1.5rem', fontSize: '0.82rem', color: '#c0392b',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            ⚠️ Some items are sold out. Please remove them to continue to checkout.
          </div>
        )}

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
              opacity: item.soldOut ? 0.55 : 1,
              transition: 'opacity 0.2s',
            }}>
              {/* Image */}
              <div style={{
                width: 64, height: 64, borderRadius: 6, flexShrink: 0,
                background: item.soldOut ? '#e8e8e8' : 'var(--cream-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', position: 'relative', filter: item.soldOut ? 'grayscale(1)' : 'none',
              }}>
                {item.emoji}
                {item.soldOut && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 6,
                    background: 'rgba(255,255,255,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.05em',
                    textTransform: 'uppercase', color: '#c0392b',
                  }}>sold out</div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 3, color: item.soldOut ? 'var(--text-muted)' : 'var(--text-dark)' }}>
                  {item.name}
                </div>
                {item.soldOut ? (
                  <div style={{ fontSize: '0.78rem', color: '#c0392b', fontWeight: 600 }}>
                    ✕ Out of stock
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.id)}
                style={{
                  background: item.soldOut ? 'rgba(192,57,43,0.1)' : 'none',
                  border: item.soldOut ? '1px solid rgba(192,57,43,0.2)' : 'none',
                  borderRadius: 4, cursor: 'pointer', color: item.soldOut ? '#c0392b' : 'var(--text-muted)',
                  fontSize: '0.8rem', padding: item.soldOut ? '4px 8px' : '0',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: item.soldOut ? 600 : 400,
                }}
              >{item.soldOut ? 'Remove' : '🗑'}</button>
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
            <button
              className={`btn btn-full btn-lg ${hasSoldOut ? 'btn-outline' : 'btn-green'}`}
              onClick={handleCheckout}
              style={hasSoldOut ? { color: 'var(--text-muted)', borderColor: 'var(--cream-dark)', cursor: 'not-allowed' } : {}}
            >
              {hasSoldOut ? 'Remove sold-out items first' : 'Checkout with Stripe →'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
