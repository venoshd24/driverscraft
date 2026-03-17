'use client'
// src/app/shop/product/[id]/ProductDetailClient.tsx

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { showToast } from '@/components/ui/Toast'

const SIZE_GUIDE = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export default function ProductDetailClient({ product, gallery }: { product: any, gallery: any[] }) {
  const { addItem } = useCart()
  const allImages = [
    ...(product.image_url ? [{ image_url: product.image_url }] : []),
    ...gallery,
  ]
  const [activeIdx, setActiveIdx] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([])

  const sizes = product.available_sizes?.length > 0 ? product.available_sizes : (product.has_sizes ? SIZE_GUIDE : [])

  // Track recently viewed
  useEffect(() => {
    const key = 'rv_products'
    const stored = JSON.parse(localStorage.getItem(key) || '[]') as any[]
    // Save current product (trim to essential fields)
    const entry = { id: product.id, name: product.name, price: product.price, image_url: product.image_url, emoji: product.emoji, category: product.category, ts: Date.now() }
    const updated = [entry, ...stored.filter((p: any) => p.id !== product.id)].slice(0, 8)
    localStorage.setItem(key, JSON.stringify(updated))
    // Load others (exclude current)
    setRecentlyViewed(stored.filter((p: any) => p.id !== product.id).slice(0, 4))
  }, [product.id])

  function handleAdd() {
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true)
      showToast('⚠️ Please select a size')
      return
    }
    setSizeError(false)
    addItem({ ...product, selectedSize })
    showToast(`🛒 ${product.name}${selectedSize ? ` (${selectedSize})` : ''} added to cart`)
  }

  const activeImage = allImages[activeIdx]?.image_url

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem clamp(1.25rem,5vw,5rem) 3rem' }}>
      <div className="product-detail-grid">

        {/* ── LEFT: Images ── */}
        <div>
          {/* Main image */}
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: 'var(--cream-dark)', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            {activeImage ? (
              <Image src={activeImage} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" priority />
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

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveIdx(i)} style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: `2px solid ${i === activeIdx ? 'var(--green-brand)' : 'transparent'}`, background: 'var(--cream-dark)', cursor: 'pointer', padding: 0, position: 'relative', flexShrink: 0, transition: 'border-color 0.15s' }}>
                  {img.image_url ? <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.8rem' }}>{product.emoji}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{product.category}</div>
            <h1 className="font-serif" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, color: 'var(--text-dark)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>{product.name}</h1>
            <div style={{ fontSize: '1.8rem', fontFamily: 'DM Mono, monospace', fontWeight: 700, color: 'var(--green-brand)' }}>
              {(product.price / 100).toLocaleString('en-MY', { style: 'currency', currency: 'MYR' })}
            </div>
          </div>

          {product.description && (
            <p style={{ color: 'var(--text-mid)', lineHeight: 1.75, fontSize: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>{product.description}</p>
          )}

          {/* Size selector */}
          {sizes.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-dark)' }}>
                  Size {selectedSize ? <span style={{ color: 'var(--green-brand)' }}>— {selectedSize}</span> : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sizes.map((size: string) => (
                  <button key={size} onClick={() => { setSelectedSize(size); setSizeError(false) }} style={{
                    minWidth: 48, height: 44, borderRadius: 7, border: `2px solid ${selectedSize === size ? 'var(--green-brand)' : sizeError ? '#fca5a5' : 'var(--border)'}`,
                    background: selectedSize === size ? 'var(--green-brand)' : '#fff',
                    color: selectedSize === size ? '#fff' : 'var(--text-dark)',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                    padding: '0 0.75rem', transition: 'all 0.15s',
                  }}>{size}</button>
                ))}
              </div>
              {sizeError && <div style={{ color: '#c0392b', fontSize: '0.75rem', marginTop: '0.4rem' }}>Please select a size before adding to cart</div>}
            </div>
          )}

          {/* Stock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: product.stock === 0 ? '#e74c3c' : product.stock < 10 ? '#f39c12' : '#2ecc71' }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {product.stock === 0 ? 'Out of stock' : product.stock < 10 ? `Only ${product.stock} left` : 'In stock'}
            </span>
          </div>

          {/* Add to cart */}
          <button onClick={handleAdd} disabled={product.stock === 0} style={{
            background: product.stock === 0 ? 'rgba(0,0,0,0.1)' : 'var(--green-brand)',
            color: product.stock === 0 ? 'var(--text-muted)' : '#fff',
            border: 'none', borderRadius: 10, padding: '1rem 2rem',
            fontWeight: 700, fontSize: '1rem', cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            {product.stock === 0 ? 'Sold Out' : '+ Add to Cart'}
          </button>

          <a href="/shop" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>← Back to Shop</a>
        </div>
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border)' }}>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.25rem' }}>Recently Viewed</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {recentlyViewed.map((p: any) => (
              <Link key={p.id} href={`/shop/product/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', transition: 'transform 0.2s, box-shadow 0.2s' }} className="related-card">
                  <div style={{ height: 140, background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                    {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '3rem' }}>{p.emoji}</span>}
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 3 }}>{p.category}</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.85rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: 'var(--green-brand)', fontSize: '0.85rem' }}>
                      {(p.price / 100).toLocaleString('en-MY', { style: 'currency', currency: 'MYR' })}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
