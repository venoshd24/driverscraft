'use client'
// src/app/admin/posts/PostsClient.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'

export default function PostsClient({ posts: initial, onRefresh }: { posts: any[], onRefresh?: () => void }) {
  const [posts, setPosts] = useState(initial)

  useEffect(() => { setPosts(initial) }, [initial])

  async function togglePublished(id: string, current: boolean) {
    const sb = createClient()
    const { error } = await sb.from('posts').update({ published: !current }).eq('id', id)
    if (error) { showToast('❌ Failed to update'); return }
    setPosts(prev => prev.map(p => p.id === id ? { ...p, published: !current } : p))
    showToast(`✅ Post ${!current ? 'published' : 'unpublished'}`)
  }

  async function deletePost(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const sb = createClient()
    const { error } = await sb.from('posts').delete().eq('id', id)
    if (error) { showToast('❌ Failed to delete'); return }
    setPosts(prev => prev.filter(p => p.id !== id))
    showToast(`🗑 Article deleted`)
  }

  if (posts.length === 0) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(240,245,236,0.3)', background: '#121d17', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>No articles yet</div>
  )

  return (
    <>
      {/* ── DESKTOP TABLE ── */}
      <div className="admin-table-desktop" style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Article', 'Tag', 'Author', 'Views', 'Published', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.3)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '1rem 1.25rem', maxWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{post.emoji}</span>
                    <div style={{ color: '#f0f5ec', fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{ background: 'rgba(14,102,64,0.2)', color: '#2d8a5e', padding: '2px 8px', borderRadius: 2, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{post.tag}</span>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'rgba(240,245,236,0.6)' }}>{post.author_name}</td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'DM Mono, monospace', fontSize: '0.82rem', color: post.view_count > 0 ? '#c8a84b' : 'rgba(240,245,236,0.25)' }}>
                  {post.view_count > 0 ? `👁 ${post.view_count.toLocaleString()}` : '—'}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <button onClick={() => togglePublished(post.id, post.published)} style={{ background: post.published ? 'rgba(14,102,64,0.2)' : 'rgba(200,168,75,0.15)', border: `1px solid ${post.published ? 'rgba(14,102,64,0.4)' : 'rgba(200,168,75,0.35)'}`, borderRadius: 4, padding: '3px 10px', cursor: 'pointer', color: post.published ? '#2d8a5e' : '#c8a84b', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>
                    {post.published ? 'Live' : '● Draft'}
                  </button>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: 'rgba(240,245,236,0.4)' }}>
                  {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/blog/${post.slug}`} target="_blank" style={{ textDecoration: 'none' }}>
                      <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '0.35rem 0.6rem', color: 'rgba(240,245,236,0.5)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>👁</button>
                    </Link>
                    <Link href={`/admin/posts/edit/${post.id}`} style={{ textDecoration: 'none' }}>
                      <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '0.35rem 0.75rem', color: '#f0f5ec', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Edit</button>
                    </Link>
                    <button onClick={() => deletePost(post.id, post.title)} style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 4, padding: '0.35rem 0.75rem', color: '#e74c3c', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="admin-cards-mobile">
        {posts.map(post => (
          <div key={post.id} className="admin-card">
            <div className="admin-card-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{post.emoji}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#f0f5ec', fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                  <div style={{ color: 'rgba(240,245,236,0.45)', fontSize: '0.75rem', marginTop: 2 }}>{post.author_name}</div>
                </div>
              </div>
              <span style={{ background: 'rgba(14,102,64,0.2)', color: '#2d8a5e', padding: '2px 8px', borderRadius: 2, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>{post.tag}</span>
            </div>
            <div className="admin-card-meta">
              {post.view_count > 0 && <span style={{ color: '#c8a84b', fontSize: '0.75rem' }}>👁 {post.view_count.toLocaleString()} views</span>}
              <button onClick={() => togglePublished(post.id, post.published)} className={`admin-badge-btn ${post.published ? 'active' : 'featured'}`}>
                {post.published ? 'Live' : '● Draft'}
              </button>
            </div>
            <div className="admin-card-actions">
              <Link href={`/blog/${post.slug}`} target="_blank" style={{ textDecoration: 'none' }}>
                <button className="admin-btn-view">👁 View</button>
              </Link>
              <Link href={`/admin/posts/edit/${post.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                <button className="admin-btn-edit">Edit</button>
              </Link>
              <button className="admin-btn-delete" onClick={() => deletePost(post.id, post.title)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
