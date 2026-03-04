// src/components/ui/BlogCard.tsx
import Link from 'next/link'
import { Post } from '@/lib/types'

export default function BlogCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit', gridRow: featured ? 'span 2' : undefined }}>
      <div className="card" style={{ height: '100%', overflow: 'hidden' }}>
        <div style={{
          background: 'var(--cream-dark)',
          height: featured ? 300 : 160,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: featured ? '4rem' : '2.5rem',
        }}>
          {post.emoji}
        </div>
        <div style={{ padding: '1.4rem' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(14,102,64,0.1)',
            color: 'var(--green-brand)', fontSize: '0.63rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '3px 10px', borderRadius: 2, marginBottom: '0.7rem',
          }}>{post.tag}</span>
          <div className="font-serif" style={{
            fontWeight: 700, lineHeight: 1.25, color: 'var(--text-dark)', marginBottom: '0.7rem',
            fontSize: featured ? '1.55rem' : '0.97rem',
          }}>{post.title}</div>
          {featured && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: '1rem' }}>
              {post.excerpt}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: 'var(--green-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', color: 'var(--cream)', fontWeight: 700,
            }}>{post.author_initials}</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-dark)' }}>{post.author_name}</strong>
              {' · '}{new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
