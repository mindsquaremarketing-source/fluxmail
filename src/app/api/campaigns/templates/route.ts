import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const store = await prisma.store.findFirst({ orderBy: { createdAt: 'desc' } })
    if (!store) return NextResponse.json({ templates: [] })

    let products: any[] = []
    try {
      const res = await fetch(
        `https://${store.shopDomain}/admin/api/2024-01/products.json?limit=6&fields=id,title,images,variants`,
        { headers: { 'X-Shopify-Access-Token': store.accessToken } }
      )
      const data = await res.json()
      products = data.products || []
    } catch {}

    const storeName = store.companyName || store.senderName || 'Our Store'
    const primaryColor = store.primaryColor || '#1E40AF'

    const client = new Anthropic()
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are an email marketing expert for Shopify stores.

Store: ${storeName}
Products: ${products.map(p => p.title).join(', ')}
Brand color: ${primaryColor}

Generate 6 different email campaign templates for this store. Each should be unique and conversion-focused.

Return ONLY valid JSON array, no markdown:
[
  {
    "id": "template_1",
    "name": "Campaign name (3-4 words)",
    "description": "What this campaign does (1 sentence)",
    "emoji": "relevant emoji",
    "category": "one of: sale, new_arrival, seasonal, winback, loyalty, announcement",
    "subject": "Email subject line with emoji",
    "headline": "Main headline for email",
    "bodyText": "2-3 sentences of email body text",
    "ctaText": "Call to action button text",
    "discountCode": "DISCOUNT code or empty string",
    "discountValue": "10 or 15 or 20 or empty string",
    "badge": "e.g. Popular, Best Seller, Limited Time"
  }
]

Make them specific to ${storeName} and their products. Categories should be varied.`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
    let templates = []
    try {
      templates = JSON.parse(text.replace(/```json|```/g, '').trim())
    } catch {}

    return NextResponse.json({
      templates,
      store: { name: storeName, primaryColor, logoUrl: store.logoUrl || '', website: store.website || '#' },
      products
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
