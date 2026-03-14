// src/app/admin/customers/page.tsx
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Customers — Admin' }

export default async function AdminCustomersPage() {
  const supabase = createClient()

  const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  const { data: orderStats } = await supabase.from('orders').select('user_id, total, status')

  const statsMap = (orderStats || []).reduce((acc: any, o) => {
    if (!acc[o.user_id]) acc[o.user_id] = { count: 0, total: 0 }
    acc[o.user_id].count++
    if (['paid','delivered','shipped'].includes(o.status)) acc[o.user_id].total += o.total
    return acc
  }, {})

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#f0f5ec' }}>Customers</h1>
        <p style={{ color: 'rgba(240,245,236,0.45)', marginTop: '0.3rem', fontSize: '0.9rem' }}>{profiles?.length ?? 0} registered users</p>
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="admin-table-desktop" style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Customer', 'Favourite Driver', 'Orders', 'Total Spent', 'Role', 'Joined'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.3)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(profiles || []).map((profile: any) => {
              const stats = statsMap[profile.id] || { count: 0, total: 0 }
              const initials = ((profile.first_name || 'U')[0] + (profile.last_name || '')[0]).toUpperCase()
              return (
                <tr key={profile.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: profile.is_admin ? '#c8a84b' : '#0e6640', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: '#f0f5ec', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                      <div>
                        <div style={{ color: '#f0f5ec', fontWeight: 600, fontSize: '0.88rem' }}>{[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Unnamed User'}</div>
                        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'rgba(240,245,236,0.35)', marginTop: 1 }}>{profile.id.slice(0, 12)}…</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'rgba(240,245,236,0.6)' }}>{profile.favourite_driver || '—'}</td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: '#f0f5ec' }}>{stats.count}</td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: '#c8a84b' }}>{stats.total > 0 ? `$${(stats.total / 100).toFixed(2)}` : '—'}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ background: profile.is_admin ? 'rgba(200,168,75,0.15)' : 'rgba(255,255,255,0.06)', color: profile.is_admin ? '#c8a84b' : 'rgba(240,245,236,0.45)', padding: '2px 8px', borderRadius: 2, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{profile.is_admin ? 'Admin' : 'Customer'}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: 'rgba(240,245,236,0.4)' }}>{profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                </tr>
              )
            })}
            {(!profiles || profiles.length === 0) && (
              <tr><td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(240,245,236,0.3)', fontSize: '0.85rem' }}>No customers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="admin-cards-mobile">
        {(profiles || []).map((profile: any) => {
          const stats = statsMap[profile.id] || { count: 0, total: 0 }
          const initials = ((profile.first_name || 'U')[0] + (profile.last_name || '')[0]).toUpperCase()
          return (
            <div key={profile.id} className="admin-card">
              <div className="admin-card-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: profile.is_admin ? '#c8a84b' : '#0e6640', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', color: '#f0f5ec', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                  <div>
                    <div style={{ color: '#f0f5ec', fontWeight: 700, fontSize: '0.95rem' }}>{[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Unnamed User'}</div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'rgba(240,245,236,0.35)', marginTop: 2 }}>{profile.id.slice(0, 14)}…</div>
                  </div>
                </div>
                <span style={{ background: profile.is_admin ? 'rgba(200,168,75,0.15)' : 'rgba(255,255,255,0.06)', color: profile.is_admin ? '#c8a84b' : 'rgba(240,245,236,0.4)', padding: '2px 8px', borderRadius: 2, fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>{profile.is_admin ? 'Admin' : 'Customer'}</span>
              </div>
              <div className="admin-card-meta">
                <span style={{ color: 'rgba(240,245,236,0.45)', fontSize: '0.78rem' }}>Orders: <b style={{ color: '#f0f5ec', fontFamily: 'DM Mono, monospace' }}>{stats.count}</b></span>
                <span style={{ color: 'rgba(240,245,236,0.45)', fontSize: '0.78rem' }}>Spent: <b style={{ color: '#c8a84b', fontFamily: 'DM Mono, monospace' }}>{stats.total > 0 ? `$${(stats.total/100).toFixed(2)}` : '—'}</b></span>
                {profile.favourite_driver && <span style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.75rem' }}>🏎 {profile.favourite_driver}</span>}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(240,245,236,0.3)', marginTop: 6 }}>Joined {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</div>
            </div>
          )
        })}
        {(!profiles || profiles.length === 0) && (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(240,245,236,0.3)', background: '#121d17', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>No customers yet</div>
        )}
      </div>
    </div>
  )
}
