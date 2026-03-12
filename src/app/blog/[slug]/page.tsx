// src/app/blog/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: post } = await supabase.from('posts').select('title,excerpt').eq('slug', params.slug).single()
  return { title: post ? `${post.title} — driversCraft` : 'driversEdge — driversCraft' }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: post } = await supabase.from('posts').select('*').eq('slug', params.slug).eq('published', true).single()
  if (!post) notFound()

  return (
    <>
      {/* Hero */}
      <div style={{ background: 'var(--green-deep)', padding: '4rem 5rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Link href="/blog" style={{ color: 'rgba(240,245,236,0.55)', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '2rem' }}>
            ← Back to Stories
          </Link>
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
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 2rem 5rem' }}>
        <style>{`
          .article-body p { color: var(--text-mid); line-height: 1.85; margin-bottom: 1.25rem; font-size: 1.02rem; }
          .article-body h2 { font-family: 'Playfair Display',serif; font-size: 1.55rem; font-weight: 700; margin: 2.5rem 0 1rem; color: var(--text-dark); }
          .article-body blockquote { border-left: 3px solid var(--green-brand); padding: 0.5rem 1.5rem; margin: 1.5rem 0; font-style: italic; color: var(--text-muted); font-size: 1.05rem; }
        `}</style>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--cream-dark)' }}>
          <Link href="/blog" className="btn btn-dark">← Back to Stories</Link>
        </div>
      </div>
      <Footer />
    </>
  )
}
