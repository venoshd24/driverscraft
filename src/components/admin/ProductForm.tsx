'use client'
// src/components/admin/ProductForm.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import { Product } from '@/lib/types'
import ImageUpload from './ImageUpload'

const EMOJIS = ['👕','🧥','👔','🧶','🧢','🎩','👜','🏷️','🏎️','🏁','🔧','⚙️']

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product ? (product.price / 100).toFixed(2) : '',
    category: product?.category || 'apparel',
    emoji: product?.emoji || '👕',
    badge: product?.badge || '',
    stock: product?.stock?.toString() || '100',
    active: product?.active ?? true,
    image_url: product?.image_url || '',
    has_sizes: product?.has_sizes ?? false,
    available_sizes: (product?.available_sizes || []).join(', '),
  })
  const [saving, setSaving] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])

  useEffect(() => {
    if (!isEdit || !product?.id) return
    const sb = createClient()
    sb.from('product_gallery').select('image_url').eq('product_id', product.id).order('sort_order').then(({ data }) => {
      if (data) setGalleryUrls(data.map((r: any) => r.image_url))
    })
  }, [isEdit, product?.id])

  function set(key: string, val: any) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.price) { showToast('⚠️ Name and price are required'); return }

    setSaving(true)
    const sb = createClient()
    const payload = {
      name: form.name,
      description: form.description,
      price: Math.round(parseFloat(form.price) * 100),
      category: form.category,
      emoji: form.emoji,
      badge: form.badge || null,
      stock: parseInt(form.stock) || 0,
      active: form.active,
      image_url: form.image_url || null,
      has_sizes: form.has_sizes,
      available_sizes: form.has_sizes
        ? form.available_sizes.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean)
        : [],
    }

    const { error } = isEdit
      ? await sb.from('products').update(payload).eq('id', product!.id)
      : await sb.from('products').insert(payload)

    setSaving(false)
    if (error) { showToast('❌ ' + error.message); return }
    showToast(isEdit ? '✅ Product updated!' : '✅ Product created!')
    router.push('/admin/products')
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.12)', background: '#0f1a14',
    color: '#f0f5ec', fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem',
    outline: 'none', boxSizing: 'border-box' as const,
  }
  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontFamily: 'DM Mono, monospace',
    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    color: 'rgba(240,245,236,0.5)', marginBottom: '0.5rem',
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* Image upload — full width, shown first */}
        <div style={{ gridColumn: '1 / -1' }}>
          <ImageUpload
            bucket="product-images"
            currentUrl={form.image_url || null}
            onUpload={url => set('image_url', url)}
            label="Product Photo"
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Product Name *</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Apex Classic Tee" required />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' } as any} value={form.description} onChange={e => set('description', e.target.value)} placeholder="100% organic cotton, heavyweight 280gsm." />
        </div>

        <div>
          <label style={labelStyle}>Price (RM) *</label>
          <input style={inputStyle} type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="38.00" required />
        </div>

        <div>
          <label style={labelStyle}>Stock</label>
          <input style={inputStyle} type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Category</label>
          <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="apparel">Apparel</option>
            <option value="headwear">Headwear</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Badge</label>
          <select style={inputStyle} value={form.badge} onChange={e => set('badge', e.target.value)}>
            <option value="">None</option>
            <option value="new">New</option>
            <option value="sale">Sale</option>
          </select>
        </div>

        {/* Sizes */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: form.has_sizes ? '0.75rem' : 0 }}>
            <button type="button" onClick={() => set('has_sizes', !form.has_sizes)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: form.has_sizes ? '#0e6640' : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <span style={{ position: 'absolute', top: 2, left: form.has_sizes ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </button>
            <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }} onClick={() => set('has_sizes', !form.has_sizes)}>
              This product has sizes (e.g. S, M, L, XL)
            </label>
          </div>
          {form.has_sizes && (
            <div>
              <label style={labelStyle}>Available Sizes (comma separated)</label>
              <input style={inputStyle} value={form.available_sizes} onChange={e => set('available_sizes', e.target.value)} placeholder="XS, S, M, L, XL, XXL" />
              <div style={{ fontSize: '0.7rem', color: 'rgba(240,245,236,0.3)', marginTop: '0.3rem' }}>Leave blank to show default sizes (XS–XXL). Values are auto-uppercased.</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: '0.6rem' }}>
                {['XS, S, M, L, XL, XXL', 'S, M, L, XL', 'ONE SIZE', 'XS, S, M, L, XL, XXL, 3XL'].map(preset => (
                  <button key={preset} type="button" onClick={() => set('available_sizes', preset)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '0.2rem 0.6rem', color: 'rgba(240,245,236,0.5)', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Emoji Icon (fallback)</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
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

        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => set('active', !form.active)} style={{
            width: 44, height: 24, borderRadius: 12, border: 'none',
            background: form.active ? '#0e6640' : 'rgba(255,255,255,0.15)',
            cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
          }}>
            <span style={{ position: 'absolute', top: 2, left: form.active ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </button>
          <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }} onClick={() => set('active', !form.active)}>
            {form.active ? 'Active (visible in shop)' : 'Hidden (not visible in shop)'}
          </label>
        </div>

        {/* Extra gallery images */}
        {isEdit && (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Additional Gallery Photos</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {galleryUrls.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setGalleryUrls(prev => prev.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(192,57,43,0.85)', border: 'none', borderRadius: 3, width: 18, height: 18, color: '#fff', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
              <label style={{
                width: 80, height: 80, borderRadius: 6, border: '2px dashed rgba(255,255,255,0.2)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: galleryUploading ? 'not-allowed' : 'pointer', gap: 4,
                background: 'rgba(255,255,255,0.02)', opacity: galleryUploading ? 0.6 : 1,
              }}>
                <span style={{ fontSize: '1.4rem' }}>{galleryUploading ? '⏳' : '+'}</span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(240,245,236,0.4)', textAlign: 'center' }}>Add photo</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} disabled={galleryUploading}
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (file.size > 20 * 1024 * 1024) { showToast('⚠️ Max 20MB'); return }
                    setGalleryUploading(true)
                    const sb = createClient()
                    const ext = file.name.split('.').pop()
                    const path = `gallery-${Date.now()}.${ext}`
                    const { error } = await sb.storage.from('product-images').upload(path, file, { upsert: true })
                    if (error) { showToast('❌ Upload failed'); setGalleryUploading(false); return }
                    const { data } = sb.storage.from('product-images').getPublicUrl(path)
                    // Save to product_gallery table
                    await sb.from('product_gallery').insert({ product_id: product!.id, image_url: data.publicUrl, sort_order: galleryUrls.length })
                    setGalleryUrls(prev => [...prev, data.publicUrl])
                    showToast('✅ Gallery image added!')
                    setGalleryUploading(false)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(240,245,236,0.3)', marginTop: '0.4rem' }}>Gallery photos show on the product detail page. The main photo above shows on cards and in the carousel.</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap' }}>
        <button type="submit" disabled={saving} style={{
          background: '#0e6640', color: '#f0f5ec', border: 'none', borderRadius: 6,
          padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.88rem',
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')} style={{
          background: 'transparent', color: 'rgba(240,245,236,0.5)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
          padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '0.88rem',
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
        }}>Cancel</button>
      </div>
    </form>
  )
}
