import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') || ''
  const supabase = createClient()

  // Try RPC
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('increment_post_views', { post_slug: slug })

  // Try direct update as fallback
  const { data: updateData, error: updateError } = await supabase
    .from('posts')
    .update({ view_count: 999 })
    .eq('slug', slug)
    .select('slug, view_count')

  // Current value
  const { data: current } = await supabase
    .from('posts')
    .select('slug, view_count')
    .eq('slug', slug)
    .single()

  return NextResponse.json({ 
    slug,
    rpc: { data: rpcData, error: rpcError },
    directUpdate: { data: updateData, error: updateError },
    current 
  })
}
