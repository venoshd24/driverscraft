// src/components/layout/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          <div className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--cream)' }}>
            drivers<span style={{ color: 'var(--accent)' }}>Craft</span>.
          </div>
          <p style={{ color: 'rgba(240,245,236,0.5)', fontSize: '0.88rem', lineHeight: 1.7, marginTop: '1rem' }}>
            Premium motorsport lifestyle brand. Gear, stories, and community for people who live to drive.
          </p>
        </div>

        {/* Quick Links — single column */}
        <div>
          <h4 className="font-mono" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none' }}>
            {[
              { label: 'Home', href: '/' },
              { label: 'Merch', href: '/shop' },
              { label: 'Articles', href: '/blog' },
              { label: 'Kickback', href: '/kickback' },
              { label: 'About Us', href: '/about' },
            ].map(l => (
              <li key={l.label} style={{ marginBottom: '0.6rem' }}>
                <Link href={l.href} style={{ color: 'rgba(240,245,236,0.55)', fontSize: '0.88rem', textDecoration: 'none' }}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p style={{ color: 'rgba(240,245,236,0.3)', fontSize: '0.78rem' }}>© {new Date().getFullYear()} driversCraft. All rights reserved.</p>
        <p style={{ color: 'rgba(240,245,236,0.3)', fontSize: '0.78rem' }}>Designed for those who live to drive.</p>
      </div>
    </footer>
  )
}
