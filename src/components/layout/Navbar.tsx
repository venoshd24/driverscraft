'use client'
// src/components/layout/Navbar.tsx

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/cart-context'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const pathname = usePathname()
  const { count } = useCart()
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const isVisible = scrolled || hovered || menuOpen
  const isHome = pathname === '/'
  const alwaysSolid = !isHome // solid on all pages except landing

  useEffect(() => {
    // Initialize from current scroll position (handles page refresh mid-scroll)
    setScrolled(window.scrollY > 20)
    function onScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    const sb = createClient()
    async function loadUser(uid: string) {
      const { data: profile } = await sb.from('profiles').select('is_admin').eq('id', uid).single()
      setIsAdmin(profile?.is_admin ?? false)
    }
    sb.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) loadUser(data.user.id)
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadUser(session.user.id)
      else setIsAdmin(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const sb = createClient()
    await sb.auth.signOut()
    window.location.href = '/'
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const leftLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/blog', label: 'driversEdge' },
    { href: '/about', label: 'About Us' },
    ...(isAdmin ? [{ href: '/admin', label: '⚙ Admin', accent: true }] : []),
  ]

  return (
    <>
      <nav
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: (isVisible || alwaysSolid) ? 'rgba(13,31,23,0.96)' : 'rgba(13,31,23,0)',
          borderBottom: '1px solid',
          borderBottomColor: (isVisible || alwaysSolid) ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0)',
          backdropFilter: (isVisible || alwaysSolid) ? 'blur(16px)' : 'blur(0px)',
          WebkitBackdropFilter: (isVisible || alwaysSolid) ? 'blur(16px)' : 'blur(0px)',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '0 1.5rem',
          height: 'var(--nav-height)',
          transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, backdrop-filter 0.4s ease',
          boxShadow: scrolled ? '0 4px 30px rgba(13,31,23,0.3)' : 'none',
        }}>

        {/* LEFT — nav links */}
        <ul className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
          {leftLinks.map(({ href, label, accent }: any) => {
            const active = href === '/' ? pathname === '/' : isActive(href)
            return (
              <li key={href}>
                <Link href={href} className={`nav-link-animated${active ? ' active' : ''}`} style={{
                  color: accent ? 'var(--accent)' : (active ? 'var(--cream)' : 'rgba(240,245,236,0.65)'),
                  textDecoration: 'none', fontSize: '0.82rem',
                  fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase',
                  transition: 'color 0.2s ease',
                }}>{label}</Link>
              </li>
            )
          })}
        </ul>

        {/* MOBILE LEFT — hamburger */}
        <div className="mobile-nav" style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => setMenuOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: 22, height: 2, background: 'var(--cream)', borderRadius: 2,
                transition: 'all 0.25s ease',
                transform: menuOpen
                  ? i === 0 ? 'translateY(7px) rotate(45deg)'
                  : i === 2 ? 'translateY(-7px) rotate(-45deg)' : 'scaleX(0)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>

        {/* CENTER — Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          <Image
            src="/logo.png"
            alt="driversCraft"
            width={180}
            height={48}
            style={{ objectFit: 'contain', maxHeight: 44 }}
            priority
          />
        </Link>

        {/* RIGHT — actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          {/* Desktop auth */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user === undefined ? (
              // Loading — render invisible placeholder to prevent layout shift
              <div style={{ width: 120, height: 32 }} />
            ) : user ? (
              <>
                <Link href="/account" style={{ color: 'rgba(240,245,236,0.7)', fontSize: '0.85rem', textDecoration: 'none' }}>
                  {user.user_metadata?.first_name || user.email?.split('@')[0]}
                </Link>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Log Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-outline-light btn-sm">Log In</Link>
                <Link href="/auth/signup" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Cart — always visible */}
          <button onClick={() => document.getElementById('cart-drawer')?.classList.toggle('open')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cream)', fontSize: '1.25rem', position: 'relative', padding: '4px' }}>
            🛒
            {count > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -6, background: 'var(--accent)', color: 'var(--green-deep)', borderRadius: '50%', width: 18, height: 18, fontSize: '0.62rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div className="mobile-nav" style={{
        position: 'fixed', top: 'var(--nav-height)', left: 0, right: 0, zIndex: 999,
        background: 'var(--green-deep)',
        overflow: 'hidden',
        maxHeight: menuOpen ? '400px' : '0',
        transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
          {leftLinks.map(({ href, label, accent }: any) => (
            <Link key={href} href={href} style={{
              display: 'block', padding: '0.75rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              color: accent ? 'var(--accent)' : 'var(--cream)',
              textDecoration: 'none', fontSize: '1rem', fontWeight: 600,
              letterSpacing: '0.03em',
            }}>{label}</Link>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
            {user === undefined ? null : user ? (
              <button className="btn btn-outline-light btn-sm btn-full" onClick={handleLogout}>Log Out</button>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-outline-light btn-sm" style={{ flex: 1, textAlign: 'center' }}>Log In</Link>
                <Link href="/auth/signup" className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-nav" onClick={() => setMenuOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.4)',
          top: 'var(--nav-height)',
        }} />
      )}
    </>
  )
}