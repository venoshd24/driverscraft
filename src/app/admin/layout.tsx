// src/app/admin/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { title: 'Admin — driversCraft' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles').select('is_admin, first_name').eq('id', user.id).single()

  if (!profile?.is_admin) redirect('/')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f1a14' }}>
      <AdminSidebar adminName={profile.first_name || user.email!.split('@')[0]} />
      <div style={{ flex: 1, marginLeft: 260, padding: '2rem 2.5rem', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}
