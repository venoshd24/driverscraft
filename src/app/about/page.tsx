// src/app/about/page.tsx
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'About Us — driversCraft' }

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: 'var(--green-deep)', padding: 'calc(var(--nav-height) + 4rem) clamp(1.5rem,6vw,6rem) 5rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.3)', color: 'var(--accent)', padding: '4px 14px', borderRadius: 2, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Our Story</div>
          <h1 className="font-serif" style={{ fontSize: 'clamp(2.4rem,5vw,4rem)', fontWeight: 900, color: 'var(--cream)', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            Built by drivers.<br />For drivers.
          </h1>
          <p style={{ color: 'rgba(240,245,236,0.65)', fontSize: 'clamp(1rem,2vw,1.15rem)', lineHeight: 1.8, maxWidth: 580 }}>
            driversCraft started as a passion project between a group of motorsport enthusiasts who couldn't find gear that matched their obsession with the sport. So we built it ourselves.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div style={{ background: 'var(--cream)', padding: '5rem clamp(1.5rem,6vw,6rem)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--green-brand)', marginBottom: '0.75rem' }}>What We Do</div>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 900, color: 'var(--text-dark)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
              Gear that lives at the intersection of track & street
            </h2>
            <p style={{ color: 'var(--text-mid)', lineHeight: 1.8, fontSize: '1rem', marginBottom: '1rem' }}>
              Every piece we design is inspired by the culture of motorsport — the precision, the dedication, and the community that forms around the love of speed. We make clothing and accessories for people who see cars as more than just transport.
            </p>
            <p style={{ color: 'var(--text-mid)', lineHeight: 1.8, fontSize: '1rem' }}>
              Alongside our merch, we run <strong style={{ color: 'var(--text-dark)' }}>driversEdge</strong> — a editorial platform covering race analysis, driver profiles, and the technical stories that define the sport.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { icon: '🏎️', label: 'Race-Inspired Design', desc: 'Every drop is rooted in motorsport culture' },
              { icon: '🌿', label: 'Quality Materials', desc: 'Premium fabrics built to last beyond the season' },
              { icon: '📖', label: 'driversEdge', desc: 'In-depth stories for serious motorsport fans' },
              { icon: '🤝', label: 'Community First', desc: 'Built by enthusiasts, for enthusiasts' },
            ].map(item => (
              <div key={item.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-dark)', marginBottom: '0.3rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div style={{ background: '#0d1f17', padding: '5rem clamp(1.5rem,6vw,6rem)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem' }}>What Drives Us</div>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 900, color: 'var(--cream)', letterSpacing: '-0.02em' }}>Our Values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { num: '01', title: 'Authenticity', desc: 'We only make what we\'d wear to a race day ourselves. No filler, no fast fashion.' },
              { num: '02', title: 'Precision', desc: 'Like a well-set up car, every detail matters — from stitching to sizing.' },
              { num: '03', title: 'Community', desc: 'The best part of motorsport is the people. We\'re here to bring them together.' },
              { num: '04', title: 'Passion', desc: 'This isn\'t just a brand. It\'s a love letter to everyone who lives to drive.' },
            ].map(v => (
              <div key={v.num} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '0.75rem', opacity: 0.7 }}>{v.num}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--cream)', marginBottom: '0.6rem' }}>{v.title}</div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(240,245,236,0.5)', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'var(--cream)', padding: '5rem clamp(1.5rem,6vw,6rem)', textAlign: 'center' }}>
        <h2 className="font-serif" style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          Ready to gear up?
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>Browse the latest drops or read our most-viewed stories.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/shop" className="btn btn-green" style={{ padding: '0.85rem 2rem' }}>Shop Merch</a>
          <a href="/blog" className="btn btn-dark" style={{ padding: '0.85rem 2rem' }}>Read Stories</a>
        </div>
      </div>

      <Footer />
    </>
  )
}
