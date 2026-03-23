// src/app/blog/page.tsx
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'driversEdge — driversCraft' }

const PER_PAGE = 9

export default async function BlogPage({ searchParams }: { searchParams: { page?: string } }) {
  const supabase = createClient()
  const currentPage = Math.max(1, parseInt(searchParams.page || '1', 10))

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })

  const allPosts = posts || []
  const totalPages = Math.ceil(allPosts.length / PER_PAGE)
  const pagePosts = allPosts.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  return (
    <>
      {/* Header */}
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
        }}>Pit Lane</div>
        <h1 className="font-serif" style={{
          fontSize: 'clamp(2.2rem,4vw,3.5rem)', fontWeight: 900,
          color: '#f0f0f0', letterSpacing: '-0.03em',
        }}>
          drivers<span style={{ color: 'var(--accent)' }}>Edge</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.75rem', maxWidth: 480, fontSize: '0.95rem' }}>
          Race breakdowns, driver deep dives, tech explainers, and the history that defines motorsport.
        </p>
      </div>

      {/* Grid */}
      <div style={{ background: '#111', minHeight: '60vh', padding: '3rem clamp(1.25rem,5vw,5rem)' }}>
        {pagePosts.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '4rem' }}>No stories published yet.</p>
        ) : (
          <div className="blog-page-grid">
            {pagePosts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
                <article className="blog-page-card">
                  <div className="blog-page-card-img" style={
                    post.image_url ? {
                      backgroundImage: `url(${post.image_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    } : {}
                  }>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 55%)',
                      zIndex: 1,
                    }} />
                    <span style={{
                      position: 'absolute', bottom: 12, left: 14, zIndex: 2,
                      background: 'var(--accent)', color: '#1a1a1a',
                      fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em',
                      textTransform: 'uppercase', padding: '3px 9px', borderRadius: 2,
                    }}>{post.tag}</span>
                    {!post.image_url && (
                      <span style={{ fontSize: '3.5rem', opacity: 0.2, userSelect: 'none', position: 'relative', zIndex: 0 }}>{post.emoji}</span>
                    )}
                  </div>
                  <div style={{ padding: '1.1rem 1.1rem 1.25rem' }}>
                    <h3 className="font-serif" style={{
                      fontWeight: 700, fontSize: '1rem', color: '#f0f0f0',
                      lineHeight: 1.3, marginBottom: '0.4rem',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{post.title}</h3>
                    <p style={{
                      fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      marginBottom: '0.75rem',
                    }}>{post.excerpt}</p>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {post.author_name && <span>{post.author_name}</span>}
                      {post.author_name && <span>·</span>}
                      <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {post.view_count > 0 && <><span>·</span><span>👁 {post.view_count}</span></>}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '3rem', alignItems: 'center' }}>
            {/* Prev */}
            {currentPage > 1 && (
              <Link href={`/blog?page=${currentPage - 1}`} style={{
                width: 36, height: 36, borderRadius: 4, textDecoration: 'none',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem',
              }}>←</Link>
            )}

            {/* Page numbers */}
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1
              const isActive = page === currentPage
              return (
                <Link key={page} href={`/blog?page=${page}`} style={{
                  width: 36, height: 36, borderRadius: 4, textDecoration: 'none',
                  background: isActive ? 'var(--green-brand)' : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${isActive ? 'var(--green-brand)' : 'rgba(255,255,255,0.12)'}`,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: isActive ? 700 : 400,
                  transition: 'all 0.15s',
                }}>{page}</Link>
              )
            })}

            {/* Next */}
            {currentPage < totalPages && (
              <Link href={`/blog?page=${currentPage + 1}`} style={{
                width: 36, height: 36, borderRadius: 4, textDecoration: 'none',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem',
              }}>→</Link>
            )}
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}