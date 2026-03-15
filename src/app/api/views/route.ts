// src/app/api/views/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const slug: string = body.slug
  if (!slug) return NextResponse.json({ ok: false, error: 'no slug' })

  const admin = getAdmin()

  const { data: post, error: readErr } = await admin
    .from('posts')
    .select('view_count')
    .eq('slug', slug)
    .single()

  if (readErr || !post) return NextResponse.json({ ok: false, error: readErr?.message || 'not found' })

  const newCount = (post.view_count || 0) + 1
  const { error: updateErr } = await admin
    .from('posts')
    .update({ view_count: newCount })
    .eq('slug', slug)

  if (updateErr) return NextResponse.json({ ok: false, error: updateErr.message })

  return NextResponse.json({ ok: true, view_count: newCount })
}

// GET: check current count — /api/views?slug=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') || ''
  const admin = getAdmin()
  const { data, error } = await admin
    .from('posts').select('slug, view_count').eq('slug', slug).single()
  return NextResponse.json({ data, error: error?.message })
}
