// src/app/shop/page.tsx
import { createClient } from '@/lib/supabase/server'
import ShopClient from './ShopClient'
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'Shop — driversCraft' }

export default async function ShopPage({ searchParams }: { searchParams: { cat?: string } }) {
  const supabase = createClient()
  const { data: products } = await supabase.from('products').select('*').eq('active', true).order('created_at')
  return (
    <>
      <div style={{ background: 'var(--green-deep)', padding: '4rem 5rem 3rem' }}>
        <div className="section-label" style={{ color: 'var(--accent)' }}>Our Collection</div>
        <h1 className="font-serif" style={{ fontSize: 'clamp(2.2rem,4vw,3rem)', fontWeight: 900, color: 'var(--cream)', letterSpacing: '-0.02em' }}>
          The <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Merch</em>
        </h1>
        <p style={{ color: 'rgba(240,245,236,0.6)', marginTop: '0.75rem', maxWidth: 480 }}>
          Premium motorsport-inspired apparel and accessories. Race-day quality, everyday wear.
        </p>
      </div>
      <div className="section" style={{ background: 'var(--white)' }}>
        <ShopClient products={products || []} initialCat={searchParams.cat || 'all'} />
      </div>
      <Footer />
    </>
  )
}
