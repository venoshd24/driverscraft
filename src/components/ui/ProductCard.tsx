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
    <div className="card" style={{ overflow: 'hidden', cursor: 'default' }}>
      {/* Image area */}
      <div style={{
        height: 260, background: 'var(--cream-dark)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '5rem', position: 'relative', overflow: 'hidden',
      }}>
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
        {product.emoji}
      </div>

      {/* Info */}
      <div style={{ padding: '1.2rem' }}>
        <div className="font-mono" style={{ fontSize: '0.63rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          {product.category}
        </div>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>{product.name}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem', lineHeight: 1.5 }}>{product.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--green-brand)' }}>
            ${(product.price / 100).toFixed(2)}
          </div>
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
