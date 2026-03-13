// src/app/admin/products/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProductsClient from './ProductsClient'

export const metadata = { title: 'Products — Admin' }

export default async function AdminProductsPage() {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('products').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#f0f5ec' }}>Products</h1>
          <p style={{ color: 'rgba(240,245,236,0.45)', marginTop: '0.3rem', fontSize: '0.9rem' }}>{products?.length ?? 0} products</p>
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
      <ProductsClient products={products || []} />
    </div>
  )
}
