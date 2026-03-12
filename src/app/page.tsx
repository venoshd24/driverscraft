// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProductCard from '@/components/ui/ProductCard'
import BlogCard from '@/components/ui/BlogCard'
import NewsletterStrip from '@/components/ui/NewsletterStrip'
import Footer from '@/components/layout/Footer'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default async function HomePage() {
  const supabase = createClient()

  const [{ data: products }, { data: posts }] = await Promise.all([
    supabase.from('products').select('*').eq('active', true).limit(4),
    supabase.from('posts').select('*').eq('published', true).order('published_at', { ascending: false }).limit(4),
  ])

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero-section" style={{
        background: 'var(--green-deep)',
        minHeight: 'calc(100vh - var(--nav-height))',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* BG watermark */}
        <div style={{
          position: 'absolute', bottom: '-2rem', left: '-1rem',
          fontFamily: 'Playfair Display, serif', fontSize: '14rem', fontWeight: 900,
          color: 'rgba(255,255,255,0.03)', lineHeight: 1,
          pointerEvents: 'none', userSelect: 'none', zIndex: 1, whiteSpace: 'nowrap',
        }}>DC.</div>

        {/* Left */}
        <div className="animate-fade-up hero-left" style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '5rem 3rem 5rem 5rem', position: 'relative', zIndex: 2,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.3)',
            color: 'var(--accent)', padding: '6px 14px', borderRadius: 2,
            fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            width: 'fit-content', marginBottom: '2rem',
          }}>
            🏁 Motorsport Lifestyle
          </div>

          <h1 className="font-serif" style={{
            fontSize: 'clamp(3rem,5vw,5.5rem)', fontWeight: 900, lineHeight: 1.0,
            color: 'var(--cream)', marginBottom: '1.5rem', letterSpacing: '-0.03em',
          }}>
            Built for<br />
            <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>those who</em><br />
            live to drive.
          </h1>

          <p style={{
            color: 'rgba(240,245,236,0.65)', fontSize: '1.05rem', lineHeight: 1.7,
            maxWidth: 440, marginBottom: '2.5rem', fontWeight: 300,
          }}>
            Premium motorsport-inspired gear, honest race analysis,
            and a community that bleeds petrol. This is driversCraft.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/shop" className="btn btn-primary btn-lg">Shop Merch</Link>
            <Link href="/blog" className="btn btn-outline-light btn-lg">Read Stories</Link>
          </div>
        </div>

        {/* Right — Cards */}
        <div className="hero-cards-panel" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '4rem 3rem', position: 'relative', zIndex: 2,
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            transform: 'rotate(-3deg)', maxWidth: 360,
          }}>
            {[
              { emoji: '🧢', label: 'New Drop', title: 'Grid Cap Collection' },
              { emoji: '📝', label: 'Latest Story', title: "Monaco's Hidden Sector" },
              { emoji: '👕', label: 'Fan Favourite', title: 'Apex Tee — Forest' },
              { emoji: '🔥', label: 'Community', title: '2.4k Members Strong' },
            ].map((card, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '1.5rem',
                marginTop: i === 1 ? 24 : i === 3 ? -24 : 0,
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{card.emoji}</div>
                <div className="font-mono" style={{
                  fontSize: '0.62rem', color: 'var(--accent)', letterSpacing: '0.12em',
                  textTransform: 'uppercase', marginBottom: '0.3rem',
                }}>{card.label}</div>
                <div style={{ color: 'var(--cream)', fontWeight: 600, fontSize: '0.88rem' }}>{card.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED MERCH ── */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="section-header">
          <div>
            <div className="section-label">Gear Up</div>
            <h2 className="section-title">Featured <em>Merch</em></h2>
            <p className="section-sub">Limited drops, race-day quality. Designed for the paddock and the street.</p>
          </div>
          <Link href="/shop" className="btn btn-green">View All →</Link>
        </div>
        <div className="products-grid">
          {(products || []).map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 80} direction="up">
              <ProductCard product={p} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── BLOG PREVIEW ── */}
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-label">Pit Lane</div>
            <h2 className="section-title">Latest <em>Stories</em></h2>
            <p className="section-sub">Race analysis, driver profiles, and everything in between.</p>
          </div>
          <Link href="/blog" className="btn btn-dark">All Stories →</Link>
        </div>
        <div className="blog-grid">
          {(posts || []).map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 100} direction="up">
              <BlogCard post={post} featured={i === 0} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <NewsletterStrip />
      <Footer />

      <style>{`
        /* ── HERO MOBILE ── */
        @media (max-width: 768px) {
          .hero-section {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
            padding-bottom: 3rem;
          }
          .hero-left {
            padding: 3rem 1.5rem 2rem !important;
          }
          .hero-cards-panel {
            padding: 0 1.5rem 2rem !important;
          }
          .hero-cards-panel > div {
            transform: none !important;
            max-width: 100% !important;
            width: 100%;
          }
        }

        /* ── MERCH GRID MOBILE ── */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 24px;
        }
        @media (max-width: 640px) {
          .products-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
        }
        @media (max-width: 400px) {
          .products-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ── BLOG GRID MOBILE ── */
        .blog-card-featured {
          grid-row: span 2;
        }
        .blog-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 900px) {
          .blog-grid {
            grid-template-columns: 1fr 1fr;
          }
          /* first post full width on tablet */
          .blog-grid > *:first-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 560px) {
          .blog-grid {
            grid-template-columns: 1fr;
          }
          .blog-grid > *:first-child {
            grid-column: auto;
          }
          .blog-card-featured {
            grid-row: auto;
          }
        }

        /* ── SECTION HEADER MOBILE ── */
        @media (max-width: 640px) {
          .section-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          .section {
            padding: 3rem 1.25rem !important;
          }
        }
      `}</style>
    </>
  )
}
