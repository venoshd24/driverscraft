// src/app/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL!), {
    status: 302,
  })
}

export async function GET() {
  const supabase = createClient()
  await supabase.auth.signOut()

  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL!), {
    status: 302,
  })

  // Clear cart cookie so localStorage is wiped on next load
  response.cookies.set('dc_cart_clear', 'true', { maxAge: 10 })

  return response
}
