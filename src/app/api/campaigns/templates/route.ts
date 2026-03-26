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
        content: `You are a world-class email designer for premium Shopify brands like Gymshark, Allbirds and Glossier.
Seed: ${Math.random().toString(36).substring(7)}

MERCHANT BRAND:
- Company: ${storeName}
- Primary color: ${primaryColor}

PRODUCT DATA:
- Products: ${products.map(p => p.title).join(', ')}

STYLE REFERENCE — this is the level of design quality the emails you suggest must match:
<div style="background:#f0f2f5;padding:40px 16px;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

    <!-- HERO: full width, gradient, logo + headline -->
    <div style="background:linear-gradient(135deg,${primaryColor} 0%,${primaryColor}bb 100%);padding:52px 40px 44px;text-align:center;">
      <p style="color:rgba(255,255,255,0.75);font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 18px;">WRITE SOMETHING RELEVANT TO CAMPAIGN GOAL HERE</p>
      <h1 style="color:#ffffff;font-size:38px;font-weight:800;line-height:1.15;margin:0 0 16px;">WRITE A BOLD BENEFIT-DRIVEN HEADLINE</h1>
      <p style="color:rgba(255,255,255,0.88);font-size:17px;line-height:1.65;margin:0;">WRITE A COMPELLING SUBHEADLINE BASED ON THE CAMPAIGN GOAL</p>
    </div>

    <!-- PRODUCT: large image, name, price, CTA -->
    <div style="padding:48px 40px 36px;text-align:center;">
      <p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${primaryColor};font-weight:700;margin:0 0 10px;">WRITE A SHORT PRODUCT CATEGORY OR TAGLINE</p>
      <h2 style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 10px;">PRODUCT NAME</h2>
      <p style="font-size:15px;color:#64748b;line-height:1.7;margin:0 0 20px;">WRITE 2 SENTENCES ABOUT THE PRODUCT BENEFIT</p>
      <a href="#" style="background:linear-gradient(135deg,${primaryColor},${primaryColor}cc);color:#ffffff;padding:18px 52px;border-radius:24px;font-size:16px;font-weight:700;text-decoration:none;display:inline-block;letter-spacing:0.4px;box-shadow:0 6px 20px ${primaryColor}44;">WRITE A SPECIFIC URGENT CTA</a>
    </div>

    <!-- DISCOUNT: only if discount exists -->
    <div style="margin:0 40px 40px;background:${primaryColor}0f;border:2px dashed ${primaryColor}55;border-radius:14px;padding:28px;text-align:center;">
      <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${primaryColor};font-weight:700;margin:0 0 12px;">EXCLUSIVE OFFER</p>
      <p style="font-size:32px;font-weight:900;color:${primaryColor};letter-spacing:5px;margin:0 0 10px;">DISCOUNTCODE</p>
      <p style="font-size:14px;color:#64748b;margin:0;">Save X% — limited time</p>
    </div>

    <!-- TRUST BAR: 3 columns -->
    <div style="background:#f8fafc;padding:28px 40px;display:table;width:100%;box-sizing:border-box;">
      <div style="display:table-cell;text-align:center;padding:0 12px;border-right:1px solid #e2e8f0;">
        <p style="font-size:24px;margin:0 0 6px;">🚚</p>
        <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 4px;">Free Shipping</p>
      </div>
      <div style="display:table-cell;text-align:center;padding:0 12px;border-right:1px solid #e2e8f0;">
        <p style="font-size:24px;margin:0 0 6px;">🔄</p>
        <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 4px;">Easy Returns</p>
      </div>
      <div style="display:table-cell;text-align:center;padding:0 12px;">
        <p style="font-size:24px;margin:0 0 6px;">⭐</p>
        <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 4px;">Top Rated</p>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="background:#1e293b;padding:36px 40px;text-align:center;">
      <p style="color:#ffffff;font-size:15px;font-weight:700;margin:0 0 6px;">${storeName}</p>
      <p style="color:#94a3b8;font-size:13px;margin:0 0 20px;">WRITE A SHORT BRAND TAGLINE</p>
    </div>

  </div>
</div>

The above is ONLY a visual style reference. Your task is to generate campaign template suggestions.

IMPORTANT RULES:
- Analyze the brand colors and products to decide the best campaign angles for this specific store
- Headlines must be bold, specific, and benefit-driven — never generic like "Check out our products"
- Write each headline based on the actual product names and campaign goal
- CTA button text must have urgency and be specific — never just "Shop Now", use things like "Get Yours Today", "Claim 15% Off", "Shop {product name}" etc based on context
- Body text should create urgency and mention the product by name
- If a discount code exists it should be memorable and brand-relevant (e.g. LUXE15, GLOW20)
- Make the copy sound human, premium and conversion-focused — never generic

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
