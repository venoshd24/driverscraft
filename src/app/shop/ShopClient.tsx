'use client'
// src/app/shop/ShopClient.tsx

import { useState } from 'react'
import ProductCard from '@/components/ui/ProductCard'
import { Product } from '@/lib/types'

const CATS = ['all', 'apparel', 'headwear', 'accessories']

export default function ShopClient({ products, initialCat }: { products: Product[]; initialCat: string }) {
  const [cat, setCat] = useState(initialCat)
  const filtered = cat === 'all' ? products : products.filter(p => p.category === cat)

  return (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        {CATS.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`btn ${cat === c ? 'btn-green' : 'btn-outline'}`}
            style={cat !== c ? { color: 'var(--text-dark)', borderColor: 'var(--cream-dark)' } : {}}
          >
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 24 }}>
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      {filtered.length === 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No products in this category yet.</p>
      )}
    </>
  )
}
