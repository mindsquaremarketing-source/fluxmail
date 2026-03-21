export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const topic = req.headers.get('X-Shopify-Topic')
    const body = await req.json()

    console.log('GDPR webhook received:', topic)

    switch (topic) {
      case 'customers/redact':
        // Delete customer data
        const shopDomain = body.shop_domain
        const customerEmail = body.customer?.email
        if (customerEmail && shopDomain) {
          const store = await prisma.store.findUnique({
            where: { shopDomain }
          })
          if (store) {
            await prisma.contact.deleteMany({
              where: { storeId: store.id, email: customerEmail }
            })
          }
        }
        break

      case 'shop/redact':
        // Delete all shop data
        const domain = body.shop_domain
        if (domain) {
          const store = await prisma.store.findUnique({
            where: { shopDomain: domain }
          })
          if (store) {
            await prisma.contact.deleteMany({ where: { storeId: store.id } })
            await prisma.campaign.deleteMany({ where: { storeId: store.id } })
            await prisma.store.delete({ where: { id: store.id } })
          }
        }
        break

      case 'customers/data_request':
        // Log data request - in production send email with customer data
        console.log('Customer data request received for:', body.customer?.email)
        break
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('GDPR webhook error:', error)
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
