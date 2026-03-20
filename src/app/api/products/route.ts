export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    if (!store) return NextResponse.json({ products: [] })

    const response = await fetch(
      `https://${store.shopDomain}/admin/api/2024-01/products.json?limit=50&fields=id,title,images`,
      {
        headers: {
          'X-Shopify-Access-Token': store.accessToken,
        }
      }
    )

    if (!response.ok) {
      console.error('Shopify products error:', response.status)
      return NextResponse.json({ products: [] })
    }

    const data = await response.json()
    return NextResponse.json({ products: data.products || [] })
  } catch (error: any) {
    console.error('Products fetch error:', error)
    return NextResponse.json({ products: [] })
  }
}
