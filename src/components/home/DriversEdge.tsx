'use client'
// src/components/home/DriversEdge.tsx

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Post } from '@/lib/types'

export default function DriversEdge({ posts, latestPosts }: { posts: Post[], latestPosts: Post[] }) {
  const published = posts.filter(p => p.published !== false)
  const heroSlides = published.slice(0, 5)
  const latestCards = latestPosts.length > 0 ? latestPosts : published.slice(0, 3)
  const total = heroSlides.length

  const [current, setCurrent] = useState(0)
  const [incoming, setIncoming] = useState<number | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [transitioning, setTransitioning] = useState(false)
  const [paused, setPaused] = useState(false)
  const busyRef = useRef(false)

  function go(nextIdx: number, dir: 1 | -1) {
    if (busyRef.current || nextIdx === current) return
    busyRef.current = true
    setDirection(dir)
    setIncoming(nextIdx)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitioning(true)
        setTimeout(() => {
          setCurrent(nextIdx)
          setIncoming(null)
          setTransitioning(false)
          busyRef.current = false
        }, 480)
      })
    })
  }

  function prev() { go((current - 1 + total) % total, -1); setPaused(true) }
  function next() { go((current + 1) % total, 1); setPaused(true) }
  function goTo(i: number) { if (i !== current) go(i, i > current ? 1 : -1); setPaused(true) }

  useEffect(() => {
    if (paused || total <= 1) return
    const t = setInterval(() => go((current + 1) % total, 1), 3000)
    return () => clearInterval(t)
  }, [paused, total, current])

  useEffect(() => {
    if (!paused) return
    const t = setTimeout(() => setPaused(false), 8000)
    return () => clearTimeout(t)
  }, [paused])

  if (!total) return null

  const currentExitX = transitioning ? (direction > 0 ? '-100%' : '100%') : '0%'
  const incomingStartX = direction > 0 ? '100%' : '-100%'
  const incomingEndX = transitioning ? '0%' : incomingStartX

  return (
    <section style={{ background: '#0d0d0d', padding: '5rem 0 4rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ width: 'fit-content', margin: '0 auto', marginBottom: '0.75rem' }}>
          <div style={{
            display: 'inline-flex', color: 'var(--accent)',
            background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.2)',
            padding: '4px 14px', borderRadius: 2,
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>Pit Lane</div>
        </div>
        <h2 className="font-serif" style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900,
          color: '#f0f0f0', letterSpacing: '-0.02em',
        }}>
          drivers<span style={{ color: 'var(--accent)' }}>Edge</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
          Race analysis, driver profiles, and everything in between.
        </p>
      </div>

      {/* ── CAROUSEL — Most Read ── */}
      <div style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>🔥 Most Read</span>
        </div>
        <div style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(340px, 60vw, 600px)',
          overflow: 'hidden',
          background: '#111',
        }}>
          <SlidePanel
            post={heroSlides[current]}
            slideIndex={current}
            total={total}
            translateX={currentExitX}
            animate={transitioning}
          />
          {incoming !== null && (
            <SlidePanel
              post={heroSlides[incoming]}
              slideIndex={incoming}
              total={total}
              translateX={incomingEndX}
              startX={incomingStartX}
              animate={transitioning}
            />
          )}
          {(['←', '→'] as const).map((arrow, idx) => (
            <button key={arrow} onClick={idx === 0 ? prev : next} style={{
              position: 'absolute',
              [idx === 0 ? 'left' : 'right']: 16,
              top: '50%', transform: 'translateY(-50%)',
              zIndex: 20,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)', color: '#fff',
              width: 46, height: 46, borderRadius: '50%',
              cursor: 'pointer', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{arrow}</button>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.25rem' }}>
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === current ? 28 : 8, height: 4, borderRadius: 2,
              background: i === current ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* ── LATEST CARDS ── */}
      {latestCards.length > 0 && (
        <div style={{ padding: '2.5rem clamp(1.25rem,5vw,5rem) 0' }}>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
            marginBottom: '1.25rem',
          }}>Latest</div>
          <div className="de-cards-grid">
            {latestCards.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div className="de-card">
                  <div className="de-card-img" style={post.image_url ? {
                    backgroundImage: `url(${post.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  } : {
                    background: '#1a2e22',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {/* Gradient overlay always present */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%)', zIndex: 1 }} />
                    {/* Emoji fallback when no image */}
                    {!post.image_url && (
                      <span style={{ fontSize: '3.5rem', position: 'relative', zIndex: 2, opacity: 0.4 }}>{post.emoji}</span>
                    )}
                    <span style={{
                      position: 'absolute', bottom: 10, left: 12, zIndex: 3,
                      background: 'var(--accent)', color: '#1a1a1a',
                      fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em',
                      textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2,
                    }}>{post.tag}</span>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div className="font-serif" style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f0f0f0', lineHeight: 1.3, marginBottom: '0.5rem' }}>{post.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {post.author_name && <span>{post.author_name}</span>}
                      <span>·</span>
                      <span>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : new Date((post as any).created_at || '').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        }
                      </span>
                      {(post as any).view_count > 0 && (
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>· 👁 {(post as any).view_count.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <Link href="/blog" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)',
          padding: '0.7rem 2rem', borderRadius: 4, textDecoration: 'none',
          fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em',
        }}>All Stories on driversEdge →</Link>
      </div>
    </section>
  )
}

function SlidePanel({
  post, slideIndex, total, translateX, startX, animate,
}: {
  post: Post
  slideIndex: number
  total: number
  translateX: string
  startX?: string
  animate: boolean
}) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      transform: `translateX(${translateX})`,
      transition: animate ? 'transform 0.48s cubic-bezier(0.77,0,0.18,1)' : 'none',
      willChange: 'transform',
    }}>
      {/* Background: real image or dark gradient with emoji */}
      {post.image_url ? (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${post.image_url})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #0d1f17 0%, #1a3528 50%, #0d1f17 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '8rem', opacity: 0.15 }}>{post.emoji}</span>
        </div>
      )}

      {/* Overlays */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,13,0.92) 0%, rgba(13,13,13,0.35) 55%, rgba(13,13,13,0.2) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(13,13,13,0.5) 0%, transparent 65%)' }} />

      {/* Counter */}
      <div style={{
        position: 'absolute', top: 20, right: 24, zIndex: 2,
        fontFamily: 'monospace', fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em',
      }}>{String(slideIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>

      {/* Content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
        padding: 'clamp(1.5rem,4vw,3rem)',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
      }}>
        <span style={{
          display: 'inline-block', width: 'fit-content',
          background: 'var(--accent)', color: '#1a1a1a',
          fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em',
          textTransform: 'uppercase', padding: '4px 12px', borderRadius: 2,
        }}>{post.tag}</span>

        <h3 className="font-serif" style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.6rem)', fontWeight: 800,
          color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 680,
        }}>{post.title}</h3>

        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.92rem', maxWidth: 540, lineHeight: 1.6 }}>
          {post.excerpt?.slice(0, 130)}{(post.excerpt?.length || 0) > 130 ? '…' : ''}
        </p>

        <Link href={`/blog/${post.slug}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: 'var(--accent)', fontWeight: 700, fontSize: '0.88rem',
          textDecoration: 'none', width: 'fit-content', marginTop: '0.25rem',
        }}>Read Full Story →</Link>
        {(post as any).view_count > 0 && (
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.25rem' }}>
            👁 {(post as any).view_count.toLocaleString()} views
          </span>
        )}
      </div>
    </div>
  )
}
