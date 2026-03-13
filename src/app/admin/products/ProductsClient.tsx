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

  if (products.length === 0) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(240,245,236,0.3)', background: '#121d17', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>No products yet</div>
  )

  return (
    <>
      {/* ── DESKTOP TABLE ── */}
      <div className="admin-table-desktop" style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
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
                  <button onClick={() => toggleActive(p.id, p.active)} style={{
                    background: p.active ? 'rgba(14,102,64,0.2)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${p.active ? 'rgba(14,102,64,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
                    color: p.active ? '#2d8a5e' : 'rgba(240,245,236,0.4)',
                    fontSize: '0.72rem', fontWeight: 700, fontFamily: 'DM Sans, sans-serif',
                  }}>{p.active ? 'Active' : 'Hidden'}</button>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/admin/products/edit/${p.id}`} style={{ textDecoration: 'none' }}>
                      <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '0.35rem 0.75rem', color: '#f0f5ec', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Edit</button>
                    </Link>
                    <button onClick={() => deleteProduct(p.id, p.name)} style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 4, padding: '0.35rem 0.75rem', color: '#e74c3c', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="admin-cards-mobile">
        {products.map(p => (
          <div key={p.id} className="admin-card" style={{ opacity: p.active ? 1 : 0.6 }}>
            <div className="admin-card-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <span style={{ fontSize: '2rem' }}>{p.emoji}</span>
                <div>
                  <div style={{ color: '#f0f5ec', fontWeight: 700, fontSize: '0.95rem' }}>{p.name}</div>
                  <div style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.75rem', marginTop: 2, textTransform: 'capitalize' }}>{p.category}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'DM Mono, monospace', color: '#c8a84b', fontWeight: 700, fontSize: '1rem' }}>${(p.price / 100).toFixed(2)}</div>
            </div>
            <div className="admin-card-meta">
              <span style={{ color: p.stock < 10 ? '#e74c3c' : 'rgba(240,245,236,0.5)', fontSize: '0.78rem' }}>Stock: <b style={{ fontFamily: 'DM Mono, monospace' }}>{p.stock}</b></span>
              <button onClick={() => toggleActive(p.id, p.active)} className={`admin-badge-btn ${p.active ? 'active' : 'inactive'}`}>{p.active ? 'Active' : 'Hidden'}</button>
            </div>
            <div className="admin-card-actions">
              <Link href={`/admin/products/edit/${p.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                <button className="admin-btn-edit">Edit</button>
              </Link>
              <button className="admin-btn-delete" onClick={() => deleteProduct(p.id, p.name)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
