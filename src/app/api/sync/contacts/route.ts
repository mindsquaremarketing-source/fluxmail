export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { syncAllContacts } from '@/lib/sync'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shop } = body

    if (!shop) {
      return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 })
    }

    const store = await prisma.store.findUnique({
      where: { shopDomain: shop }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    console.log('Store found:', store.shopDomain)
    console.log('Store ID:', store.id)
    console.log('Starting sync for:', shop)
    console.log('Access token exists:', !!store.accessToken)
    console.log('Access token preview:', store.accessToken?.substring(0, 10))

    const totalSynced = await syncAllContacts(store.id, store.accessToken, shop)

    return NextResponse.json({
      success: true,
      synced: totalSynced,
      message: `Synced ${totalSynced} contacts`
    })
  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
