// src/app/admin/meets/new/page.tsx
import MeetForm from '@/components/admin/MeetForm'

export default function NewMeetPage() {
  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 900, color: '#f0f5ec' }}>New Meet</h1>
        <p style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Create a new Kickback event</p>
      </div>
      <MeetForm />
    </div>
  )
}
