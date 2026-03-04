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

  return (
    <>
      <div style={{ background: 'var(--green-deep)', padding: '3rem 5rem' }}>
        <h2 className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cream)' }}>
          Welcome back, {profile?.first_name || user.email?.split('@')[0]} 👋
        </h2>
        <p style={{ color: 'rgba(240,245,236,0.6)', marginTop: '0.3rem' }}>{user.email}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 220px)' }}>
        <AccountClient profile={profile} orders={orders || []} userEmail={user.email!} />
      </div>
      <Footer />
    </>
  )
}
