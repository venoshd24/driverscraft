'use client'
// src/components/admin/ProductForm.tsx

import { useState } from 'react'
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
  })
  const [saving, setSaving] = useState(false)

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
    }

    const { error } = isEdit
      ? await sb.from('products').update(payload).eq('id', product!.id)
      : await sb.from('products').insert(payload)

    setSaving(false)
    if (error) { showToast('❌ ' + error.message); return }
    showToast(isEdit ? '✅ Product updated!' : '✅ Product created!')
    router.push('/admin/products')
    router.refresh()
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
