'use client'
// src/components/layout/Navbar.tsx

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/cart-context'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const pathname = usePathname()
  const { count } = useCart()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const { data: profile } = await sb
          .from('profiles').select('is_admin').eq('id', data.user.id).single()
        setIsAdmin(profile?.is_admin ?? false)
      }
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await sb
          .from('profiles').select('is_admin').eq('id', session.user.id).single()
        setIsAdmin(profile?.is_admin ?? false)
      } else {
        setIsAdmin(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    try {
      const sb = createClient()
      await sb.auth.signOut()
    } catch (_) {}
    setUser(null)
    setIsAdmin(false)
    window.location.href = '/'
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(26,74,53,0.97)' : 'var(--green-deep)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.08)',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2.5rem', height: 'var(--nav-height)',
      transition: 'background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease',
      boxShadow: scrolled ? '0 4px 30px rgba(13,31,23,0.25)' : 'none',
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
        ].map(({ href, label }) => {
          const active = href === '/' ? pathname === '/' : isActive(href)
          return (
            <li key={href}>
              <Link href={href} className={`nav-link-animated${active ? ' active' : ''}`} style={{
                color: active ? 'var(--cream)' : 'rgba(240,245,236,0.65)',
                textDecoration: 'none', fontSize: '0.82rem',
                fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase',
                transition: 'color 0.2s ease',
              }}>
                {label}
              </Link>
            </li>
          )
        })}

        {user && (
          <li>
            <Link href="/account" className={`nav-link-animated${isActive('/account') ? ' active' : ''}`} style={{
              color: isActive('/account') ? 'var(--cream)' : 'rgba(240,245,236,0.65)',
              textDecoration: 'none', fontSize: '0.82rem',
              fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase',
              transition: 'color 0.2s ease',
            }}>
              Account
            </Link>
          </li>
        )}

        {isAdmin && (
          <li>
            <Link href="/admin" className={`nav-link-animated${isActive('/admin') ? ' active' : ''}`} style={{
              color: isActive('/admin') ? 'var(--accent)' : 'rgba(200,168,75,0.75)',
              textDecoration: 'none', fontSize: '0.82rem',
              fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
              transition: 'color 0.2s ease',
            }}>
              ⚙ Admin
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
