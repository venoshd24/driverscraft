// src/app/admin/customers/page.tsx
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import CustomersClient from './CustomersClient'

export const metadata = { title: 'Customers — Admin' }

export default async function AdminCustomersPage() {
  const supabase = createClient()

  const [
    { data: rpcUsers },
    { data: profiles },
    { data: orderStats },
    { data: rsvpStats },
    { data: subscribers },
  ] = await Promise.all([
    supabase.rpc('get_admin_users'),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('user_id, total, status'),
    supabase.from('meet_rsvps').select('user_id'),
    supabase.from('newsletter_subscribers').select('email').eq('active', true),
  ])

  const statsMap = (orderStats || []).reduce((acc: any, o: any) => {
    if (!acc[o.user_id]) acc[o.user_id] = { count: 0, total: 0 }
    acc[o.user_id].count++
    if (['paid', 'delivered', 'shipped'].includes(o.status)) acc[o.user_id].total += o.total
    return acc
  }, {})

  // Count RSVPs per user
  const rsvpMap = (rsvpStats || []).reduce((acc: any, r: any) => {
    acc[r.user_id] = (acc[r.user_id] || 0) + 1
    return acc
  }, {})

  // Set of subscribed emails
  const subscribedEmails = new Set((subscribers || []).map((s: any) => s.email?.toLowerCase()))

  const source = (rpcUsers && rpcUsers.length > 0) ? rpcUsers : (profiles || [])

  const users = source.map((u: any) => ({
    id: u.id,
    email: u.email || '',
    first_name: u.first_name || '',
    last_name: u.last_name || '',
    favourite_driver: u.favourite_driver || '',
    car: u.car || '',
    car_year: u.car_year || '',
    location: u.location || '',
    bio: u.bio || '',
    is_admin: u.is_admin || false,
    created_at: u.created_at,
    orders: statsMap[u.id]?.count || 0,
    spent: statsMap[u.id]?.total || 0,
    rsvps: rsvpMap[u.id] || 0,
    subscribed: subscribedEmails.has((u.email || '').toLowerCase()),
  }))

  return <CustomersClient users={users} />
}
