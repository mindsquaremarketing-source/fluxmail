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
      return NextResponse.json({ store: null })
    }

    const contactCount = await prisma.contact.count({
      where: { storeId: store.id },
    })

    const shopName = store.shopDomain.replace('.myshopify.com', '')

    return NextResponse.json({
      store: {
        id: store.id,
        shopDomain: store.shopDomain,
        storeName: shopName.charAt(0).toUpperCase() + shopName.slice(1),
        firstName: store.firstName || '',
        lastName: store.lastName || '',
        email: store.email || '',
        phone: store.phone || '',
        logoUrl: store.logoUrl || '',
        primaryColor: store.primaryColor || '#1E40AF',
        secondaryColor: store.secondaryColor || '#FFFFFF',
        bgColor: store.bgColor || '#FFFFFF',
        primaryText: store.primaryText || '#FFFFFF',
        secondaryText: store.secondaryText || '#000000',
        bgText: store.bgText || '#1F2937',
        fontFamily: store.fontFamily || 'Arial',
        buttonShape: store.buttonShape || 'rounded',
        companyName: store.companyName || '',
        website: store.website || `https://${store.shopDomain}`,
        country: store.country || '',
        state: store.state || '',
        city: store.city || '',
        zip: store.zip || '',
        address: store.address || '',
        senderName: store.senderName || '',
        replyToEmail: store.replyToEmail || '',
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

    const store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const data: any = {}
    const fields = [
      'firstName', 'lastName', 'email', 'phone', 'logoUrl',
      'primaryColor', 'secondaryColor', 'bgColor',
      'primaryText', 'secondaryText', 'bgText',
      'fontFamily', 'buttonShape',
      'companyName', 'website', 'country', 'state', 'city', 'zip', 'address',
      'senderName', 'replyToEmail',
    ]

    for (const field of fields) {
      if (body[field] !== undefined) {
        data[field] = body[field]
      }
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data,
    })

    return NextResponse.json({ success: true, store: updated })
  } catch (error: any) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
