// src/components/layout/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#0d1f17', padding: '3rem 5rem 2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
        <div>
          <div className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--cream)' }}>
            drivers<span style={{ color: 'var(--accent)' }}>Craft</span>.
          </div>
          <p style={{ color: 'rgba(240,245,236,0.5)', fontSize: '0.88rem', lineHeight: 1.7, marginTop: '1rem' }}>
            Premium motorsport lifestyle brand. Gear, stories, and community for people who live to drive.
          </p>
        </div>
        {[
          { title: 'Shop', links: [{ label: 'All Merch', href: '/shop' }, { label: 'Apparel', href: '/shop?cat=apparel' }, { label: 'Headwear', href: '/shop?cat=headwear' }, { label: 'Accessories', href: '/shop?cat=accessories' }] },
          { title: 'Stories', links: [{ label: 'Race Analysis', href: '/blog' }, { label: 'Driver Profiles', href: '/blog' }, { label: 'Tech Deep Dives', href: '/blog' }, { label: 'History', href: '/blog' }] },
          { title: 'Account', links: [{ label: 'Log In', href: '/auth/login' }, { label: 'Sign Up', href: '/auth/signup' }, { label: 'My Orders', href: '/account' }, { label: 'Profile', href: '/account' }] },
        ].map(col => (
          <div key={col.title}>
            <h4 className="font-mono" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>{col.title}</h4>
            <ul style={{ listStyle: 'none' }}>
              {col.links.map(l => (
                <li key={l.label} style={{ marginBottom: '0.6rem' }}>
                  <Link href={l.href} style={{ color: 'rgba(240,245,236,0.55)', fontSize: '0.88rem', textDecoration: 'none' }}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <p style={{ color: 'rgba(240,245,236,0.3)', fontSize: '0.78rem' }}>© {new Date().getFullYear()} driversCraft. All rights reserved.</p>
        <p style={{ color: 'rgba(240,245,236,0.3)', fontSize: '0.78rem' }}>Designed for those who live to drive.</p>
      </div>
    </footer>
  )
}
