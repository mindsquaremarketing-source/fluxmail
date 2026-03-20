export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { syncAllContacts } from '@/lib/sync'

export async function POST(req: NextRequest) {
  try {
    const { shop } = await req.json()

    if (!shop) {
      return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 })
    }

    const store = await prisma.store.findUnique({
      where: { shopDomain: shop },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const result = await syncAllContacts(store.id, store.accessToken, store.shopDomain)

    return NextResponse.json({
      success: true,
      totalSynced: result.totalSynced,
    })
  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
