'use client'
// src/components/layout/Navbar.tsx

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/cart-context'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { count } = useCart()
  const [user, setUser] = useState<User | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Expose cart toggle globally so CartDrawer button works
  useEffect(() => {
    ;(window as any).__openCart = () => {
      document.getElementById('cart-drawer')?.classList.toggle('open')
    }
  }, [])

  async function handleLogout() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'var(--green-deep)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2.5rem', height: 'var(--nav-height)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 32, height: 32, background: 'var(--cream)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>🏎️</div>
        <span className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.02em' }}>
          drivers<span style={{ color: 'var(--accent)' }}>Craft</span>.
        </span>
      </Link>

      {/* Nav Links */}
      <ul style={{ display: 'flex', alignItems: 'center', gap: '2rem', listStyle: 'none' }}>
        {[
          { href: '/', label: 'Home' },
          { href: '/shop', label: 'Shop' },
          { href: '/blog', label: 'Stories' },
        ].map(({ href, label }) => (
          <li key={href}>
            <Link href={href} style={{
              color: isActive(href) && href !== '/' || (href === '/' && pathname === '/')
                ? 'var(--cream)' : 'rgba(240,245,236,0.65)',
              textDecoration: 'none', fontSize: '0.82rem',
              fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}>
              {label}
            </Link>
          </li>
        ))}
        {user && (
          <li>
            <Link href="/account" style={{
              color: isActive('/account') ? 'var(--cream)' : 'rgba(240,245,236,0.65)',
              textDecoration: 'none', fontSize: '0.82rem',
              fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              Account
            </Link>
          </li>
        )}
      </ul>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {user ? (
          <>
            <span style={{ color: 'rgba(240,245,236,0.7)', fontSize: '0.85rem' }}>
              {user.user_metadata?.first_name || user.email?.split('@')[0]}
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="btn btn-outline-light btn-sm">Log In</Link>
            <Link href="/auth/signup" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}

        {/* Cart */}
        <button
          onClick={() => document.getElementById('cart-drawer')?.classList.toggle('open')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--cream)', fontSize: '1.25rem',
            position: 'relative', padding: '4px',
          }}
          aria-label="Open cart"
        >
          🛒
          {count > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -6,
              background: 'var(--accent)', color: 'var(--green-deep)',
              borderRadius: '50%', width: 18, height: 18,
              fontSize: '0.62rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {count}
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}
