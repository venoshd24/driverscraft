'use client'
// src/app/shop/product/[id]/ProductDetailClient.tsx

import { useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import { showToast } from '@/components/ui/Toast'

export default function ProductDetailClient({ product, gallery }: { product: any, gallery: any[] }) {
  const { addItem } = useCart()
  const allImages = [
    ...(product.image_url ? [{ image_url: product.image_url }] : []),
    ...gallery,
  ]
  const [activeIdx, setActiveIdx] = useState(0)

  function handleAdd() {
    addItem(product)
    showToast(`🛒 ${product.name} added to cart`)
  }

  const activeImage = allImages[activeIdx]?.image_url

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem clamp(1.25rem,5vw,5rem) 3rem' }}>
      <div className="product-detail-grid">
        {/* ── LEFT: Image gallery ── */}
        <div>
          {/* Main image */}
          <div style={{
            position: 'relative', borderRadius: 12, overflow: 'hidden',
            background: 'var(--cream-dark)', aspectRatio: '1/1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '0.75rem',
          }}>
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <span style={{ fontSize: '7rem' }}>{product.emoji}</span>
            )}
            {product.stock === 0 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ background: '#111', color: '#fff', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 20px', borderRadius: 4, fontSize: '0.85rem' }}>Sold Out</span>
              </div>
            )}
            {product.badge && (
              <span style={{ position: 'absolute', top: 16, left: 16, background: product.badge === 'new' ? 'var(--accent)' : 'var(--green-brand)', color: '#fff', padding: '4px 12px', borderRadius: 3, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', zIndex: 2 }}>{product.badge}</span>
            )}
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  style={{
                    width: 72, height: 72, borderRadius: 8, overflow: 'hidden',
                    border: `2px solid ${i === activeIdx ? 'var(--green-brand)' : 'transparent'}`,
                    background: 'var(--cream-dark)', cursor: 'pointer', padding: 0,
                    position: 'relative', flexShrink: 0,
                    transition: 'border-color 0.15s',
                  }}
                >
                  {img.image_url
                    ? <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '1.8rem' }}>{product.emoji}</span>
                  }
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Product info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{product.category}</div>
            <h1 className="font-serif" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, color: 'var(--text-dark)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              {product.name}
            </h1>
            <div style={{ fontSize: '1.8rem', fontFamily: 'DM Mono, monospace', fontWeight: 700, color: 'var(--green-brand)' }}>
              {(product.price / 100).toLocaleString('en-MY', { style: 'currency', currency: 'MYR' })}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p style={{ color: 'var(--text-mid)', lineHeight: 1.75, fontSize: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              {product.description}
            </p>
          )}

          {/* Stock indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              background: product.stock === 0 ? '#e74c3c' : product.stock < 10 ? '#f39c12' : '#2ecc71',
            }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {product.stock === 0 ? 'Out of stock' : product.stock < 10 ? `Only ${product.stock} left` : 'In stock'}
            </span>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            style={{
              background: product.stock === 0 ? 'rgba(0,0,0,0.15)' : 'var(--green-brand, #0e6640)',
              color: product.stock === 0 ? 'var(--text-muted)' : '#fff',
              border: 'none', borderRadius: 8, padding: '1rem 2rem',
              fontWeight: 700, fontSize: '1rem', cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.02em',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { if (product.stock > 0) (e.currentTarget as HTMLElement).style.opacity = '0.88' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          >
            {product.stock === 0 ? 'Sold Out' : '+ Add to Cart'}
          </button>

          {/* Back link */}
          <a href="/shop" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            ← Back to Shop
          </a>
        </div>
      </div>
    </div>
  )
}
