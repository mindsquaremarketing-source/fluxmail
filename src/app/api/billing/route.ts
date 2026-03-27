import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const PLANS: Record<string, { price: number; contacts: number }> = {
  STARTER:    { price: 7.99,   contacts: 500 },
  BASIC:      { price: 9.99,   contacts: 1000 },
  PRO:        { price: 14.99,  contacts: 2500 },
  BUSINESS:   { price: 24.99,  contacts: 5000 },
  GROWTH:     { price: 39.99,  contacts: 10000 },
  ADVANCED:   { price: 59.99,  contacts: 25000 },
  PREMIUM:    { price: 89.99,  contacts: 50000 },
  ENTERPRISE: { price: 139.99, contacts: 100000 },
  SCALE:      { price: 224.99, contacts: 200000 },
}

export async function POST(req: NextRequest) {
  try {
    const { planName, shop } = await req.json()

    const plan = PLANS[planName]
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const store = shop
      ? await prisma.store.findUnique({ where: { shopDomain: shop } })
      : await prisma.store.findFirst({ orderBy: { createdAt: 'desc' } })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const host = process.env.HOST || 'https://fluxmail-silk.vercel.app'

    const mutation = `
      mutation {
        appSubscriptionCreate(
          name: "${planName} - Fluxmail"
          returnUrl: "${host}/api/billing/callback?shop=${store.shopDomain}&plan=${planName}"
          trialDays: 30
          lineItems: [{
            plan: {
              appRecurringPricingDetails: {
                price: { amount: ${plan.price}, currencyCode: USD }
                interval: EVERY_30_DAYS
              }
            }
          }]
        ) {
          appSubscription { id }
          confirmationUrl
          userErrors { field message }
        }
      }
    `

    const response = await fetch(
      `https://${store.shopDomain}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': store.accessToken,
        },
        body: JSON.stringify({ query: mutation }),
      }
    )

    const data = await response.json()
    const result = data?.data?.appSubscriptionCreate

    if (result?.userErrors?.length > 0) {
      return NextResponse.json({ error: result.userErrors[0].message }, { status: 400 })
    }

    return NextResponse.json({
      confirmationUrl: result?.confirmationUrl,
      subscriptionId: result?.appSubscription?.id,
    })
  } catch (error: any) {
    console.error('Billing error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
