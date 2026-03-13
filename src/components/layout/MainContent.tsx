'use client'
// src/components/layout/MainContent.tsx
// Suppresses nav padding on /admin routes

import { usePathname } from 'next/navigation'

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  return (
    <main style={isAdmin ? {} : { paddingTop: 'var(--nav-height)' }}>
      {children}
    </main>
  )
}
