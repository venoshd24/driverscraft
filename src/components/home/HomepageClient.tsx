'use client'
// src/components/home/HomepageClient.tsx

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Product, Post } from '@/lib/types'
import { useCart } from '@/lib/cart-context'
import { showToast } from '@/components/ui/Toast'

interface Props {
  products: Product[]
  posts: Post[]
  latestProduct: Product | null
  latestPost: Post | null
}

export default function HomepageClient({ products, posts, latestProduct, latestPost }: Props) {
  return (
    <>
      <HeroSection latestProduct={latestProduct} latestPost={latestPost} products={products} />
      <MerchDropShelf products={products} />
      <EditorialSection posts={posts} />
    </>
  )
}

/* ─────────────────────────────────────────
   HERO — static identity + live floating cards
───────────────────────────────────────── */
function HeroSection({ latestProduct, latestPost, products }: { latestProduct: Product | null; latestPost: Post | null; products: Product[] }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])

  const cards = [
    {
      label: 'New Drop',
      title: latestProduct?.name || 'Grid Cap Collection',
      emoji: latestProduct?.emoji || '🧢',
      href: '/shop',
      accent: true,
    },
    {
      label: 'Latest Story',
      title: latestPost?.title || "Monaco's Hidden Sector",
      emoji: latestPost?.emoji || '📝',
      href: latestPost ? `/blog/${latestPost.slug}` : '/blog',
      accent: false,
    },
    {
      label: 'Fan Favourite',
      title: products[1]?.name || 'Apex Tee — Forest',
      emoji: products[1]?.emoji || '👕',
      href: '/shop',
      accent: false,
    },
    {
      label: 'Community',
      title: '2.4k Members Strong',
      emoji: '🔥',
      href: '/blog',
      accent: false,
    },
  ]

  return (
    <section style={{
      background: 'var(--green-deep)',
      minHeight: 'calc(100vh - var(--nav-height))',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background DC. watermark */}
      <div style={{
        position: 'absolute', bottom: '-2rem', left: '-1rem',
        fontFamily: 'Playfair Display, serif', fontSize: '14rem', fontWeight: 900,
        color: 'rgba(255,255,255,0.03)', lineHeight: 1,
        pointerEvents: 'none', userSelect: 'none', zIndex: 1, whiteSpace: 'nowrap',
      }}>DC.</div>

      {/* Subtle radial glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '10%', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(200,168,75,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* LEFT — brand statement */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'clamp(3rem,6vw,5rem) clamp(2rem,4vw,3rem) clamp(3rem,6vw,5rem) clamp(2rem,6vw,5rem)',
        position: 'relative', zIndex: 2,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(24px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
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

      {/* RIGHT — live cards */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4rem 3rem', position: 'relative', zIndex: 2,
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          transform: 'rotate(-3deg)', maxWidth: 360,
        }}>
          {cards.map((card, i) => (
            <Link key={i} href={card.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: card.accent ? 'rgba(200,168,75,0.12)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${card.accent ? 'rgba(200,168,75,0.35)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8, padding: '1.5rem',
                marginTop: i === 1 ? 24 : i === 3 ? -24 : 0,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, background 0.2s ease',
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(16px)',
                transitionDelay: `${0.2 + i * 0.1}s`,
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = i === 1 ? 'translateY(0)' : 'none')}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{card.emoji}</div>
                <div className="font-mono" style={{
                  fontSize: '0.62rem', color: 'var(--accent)', letterSpacing: '0.12em',
                  textTransform: 'uppercase', marginBottom: '0.3rem',
                }}>{card.label}</div>
                <div style={{ color: 'var(--cream)', fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.3 }}>
                  {card.title.length > 30 ? card.title.slice(0, 30) + '…' : card.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          section[data-hero] { grid-template-columns: 1fr !important; }
          section[data-hero] > div:last-child { display: none !important; }
        }
      `}</style>
    </section>
  )
}

/* ─────────────────────────────────────────
   MERCH — horizontal scroll drop shelf
───────────────────────────────────────── */
function MerchDropShelf({ products }: { products: Product[] }) {
  const { addItem } = useCart()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  function checkScroll() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll)
    return () => el.removeEventListener('scroll', checkScroll)
  }, [products])

  const dropLabels = ['NEW DROP', 'FAN FAVOURITE', 'LIMITED', 'BESTSELLER', 'JUST DROPPED', 'EXCLUSIVE']

  return (
    <section style={{ background: 'var(--white)', padding: '5rem 0' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        padding: '0 clamp(1.5rem,5vw,5rem)', marginBottom: '2.5rem',
      }}>
        <div>
          <div className="section-label">Gear Up</div>
          <h2 className="section-title" style={{ marginBottom: '0.3rem' }}>
            The Drop <em>Shelf</em>
          </h2>
          <p className="section-sub">Limited runs. Race-day quality. Designed for paddock and street.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            style={{
              width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)',
              background: canScrollLeft ? 'var(--green-brand)' : 'transparent',
              color: canScrollLeft ? '#fff' : 'var(--text-muted)',
              cursor: canScrollLeft ? 'pointer' : 'default',
              fontSize: '1rem', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >←</button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            style={{
              width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)',
              background: canScrollRight ? 'var(--green-brand)' : 'transparent',
              color: canScrollRight ? '#fff' : 'var(--text-muted)',
              cursor: canScrollRight ? 'pointer' : 'default',
              fontSize: '1rem', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >→</button>
          <Link href="/shop" className="btn btn-green" style={{ marginLeft: 8 }}>View All →</Link>
        </div>
      </div>

      {/* Scroll track */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex', gap: 20, overflowX: 'auto', scrollSnapType: 'x mandatory',
          padding: '0.5rem clamp(1.5rem,5vw,5rem) 1.5rem',
          scrollbarWidth: 'none',
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {products.map((product, i) => (
          <div key={product.id} style={{
            flex: '0 0 280px', scrollSnapAlign: 'start',
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 10, overflow: 'hidden',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            {/* Image / emoji area */}
            <div style={{
              height: 220, background: 'var(--cream-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '5rem', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(14,102,64,0.07) 0%, transparent 60%)',
              }} />
              {/* Drop label badge */}
              <div style={{
                position: 'absolute', top: 12, left: 12,
                background: i === 0 ? 'var(--accent)' : 'var(--green-brand)',
                color: i === 0 ? '#1a1a1a' : 'var(--cream)',
                fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', padding: '4px 10px', borderRadius: 2,
              }}>
                {dropLabels[i % dropLabels.length]}
              </div>
              {product.stock === 0 && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(0,0,0,0.7)', color: '#fff',
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', padding: '4px 10px', borderRadius: 2,
                }}>SOLD OUT</div>
              )}
              {product.emoji}
            </div>

            {/* Info */}
            <div style={{ padding: '1.2rem' }}>
              <div className="font-mono" style={{
                fontSize: '0.6rem', color: 'var(--text-muted)',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem',
              }}>{product.category}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                {product.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                {product.description?.slice(0, 60)}{(product.description?.length || 0) > 60 ? '…' : ''}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--green-brand)' }}>
                  ${(product.price / 100).toFixed(2)}
                </div>
                <button
                  className="btn btn-dark btn-sm"
                  onClick={() => { addItem(product); showToast(`🛒 ${product.name} added to cart`) }}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Sold Out' : '+ Add'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   ARTICLES — Turnpike editorial layout
   1 hero (full-width image area) + 3-col row
───────────────────────────────────────── */
function EditorialSection({ posts }: { posts: Post[] }) {
  const [hero, ...secondary] = posts
  if (!hero) return null

  return (
    <section style={{ background: '#f7f4ef', padding: '5rem 0' }}>
      <div style={{ padding: '0 clamp(1.5rem,5vw,5rem)' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: '2.5rem',
        }}>
          <div>
            <div className="section-label">Pit Lane</div>
            <h2 className="section-title" style={{ marginBottom: '0.3rem' }}>
              Latest <em>Stories</em>
            </h2>
            <p className="section-sub">Race analysis, driver profiles, and everything in between.</p>
          </div>
          <Link href="/blog" className="btn btn-dark">All Stories →</Link>
        </div>

        {/* Hero article */}
        <Link href={`/blog/${hero.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.1fr 1fr',
            background: 'var(--white)', borderRadius: 12, overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            cursor: 'pointer',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'
            }}
          >
            {/* Big emoji/image panel */}
            <div style={{
              background: 'var(--green-deep)', minHeight: 380,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '8rem', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(200,168,75,0.1) 0%, transparent 50%)',
              }} />
              <div style={{
                position: 'absolute', top: 20, left: 20,
                background: 'var(--accent)', color: '#1a1a1a',
                fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em',
                textTransform: 'uppercase', padding: '5px 12px', borderRadius: 2,
              }}>TOP STORY</div>
              <span style={{ position: 'relative', zIndex: 1 }}>{hero.emoji}</span>
            </div>

            {/* Content panel */}
            <div style={{
              padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <span style={{
                display: 'inline-block', background: 'rgba(14,102,64,0.1)', color: 'var(--green-brand)',
                fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '4px 12px', borderRadius: 2, marginBottom: '1.25rem', width: 'fit-content',
              }}>{hero.tag}</span>

              <h3 className="font-serif" style={{
                fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800,
                lineHeight: 1.2, color: 'var(--text-dark)', marginBottom: '1rem', letterSpacing: '-0.02em',
              }}>{hero.title}</h3>

              <p style={{
                color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7,
                marginBottom: '2rem',
              }}>
                {hero.excerpt?.slice(0, 160)}{(hero.excerpt?.length || 0) > 160 ? '…' : ''}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'var(--green-brand)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', color: 'var(--cream)', fontWeight: 700, flexShrink: 0,
                }}>{hero.author_initials}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-dark)', display: 'block' }}>{hero.author_name}</strong>
                  {new Date(hero.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'var(--green-brand)', fontWeight: 700, fontSize: '0.88rem',
              }}>
                Read Full Story <span style={{ fontSize: '1rem' }}>→</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Secondary articles — 3 column */}
        {secondary.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${secondary.length}, 1fr)`,
            gap: 20,
          }}>
            {secondary.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: 'var(--white)', borderRadius: 10, overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.07)',
                  transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                  height: '100%',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Image panel */}
                  <div style={{
                    background: 'var(--cream-dark)', height: 180,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3.5rem', position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(135deg, rgba(14,102,64,0.06) 0%, transparent 60%)',
                    }} />
                    {post.emoji}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1.25rem' }}>
                    <span style={{
                      display: 'inline-block', background: 'rgba(14,102,64,0.1)', color: 'var(--green-brand)',
                      fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                      padding: '3px 8px', borderRadius: 2, marginBottom: '0.6rem',
                    }}>{post.tag}</span>

                    <div className="font-serif" style={{
                      fontWeight: 700, fontSize: '1rem', lineHeight: 1.3,
                      color: 'var(--text-dark)', marginBottom: '0.75rem',
                    }}>{post.title}</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', background: 'var(--green-brand)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.62rem', color: 'var(--cream)', fontWeight: 700, flexShrink: 0,
                      }}>{post.author_initials}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--text-dark)' }}>{post.author_name}</strong>
                        {' · '}{new Date(post.published_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
