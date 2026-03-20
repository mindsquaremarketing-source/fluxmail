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
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const campaigns = await prisma.campaign.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ campaigns })
  } catch (error: any) {
    console.error('Campaigns GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { storeId, name, subject, htmlContent } = body

    if (!storeId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const campaign = await prisma.campaign.create({
      data: {
        storeId,
        name,
        subject: subject || '',
        htmlContent: htmlContent || '',
        status: 'draft',
      },
    })

    return NextResponse.json({ success: true, campaign })
  } catch (error: any) {
    console.error('Campaigns POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
