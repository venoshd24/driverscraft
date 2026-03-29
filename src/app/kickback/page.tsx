// src/app/kickback/page.tsx
import { createClient } from '@/lib/supabase/server'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import KickbackClient from './KickbackClient'

export const revalidate = 60
export const metadata = { title: 'Kickback — driversCraft' }

export default async function KickbackPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: meets }, { data: userRsvps }] = await Promise.all([
    supabase.from('car_meets').select('*').order('date', { ascending: false }),
    user
      ? supabase.from('meet_rsvps').select('meet_id').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  // Compare date strings directly (YYYY-MM-DD) to avoid UTC offset issues
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }) // YYYY-MM-DD in MYT

  const allMeets = meets || []
  const rsvpedIds = new Set((userRsvps || []).map((r: any) => r.meet_id))

  const upcoming = allMeets
    .filter(m => m.date.slice(0, 10) >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))

  const past = allMeets
    .filter(m => m.date.slice(0, 10) < todayStr)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      {/* Hero */}
      <div style={{
        background: 'var(--green-deep)',
        padding: 'calc(var(--nav-height) + 4rem) clamp(1.5rem,6vw,6rem) 4rem',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', background: 'rgba(200,168,75,0.15)',
            border: '1px solid rgba(200,168,75,0.3)', color: 'var(--accent)',
            padding: '4px 14px', borderRadius: 2, fontSize: '0.68rem', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.25rem',
          }}>driversCraft Events</div>
          <h1 className="font-serif" style={{
            fontSize: 'clamp(2.8rem,5vw,4.5rem)', fontWeight: 900,
            color: 'var(--cream)', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: '1rem',
          }}>
            Kick<span style={{ color: 'var(--accent)' }}>back.</span>
          </h1>
          <p style={{ color: 'rgba(240,245,236,0.6)', fontSize: 'clamp(1rem,2vw,1.1rem)', lineHeight: 1.7, maxWidth: 520 }}>
            Car meets, community drives, and garage sessions hosted by driversCraft. Show up, hang out, talk cars.
          </p>
        </div>
      </div>

      <KickbackClient
        upcoming={upcoming}
        past={past}
        userId={user?.id || null}
        rsvpedIds={Array.from(rsvpedIds)}
      />

      <Footer />
    </>
  )
}
