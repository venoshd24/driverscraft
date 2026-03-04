// src/app/blog/page.tsx
import { createClient } from '@/lib/supabase/server'
import BlogCard from '@/components/ui/BlogCard'
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'Stories — driversCraft' }

export default async function BlogPage() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from('posts').select('*').eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <>
      <div style={{ background: 'var(--green-deep)', padding: '4rem 5rem 3rem' }}>
        <div className="section-label" style={{ color: 'var(--accent)' }}>Pit Lane</div>
        <h1 className="font-serif" style={{ fontSize: 'clamp(2.2rem,4vw,3rem)', fontWeight: 900, color: 'var(--cream)', letterSpacing: '-0.02em' }}>
          Stories &amp; <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Analysis</em>
        </h1>
        <p style={{ color: 'rgba(240,245,236,0.6)', marginTop: '0.75rem', maxWidth: 480 }}>
          Race breakdowns, driver deep dives, tech explainers, and the history that defines motorsport.
        </p>
      </div>

      <div className="section">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 24 }}>
          {(posts || []).map((post, i) => <BlogCard key={post.id} post={post} featured={i === 0} />)}
        </div>
        {(!posts || posts.length === 0) && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No stories published yet.</p>
        )}
      </div>
      <Footer />
    </>
  )
}
