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

    const host = req.nextUrl.searchParams.get('host')
    return NextResponse.redirect(
      new URL(`/app/dashboard?shop=${session.shop}&host=${host}`, req.url)
    )
  } catch (error: any) {
    console.error('OAuth callback error:', error)
    const shop = req.nextUrl.searchParams.get('shop')
    return NextResponse.redirect(
      new URL(`/api/auth?shop=${shop}`, req.url)
    )
  }
}
