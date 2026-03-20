export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

function verifyHmac(body: string, hmacHeader: string): boolean {
  const secret = process.env.SHOPIFY_API_SECRET!
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64')
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const hmac = req.headers.get('x-shopify-hmac-sha256')
    const shop = req.headers.get('x-shopify-shop-domain')
    const topic = req.headers.get('x-shopify-topic')

    if (!hmac || !shop) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 401 })
    }

    if (!verifyHmac(body, hmac)) {
      return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 })
    }

    const customer = JSON.parse(body)

    const store = await prisma.store.findUnique({
      where: { shopDomain: shop },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (customer.email) {
      await prisma.contact.upsert({
        where: {
          storeId_email: {
            storeId: store.id,
            email: customer.email,
          },
        },
        update: {
          firstName: customer.first_name || null,
          lastName: customer.last_name || null,
        },
        create: {
          storeId: store.id,
          email: customer.email,
          firstName: customer.first_name || null,
          lastName: customer.last_name || null,
          source: 'shopify',
        },
      })
    }

    console.log(`Webhook ${topic} processed for ${shop}`)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
