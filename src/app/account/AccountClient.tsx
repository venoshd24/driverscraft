'use client'
// src/app/account/AccountClient.tsx

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import { Profile, Order } from '@/lib/types'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Tab = 'orders' | 'profile'

const STATUS_STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered']
const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Placed',
  paid: 'Payment Confirmed',
  processing: 'Being Prepared',
  shipped: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}
const STATUS_ICONS: Record<string, string> = {
  pending: '🕐', paid: '✅', processing: '📦', shipped: '🚚', delivered: '🎉', cancelled: '❌',
}
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', paid: '#10b981', processing: '#3b82f6',
  shipped: '#8b5cf6', delivered: '#059669', cancelled: '#ef4444',
}

export default function AccountClient({ profile, orders, userEmail }: {
  profile: Profile | null
  orders: Order[]
  userEmail: string
}) {
  const [tab, setTab] = useState<Tab>('orders')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(orders[0]?.id || null)
  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName, setLastName] = useState(profile?.last_name || '')
  const [favDriver, setFavDriver] = useState(profile?.favourite_driver || '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function saveProfile() {
    setSaving(true)
    const sb = createClient()
    const { error } = await sb.from('profiles').upsert({
      id: (await sb.auth.getUser()).data.user!.id,
      first_name: firstName, last_name: lastName, favourite_driver: favDriver,
    })
    setSaving(false)
    if (error) { showToast('❌ Failed to save'); return }
    showToast('✅ Profile updated!')
    router.refresh()
  }

  const initials = ((firstName || 'D')[0] + (lastName || 'C')[0]).toUpperCase()

  const navItems = [
    { id: 'orders' as Tab, icon: '📦', label: 'My Orders', count: orders.length },
    { id: 'profile' as Tab, icon: '👤', label: 'Profile' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100vh - 220px)' }} className="account-layout">

      {/* Sidebar */}
      <aside style={{ background: '#fafcf8', borderRight: '1px solid #e2ead9', padding: '1.5rem 1rem' }}>
        <nav>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '0.7rem 0.875rem', borderRadius: 8, border: 'none',
              cursor: 'pointer', marginBottom: '0.25rem',
              background: tab === item.id ? 'rgba(14,102,64,0.1)' : 'transparent',
              color: tab === item.id ? 'var(--green-brand)' : 'var(--text-mid)',
              fontWeight: tab === item.id ? 700 : 400,
              fontSize: '0.88rem', fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.15s',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {item.icon} {item.label}
              </span>
              {'count' in item && item.count! > 0 && (
                <span style={{ background: 'var(--green-brand)', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 700 }}>{item.count}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div style={{ padding: 'clamp(1.5rem,3vw,2.5rem)', background: '#f8faf6', minHeight: '100%' }}>

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Purchase History</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 12, border: '1px solid #e2ead9' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛍️</div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>No orders yet</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>When you make a purchase, your orders will appear here.</p>
                <Link href="/shop" className="btn btn-green" style={{ padding: '0.75rem 1.75rem' }}>Browse Merch →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((order: any) => {
                  const isExpanded = expandedOrder === order.id
                  const statusColor = STATUS_COLORS[order.status] || '#6b7280'
                  const stepIdx = STATUS_STEPS.indexOf(order.status)
                  const isCancelled = order.status === 'cancelled'

                  return (
                    <div key={order.id} style={{ background: '#fff', border: '1px solid #e2ead9', borderRadius: 12, overflow: 'hidden', transition: 'box-shadow 0.2s' }}>

                      {/* Order header — always visible */}
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%', padding: '1.1rem 1.25rem', background: 'none', border: 'none',
                          cursor: 'pointer', textAlign: 'left', gap: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, flex: 1 }}>
                          {/* Status icon */}
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${statusColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                            {STATUS_ICONS[order.status] || '📦'}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: '0.85rem', color: 'var(--green-brand)' }}>
                                #{order.id.slice(0, 8).toUpperCase()}
                              </span>
                              <span style={{ background: `${statusColor}18`, color: statusColor, padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {STATUS_LABELS[order.status] || order.status}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                              {' · '}{order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                          <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: 'var(--green-brand)', fontSize: '0.95rem' }}>
                            {(order.total / 100).toLocaleString('en-MY', { style: 'currency', currency: 'MYR' })}
                          </span>
                          <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'none', fontSize: '0.8rem' }}>▼</span>
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid #e2ead9', padding: '1.25rem' }}>

                          {/* Progress tracker */}
                          {!isCancelled && (
                            <div style={{ marginBottom: '1.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                {/* Track line */}
                                <div style={{ position: 'absolute', top: 14, left: '10%', right: '10%', height: 2, background: '#e2ead9', zIndex: 0 }} />
                                <div style={{ position: 'absolute', top: 14, left: '10%', height: 2, background: 'var(--green-brand)', zIndex: 1, width: stepIdx >= 0 ? `${(stepIdx / (STATUS_STEPS.length - 1)) * 80}%` : '0%', transition: 'width 0.5s ease' }} />

                                {STATUS_STEPS.map((step, i) => {
                                  const done = stepIdx >= i
                                  const current = stepIdx === i
                                  return (
                                    <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                                      <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: done ? 'var(--green-brand)' : '#fff',
                                        border: `2px solid ${done ? 'var(--green-brand)' : '#d1d5db'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', color: done ? '#fff' : '#9ca3af',
                                        fontWeight: 700, transition: 'all 0.3s',
                                        boxShadow: current ? '0 0 0 4px rgba(14,102,64,0.15)' : 'none',
                                      }}>
                                        {done ? '✓' : i + 1}
                                      </div>
                                      <div style={{ fontSize: '0.62rem', color: done ? 'var(--green-brand)' : '#9ca3af', fontWeight: done ? 600 : 400, marginTop: '0.4rem', textAlign: 'center', lineHeight: 1.3 }}>
                                        {STATUS_LABELS[step]}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {isCancelled && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem 1rem', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                              ❌ This order was cancelled
                            </div>
                          )}

                          {/* Items */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Items</div>
                            {order.order_items?.map((item: any) => (
                              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', background: '#f8faf6', borderRadius: 8 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 8, background: '#e2ead9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                                  {item.product_image_url
                                    ? <img src={item.product_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                                    : item.product_emoji
                                  }
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                                </div>
                                <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.88rem', flexShrink: 0 }}>
                                  {(item.unit_price / 100).toLocaleString('en-MY', { style: 'currency', currency: 'MYR' })}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Total */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2ead9' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order Total</span>
                            <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 800, color: 'var(--green-brand)', fontSize: '1.05rem' }}>
                              {(order.total / 100).toLocaleString('en-MY', { style: 'currency', currency: 'MYR' })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div style={{ maxWidth: 540 }}>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.75rem' }}>Profile Settings</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '1.25rem', background: '#fff', borderRadius: 12, border: '1px solid #e2ead9' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#fff', fontWeight: 800, flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{firstName} {lastName}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{userEmail}</div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2ead9', padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Lewis" />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Hamilton" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={userEmail} readOnly style={{ opacity: 0.55, cursor: 'not-allowed' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Favourite Driver 🏎️</label>
                <input className="form-input" value={favDriver} onChange={e => setFavDriver(e.target.value)} placeholder="e.g. Senna, Verstappen, Hamilton…" />
              </div>
              <button className="btn btn-green" onClick={saveProfile} disabled={saving} style={{ width: '100%', padding: '0.85rem', borderRadius: 8 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
