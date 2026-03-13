'use client'
// src/components/admin/ImageUpload.tsx

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import Image from 'next/image'

interface Props {
  bucket: 'product-images' | 'article-images'
  currentUrl: string | null
  onUpload: (url: string) => void
  label?: string
}

export default function ImageUpload({ bucket, currentUrl, onUpload, label = 'Main Image' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) { showToast('⚠️ Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { showToast('⚠️ Image must be under 5MB'); return }

    setUploading(true)
    const sb = createClient()

    // Preview immediately
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: upErr } = await sb.storage.from(bucket).upload(path, file, { upsert: true })
    if (upErr) { showToast('❌ Upload failed: ' + upErr.message); setUploading(false); return }

    const { data } = sb.storage.from(bucket).getPublicUrl(path)
    onUpload(data.publicUrl)
    showToast('✅ Image uploaded!')
    setUploading(false)
  }

  async function removeImage() {
    setPreview(null)
    onUpload('')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontFamily: 'DM Mono, monospace',
    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    color: 'rgba(240,245,236,0.5)', marginBottom: '0.5rem',
  }

  return (
    <div>
      <label style={labelStyle}>{label}</label>

      {preview ? (
        // Image preview
        <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
            <Image
              src={preview} alt="Preview"
              fill style={{ objectFit: 'cover' }}
              unoptimized={preview.startsWith('data:')}
            />
          </div>
          <div style={{
            position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6,
          }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 5, padding: '0.3rem 0.65rem', color: '#f0f5ec', fontSize: '0.75rem', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
            >Change</button>
            <button
              type="button" onClick={removeImage}
              style={{ background: 'rgba(192,57,43,0.8)', border: '1px solid rgba(192,57,43,0.4)', borderRadius: 5, padding: '0.3rem 0.65rem', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}
            >✕</button>
          </div>
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: '#f0f5ec', fontSize: '0.88rem' }}>Uploading…</div>
            </div>
          )}
        </div>
      ) : (
        // Drop zone
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#c8a84b' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 8,
            padding: '2.5rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'rgba(200,168,75,0.05)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s',
          }}
        >
          {uploading ? (
            <div style={{ color: 'rgba(240,245,236,0.5)', fontSize: '0.88rem' }}>Uploading…</div>
          ) : (
            <>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
              <div style={{ color: 'rgba(240,245,236,0.6)', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                Drop image here or <span style={{ color: '#c8a84b', textDecoration: 'underline' }}>browse</span>
              </div>
              <div style={{ color: 'rgba(240,245,236,0.3)', fontSize: '0.72rem' }}>JPG, PNG, WebP — max 5MB</div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f) }}
      />
    </div>
  )
}
