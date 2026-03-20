export const dynamic = 'force-dynamic'

import { shopify } from '@/lib/shopify'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const callbackResponse = await shopify.auth.callback({
      rawRequest: req,
    })

    const { session } = callbackResponse

    await prisma.store.upsert({
      where: { shopDomain: session.shop },
      update: { accessToken: session.accessToken! },
      create: {
        shopDomain: session.shop,
        accessToken: session.accessToken!,
      },
    })

    const host = req.nextUrl.searchParams.get('host') || ''
    const shop = session.shop

    return NextResponse.redirect(
      `https://${shop}/admin/apps/fluxmail/app/dashboard`
    )
  } catch (error: any) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
