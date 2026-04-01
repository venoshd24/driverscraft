'use client'
// src/app/account/AccountClient.tsx

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import { Profile, Order } from '@/lib/types'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Tab = 'orders' | 'profile'

type Car = {
  id: string
  year: string
  model: string
  engine: string
  power: string
  suspension: string
  wheels: string
  tyres: string
  exterior_mods: string
  other_mods: string
  photo_url: string
}

function emptyCar(): Car {
  return { id: Date.now().toString(), year: '', model: '', engine: '', power: '', suspension: '', wheels: '', tyres: '', exterior_mods: '', other_mods: '', photo_url: '' }
}

const STATUS_STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered']
const STATUS_LABELS: Record<string, string> = { pending: 'Order Placed', paid: 'Payment Confirmed', processing: 'Being Prepared', shipped: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' }
const STATUS_ICONS: Record<string, string>  = { pending: '🕐', paid: '✅', processing: '📦', shipped: '🚚', delivered: '🎉', cancelled: '❌' }
const STATUS_COLORS: Record<string, string> = { pending: '#f59e0b', paid: '#10b981', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#059669', cancelled: '#ef4444' }

export default function AccountClient({ profile, orders, userEmail }: { profile: Profile | null; orders: Order[]; userEmail: string }) {
  const [tab, setTab]               = useState<Tab>('orders')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(orders[0]?.id || null)
  const [firstName, setFirstName]   = useState(profile?.first_name || '')
  const [lastName, setLastName]     = useState(profile?.last_name || '')
  const [location, setLocation]     = useState((profile as any)?.location || '')
  const [bio, setBio]               = useState((profile as any)?.bio || '')
  const [favDriver, setFavDriver]   = useState((profile as any)?.favourite_driver || '')
  const [cars, setCars]             = useState<Car[]>(() => {
    const raw = (profile as any)?.cars
    if (Array.isArray(raw) && raw.length > 0) return raw.map((c: any) => ({ ...emptyCar(), ...c }))
    // Migrate legacy single-car fields
    const legacyCar = (profile as any)?.car || (profile as any)?.car_year
    if (legacyCar) return [{
      id: '1', year: (profile as any)?.car_year || '', model: (profile as any)?.car || '',
      engine: (profile as any)?.engine || '', power: (profile as any)?.power || '',
      suspension: (profile as any)?.suspension || '', wheels: (profile as any)?.wheels || '',
      tyres: (profile as any)?.tyres || '', exterior_mods: (profile as any)?.exterior_mods || '',
      other_mods: (profile as any)?.other_mods || '', photo_url: (profile as any)?.car_photo_url || '',
    }]
    return []
  })
  const [expandedCar, setExpandedCar] = useState<string | null>(cars[0]?.id || null)
  const [saving, setSaving]         = useState(false)
  const [carPhotoFiles, setCarPhotoFiles] = useState<Record<string, File>>({})
  const router = useRouter()

  function updateCar(id: string, field: keyof Car, value: string) {
    setCars(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }
  function addCar() {
    const nc = emptyCar()
    setCars(prev => [...prev, nc])
    setExpandedCar(nc.id)
  }
  function removeCar(id: string) {
    setCars(prev => prev.filter(c => c.id !== id))
    if (expandedCar === id) setExpandedCar(cars.find(c => c.id !== id)?.id || null)
  }

  async function saveProfile() {
    setSaving(true)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()

    // Upload any new car photos
    const updatedCars = [...cars]
    for (const [carId, file] of Object.entries(carPhotoFiles)) {
      const idx = updatedCars.findIndex(c => c.id === carId)
      if (idx === -1) continue
      const ext = file.name.split('.').pop()
      const path = `${user!.id}/car-${carId}.${ext}`
      const { error: upErr } = await sb.storage.from('car-photos').upload(path, file, { upsert: true })
      if (!upErr) updatedCars[idx] = { ...updatedCars[idx], photo_url: sb.storage.from('car-photos').getPublicUrl(path).data.publicUrl }
    }

    const { error } = await sb.from('profiles').upsert({
      id: user!.id, first_name: firstName, last_name: lastName,
      location: location || null, bio: bio || null, favourite_driver: favDriver || null,
      cars: updatedCars,
      // Keep legacy fields from first car for backwards compat
      car: updatedCars[0]?.model || null, car_year: updatedCars[0]?.year || null,
    })
    setSaving(false)
    if (error) { showToast('❌ Failed to save'); return }
    setCars(updatedCars); setCarPhotoFiles({})
    showToast('✅ Profile updated!')
    router.refresh()
  }

  const initials = ((firstName || 'D')[0] + (lastName || 'C')[0]).toUpperCase()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100vh - 220px)' }} className="account-layout">
      {/* Sidebar */}
      <aside style={{ background: '#fafcf8', borderRight: '1px solid #e2ead9', padding: '1.5rem 1rem' }}>
        <nav>
          {([{ id: 'orders' as Tab, icon: '📦', label: 'My Orders', count: orders.length }, { id: 'profile' as Tab, icon: '👤', label: 'Profile' }]).map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.7rem 0.875rem', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: '0.25rem', background: tab === item.id ? 'rgba(14,102,64,0.1)' : 'transparent', color: tab === item.id ? 'var(--green-brand)' : 'var(--text-mid)', fontWeight: tab === item.id ? 700 : 400, fontSize: '0.88rem', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{item.icon} {item.label}</span>
              {'count' in item && (item as any).count > 0 && <span style={{ background: 'var(--green-brand)', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 700 }}>{(item as any).count}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div style={{ padding: 'clamp(1.5rem,3vw,2.5rem)', background: '#f8faf6', minHeight: '100%' }}>

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Purchase History</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 12, border: '1px solid #e2ead9' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛍️</div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>No orders yet</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Your orders will appear here once you make a purchase.</p>
                <Link href="/shop" className="btn btn-green" style={{ padding: '0.75rem 1.75rem' }}>Browse Merch →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((order: any) => {
                  const isExpanded = expandedOrder === order.id
                  const statusColor = STATUS_COLORS[order.status] || '#6b7280'
                  const stepIdx = STATUS_STEPS.indexOf(order.status)
                  return (
                    <div key={order.id} style={{ background: '#fff', border: '1px solid #e2ead9', borderRadius: 12, overflow: 'hidden' }}>
                      <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '1.1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, flex: 1 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${statusColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{STATUS_ICONS[order.status] || '📦'}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: '0.85rem', color: 'var(--green-brand)' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                              <span style={{ background: `${statusColor}18`, color: statusColor, padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{STATUS_LABELS[order.status] || order.status}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                          <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: 'var(--green-brand)', fontSize: '0.95rem' }}>{(order.total / 100).toLocaleString('en-MY', { style: 'currency', currency: 'MYR' })}</span>
                          <span style={{ color: 'var(--text-muted)', display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: '0.8rem' }}>▼</span>
                        </div>
                      </button>
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid #e2ead9', padding: '1.25rem' }}>
                          {order.status !== 'cancelled' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 14, left: '10%', right: '10%', height: 2, background: '#e2ead9', zIndex: 0 }} />
                                <div style={{ position: 'absolute', top: 14, left: '10%', height: 2, background: 'var(--green-brand)', zIndex: 1, width: stepIdx >= 0 ? `${(stepIdx / (STATUS_STEPS.length - 1)) * 80}%` : '0%', transition: 'width 0.5s ease' }} />
                                {STATUS_STEPS.map((step, i) => {
                                  const done = stepIdx >= i
                                  return (
                                    <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? 'var(--green-brand)' : '#fff', border: `2px solid ${done ? 'var(--green-brand)' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: done ? '#fff' : '#9ca3af', fontWeight: 700, transition: 'all 0.3s' }}>{done ? '✓' : i + 1}</div>
                                      <div style={{ fontSize: '0.6rem', color: done ? 'var(--green-brand)' : '#9ca3af', fontWeight: done ? 600 : 400, marginTop: '0.4rem', textAlign: 'center', lineHeight: 1.3 }}>{STATUS_LABELS[step]}</div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Items</div>
                            {order.order_items?.map((item: any) => (
                              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', background: '#f8faf6', borderRadius: 8 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 8, background: '#e2ead9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{item.product_emoji}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                                </div>
                                <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.88rem', flexShrink: 0 }}>{(item.unit_price / 100).toLocaleString('en-MY', { style: 'currency', currency: 'MYR' })}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2ead9' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order Total</span>
                            <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 800, color: 'var(--green-brand)', fontSize: '1.05rem' }}>{(order.total / 100).toLocaleString('en-MY', { style: 'currency', currency: 'MYR' })}</span>
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

        {/* PROFILE */}
        {tab === 'profile' && (
          <div style={{ maxWidth: 600 }}>
            <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '1.75rem' }}>Your Profile</h3>

            {/* Preview card */}
            <div style={{ background: 'var(--green-deep)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.75rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'rgba(255,255,255,0.03)', borderRadius: '50%', transform: 'translate(40%,-40%)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: bio ? '1rem' : 0 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--green-brand)', border: '3px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#fff', fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                <div>
                  <div style={{ fontWeight: 800, color: '#f0f5ec', fontSize: '1.05rem' }}>{firstName || 'Your'} {lastName || 'Name'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(240,245,236,0.45)', marginTop: 2 }}>{userEmail}</div>
                  {location && <div style={{ fontSize: '0.72rem', color: 'rgba(240,245,236,0.4)', marginTop: 2 }}>📍 {location}</div>}
                </div>
              </div>
              {bio && <p style={{ fontSize: '0.82rem', color: 'rgba(240,245,236,0.55)', lineHeight: 1.6, fontStyle: 'italic', marginTop: '0.75rem' }}>"{bio}"</p>}
              {cars.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  {cars.map(c => (c.year || c.model) && (
                    <div key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.25)', borderRadius: 8, padding: '0.4rem 0.85rem' }}>
                      <span>🚗</span>
                      <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.82rem' }}>{[c.year, c.model].filter(Boolean).join(' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Personal section */}
              <Section title="Personal">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="auth-name-grid">
                  <Field label="First Name"><input className="form-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Lewis" /></Field>
                  <Field label="Last Name"><input className="form-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Hamilton" /></Field>
                </div>
                <Field label="Email"><input className="form-input" value={userEmail} readOnly style={{ opacity: 0.5, cursor: 'not-allowed' }} /></Field>
                <Field label="Location"><input className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Shah Alam, Selangor" /></Field>
                <Field label="Favourite Driver"><input className="form-input" value={favDriver} onChange={e => setFavDriver(e.target.value)} placeholder="Ayrton Senna" /></Field>
                <Field label="Bio"><textarea className="form-input" value={bio} onChange={e => setBio(e.target.value)} placeholder="Weekend warrior. Track days and late nights." rows={3} style={{ resize: 'vertical' as const }} /></Field>
              </Section>

              {/* Garage section */}
              <Section title={`Garage 🚗 (${cars.length} car${cars.length !== 1 ? 's' : ''})`}>
                {cars.map((car, idx) => (
                  <div key={car.id} style={{ border: '1px solid #e2ead9', borderRadius: 10, overflow: 'hidden', marginBottom: '0.75rem' }}>
                    {/* Car header */}
                    <button onClick={() => setExpandedCar(expandedCar === car.id ? null : car.id)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: expandedCar === car.id ? '#f8faf6' : '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                        {[car.year, car.model].filter(Boolean).join(' ') || `Car ${idx + 1}`}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button onClick={e => { e.stopPropagation(); removeCar(car.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '0.78rem', padding: '2px 6px', borderRadius: 4, opacity: 0.7 }}>Remove</button>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', transform: expandedCar === car.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'block' }}>▼</span>
                      </div>
                    </button>

                    {expandedCar === car.id && (
                      <div style={{ padding: '1rem', borderTop: '1px solid #e2ead9', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* Car photo */}
                        <Field label="Car Photo">
                          {(car.photo_url || carPhotoFiles[car.id]) && (
                            <div style={{ position: 'relative', marginBottom: '0.5rem', display: 'inline-block' }}>
                              <img src={carPhotoFiles[car.id] ? URL.createObjectURL(carPhotoFiles[car.id]) : car.photo_url} alt="" style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 8, objectFit: 'cover', display: 'block', border: '1px solid #e2ead9' }} />
                              <button onClick={() => { updateCar(car.id, 'photo_url', ''); setCarPhotoFiles(p => { const n = { ...p }; delete n[car.id]; return n }) }}
                                style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                            </div>
                          )}
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--cream-dark)', border: '1px solid #d1d5db', borderRadius: 8, padding: '0.45rem 0.9rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                            📷 {car.photo_url || carPhotoFiles[car.id] ? 'Change' : 'Upload photo'}
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f && f.size <= 8 * 1024 * 1024) setCarPhotoFiles(p => ({ ...p, [car.id]: f })); else if (f) showToast('❌ Max 8MB') }} />
                          </label>
                        </Field>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.65rem' }}>
                          <Field label="Year"><input className="form-input" value={car.year} onChange={e => updateCar(car.id, 'year', e.target.value)} placeholder="1998" maxLength={4} /></Field>
                          <Field label="Model"><input className="form-input" value={car.model} onChange={e => updateCar(car.id, 'model', e.target.value)} placeholder="Honda Civic EK9" /></Field>
                        </div>
                        {[
                          ['Engine', 'engine', 'B18C, 4G63T, RB26DETT…'],
                          ['Power / Tune', 'power', '250hp / Haltech Elite tuned'],
                          ['Suspension', 'suspension', 'BC Racing BR coilovers…'],
                          ['Wheels', 'wheels', 'Work Meister S1 18x9.5 +22'],
                          ['Tyres', 'tyres', 'Nankang NS-2 235/40/18'],
                          ['Exterior Mods', 'exterior_mods', 'Rocket Bunny kit…'],
                          ['Other Mods', 'other_mods', 'Bucket seat, harness…'],
                        ].map(([label, field, placeholder]) => (
                          <Field key={field} label={label}>
                            <input className="form-input" value={(car as any)[field]} onChange={e => updateCar(car.id, field as keyof Car, e.target.value)} placeholder={placeholder} />
                          </Field>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <button onClick={addCar} style={{ width: '100%', padding: '0.65rem', background: 'transparent', border: '1.5px dashed #d1d5db', borderRadius: 8, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  + Add another car
                </button>
              </Section>

              <button className="btn btn-green" onClick={saveProfile} disabled={saving} style={{ padding: '0.85rem', borderRadius: 8 }}>
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2ead9', overflow: 'hidden' }}>
      <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{title}</div>
      <div style={{ padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  )
}
