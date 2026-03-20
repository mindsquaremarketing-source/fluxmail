export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const shop = req.nextUrl.searchParams.get('shop')
    const status = req.nextUrl.searchParams.get('status')
    const search = req.nextUrl.searchParams.get('search')
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
    const limit = 50

    let store
    if (shop) {
      store = await prisma.store.findUnique({ where: { shopDomain: shop } })
    } else {
      store = await prisma.store.findFirst({ orderBy: { createdAt: 'desc' } })
    }

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const where: any = { storeId: store.id }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [contacts, total, subscribedCount, unsubscribedCount, notSubscribedCount, last30Days] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { addedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contact.count({ where }),
      prisma.contact.count({ where: { storeId: store.id, status: 'subscribed' } }),
      prisma.contact.count({ where: { storeId: store.id, status: 'unsubscribed' } }),
      prisma.contact.count({ where: { storeId: store.id, status: 'not_subscribed' } }),
      prisma.contact.count({
        where: {
          storeId: store.id,
          addedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ])

    const totalAll = subscribedCount + unsubscribedCount + notSubscribedCount

    return NextResponse.json({
      contacts,
      total,
      totalAll,
      subscribedCount,
      unsubscribedCount,
      notSubscribedCount,
      last30Days,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: any) {
    console.error('Contacts GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
