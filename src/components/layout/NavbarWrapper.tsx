'use client'
// src/components/layout/NavbarWrapper.tsx
// Hides the main site navbar on /admin routes

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function NavbarWrapper() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null
  return <Navbar />
}
