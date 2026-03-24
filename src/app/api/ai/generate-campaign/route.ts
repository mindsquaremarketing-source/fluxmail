import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, productId, discountCode, discountValue, templateName, previewOnly } = body

    const store = await prisma.store.findFirst({ orderBy: { createdAt: 'desc' } })
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 })

    const storeName = store.companyName || store.senderName || 'Our Store'
    const primaryColor = store.primaryColor || '#1E40AF'
    const logoUrl = store.logoUrl || ''
    const website = store.website || '#'

    // Fetch products
    let productName = ''
    let productImage = ''
    let productPrice = '0.00'

    try {
      const res = await fetch(
        `https://${store.shopDomain}/admin/api/2024-01/products.json?limit=10&fields=id,title,images,variants`,
        { headers: { 'X-Shopify-Access-Token': store.accessToken } }
      )
      const data = await res.json()
      const products = data.products || []

      let featured = productId
        ? products.find((p: any) => p.id.toString() === productId.toString())
        : products[0]

      if (featured) {
        productName = featured.title || ''
        productImage = featured.images?.[0]?.src || ''
        productPrice = featured.variants?.[0]?.price || '0.00'
      }
    } catch {}

    const client = new Anthropic()

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are an expert email marketer for Shopify stores.
Create a beautiful HTML email campaign.

Store: ${storeName}
Brand Color: ${primaryColor}
Logo URL: ${logoUrl}
Website: ${website}
Product: ${productName || 'Featured Products'}
Product Image: ${productImage}
Product Price: $${productPrice}
Campaign Brief: ${prompt || 'General promotional campaign'}
${discountCode ? `Discount: ${discountCode} for ${discountValue}% off` : ''}

Create a complete HTML email. Return ONLY valid JSON, no markdown:
{
  "subject": "email subject with emoji",
  "htmlBody": "complete HTML email"
}

The HTML email must:
- Use ${primaryColor} as the primary color
- Include the logo: ${logoUrl ? `<img src="${logoUrl}" style="max-height:60px;width:auto;display:block;margin:0 auto;">` : `<h1 style="color:#fff">${storeName}</h1>`}
- Include product image if available: ${productImage}
- Have a gradient header using ${primaryColor}
- Have a discount box if discount provided
- Have a CTA button in ${primaryColor}
- Have an unsubscribe link: {{UNSUBSCRIBE_URL}}
- Be mobile responsive
- Look professional and conversion focused`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    let subject = `${storeName} - Special Offer`
    let htmlBody = ''

    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      subject = parsed.subject || subject
      htmlBody = parsed.htmlBody || ''
    } catch {
      htmlBody = text
    }

    // Preview only — return HTML without saving
    if (previewOnly) {
      return NextResponse.json({ success: true, html: htmlBody, subject })
    }

    const campaignName = templateName
      ? `${templateName} - ${new Date().toLocaleDateString()}`
      : `ai_based - ${new Date().toLocaleDateString()}`

    const campaign = await prisma.campaign.create({
      data: {
        storeId: store.id,
        name: campaignName,
        subject,
        htmlContent: htmlBody,
        status: 'draft',
      }
    })

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      campaign,
      subject,
      name: campaignName,
      htmlBody,
    })
  } catch (error: any) {
    console.error('Generate campaign error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
