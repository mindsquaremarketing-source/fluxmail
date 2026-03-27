import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const store = await prisma.store.findFirst({ orderBy: { createdAt: 'desc' } })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const appHost = process.env.HOST || 'https://fluxmail-silk.vercel.app'
    const scriptSrc = `${appHost}/api/popup/script?storeId=${store.id}`

    // Check if script tag already exists
    const listRes = await fetch(
      `https://${store.shopDomain}/admin/api/2024-01/script_tags.json`,
      {
        headers: {
          'X-Shopify-Access-Token': store.accessToken,
          'Content-Type': 'application/json',
        },
      }
    )
    const listData = await listRes.json()
    const existing = (listData.script_tags || []).find(
      (t: any) => t.src && t.src.includes('/api/popup/script')
    )

    if (existing) {
      return NextResponse.json({ success: true, message: 'Script tag already registered', scriptTagId: existing.id })
    }

    const res = await fetch(
      `https://${store.shopDomain}/admin/api/2024-01/script_tags.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': store.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script_tag: {
            event: 'onload',
            src: scriptSrc,
          },
        }),
      }
    )

    const data = await res.json()

    if (data.errors) {
      return NextResponse.json({ error: data.errors }, { status: 400 })
    }

    return NextResponse.json({ success: true, scriptTag: data.script_tag })
  } catch (error: any) {
    console.error('Register script tag error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
