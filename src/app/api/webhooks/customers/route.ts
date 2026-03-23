export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendFlowEmail } from '@/lib/flow-sender'
import crypto from 'crypto'

function verifyHmac(body: string, hmacHeader: string): boolean {
  const secret = process.env.SHOPIFY_API_SECRET!
  const hash = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64')
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const hmac = req.headers.get('x-shopify-hmac-sha256')
    const shopDomain = req.headers.get('x-shopify-shop-domain') || ''
    const topic = req.headers.get('x-shopify-topic') || ''

    if (!hmac || !shopDomain) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 401 })
    }

    if (!verifyHmac(body, hmac)) {
      return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 })
    }

    const data = JSON.parse(body)
    console.log('Webhook received:', topic, shopDomain)

    const store = await prisma.store.findUnique({ where: { shopDomain } })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (topic === 'customers/create') {
      const email = data.email
      if (!email) return NextResponse.json({ success: true })

      const contact = await prisma.contact.upsert({
        where: { storeId_email: { storeId: store.id, email } },
        update: { firstName: data.first_name || null, lastName: data.last_name || null },
        create: {
          storeId: store.id,
          email,
          firstName: data.first_name || null,
          lastName: data.last_name || null,
          status: 'subscribed',
          source: 'shopify',
        }
      })

      // Trigger welcome flow
      await sendFlowEmail({
        storeId: store.id,
        contactId: contact.id,
        contactEmail: email,
        contactName: data.first_name || '',
        flowType: 'welcome',
        emailNumber: 1,
      })
    }

    if (topic === 'customers/update') {
      if (data.email) {
        await prisma.contact.updateMany({
          where: { storeId: store.id, email: data.email },
          data: { firstName: data.first_name || null, lastName: data.last_name || null }
        })
      }
    }

    if (topic === 'orders/create') {
      const email = data.email || data.customer?.email
      if (!email) return NextResponse.json({ success: true })

      const contact = await prisma.contact.findFirst({
        where: { storeId: store.id, email }
      })

      if (contact) {
        await sendFlowEmail({
          storeId: store.id,
          contactId: contact.id,
          contactEmail: email,
          contactName: data.customer?.first_name || '',
          flowType: 'thankyou',
          emailNumber: 1,
        })
      }
    }

    console.log(`Webhook ${topic} processed for ${shopDomain}`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
