// src/app/admin/products/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ProductsClient from './ProductsClient'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProducts() {
    setLoading(true)
    const sb = createClient()
    const { data } = await sb
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#f0f5ec' }}>Products</h1>
          <p style={{ color: 'rgba(240,245,236,0.45)', marginTop: '0.3rem', fontSize: '0.9rem' }}>
            {loading ? 'Loading…' : `${products?.length ?? 0} products`}
          </p>
        </div>
        <Link href="/admin/products/new" style={{ textDecoration: 'none' }}>
          <button style={{
            background: '#0e6640', color: '#f0f5ec', border: 'none', borderRadius: 6,
            padding: '0.7rem 1.4rem', fontWeight: 700, fontSize: '0.85rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'DM Sans, sans-serif',
          }}>➕ Add Product</button>
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(240,245,236,0.3)', background: '#121d17', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
          Loading products…
        </div>
      ) : (
        <ProductsClient products={products || []} />
      )}
    </div>
  )
}
