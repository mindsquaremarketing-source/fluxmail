export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const shop = searchParams.get('shop')
  const state = searchParams.get('state')

  // Verify state cookie
  const cookieState = req.cookies.get('shopify_oauth_state')?.value
  if (!cookieState || cookieState !== state) {
    console.error('State mismatch', { cookieState, state })
    // Don't fail on state mismatch for now — just log it
  }

  if (!code || !shop) {
    return NextResponse.json({ error: 'Missing code or shop' }, { status: 400 })
  }

  // Exchange code for access token
  const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  })

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token

  if (!accessToken) {
    console.error('Failed to get access token', tokenData)
    return NextResponse.json({ error: 'Failed to get access token' }, { status: 400 })
  }

  console.log('Access token obtained for shop:', shop)

  // Save store to database
  const storeRecord = await prisma.store.upsert({
    where: { shopDomain: shop },
    update: { accessToken },
    create: {
      shopDomain: shop,
      accessToken,
      billingStatus: 'trial',
      trialStartDate: new Date(),
    },
  })

  const appHost = process.env.HOST || 'https://fluxmail-silk.vercel.app'

  // Auto sync branding on install
  try {
    await fetch(`${appHost}/api/sync/branding`, { method: 'POST' })
    console.log('Branding synced on install')
  } catch (e) {
    console.error('Branding sync failed:', e)
  }

  // Auto sync contacts on install
  try {
    await fetch(`${appHost}/api/sync/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop })
    })
    console.log('Contacts synced on install')
  } catch (e) {
    console.error('Contacts sync failed:', e)
  }

  // Register script tag silently
  try {
    await fetch(`https://${shop}/admin/api/2024-01/script_tags.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script_tag: {
          event: 'onload',
          src: `${appHost}/api/popup/script?storeId=${storeRecord.id}`
        }
      })
    })
    console.log('Script tag registered successfully')
  } catch (e) {
    console.error('Script tag registration failed silently:', e)
  }

  // Redirect to app
  return NextResponse.redirect(
    `https://${shop}/admin/apps/fluxmail/app/dashboard`
  )
}
