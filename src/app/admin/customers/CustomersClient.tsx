'use client'
// src/app/admin/customers/CustomersClient.tsx

import { useState, useMemo } from 'react'

type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  favourite_driver: string
  car: string
  car_year: string
  location: string
  bio: string
  is_admin: boolean
  created_at: string
  orders: number
  spent: number
  rsvps: number
  subscribed: boolean
}

type SortKey = 'name' | 'joined' | 'orders' | 'spent' | 'rsvps'
type SortDir = 'asc' | 'desc'

function memberSince(dateStr: string) {
  const months = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (months < 1) return 'New member'
  if (months < 12) return `${months}mo member`
  const years = Math.floor(months / 12)
  return `${years}yr member`
}

export default function CustomersClient({ users }: { users: User[] }) {
  const [search, setSearch]     = useState('')
  const [sortKey, setSortKey]   = useState<SortKey>('joined')
  const [sortDir, setSortDir]   = useState<SortDir>('desc')
  const [filter, setFilter]     = useState<'all' | 'admin' | 'customer' | 'subscribed' | 'attended'>('all')
  const [selected, setSelected] = useState<User | null>(null)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    let list = [...users]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.favourite_driver?.toLowerCase().includes(q) ||
        u.car?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q)
      )
    }
    if (filter === 'admin')      list = list.filter(u => u.is_admin)
    if (filter === 'customer')   list = list.filter(u => !u.is_admin)
    if (filter === 'subscribed') list = list.filter(u => u.subscribed)
    if (filter === 'attended')   list = list.filter(u => u.rsvps > 0)

    list.sort((a, b) => {
      let va: any, vb: any
      if (sortKey === 'name')   { va = `${a.first_name}${a.last_name}`; vb = `${b.first_name}${b.last_name}` }
      if (sortKey === 'joined') { va = new Date(a.created_at).getTime(); vb = new Date(b.created_at).getTime() }
      if (sortKey === 'orders') { va = a.orders; vb = b.orders }
      if (sortKey === 'spent')  { va = a.spent;  vb = b.spent }
      if (sortKey === 'rsvps')  { va = a.rsvps;  vb = b.rsvps }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [users, search, sortKey, sortDir, filter])

  const SortBtn = ({ col, label }: { col: SortKey; label: string }) => (
    <button onClick={() => toggleSort(col)} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: sortKey === col ? '#c8a84b' : 'rgba(240,245,236,0.3)',
      fontSize: '0.65rem', fontFamily: 'DM Mono, monospace',
      letterSpacing: '0.1em', textTransform: 'uppercase',
      fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 4,
    }}>
      {label}
      <span style={{ opacity: sortKey === col ? 1 : 0.4 }}>
        {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </button>
  )

  const subscribers = users.filter(u => u.subscribed).length
  const attended    = users.filter(u => u.rsvps > 0).length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#f0f5ec' }}>Customers</h1>
        <p style={{ color: 'rgba(240,245,236,0.4)', marginTop: '0.25rem', fontSize: '0.88rem' }}>
          {filtered.length} of {users.length} registered users
        </p>
      </div>

      {/* Summary stats bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Members', value: users.length, icon: '👥' },
          { label: 'Newsletter', value: subscribers, icon: '📧' },
          { label: 'Meet Attendees', value: attended, icon: '🚗' },
          { label: 'Admins', value: users.filter(u => u.is_admin).length, icon: '⚙' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#121d17', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8, padding: '0.65rem 1rem', flex: '1 1 120px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '1.1rem', fontWeight: 700, color: '#f0f5ec', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(240,245,236,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 0 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.35, pointerEvents: 'none' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, car, location…"
            style={{
              width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem',
              background: '#121d17', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 8, color: '#f0f5ec', fontSize: '0.88rem',
              fontFamily: 'DM Sans, sans-serif', outline: 'none',
            }}
          />
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#121d17', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: '0.5rem 1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6rem', color: 'rgba(240,245,236,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace' }}>Sort</span>
          {(['name', 'joined', 'orders', 'spent', 'rsvps'] as SortKey[]).map(k => (
            <SortBtn key={k} col={k} label={k} />
          ))}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {([
          { key: 'all',        label: `All (${users.length})` },
          { key: 'customer',   label: `Members (${users.filter(u => !u.is_admin).length})` },
          { key: 'subscribed', label: `Newsletter (${subscribers})` },
          { key: 'attended',   label: `Meet Goers (${attended})` },
          { key: 'admin',      label: `Admins (${users.filter(u => u.is_admin).length})` },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '0.45rem 0.9rem', borderRadius: 6,
            border: `1px solid ${filter === f.key ? 'rgba(200,168,75,0.5)' : 'rgba(255,255,255,0.09)'}`,
            background: filter === f.key ? 'rgba(200,168,75,0.1)' : 'transparent',
            color: filter === f.key ? '#c8a84b' : 'rgba(240,245,236,0.4)',
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(240,245,236,0.3)', background: '#121d17', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
          {search ? `No users matching "${search}"` : 'No users yet'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
          {filtered.map(user => (
            <UserCard key={user.id} user={user} onClick={() => setSelected(user)} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && <UserModal user={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

/* ── User Card ── */
function UserCard({ user, onClick }: { user: User; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ')
  const initials = (displayName
    ? displayName.split(' ').map(n => n[0]).join('')
    : user.email?.[0] || 'U'
  ).toUpperCase().slice(0, 2)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#121d17',
        border: `1px solid ${hovered ? 'rgba(200,168,75,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 12, padding: '1.25rem',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: '1rem' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: user.is_admin
            ? 'linear-gradient(135deg, #c8a84b, #a07830)'
            : 'linear-gradient(135deg, #0e6640, #1a4a35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.88rem', color: '#f0f5ec', fontWeight: 700,
          boxShadow: user.is_admin ? '0 0 0 2px rgba(200,168,75,0.3)' : 'none',
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#f0f5ec', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayName || 'Unnamed User'}
          </div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'rgba(240,245,236,0.4)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.email || '—'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{
            background: user.is_admin ? 'rgba(200,168,75,0.15)' : 'rgba(255,255,255,0.06)',
            color: user.is_admin ? '#c8a84b' : 'rgba(240,245,236,0.4)',
            padding: '2px 7px', borderRadius: 2,
            fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>{user.is_admin ? 'Admin' : 'Member'}</span>
          {user.subscribed && (
            <span style={{ fontSize: '0.58rem', color: '#3b82f6', background: 'rgba(59,130,246,0.12)', padding: '2px 7px', borderRadius: 2, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Newsletter
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <MiniStat label="Orders" value={String(user.orders)} />
        <MiniStat label="Spent" value={user.spent > 0 ? `RM ${(user.spent / 100).toFixed(0)}` : '—'} accent />
        <MiniStat label="Meets" value={user.rsvps > 0 ? `${user.rsvps} RSVP` : '—'} highlight={user.rsvps > 0} />
      </div>

      {/* Car & driver snippets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minHeight: 36 }}>
        {(user.car || user.car_year) && (
          <div style={{ fontSize: '0.74rem', color: 'rgba(240,245,236,0.5)', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            🚗 {[user.car_year, user.car].filter(Boolean).join(' ')}
          </div>
        )}
        {user.favourite_driver && (
          <div style={{ fontSize: '0.74rem', color: 'rgba(240,245,236,0.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
            🏎 {user.favourite_driver}
          </div>
        )}
        {user.location && (
          <div style={{ fontSize: '0.74rem', color: 'rgba(240,245,236,0.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
            📍 {user.location}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', color: 'rgba(240,245,236,0.22)' }}>
          {memberSince(user.created_at)}
        </span>
        <span style={{ fontSize: '0.65rem', color: hovered ? 'rgba(200,168,75,0.7)' : 'rgba(240,245,236,0.2)', transition: 'color 0.2s' }}>
          View profile →
        </span>
      </div>
    </div>
  )
}

function MiniStat({ label, value, accent, highlight }: { label: string; value: string; accent?: boolean; highlight?: boolean }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '0.35rem 0.5rem' }}>
      <div style={{ fontSize: '0.56rem', color: 'rgba(240,245,236,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace' }}>{label}</div>
      <div style={{ fontSize: '0.78rem', fontFamily: 'DM Mono, monospace', fontWeight: 600, marginTop: 1, color: accent ? '#c8a84b' : highlight ? '#2d8a5e' : '#f0f5ec' }}>{value}</div>
    </div>
  )
}

/* ── User Modal ── */
function UserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ')
  const initials = (displayName
    ? displayName.split(' ').map(n => n[0]).join('')
    : user.email?.[0] || 'U'
  ).toUpperCase().slice(0, 2)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f1a14',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16, width: '100%', maxWidth: 520,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header band */}
        <div style={{
          background: user.is_admin
            ? 'linear-gradient(135deg, rgba(200,168,75,0.18), rgba(200,168,75,0.04))'
            : 'linear-gradient(135deg, rgba(14,102,64,0.25), rgba(14,102,64,0.04))',
          padding: '1.75rem 1.75rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
              background: user.is_admin
                ? 'linear-gradient(135deg, #c8a84b, #a07830)'
                : 'linear-gradient(135deg, #0e6640, #1a4a35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', color: '#f0f5ec', fontWeight: 700,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}>{initials}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 900, color: '#f0f5ec', lineHeight: 1.1 }}>
                {displayName || 'Unnamed User'}
              </div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'rgba(240,245,236,0.4)', marginTop: 4 }}>
                {user.email}
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Badge label={user.is_admin ? '⚙ Admin' : 'Member'} gold={user.is_admin} />
                {user.subscribed && <Badge label="📧 Newsletter" blue />}
                {user.rsvps > 0 && <Badge label={`🚗 ${user.rsvps} Meet${user.rsvps > 1 ? 's' : ''}`} green />}
              </div>
            </div>

            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, color: 'rgba(240,245,236,0.5)',
              cursor: 'pointer', fontSize: '0.8rem', padding: '4px 10px',
              fontFamily: 'DM Sans, sans-serif', flexShrink: 0,
            }}>✕</button>
          </div>

          {user.bio && (
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'rgba(240,245,236,0.5)', fontStyle: 'italic', lineHeight: 1.6 }}>
              "{user.bio}"
            </p>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem 1.75rem' }}>
          {/* Big stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <BigStat label="Orders" value={String(user.orders)} />
            <BigStat label="Total Spent" value={user.spent > 0 ? `RM ${(user.spent / 100).toFixed(2)}` : '—'} accent />
            <BigStat label="Meets RSVPd" value={String(user.rsvps)} green />
          </div>

          {/* Profile fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Field label="Member Since" value={new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
            <Field label="Tenure" value={memberSince(user.created_at)} />
            {user.location && <Field label="Location" value={user.location} />}
            {user.favourite_driver && <Field label="Favourite Driver" value={user.favourite_driver} />}
            {(user.car || user.car_year) && (
              <Field label="Car" value={[user.car_year, user.car].filter(Boolean).join(' ')} />
            )}
            <Field label="User ID" value={user.id.slice(0, 16) + '…'} mono />
          </div>
        </div>
      </div>
    </div>
  )
}

function Badge({ label, gold, blue, green }: { label: string; gold?: boolean; blue?: boolean; green?: boolean }) {
  const bg = gold ? 'rgba(200,168,75,0.15)' : blue ? 'rgba(59,130,246,0.12)' : green ? 'rgba(14,102,64,0.15)' : 'rgba(255,255,255,0.06)'
  const color = gold ? '#c8a84b' : blue ? '#60a5fa' : green ? '#2d8a5e' : 'rgba(240,245,236,0.5)'
  return (
    <span style={{ background: bg, color, padding: '2px 8px', borderRadius: 3, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {label}
    </span>
  )
}

function BigStat({ label, value, accent, green }: { label: string; value: string; accent?: boolean; green?: boolean }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.85rem', textAlign: 'center' }}>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '1.15rem', fontWeight: 700, color: accent ? '#c8a84b' : green ? '#2d8a5e' : '#f0f5ec' }}>{value}</div>
      <div style={{ fontSize: '0.6rem', color: 'rgba(240,245,236,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '0.65rem 0.85rem', borderLeft: '2px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.28)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: mono ? '0.72rem' : '0.82rem', fontFamily: mono ? 'DM Mono, monospace' : 'DM Sans, sans-serif', color: '#f0f5ec' }}>{value}</div>
    </div>
  )
}
