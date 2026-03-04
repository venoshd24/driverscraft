'use client'
// src/app/admin/products/ProductsClient.tsx

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import { Product } from '@/lib/types'

export default function ProductsClient({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial)

  async function toggleActive(id: string, current: boolean) {
    const sb = createClient()
    const { error } = await sb.from('products').update({ active: !current }).eq('id', id)
    if (error) { showToast('❌ Failed to update'); return }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !current } : p))
    showToast(`✅ Product ${!current ? 'activated' : 'deactivated'}`)
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const sb = createClient()
    const { error } = await sb.from('products').delete().eq('id', id)
    if (error) { showToast('❌ Failed to delete'); return }
    setProducts(prev => prev.filter(p => p.id !== id))
    showToast(`🗑 "${name}" deleted`)
  }

  return (
    <div style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {['Product', 'Category', 'Price', 'Stock', 'Badge', 'Status', 'Actions'].map(h => (
              <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.3)', fontWeight: 500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: p.active ? 1 : 0.5 }}>
              <td style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.4rem' }}>{p.emoji}</span>
                  <div>
                    <div style={{ color: '#f0f5ec', fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</div>
                    <div style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.75rem', marginTop: 2 }}>{p.description?.slice(0, 40)}…</div>
                  </div>
                </div>
              </td>
              <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'rgba(240,245,236,0.6)', textTransform: 'capitalize' }}>{p.category}</td>
              <td style={{ padding: '1rem 1.25rem', fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: '#c8a84b' }}>${(p.price / 100).toFixed(2)}</td>
              <td style={{ padding: '1rem 1.25rem', fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: p.stock < 10 ? '#e74c3c' : '#f0f5ec' }}>{p.stock}</td>
              <td style={{ padding: '1rem 1.25rem' }}>
                {p.badge ? (
                  <span style={{ background: p.badge === 'new' ? 'rgba(200,168,75,0.2)' : 'rgba(14,102,64,0.2)', color: p.badge === 'new' ? '#c8a84b' : '#2d8a5e', padding: '2px 8px', borderRadius: 2, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{p.badge}</span>
                ) : <span style={{ color: 'rgba(240,245,236,0.2)', fontSize: '0.78rem' }}>—</span>}
              </td>
              <td style={{ padding: '1rem 1.25rem' }}>
                <button
                  onClick={() => toggleActive(p.id, p.active)}
                  style={{
                    background: p.active ? 'rgba(14,102,64,0.2)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${p.active ? 'rgba(14,102,64,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
                    color: p.active ? '#2d8a5e' : 'rgba(240,245,236,0.4)',
                    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >{p.active ? 'Active' : 'Hidden'}</button>
              </td>
              <td style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/admin/products/edit/${p.id}`} style={{ textDecoration: 'none' }}>
                    <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '0.35rem 0.75rem', color: '#f0f5ec', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Edit</button>
                  </Link>
                  <button
                    onClick={() => deleteProduct(p.id, p.name)}
                    style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 4, padding: '0.35rem 0.75rem', color: '#e74c3c', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                  >Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(240,245,236,0.3)', fontSize: '0.85rem' }}>No products yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
