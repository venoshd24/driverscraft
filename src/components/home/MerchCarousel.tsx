'use client'
// src/components/home/MerchCarousel.tsx

import { useState, useEffect } from 'react'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-context'
import { showToast } from '@/components/ui/Toast'

const VISIBLE_DESKTOP = 3

export default function MerchCarousel({ products }: { products: Product[] }) {
  const [start, setStart] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const visible_count = isMobile ? 1 : VISIBLE_DESKTOP
  const total = products.length
  const maxStart = Math.max(0, total - visible_count)

  function prev() { setStart(i => i <= 0 ? maxStart : i - 1) }
  function next() { setStart(i => i >= maxStart ? 0 : i + 1) }

  if (!total) return null

  const visible = products.slice(start, start + visible_count)

  return (
    <section className="section merch-carousel-section">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="section-label" style={{ justifyContent: 'center', display: 'flex' }}>Gear Up</div>
        <h2 className="section-title" style={{ textAlign: 'center' }}>Featured <em>Merch</em></h2>
        <p className="section-sub" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
          Limited drops, race-day quality. Designed for the paddock and the street.
        </p>
      </div>

      {/* Carousel row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: 1100, margin: '0 auto', padding: '0 1rem' }}>
        {/* Prev arrow */}
        <button className="merch-arrow" onClick={prev} aria-label="Previous">←</button>

        {/* 3 cards desktop / 1 card mobile */}
        <div className="merch-cards-grid">
          {visible.map((p) => (
            <div key={p.id} className="merch-card-item"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
            >
              {/* Image area */}
              <div style={{
                background: 'var(--cream-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 200, position: 'relative',
              }}>
                {p.badge && (
                  <span className={`badge ${p.badge === 'new' ? 'badge-accent' : 'badge-green'}`}
                    style={{ position: 'absolute', top: 12, left: 12 }}>{p.badge}</span>
                )}
                {p.stock === 0 && (
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(0,0,0,0.55)', color: '#fff',
                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', padding: '3px 9px', borderRadius: 2,
                  }}>SOLD OUT</span>
                )}
                <span style={{ fontSize: '4.5rem' }}>{p.emoji}</span>
              </div>

              {/* Body */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.4rem' }}>
                <div className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {p.category}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)', lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--green-brand)' }}>
                    {(p.price / 100).toLocaleString('en-MY', { style: 'currency', currency: 'MYR' })}
                  </span>
                  <button
                    className="btn btn-dark btn-sm"
                    onClick={() => { addItem(p); showToast(`🛒 ${p.name} added`) }}
                    disabled={p.stock === 0}
                  >
                    {p.stock === 0 ? 'Sold Out' : '+ Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next arrow */}
        <button className="merch-arrow" onClick={next} aria-label="Next">→</button>
      </div>

      {/* Position dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.75rem' }}>
        {Array.from({ length: maxStart + 1 }).map((_, i) => (
          <button key={i} onClick={() => setStart(i)} style={{
            width: i === start ? 24 : 8, height: 8, borderRadius: 4,
            background: i === start ? 'var(--green-brand)' : 'var(--border)',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'all 0.3s ease',
          }} aria-label={`Page ${i + 1}`} />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <a href="/shop" className="btn btn-green">View All Merch →</a>
      </div>
    </section>
  )
}
