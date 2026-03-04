'use client'
// src/components/admin/PostForm.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'

const TAGS = ['Race Analysis', 'Tech Deep Dive', 'History', 'Driver Profile', 'News', 'Opinion']
const EMOJIS = ['🏁', '🚀', '🌧️', '👤', '🏎️', '⚙️', '🏆', '📊', '🔥', '💡']

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function PostForm({ post }: { post?: any }) {
  const router = useRouter()
  const isEdit = !!post

  const [form, setForm] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    tag: post?.tag || 'Race Analysis',
    author_name: post?.author_name || '',
    author_initials: post?.author_initials || '',
    emoji: post?.emoji || '🏁',
    featured: post?.featured ?? false,
    published: post?.published ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)

  function set(key: string, val: any) { setForm(f => ({ ...f, [key]: val })) }

  function handleTitleChange(val: string) {
    set('title', val)
    if (!isEdit) set('slug', slugify(val))
  }

  function handleAuthorChange(val: string) {
    set('author_name', val)
    const parts = val.trim().split(' ')
    set('author_initials', parts.map(p => p[0]?.toUpperCase() || '').join('').slice(0, 2))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.slug || !form.content) { showToast('⚠️ Title, slug and content are required'); return }

    setSaving(true)
    const sb = createClient()
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      tag: form.tag,
      author_name: form.author_name,
      author_initials: form.author_initials,
      emoji: form.emoji,
      featured: form.featured,
      published: form.published,
    }

    const { error } = isEdit
      ? await sb.from('posts').update(payload).eq('id', post!.id)
      : await sb.from('posts').insert({ ...payload, published_at: new Date().toISOString() })

    setSaving(false)
    if (error) { showToast('❌ ' + error.message); return }
    showToast(isEdit ? '✅ Article updated!' : '✅ Article published!')
    router.push('/admin/posts')
    router.refresh()
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.12)', background: '#0f1a14',
    color: '#f0f5ec', fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem',
    outline: 'none',
  }
  const labelStyle = { display: 'block', fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(240,245,236,0.5)', marginBottom: '0.5rem' }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Title *</label>
          <input style={{ ...inputStyle, fontSize: '1.05rem' }} value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Monaco's Hidden Sector: Why Turn 1 Changes Everything" required />
        </div>

        <div>
          <label style={labelStyle}>Slug *</label>
          <input style={{ ...inputStyle, fontFamily: 'DM Mono, monospace', fontSize: '0.82rem' }} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="monacos-hidden-sector" required />
          <div style={{ fontSize: '0.72rem', color: 'rgba(240,245,236,0.3)', marginTop: '0.3rem' }}>/blog/{form.slug || 'your-slug'}</div>
        </div>

        <div>
          <label style={labelStyle}>Tag</label>
          <select style={inputStyle} value={form.tag} onChange={e => set('tag', e.target.value)}>
            {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Author Name</label>
          <input style={inputStyle} value={form.author_name} onChange={e => handleAuthorChange(e.target.value)} placeholder="Rami K." />
        </div>

        <div>
          <label style={labelStyle}>Author Initials</label>
          <input style={{ ...inputStyle, fontFamily: 'DM Mono, monospace' }} value={form.author_initials} onChange={e => set('author_initials', e.target.value.slice(0,2).toUpperCase())} placeholder="RK" maxLength={2} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Excerpt</label>
          <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' } as any} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Short summary shown on the blog listing page…" />
        </div>

        {/* Emoji picker */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Cover Emoji</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EMOJIS.map(e => (
              <button key={e} type="button" onClick={() => set('emoji', e)} style={{
                width: 44, height: 44, borderRadius: 6,
                border: `2px solid ${form.emoji === e ? '#c8a84b' : 'rgba(255,255,255,0.1)'}`,
                background: form.emoji === e ? 'rgba(200,168,75,0.15)' : '#0f1a14',
                fontSize: '1.3rem', cursor: 'pointer',
              }}>{e}</button>
            ))}
          </div>
        </div>

        {/* Content editor */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Content (HTML) *</label>
            <button type="button" onClick={() => setPreview(!preview)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '0.3rem 0.75rem', color: '#f0f5ec', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {preview ? '✏️ Edit' : '👁 Preview'}
            </button>
          </div>

          {preview ? (
            <div style={{ ...inputStyle, minHeight: 320, overflowY: 'auto', padding: '1.25rem' } as any}>
              <style>{`.preview-content p{color:rgba(240,245,236,0.75);line-height:1.8;margin-bottom:1rem;font-size:0.95rem}.preview-content h2{color:#f0f5ec;font-family:Playfair Display,serif;font-size:1.35rem;margin:1.5rem 0 0.75rem;font-weight:700}.preview-content blockquote{border-left:3px solid #c8a84b;padding:0.5rem 1.25rem;color:rgba(240,245,236,0.5);font-style:italic}`}</style>
              <div className="preview-content" dangerouslySetInnerHTML={{ __html: form.content }} />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                {[
                  { label: 'H2', insert: '<h2>Heading</h2>' },
                  { label: 'P', insert: '<p>Paragraph text here.</p>' },
                  { label: 'Quote', insert: '<blockquote>Quote text here.</blockquote>' },
                  { label: 'Bold', insert: '<strong>bold text</strong>' },
                  { label: 'Link', insert: '<a href="#">link text</a>' },
                ].map(b => (
                  <button key={b.label} type="button"
                    onClick={() => set('content', form.content + '\n' + b.insert)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '0.25rem 0.65rem', color: 'rgba(240,245,236,0.6)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>
                    {b.label}
                  </button>
                ))}
              </div>
              <textarea
                style={{ ...inputStyle, minHeight: 320, resize: 'vertical', fontFamily: 'DM Mono, monospace', fontSize: '0.82rem', lineHeight: 1.6 } as any}
                value={form.content}
                onChange={e => set('content', e.target.value)}
                placeholder={'<p>Start writing your article...</p>\n<h2>Section Heading</h2>\n<p>More content here.</p>'}
                required
              />
              <div style={{ fontSize: '0.7rem', color: 'rgba(240,245,236,0.25)', marginTop: '0.3rem' }}>Write in HTML. Use the buttons above for quick inserts. Click Preview to see how it looks.</div>
            </>
          )}
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => set('featured', !form.featured)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: form.featured ? '#c8a84b' : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 2, left: form.featured ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </button>
          <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }} onClick={() => set('featured', !form.featured)}>
            {form.featured ? '⭐ Featured post' : 'Not featured'}
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => set('published', !form.published)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: form.published ? '#0e6640' : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 2, left: form.published ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </button>
          <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }} onClick={() => set('published', !form.published)}>
            {form.published ? '🟢 Published (live)' : '🔴 Draft (hidden)'}
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button type="submit" disabled={saving} style={{ background: '#0e6640', color: '#f0f5ec', border: 'none', borderRadius: 6, padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.88rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'DM Sans, sans-serif' }}>
          {saving ? 'Saving…' : isEdit ? 'Update Article' : 'Save Article'}
        </button>
        <button type="button" onClick={() => router.push('/admin/posts')} style={{ background: 'transparent', color: 'rgba(240,245,236,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
      </div>
    </form>
  )
}
