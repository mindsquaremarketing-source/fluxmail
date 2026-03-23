export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const shop = req.nextUrl.searchParams.get('shop')

    let store
    if (shop) {
      store = await prisma.store.findUnique({ where: { shopDomain: shop } })
    } else {
      store = await prisma.store.findFirst({ orderBy: { createdAt: 'desc' } })
    }

    if (!store) {
      return NextResponse.json({ campaigns: [] })
    }

    const campaigns = await prisma.campaign.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ campaigns }, {
      headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' }
    })
  } catch (error: any) {
    console.error('Campaigns GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    if (!store) {
      return NextResponse.json({ error: 'No store found' }, { status: 404 })
    }

    const campaign = await prisma.campaign.create({
      data: {
        storeId: body.storeId || store.id,
        name: body.name || `campaign_${Date.now()}`,
        subject: body.subject || '',
        htmlContent: body.htmlContent || '',
        status: body.status || 'draft',
      },
    })

    return NextResponse.json({ success: true, campaign })
  } catch (error: any) {
    console.error('Campaigns POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
