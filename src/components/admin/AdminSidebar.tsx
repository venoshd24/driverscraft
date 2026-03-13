'use client'
// src/components/admin/AdminSidebar.tsx

import { useState } from 'react'
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
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="admin-sidebar">
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
            const active = isActive(href)
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0.7rem 0.85rem', borderRadius: 6, marginBottom: 2,
                  background: active ? 'rgba(14,102,64,0.2)' : 'transparent',
                  border: active ? '1px solid rgba(14,102,64,0.3)' : '1px solid transparent',
                  color: active ? '#f0f5ec' : 'rgba(240,245,236,0.5)',
                  fontSize: '0.88rem', fontWeight: active ? 600 : 400,
                  transition: 'all 0.2s ease', cursor: 'pointer',
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
              fontSize: '0.75rem', color: '#f0f5ec', fontWeight: 700, flexShrink: 0,
            }}>{adminName[0].toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#f0f5ec', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminName}</div>
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

      {/* ── MOBILE TOP BAR ── */}
      <div className="admin-mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: '#f0f5ec', cursor: 'pointer', fontSize: '1.2rem', padding: 4, lineHeight: 1 }}
          >☰</button>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700, color: '#f0f5ec' }}>
            drivers<span style={{ color: '#c8a84b' }}>Craft</span>.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: 'var(--green-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', color: '#f0f5ec', fontWeight: 700,
          }}>{adminName[0].toUpperCase()}</div>
          <Link href="/" style={{ color: 'rgba(240,245,236,0.5)', fontSize: '0.75rem', textDecoration: 'none' }}>← Site</Link>
        </div>
      </div>

      {/* ── MOBILE SLIDE-IN DRAWER ── */}
      {mobileOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className={`admin-mobile-drawer${mobileOpen ? ' open' : ''}`}>
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700, color: '#f0f5ec' }}>
            drivers<span style={{ color: '#c8a84b' }}>Craft</span>.
          </span>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(240,245,236,0.5)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
        <nav style={{ padding: '0.75rem' }}>
          {NAV.map(({ href, icon, label }) => {
            const active = isActive(href)
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0.85rem 1rem', borderRadius: 8, marginBottom: 4,
                  background: active ? 'rgba(14,102,64,0.25)' : 'transparent',
                  color: active ? '#f0f5ec' : 'rgba(240,245,236,0.55)',
                  fontSize: '0.95rem', fontWeight: active ? 600 : 400,
                }}>
                  <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center' }}>{icon}</span>
                  {label}
                  {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#c8a84b' }} />}
                </div>
              </Link>
            )
          })}
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
          <Link href="/" style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back to site
          </Link>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="admin-bottom-nav">
        {NAV.map(({ href, icon, label }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none', flex: 1 }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '0.5rem 0',
                color: active ? '#c8a84b' : 'rgba(240,245,236,0.4)',
                fontSize: '0.6rem', fontWeight: active ? 700 : 400,
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                {label}
              </div>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
