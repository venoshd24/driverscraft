// src/app/admin/posts/new/page.tsx
import PostForm from '@/components/admin/PostForm'

export const metadata = { title: 'New Article — Admin' }

export default function NewPostPage() {
  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#f0f5ec' }}>Write Article</h1>
        <p style={{ color: 'rgba(240,245,236,0.45)', marginTop: '0.3rem', fontSize: '0.9rem' }}>Create a new story for the blog</p>
      </div>
      <div style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '2rem' }}>
        <PostForm />
      </div>
    </div>
  )
}
