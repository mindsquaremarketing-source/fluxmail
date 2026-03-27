import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const shop = req.nextUrl.searchParams.get('shop')
    const store = shop
      ? await prisma.store.findUnique({ where: { shopDomain: shop } })
      : await prisma.store.findFirst({ orderBy: { createdAt: 'desc' } })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    return NextResponse.json({
      popupEnabled: store.popupEnabled,
      popupTitle: store.popupTitle || 'Get 10% Off Your First Order',
      popupSubtitle: store.popupSubtitle || 'Subscribe to our newsletter and get an exclusive discount on your first purchase.',
      popupDiscount: store.popupDiscount || '10',
      popupDelay: store.popupDelay || 5,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const store = await prisma.store.findFirst({ orderBy: { createdAt: 'desc' } })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const data: any = {}
    if (body.popupEnabled !== undefined) data.popupEnabled = body.popupEnabled
    if (body.popupTitle !== undefined) data.popupTitle = body.popupTitle
    if (body.popupSubtitle !== undefined) data.popupSubtitle = body.popupSubtitle
    if (body.popupDiscount !== undefined) data.popupDiscount = body.popupDiscount
    if (body.popupDelay !== undefined) data.popupDelay = parseInt(body.popupDelay, 10)

    await prisma.store.update({ where: { id: store.id }, data })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
