'use client'
// src/components/ui/ProductCard.tsx

import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-context'
import { showToast } from './Toast'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    showToast(`🛒 ${product.name} added to cart`)
  }

  return (
    <Link href={`/shop/product/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="product-card">
        <div className="product-card-img">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
            />
          ) : (
            <>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(14,102,64,0.08) 0%,transparent 60%)' }} />
              <span style={{ position: 'relative', zIndex: 1, fontSize: '4rem' }}>{product.emoji}</span>
            </>
          )}
          {product.badge && (
            <span className={`badge ${product.badge === 'new' ? 'badge-accent' : 'badge-green'}`}
              style={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
              {product.badge}
            </span>
          )}
          {product.stock === 0 && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ background: '#111', color: 'rgba(240,245,236,0.6)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 2 }}>Sold Out</span>
            </div>
          )}
        </div>
        <div className="product-card-body">
          <div>
            <div className="font-mono" style={{ fontSize: '0.63rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>{product.category}</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem', color: 'var(--text-dark)' }}>{product.name}</div>
            <div className="product-card-desc">{product.description}</div>
          </div>
          <div className="product-card-footer">
            <span className="product-card-price">{(product.price / 100).toLocaleString('en-MY', { style: 'currency', currency: 'MYR' })}</span>
            <button className="btn btn-dark btn-sm" onClick={handleAdd} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Sold Out' : '+ Add'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
