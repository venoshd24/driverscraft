'use client'
// src/app/blog/[slug]/ViewTracker.tsx
// Silently increments view_count when article is opened

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const sb = createClient()
    // Use RPC so it works regardless of RLS read policies
    sb.rpc('increment_post_views', { post_slug: slug }).then()
  }, [slug])

  return null
}
