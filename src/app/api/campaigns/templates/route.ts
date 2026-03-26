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
        content: `You are a world-class email marketing designer and copywriter working for a premium Shopify brand.
Seed: ${Math.random().toString(36).substring(7)}

BRAND DATA:
- Company: ${storeName}
- Primary color: ${primaryColor}

PRODUCT DATA:
- Products: ${products.map(p => p.title).join(', ')}

DESIGN RULES — follow all of these:
1. Analyze the brand colors and products to decide the best campaign angles for this specific store
2. Headlines must be bold, specific, and benefit-driven — never generic like "Check out our products"
3. Write each headline based on the actual product names and campaign goal
4. CTA button text must have urgency and be specific — never just "Shop Now", use things like "Get Yours Today", "Claim 15% Off", "Shop {product name}" etc based on context
5. Body text should create urgency and mention the product by name
6. If a discount code exists it should be memorable and brand-relevant (e.g. LUXE15, GLOW20)

Generate 6 UNIQUE and CREATIVE email campaign templates. Be original — don't repeat typical campaign ideas. Think outside the box and make each one specific to ${storeName}'s actual products.

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

Categories should be varied. Every template must reference specific products from the store.`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
    let templates = []
    try {
      templates = JSON.parse(text.replace(/```json|```/g, '').trim())
    } catch {}

    return NextResponse.json({
      templates,
      store: { id: store.id, name: storeName, primaryColor, logoUrl: store.logoUrl || '', website: store.website || '#' },
      products
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
