import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const PLAN_CONTACTS: Record<string, number> = {
  STARTER: 500,
  BASIC: 1000,
  PRO: 2500,
  BUSINESS: 5000,
  GROWTH: 10000,
  ADVANCED: 25000,
  PREMIUM: 50000,
  ENTERPRISE: 100000,
  SCALE: 200000,
}

export async function GET(req: NextRequest) {
  try {
    const chargeId = req.nextUrl.searchParams.get('charge_id')
    const shop = req.nextUrl.searchParams.get('shop')
    const plan = req.nextUrl.searchParams.get('plan')

    if (!shop || !plan) {
      return NextResponse.redirect(new URL('/app/billing', req.url))
    }

    const store = await prisma.store.findUnique({ where: { shopDomain: shop } })
    if (!store) {
      return NextResponse.redirect(new URL('/app/billing', req.url))
    }

    // Verify the subscription status via Shopify GraphQL
    const query = `
      {
        currentAppInstallation {
          activeSubscriptions {
            id
            name
            status
            trialDays
          }
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
        body: JSON.stringify({ query }),
      }
    )

    const data = await response.json()
    const subscriptions = data?.data?.currentAppInstallation?.activeSubscriptions || []
    const activeSubscription = subscriptions.find(
      (s: any) => s.name === `${plan} - Fluxmail` && (s.status === 'ACTIVE' || s.status === 'ACCEPTED')
    )

    if (activeSubscription) {
      await prisma.store.update({
        where: { id: store.id },
        data: {
          plan,
          subscriptionId: activeSubscription.id,
          billingStatus: 'active',
          contactLimit: PLAN_CONTACTS[plan] || 500,
          trialStartDate: new Date(),
        },
      })
    }

    const host = process.env.HOST || 'https://fluxmail-silk.vercel.app'
    return NextResponse.redirect(new URL('/app/dashboard', host))
  } catch (error: any) {
    console.error('Billing callback error:', error)
    return NextResponse.redirect(new URL('/app/billing', req.url))
  }
}
