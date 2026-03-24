// src/app/admin/page.tsx
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminAnalytics from './AdminAnalytics'

export default async function AdminDashboard() {
  const supabase = createClient()

  const [
    { count: totalOrders },
    { count: totalProducts },
    { count: totalPosts },
    { count: totalCustomers },
    { count: totalSubscribers },
    { count: totalRsvps },
    { data: recentOrders },
    { data: revenue },
    { data: allOrders },
    { data: topProducts },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('meet_rsvps').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('total').eq('status', 'paid'),
    // Last 90 days of orders for the chart
    supabase.from('orders').select('total, created_at, status').gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()).order('created_at', { ascending: true }),
    // Top products by order count
    supabase.from('order_items').select('product_name, product_emoji, quantity').limit(200),
  ])

  const totalRevenue = (revenue || []).reduce((sum, o) => sum + o.total, 0)

  // Build daily revenue for chart (last 30 days)
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    d.setHours(0, 0, 0, 0)
    return d
  })

  const dailyRevenue = last30.map(day => {
    const dayStr = day.toISOString().slice(0, 10)
    const dayOrders = (allOrders || []).filter(o =>
      o.created_at.slice(0, 10) === dayStr && o.status === 'paid'
    )
    return {
      date: day.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0) / 100,
      orders: dayOrders.length,
    }
  })

  // Top products
  const productCounts: Record<string, { name: string; emoji: string; qty: number }> = {}
  for (const item of topProducts || []) {
    if (!productCounts[item.product_name]) {
      productCounts[item.product_name] = { name: item.product_name, emoji: item.product_emoji, qty: 0 }
    }
    productCounts[item.product_name].qty += item.quantity
  }
  const topProductsList = Object.values(productCounts)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  const stats = [
    { label: 'Total Revenue', value: `RM ${(totalRevenue / 100).toFixed(2)}`, icon: '💰', color: '#c8a84b', sub: 'from paid orders' },
    { label: 'Total Orders', value: totalOrders ?? 0, icon: '📦', color: '#2d8a5e', sub: 'all time' },
    { label: 'Customers', value: totalCustomers ?? 0, icon: '👥', color: '#0e6640', sub: 'registered' },
    { label: 'Subscribers', value: totalSubscribers ?? 0, icon: '📧', color: '#3b82f6', sub: 'newsletter' },
    { label: 'Active Products', value: totalProducts ?? 0, icon: '👕', color: '#8b5cf6', sub: 'in shop' },
    { label: 'Articles', value: totalPosts ?? 0, icon: '📝', color: '#f59e0b', sub: 'published' },
    { label: 'Meet RSVPs', value: totalRsvps ?? 0, icon: '🚗', color: '#ec4899', sub: 'total' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#f0f5ec', letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ color: 'rgba(240,245,236,0.45)', marginTop: '0.3rem', fontSize: '0.9rem' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: '#121d17', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
              <span style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.3)', textAlign: 'right', lineHeight: 1.4 }}>{s.sub}</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color, fontFamily: 'DM Mono, monospace', marginBottom: '0.2rem' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(240,245,236,0.45)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Analytics — revenue chart + top products */}
      <AdminAnalytics dailyRevenue={dailyRevenue} topProducts={topProductsList} />

      {/* Quick Actions */}
      <div className="admin-actions-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          { href: '/admin/products/new', icon: '➕', label: 'Add New Product', color: '#0e6640' },
          { href: '/admin/posts/new', icon: '✏️', label: 'Write New Article', color: '#1a4a35' },
          { href: '/admin/meets/new', icon: '🚗', label: 'New Kickback Meet', color: '#1a3a4a' },
          { href: '/admin/orders', icon: '📦', label: 'View All Orders', color: '#121d17' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: a.color, border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '1.1rem 1.4rem',
              display: 'flex', alignItems: 'center', gap: 12,
              color: '#f0f5ec', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
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
                  <td style={{ padding: '1rem 1.5rem', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem', color: '#c8a84b' }}>#{order.id.slice(0,8).toUpperCase()}</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'rgba(240,245,236,0.7)' }}>{order.order_items?.length ?? 0} item(s)</td>
                  <td style={{ padding: '1rem 1.5rem', fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: '#f0f5ec' }}>RM {(order.total / 100).toFixed(2)}</td>
                  <td style={{ padding: '1rem 1.5rem' }}><span className={`badge badge-status-${order.status}`}>{order.status}</span></td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: 'rgba(240,245,236,0.4)' }}>{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
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
