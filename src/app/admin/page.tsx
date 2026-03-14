// src/app/admin/page.tsx
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createClient()

  const [
    { count: totalOrders },
    { count: totalProducts },
    { count: totalPosts },
    { count: totalCustomers },
    { data: recentOrders },
    { data: revenue },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('total').eq('status', 'paid'),
  ])

  const totalRevenue = (revenue || []).reduce((sum, o) => sum + o.total, 0)

  const stats = [
    { label: 'Total Revenue', value: `$${(totalRevenue / 100).toFixed(2)}`, icon: '💰', color: '#c8a84b', sub: 'from paid orders' },
    { label: 'Total Orders', value: totalOrders ?? 0, icon: '📦', color: '#2d8a5e', sub: 'all time' },
    { label: 'Products', value: totalProducts ?? 0, icon: '👕', color: '#0e6640', sub: 'active listings' },
    { label: 'Customers', value: totalCustomers ?? 0, icon: '👥', color: '#1a4a35', sub: 'registered users' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#f0f5ec', letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ color: 'rgba(240,245,236,0.45)', marginTop: '0.3rem', fontSize: '0.9rem' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ marginBottom: '2.5rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: '#121d17', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '1.25rem 1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
              <span style={{ fontSize: '0.62rem', fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.35)', textAlign: 'right', lineHeight: 1.4 }}>{s.sub}</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f0f5ec', fontFamily: 'DM Mono, monospace', marginBottom: '0.25rem' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(240,245,236,0.5)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="admin-actions-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          { href: '/admin/products/new', icon: '➕', label: 'Add New Product', color: '#0e6640' },
          { href: '/admin/posts/new', icon: '✏️', label: 'Write New Article', color: '#1a4a35' },
          { href: '/admin/orders', icon: '📦', label: 'View All Orders', color: '#121d17' },
          { href: '/admin/customers', icon: '👥', label: 'View Customers', color: '#121d17' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: a.color, border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '1.1rem 1.4rem',
              display: 'flex', alignItems: 'center', gap: 12,
              color: '#f0f5ec', fontWeight: 600, fontSize: '0.9rem',
              transition: 'opacity 0.2s, transform 0.2s',
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
              {a.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#f0f5ec', fontSize: '1rem', fontWeight: 700 }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ color: '#c8a84b', fontSize: '0.8rem', textDecoration: 'none' }}>View all →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Order ID', 'Items', 'Total', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.35)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(recentOrders || []).map((order: any) => (
              <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '1rem 1.5rem', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem', color: '#c8a84b' }}>
                  #{order.id.slice(0,8).toUpperCase()}
                </td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'rgba(240,245,236,0.7)' }}>
                  {order.order_items?.length ?? 0} item(s)
                </td>
                <td style={{ padding: '1rem 1.5rem', fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: '#f0f5ec' }}>
                  ${(order.total / 100).toFixed(2)}
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span className={`badge badge-status-${order.status}`}>{order.status}</span>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: 'rgba(240,245,236,0.4)' }}>
                  {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </td>
              </tr>
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'rgba(240,245,236,0.3)', fontSize: '0.85rem' }}>No orders yet</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
