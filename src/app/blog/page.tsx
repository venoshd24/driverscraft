// src/app/blog/page.tsx
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import BlogPageClient from './BlogPageClient'

export const metadata = { title: 'driversEdge — driversCraft' }

export default async function BlogPage({ searchParams }: { searchParams: { page?: string; tag?: string; q?: string } }) {
  const supabase = createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })

  const allPosts = posts || []

  // Get all unique tags for filter
  const allTags = Array.from(new Set(allPosts.map(p => p.tag).filter(Boolean))).sort()

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

      <BlogPageClient
        allPosts={allPosts}
        allTags={allTags}
        initialTag={searchParams.tag || ''}
        initialQ={searchParams.q || ''}
        initialPage={parseInt(searchParams.page || '1', 10)}
      />

      <Footer />
    </>
  )
}
