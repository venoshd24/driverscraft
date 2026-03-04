// src/app/admin/posts/edit/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PostForm from '@/components/admin/PostForm'

export const metadata = { title: 'Edit Article — Admin' }

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: post } = await supabase.from('posts').select('*').eq('id', params.id).single()
  if (!post) notFound()

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#f0f5ec' }}>Edit Article</h1>
        <p style={{ color: 'rgba(240,245,236,0.45)', marginTop: '0.3rem', fontSize: '0.9rem' }}>{post.emoji} {post.title}</p>
      </div>
      <div style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '2rem' }}>
        <PostForm post={post} />
      </div>
    </div>
  )
}
