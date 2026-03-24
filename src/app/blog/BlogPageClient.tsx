'use client'
// src/app/blog/BlogPageClient.tsx

import { useState, useMemo } from 'react'
import Link from 'next/link'

const PER_PAGE = 9

const TAG_COLORS: Record<string, string> = {
  'Race Analysis': '#3b82f6',
  'Tech Deep Dive': '#8b5cf6',
  'History': '#f59e0b',
  'Driver Profile': '#10b981',
  'News': '#ef4444',
  'Opinion': '#ec4899',
}

export default function BlogPageClient({ allPosts, allTags, initialTag, initialQ, initialPage }: {
  allPosts: any[]
  allTags: string[]
  initialTag: string
  initialQ: string
  initialPage: number
}) {
  const [search, setSearch] = useState(initialQ)
  const [activeTag, setActiveTag] = useState(initialTag)
  const [page, setPage] = useState(initialPage)

  const filtered = useMemo(() => {
    let list = allPosts
    if (activeTag) list = list.filter(p => p.tag === activeTag)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.author_name?.toLowerCase().includes(q) ||
        p.tag?.toLowerCase().includes(q)
      )
    }
    return list
  }, [allPosts, activeTag, search])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const pagePosts = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleTag(tag: string) {
    setActiveTag(tag === activeTag ? '' : tag)
    setPage(1)
  }

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  return (
    <div style={{ background: '#111', minHeight: '60vh', padding: '2.5rem clamp(1.25rem,5vw,5rem)' }}>

      {/* Search + Tag filters */}
      <div style={{ marginBottom: '2rem' }}>
        {/* Search bar */}
        <div style={{ position: 'relative', maxWidth: 420, marginBottom: '1.25rem' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '0.95rem' }}>🔍</span>
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search articles…"
            style={{
              width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: '0.7rem', paddingBottom: '0.7rem',
              borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: '#f0f0f0', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {search && (
            <button onClick={() => handleSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          )}
        </div>

        {/* Tag pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => handleTag('')}
            style={{
              padding: '0.35rem 0.9rem', borderRadius: 20, border: '1px solid',
              borderColor: !activeTag ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
              background: !activeTag ? 'rgba(200,168,75,0.15)' : 'transparent',
              color: !activeTag ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}
          >All</button>
          {allTags.map(tag => {
            const color = TAG_COLORS[tag] || '#6b7280'
            const isActive = activeTag === tag
            return (
              <button key={tag} onClick={() => handleTag(tag)} style={{
                padding: '0.35rem 0.9rem', borderRadius: 20, border: '1px solid',
                borderColor: isActive ? color : 'rgba(255,255,255,0.12)',
                background: isActive ? `${color}22` : 'transparent',
                color: isActive ? color : 'rgba(255,255,255,0.5)',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}>{tag}</button>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>
        {filtered.length} article{filtered.length !== 1 ? 's' : ''}{search ? ` for "${search}"` : ''}{activeTag ? ` in ${activeTag}` : ''}
      </div>

      {/* Grid */}
      {pagePosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
          <p>No articles found. Try a different search.</p>
        </div>
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
                    background: TAG_COLORS[post.tag] || 'var(--accent)', color: '#fff',
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
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
          {page > 1 && (
            <button onClick={() => setPage(p => p - 1)} style={{ width: 36, height: 36, borderRadius: 4, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>←</button>
          )}
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{
              width: 36, height: 36, borderRadius: 4, border: '1px solid',
              borderColor: page === i + 1 ? 'var(--green-brand)' : 'rgba(255,255,255,0.12)',
              background: page === i + 1 ? 'var(--green-brand)' : 'rgba(255,255,255,0.07)',
              color: page === i + 1 ? '#fff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', fontWeight: page === i + 1 ? 700 : 400, fontSize: '0.85rem',
            }}>{i + 1}</button>
          ))}
          {page < totalPages && (
            <button onClick={() => setPage(p => p + 1)} style={{ width: 36, height: 36, borderRadius: 4, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>→</button>
          )}
        </div>
      )}
    </div>
  )
}
