export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.storage.createBucket(
      'fluxmail-assets',
      { public: true, allowedMimeTypes: ['image/*'], fileSizeLimit: 2097152 }
    )

    if (error && !error.message.includes('already exists')) {
      throw error
    }

    return NextResponse.json({ success: true, message: 'Storage ready' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
