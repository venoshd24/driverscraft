// src/app/shop/product/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import ProductDetailClient from './ProductDetailClient'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: p } = await supabase.from('products').select('name,description').eq('id', params.id).single()
  return { title: p ? `${p.name} — driversCraft` : 'Product — driversCraft' }
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .eq('active', true)
    .single()

  if (!product) notFound()

  // Get extra gallery images for this product
  const { data: gallery } = await supabase
    .from('product_gallery')
    .select('*')
    .eq('product_id', params.id)
    .order('sort_order', { ascending: true })

  // Related products (same category, exclude current)
  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .eq('category', product.category)
    .neq('id', params.id)
    .limit(3)

  return (
    <>
      <div style={{ minHeight: '100vh', background: 'var(--cream-light, #f5f7f2)' }}>
        {/* Breadcrumb */}
        <div style={{ padding: '1.5rem clamp(1.25rem,5vw,5rem) 0', maxWidth: 1200, margin: '0 auto' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href="/shop" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Shop</Link>
            <span>›</span>
            <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{product.name}</span>
          </nav>
        </div>

        {/* Main product section */}
        <ProductDetailClient product={product} gallery={gallery || []} />

        {/* Related products */}
        {related && related.length > 0 && (
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem clamp(1.25rem,5vw,5rem)' }}>
            <h2 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
              More from {product.category}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {related.map((p: any) => (
                <Link key={p.id} href={`/shop/product/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }} className="related-card">
                    <div style={{ height: 180, background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '3.5rem' }}>{p.emoji}</span>
                      }
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>{p.category}</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>{p.name}</div>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: 'var(--green-brand)', fontSize: '0.95rem' }}>
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
      <Footer />
    </>
  )
}
