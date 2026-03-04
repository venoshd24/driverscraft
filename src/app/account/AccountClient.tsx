'use client'
// src/app/account/AccountClient.tsx

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import { Profile, Order } from '@/lib/types'
import { useRouter } from 'next/navigation'

type Tab = 'orders' | 'profile'

export default function AccountClient({ profile, orders, userEmail }: { profile: Profile | null; orders: Order[]; userEmail: string }) {
  const [tab, setTab] = useState<Tab>('orders')
  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName, setLastName] = useState(profile?.last_name || '')
  const [favDriver, setFavDriver] = useState(profile?.favourite_driver || '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function saveProfile() {
    setSaving(true)
    const sb = createClient()
    const { error } = await sb.from('profiles').upsert({ id: (await sb.auth.getUser()).data.user!.id, first_name: firstName, last_name: lastName, favourite_driver: favDriver })
    setSaving(false)
    if (error) { showToast('❌ Failed to save'); return }
    showToast('✅ Profile updated!')
    router.refresh()
  }

  const initials = ((firstName || 'D')[0] + (lastName || 'C')[0]).toUpperCase()

  const sidebarLinks: { id: Tab; icon: string; label: string }[] = [
    { id: 'orders', icon: '📦', label: 'My Orders' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ]

  return (
    <>
      {/* Sidebar */}
      <aside style={{ background: 'var(--white)', borderRight: '1px solid var(--cream-dark)', padding: '2rem 1.5rem' }}>
        <ul style={{ listStyle: 'none' }}>
          {sidebarLinks.map(l => (
            <li key={l.id} style={{ marginBottom: '0.3rem' }}>
              <button
                onClick={() => setTab(l.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '0.75rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: tab === l.id ? 'rgba(14,102,64,0.1)' : 'transparent',
                  color: tab === l.id ? 'var(--green-brand)' : 'var(--text-mid)',
                  fontWeight: tab === l.id ? 600 : 400, fontSize: '0.9rem',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {l.icon} {l.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Content */}
      <div style={{ padding: '2.5rem' }}>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Your Orders</h3>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                <p>No orders yet. <a href="/shop" style={{ color: 'var(--green-brand)', fontWeight: 600 }}>Start shopping →</a></p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map(order => (
                  <div key={order.id} style={{ background: 'var(--white)', border: '1px solid var(--cream-dark)', borderRadius: 8, padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--green-brand)' }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <span className={`badge badge-status-${order.status}`}>{order.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--cream)', borderRadius: 4, padding: '6px 12px', fontSize: '0.82rem', color: 'var(--text-mid)' }}>
                          <span style={{ fontSize: '1.2rem' }}>{item.product_emoji}</span>
                          {item.product_name} ×{item.quantity}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--cream-dark)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '1rem' }}>Order Total</span>
                      <span className="font-mono" style={{ fontWeight: 700, color: 'var(--green-brand)' }}>
                        ${(order.total / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div style={{ maxWidth: 540 }}>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Profile Settings</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'var(--green-brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', color: 'var(--cream)', fontWeight: 700,
              }}>{initials}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{firstName} {lastName}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{userEmail}</div>
              </div>
            </div>

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
              <input className="form-input" value={userEmail} readOnly style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Favourite Driver</label>
              <input className="form-input" value={favDriver} onChange={e => setFavDriver(e.target.value)} placeholder="e.g. Senna, Verstappen…" />
            </div>
            <button className="btn btn-green" onClick={saveProfile} disabled={saving} style={{ marginTop: '0.5rem' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
