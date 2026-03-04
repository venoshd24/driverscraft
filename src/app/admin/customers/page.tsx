// src/app/admin/customers/page.tsx
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Customers — Admin' }

export default async function AdminCustomersPage() {
  const supabase = createClient()

  // Get profiles joined with order counts
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Get order stats per user
  const { data: orderStats } = await supabase
    .from('orders')
    .select('user_id, total, status')

  const statsMap = (orderStats || []).reduce((acc: any, o) => {
    if (!acc[o.user_id]) acc[o.user_id] = { count: 0, total: 0 }
    acc[o.user_id].count++
    if (o.status === 'paid' || o.status === 'delivered' || o.status === 'shipped') {
      acc[o.user_id].total += o.total
    }
    return acc
  }, {})

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#f0f5ec' }}>Customers</h1>
        <p style={{ color: 'rgba(240,245,236,0.45)', marginTop: '0.3rem', fontSize: '0.9rem' }}>{profiles?.length ?? 0} registered users</p>
      </div>

      <div style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                        <div style={{ color: '#f0f5ec', fontWeight: 600, fontSize: '0.88rem' }}>
                          {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Unnamed User'}
                        </div>
                        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'rgba(240,245,236,0.35)', marginTop: 1 }}>{profile.id.slice(0, 12)}…</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'rgba(240,245,236,0.6)' }}>{profile.favourite_driver || '—'}</td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: '#f0f5ec' }}>{stats.count}</td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: '#c8a84b' }}>
                    {stats.total > 0 ? `$${(stats.total / 100).toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {profile.is_admin ? (
                      <span style={{ background: 'rgba(200,168,75,0.15)', color: '#c8a84b', padding: '2px 8px', borderRadius: 2, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin</span>
                    ) : (
                      <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(240,245,236,0.45)', padding: '2px 8px', borderRadius: 2, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Customer</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', color: 'rgba(240,245,236,0.4)' }}>
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              )
            })}
            {(!profiles || profiles.length === 0) && (
              <tr><td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(240,245,236,0.3)', fontSize: '0.85rem' }}>No customers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
