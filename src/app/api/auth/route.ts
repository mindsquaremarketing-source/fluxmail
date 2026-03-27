export const dynamic = 'force-dynamic'

import { shopify } from '@/lib/shopify'
import { NextRequest, NextResponse } from 'next/server'

const SCOPES = 'read_customers,write_customers,read_orders,write_orders,read_products,write_script_tags,read_script_tags'

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get('shop')

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 })
  }

  const sanitizedShop = shopify.utils.sanitizeShop(shop, true)
  if (!sanitizedShop) {
    return NextResponse.json({ error: 'Invalid shop parameter' }, { status: 400 })
  }

  const appHost = process.env.HOST || 'https://fluxmail-silk.vercel.app'
  const redirectUri = `${appHost}/api/auth/callback`
  const nonce = crypto.randomUUID()

  const authUrl = `https://${sanitizedShop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${nonce}`

  console.log('Shopify OAuth redirect URL:', authUrl)

  return NextResponse.redirect(authUrl)
}
