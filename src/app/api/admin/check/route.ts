// src/app/api/admin/check/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return NextResponse.json({ isAdmin: false })

    // Now that profiles RLS allows users to read their own row, this works directly
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[admin/check] profile error:', profileError.message)
      return NextResponse.json({ isAdmin: false })
    }

    return NextResponse.json({ isAdmin: profile?.is_admin === true })
  } catch (e) {
    console.error('[admin/check] unexpected error:', e)
    return NextResponse.json({ isAdmin: false })
  }
}