'use client'
// src/app/admin/orders/OrdersClient.tsx

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'

const STATUSES = ['all', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

export default function OrdersClient({ orders: initial }: { orders: any[] }) {
  const [orders, setOrders] = useState(initial)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter
    const matchSearch = !search || o.id.includes(search.toLowerCase()) ||
      `${o.profiles?.first_name} ${o.profiles?.last_name}`.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  async function updateStatus(orderId: string, status: string) {
    const sb = createClient()
    const { error } = await sb.from('orders').update({ status }).eq('id', orderId)
    if (error) { showToast('❌ Failed to update'); return }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    showToast(`✅ Order updated to ${status}`)
  }

  const statusColors: Record<string, string> = {
    pending: 'rgba(255,255,255,0.1)',
    paid: 'rgba(14,102,64,0.3)',
    processing: 'rgba(200,168,75,0.25)',
    shipped: 'rgba(26,74,53,0.3)',
    delivered: 'rgba(14,102,64,0.2)',
    cancelled: 'rgba(192,57,43,0.2)',
  }

  return (
    <>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search by order ID or customer…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            background: '#121d17', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '0.6rem 1rem', color: '#f0f5ec',
            fontSize: '0.85rem', outline: 'none', width: 280,
            fontFamily: 'DM Sans, sans-serif',
          }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              background: filter === s ? '#0e6640' : '#121d17',
              border: `1px solid ${filter === s ? '#0e6640' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 4, padding: '0.4rem 0.85rem',
              color: filter === s ? '#f0f5ec' : 'rgba(240,245,236,0.5)',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              letterSpacing: '0.04em', textTransform: 'uppercase',
              fontFamily: 'DM Sans, sans-serif',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.3)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <>
                <tr
                  key={order.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: '#c8a84b' }}>
                    #{order.id.slice(0,8).toUpperCase()}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'rgba(240,245,236,0.75)' }}>
                    {order.profiles ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() || '—' : '—'}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'rgba(240,245,236,0.6)' }}>
                    {order.order_items?.length ?? 0}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: '#f0f5ec' }}>
                    ${(order.total / 100).toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 2, fontSize: '0.65rem', fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      background: statusColors[order.status] || 'rgba(255,255,255,0.08)',
                      color: '#f0f5ec',
                    }}>{order.status}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: 'rgba(240,245,236,0.4)' }}>
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <select
                      value={order.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      style={{
                        background: '#1a2e22', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 4, padding: '0.35rem 0.6rem',
                        color: '#f0f5ec', fontSize: '0.78rem', cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif', outline: 'none',
                      }}
                    >
                      {['pending','paid','processing','shipped','delivered','cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>

                {/* Expanded row */}
                {expanded === order.id && (
                  <tr key={order.id + '-expanded'}>
                    <td colSpan={7} style={{ padding: '0 1.25rem 1.25rem', background: 'rgba(0,0,0,0.15)' }}>
                      <div style={{ padding: '1rem', background: '#0f1a14', borderRadius: 6, marginTop: 2 }}>
                        <div style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.35)', marginBottom: '0.75rem' }}>Order Items</div>
                        {(order.order_items || []).map((item: any) => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ fontSize: '1.3rem' }}>{item.product_emoji}</span>
                            <span style={{ color: '#f0f5ec', fontSize: '0.88rem', flex: 1 }}>{item.product_name}</span>
                            <span style={{ color: 'rgba(240,245,236,0.5)', fontSize: '0.82rem' }}>×{item.quantity}</span>
                            <span style={{ fontFamily: 'DM Mono, monospace', color: '#c8a84b', fontSize: '0.82rem' }}>${(item.unit_price / 100).toFixed(2)}</span>
                          </div>
                        ))}
                        {order.shipping_address && (
                          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'rgba(240,245,236,0.45)' }}>
                            📍 {[order.shipping_address.line1, order.shipping_address.city, order.shipping_address.country].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(240,245,236,0.3)', fontSize: '0.85rem' }}>No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
