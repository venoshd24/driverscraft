// src/app/admin/meets/edit/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MeetForm from '@/components/admin/MeetForm'

export default async function EditMeetPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: meet } = await supabase.from('car_meets').select('*').eq('id', params.id).single()
  if (!meet) notFound()

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 900, color: '#f0f5ec' }}>Edit Meet</h1>
        <p style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{meet.title}</p>
      </div>
      <MeetForm meet={meet} />
    </div>
  )
}
