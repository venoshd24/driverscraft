'use client'
// src/components/admin/AdminSidebar.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin',           icon: '📊', label: 'Dashboard' },
  { href: '/admin/orders',    icon: '📦', label: 'Orders' },
  { href: '/admin/products',  icon: '👕', label: 'Products' },
  { href: '/admin/posts',     icon: '📝', label: 'Articles' },
  { href: '/admin/customers', icon: '👥', label: 'Customers' },
]

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
      background: '#0a1510',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 700, color: '#f0f5ec' }}>
            drivers<span style={{ color: '#c8a84b' }}>Craft</span>.
          </div>
        </Link>
        <div style={{
          marginTop: '0.4rem', fontSize: '0.7rem', fontFamily: 'DM Mono, monospace',
          letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c8a84b',
        }}>Admin Panel</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        {NAV.map(({ href, icon, label }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.7rem 0.85rem', borderRadius: 6, marginBottom: 2,
                background: active ? 'rgba(14,102,64,0.2)' : 'transparent',
                border: active ? '1px solid rgba(14,102,64,0.3)' : '1px solid transparent',
                color: active ? '#f0f5ec' : 'rgba(240,245,236,0.5)',
                fontSize: '0.88rem', fontWeight: active ? 600 : 400,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span style={{ fontSize: '1rem' }}>{icon}</span>
                {label}
                {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#c8a84b' }} />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--green-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', color: '#f0f5ec', fontWeight: 700,
          }}>{adminName[0].toUpperCase()}</div>
          <div>
            <div style={{ color: '#f0f5ec', fontSize: '0.85rem', fontWeight: 600 }}>{adminName}</div>
            <div style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.72rem' }}>Administrator</div>
          </div>
        </div>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back to site
          </div>
        </Link>
      </div>
    </aside>
  )
}
