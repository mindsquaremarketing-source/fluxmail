export const dynamic = 'force-dynamic'

import { shopify } from '@/lib/shopify'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get('shop')

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 })
  }

  const sanitizedShop = shopify.utils.sanitizeShop(shop, true)
  if (!sanitizedShop) {
    return NextResponse.json({ error: 'Invalid shop parameter' }, { status: 400 })
  }

  const authRoute = await shopify.auth.begin({
    shop: sanitizedShop,
    callbackPath: '/api/auth/callback',
    isOnline: false,
    rawRequest: req,
  })

  console.log('Shopify OAuth redirect URL:', authRoute.headers.get('location'))

  return authRoute
}
