// src/app/blog/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import ViewTracker from './ViewTracker'
import ReadingProgress from './ReadingProgress'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: post } = await supabase.from('posts').select('title,excerpt').eq('slug', params.slug).single()
  return { title: post ? `${post.title} — driversCraft` : 'Article — driversCraft' }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: post } = await supabase.from('posts').select('*').eq('slug', params.slug).eq('published', true).single()
  if (!post) notFound()

  return (
    <>
      <ViewTracker slug={params.slug} />
      <ReadingProgress content={post.content} title={post.title} tag={post.tag} />

      {/* Hero — data-article-hero lets ReadingProgress know when this scrolls out */}
      <div data-article-hero style={{ background: 'var(--green-deep)', padding: '4rem clamp(1.5rem,5vw,5rem) 3rem', position: 'relative' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <span style={{
            background: 'rgba(200,168,75,0.2)', border: '1px solid rgba(200,168,75,0.3)',
            color: 'var(--accent)', padding: '5px 14px', borderRadius: 2,
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            display: 'inline-block', marginBottom: '1.25rem',
          }}>{post.tag}</span>

          <h1 className="font-serif" style={{
            fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, color: 'var(--cream)',
            lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.5rem',
          }}>{post.title}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.78rem', color: 'var(--green-deep)', fontWeight: 700,
            }}>{post.author_initials}</div>
            <div style={{ color: 'rgba(240,245,236,0.65)', fontSize: '0.88rem' }}>
              <strong style={{ color: 'var(--cream)' }}>{post.author_name}</strong>
              {' · '}{new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              {post.view_count > 0 && (
                <span style={{ marginLeft: 12, opacity: 0.5 }}>· {post.view_count.toLocaleString()} views</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cover image */}
      {post.image_url && (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 2rem 0' }}>
          <img src={post.image_url} alt={post.title} style={{ width: '100%', borderRadius: 10, display: 'block', maxHeight: 420, objectFit: 'cover' }} />
        </div>
      )}

      {/* Body */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 2rem 5rem' }}>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--cream-dark)' }}>
          <Link href="/blog" className="btn btn-dark">← Back to Stories</Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
