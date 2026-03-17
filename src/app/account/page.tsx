// src/app/account/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccountClient from './AccountClient'
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'My Account — driversCraft' }

export default async function AccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/account')

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const name = profile?.first_name || user.email?.split('@')[0] || 'there'

  return (
    <>
      {/* Hero */}
      <div style={{ background: 'var(--green-deep)', padding: 'calc(var(--nav-height) + 2rem) clamp(1.5rem,5vw,5rem) 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ color: 'rgba(240,245,236,0.5)', fontSize: '0.8rem', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>My Account</p>
          <h1 className="font-serif" style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, color: 'var(--cream)', letterSpacing: '-0.02em' }}>
            Welcome back, {name} 👋
          </h1>
          <p style={{ color: 'rgba(240,245,236,0.5)', marginTop: '0.35rem', fontSize: '0.85rem' }}>{user.email}</p>
        </div>
      </div>

      <AccountClient profile={profile} orders={orders || []} userEmail={user.email!} />
      <Footer />
    </>
  )
}
