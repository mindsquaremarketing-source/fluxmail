export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const shop = req.nextUrl.searchParams.get('shop')

    let store
    if (shop) {
      store = await prisma.store.findUnique({
        where: { shopDomain: shop },
      })
    } else {
      store = await prisma.store.findFirst({
        orderBy: { createdAt: 'desc' },
      })
    }

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const contactCount = await prisma.contact.count({
      where: { storeId: store.id },
    })

    return NextResponse.json({
      store: {
        id: store.id,
        shopDomain: store.shopDomain,
        createdAt: store.createdAt,
      },
      contactCount,
    })
  } catch (error: any) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { shop, ...settings } = body

    if (!shop) {
      return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 })
    }

    const store = await prisma.store.findUnique({
      where: { shopDomain: shop },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Settings would be saved to a StoreSettings model in production
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Settings updated',
      settings,
    })
  } catch (error: any) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
