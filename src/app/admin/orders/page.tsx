// src/app/admin/orders/page.tsx
import { createClient } from '@/lib/supabase/server'
import OrdersClient from './OrdersClient'

export const metadata = { title: 'Orders — Admin' }

export default async function AdminOrdersPage() {
  const supabase = createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*),
      profiles(first_name, last_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#f0f5ec' }}>Orders</h1>
        <p style={{ color: 'rgba(240,245,236,0.45)', marginTop: '0.3rem', fontSize: '0.9rem' }}>{orders?.length ?? 0} total orders</p>
      </div>
      <OrdersClient orders={orders || []} />
    </div>
  )
}
