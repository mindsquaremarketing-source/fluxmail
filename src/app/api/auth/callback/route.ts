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

    // Register popup script tag on install
    try {
      const storeRecord = await prisma.store.findUnique({ where: { shopDomain: session.shop } })
      if (storeRecord) {
        await fetch(`https://${shop}/admin/api/2024-01/script_tags.json`, {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': session.accessToken!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            script_tag: {
              event: 'onload',
              src: `${appHost}/api/popup/script?storeId=${storeRecord.id}`,
            },
          }),
        })
        console.log('Popup script tag registered on install')
      }
    } catch (e) {
      console.error('Script tag registration failed:', e)
    }

    return NextResponse.redirect(
      `https://${shop}/admin/apps/fluxmail/app/dashboard`
    )
  } catch (error: any) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
