// src/app/shop/page.tsx
import { createClient } from '@/lib/supabase/server'
import ShopClient from './ShopClient'
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'Shop — driversCraft' }

export default async function ShopPage({ searchParams }: { searchParams: { cat?: string } }) {
  const supabase = createClient()
  const { data: products } = await supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false })
  return (
    <>
      <div style={{
        background: '#0d0d0d',
        padding: 'calc(var(--nav-height) + 3rem) clamp(1.25rem,5vw,5rem) 3rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{
          display: 'inline-flex', color: 'var(--accent)',
          background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.2)',
          padding: '4px 14px', borderRadius: 2,
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
          marginBottom: '0.75rem',
        }}>Our Collection</div>
        <h1 className="font-serif" style={{
          fontSize: 'clamp(2.2rem,4vw,3.5rem)', fontWeight: 900,
          color: '#f0f0f0', letterSpacing: '-0.03em',
        }}>
          The <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Merch</em>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.75rem', maxWidth: 480, fontSize: '0.95rem' }}>
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
