'use client'
// src/components/ui/ProductCard.tsx

import { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-context'
import { showToast } from './Toast'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  function handleAdd() {
    addItem(product)
    showToast(`🛒 ${product.name} added to cart`)
  }

  return (
    <div className="product-card">
      {/* Image area — fixed height, never shrinks */}
      <div className="product-card-img">
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg,rgba(14,102,64,0.08) 0%,transparent 60%)',
        }} />
        {product.badge && (
          <span className={`badge ${product.badge === 'new' ? 'badge-accent' : 'badge-green'}`}
            style={{ position: 'absolute', top: 12, left: 12 }}>
            {product.badge}
          </span>
        )}
        <span style={{ position: 'relative', zIndex: 1, fontSize: '4rem' }}>{product.emoji}</span>
      </div>

      {/* Info — flex column so footer always sticks to bottom */}
      <div className="product-card-body">
        <div>
          <div className="font-mono" style={{ fontSize: '0.63rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            {product.category}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>{product.name}</div>
          <div className="product-card-desc">{product.description}</div>
        </div>
        <div className="product-card-footer">
          <span className="product-card-price">
            {(product.price / 100).toLocaleString('en-MY', { style: 'currency', currency: 'MYR' })}
          </span>
          <button
            className="btn btn-dark btn-sm"
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Sold Out' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
