// src/app/admin/products/edit/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export const metadata = { title: 'Edit Product — Admin' }

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: product } = await supabase.from('products').select('*').eq('id', params.id).single()
  if (!product) notFound()

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#f0f5ec' }}>
          Edit Product
        </h1>
        <p style={{ color: 'rgba(240,245,236,0.45)', marginTop: '0.3rem', fontSize: '0.9rem' }}>
          {product.emoji} {product.name}
        </p>
      </div>
      <div style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '2rem' }}>
        <ProductForm product={product} />
      </div>
    </div>
  )
}
