import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import Anthropic from '@anthropic-ai/sdk'
import { getContrastColor, darkenColor, getAlphaColor } from '@/lib/color-utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('AI Generate Campaign — received body:', JSON.stringify(body))
    const {
      prompt,
      featureType,
      productId,
      productName: inputProductName,
      productImage: inputProductImage,
      productPrice: inputProductPrice,
      discountCode,
      discountValue,
      discountStartDate,
      discountStartTime,
      hasEndDate,
      templateName,
      previewOnly,
    } = body

    const store = await prisma.store.findFirst({ orderBy: { createdAt: 'desc' } })
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 })

    // Full brand data
    const storeName = store.companyName || store.senderName || 'Our Store'
    const primaryColor = store.primaryColor || '#1E40AF'
    const secondaryColor = store.secondaryColor || '#FFFFFF'
    const bgColor = store.bgColor || '#FFFFFF'
    const logoUrl = store.logoUrl || ''
    const website = store.website || '#'
    const fontFamily = store.fontFamily || 'Arial'
    const buttonShape = store.buttonShape || 'rounded'
    const textOnPrimary = getContrastColor(primaryColor)
    const darkPrimary = darkenColor(primaryColor, 25)
    const lightPrimary = getAlphaColor(primaryColor, 0.08)

    const borderRadius = buttonShape === 'pill' ? '50px' : buttonShape === 'square' ? '4px' : '24px'

    // Fetch real products from Shopify
    let products: any[] = []
    let featuredProduct: any = null

    try {
      const res = await fetch(
        `https://${store.shopDomain}/admin/api/2024-01/products.json?limit=10&fields=id,title,images,variants,handle`,
        { headers: { 'X-Shopify-Access-Token': store.accessToken } }
      )
      const data = await res.json()
      products = data.products || []

      if (productId) {
        featuredProduct = products.find((p: any) => p.id.toString() === productId.toString())
      }
      if (!featuredProduct && inputProductName) {
        featuredProduct = products.find((p: any) => p.title === inputProductName)
      }
      if (!featuredProduct && products.length > 0) {
        featuredProduct = products[0]
      }
    } catch {}

    const productName = featuredProduct?.title || inputProductName || 'Featured Product'
    const productImage = featuredProduct?.images?.[0]?.src || inputProductImage || ''
    const productPrice = featuredProduct?.variants?.[0]?.price || inputProductPrice || '0.00'
    const productUrl = featuredProduct?.handle ? `${website}/products/${featuredProduct.handle}` : website
    const featureLabel = featureType === 'collection' ? 'Collection' : featureType === 'all' ? 'All Products' : 'Product'

    // Build logo HTML
    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="${storeName}" style="max-height:60px;max-width:200px;width:auto;height:auto;display:block;margin:0 auto;object-fit:contain;">`
      : `<span style="color:${textOnPrimary};font-size:26px;font-weight:900;font-family:${fontFamily},sans-serif;">${storeName}</span>`

    // Build discount section
    const discountHtml = discountCode
      ? `<div style="background:${lightPrimary};border:2px dashed ${primaryColor};border-radius:16px;padding:24px;margin:24px 0;text-align:center;">
  <p style="color:${primaryColor};font-size:11px;font-weight:800;margin:0 0 10px;letter-spacing:3px;text-transform:uppercase;font-family:${fontFamily},sans-serif;">Exclusive Offer</p>
  <div style="background:${primaryColor};color:${textOnPrimary};display:inline-block;padding:14px 36px;border-radius:10px;font-size:22px;font-weight:900;letter-spacing:4px;font-family:${fontFamily},sans-serif;">${discountCode}</div>
  <p style="color:#6B7280;font-size:13px;margin:10px 0 0;font-family:${fontFamily},sans-serif;">Save ${discountValue || '10'}% on your order</p>
${discountStartDate ? `<p style="color:#9CA3AF;font-size:11px;margin:8px 0 0;font-family:${fontFamily},sans-serif;">Valid from ${discountStartDate}${discountStartTime ? ' ' + discountStartTime : ''}${hasEndDate ? ' — Limited time!' : ''}</p>` : ''}
</div>`
      : ''

    // Build product section
    const productHtml = productImage
      ? `<div style="text-align:center;margin:24px 0;">
  <img src="${productImage}" alt="${productName}" style="width:100%;max-width:100%;height:auto;display:block;border-radius:12px;margin:0 auto 16px;">
  <p style="color:#111827;font-weight:700;font-size:16px;margin:0 0 4px;font-family:${fontFamily},sans-serif;">${productName}</p>
  <p style="color:${primaryColor};font-weight:800;font-size:18px;margin:0 0 16px;font-family:${fontFamily},sans-serif;">$${productPrice}</p>
  <a href="${productUrl}" style="display:inline-block;background:${primaryColor};color:${textOnPrimary};padding:14px 40px;border-radius:${borderRadius};text-decoration:none;font-weight:700;font-size:15px;font-family:${fontFamily},sans-serif;">Shop Now</a>
</div>`
      : ''

    const client = new Anthropic()

    const discountDateInfo = discountStartDate
      ? `Valid from ${discountStartDate}${discountStartTime ? ' ' + discountStartTime : ''}${hasEndDate ? ' (limited time)' : ''}`
      : ''

    const aiPrompt = `You are an expert email marketer. Generate compelling copy for an email campaign.

Campaign goal: ${prompt || 'General promotional campaign for ' + storeName}
Store: ${storeName}
Feature type: ${featureLabel}
Featured product: ${productName} — $${productPrice}
${discountCode ? `Discount: Code ${discountCode} for ${discountValue}% off` : 'No discount'}
${discountDateInfo ? `Offer dates: ${discountDateInfo}` : ''}

Write copy that:
1. Has an attention-grabbing headline about: "${prompt || 'Special offer from ' + storeName}"
2. Mentions "${productName}" by name and its $${productPrice} price
3. Creates urgency for the customer to act now
${discountCode ? `4. Highlights the discount code ${discountCode} (${discountValue}% off)${discountDateInfo ? ' — ' + discountDateInfo : ''}` : ''}

Return ONLY a JSON object, no markdown, no backticks:
{"subject":"email subject with emoji","headline":"main headline","body":"2-3 sentences body copy mentioning product and urgency","cta":"button text"}`

    console.log('AI prompt:', aiPrompt)

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: aiPrompt }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    let subject = `${storeName} - Special Offer`
    let headline = `Special Offer from ${storeName}`
    let bodyText = `Check out our amazing products at ${storeName}.`
    let ctaText = 'Shop Now'

    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      subject = parsed.subject || subject
      headline = parsed.headline || headline
      bodyText = parsed.body || bodyText
      ctaText = parsed.cta || ctaText
    } catch {}

    // Build the full branded email HTML
    const htmlBody = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${bgColor === '#FFFFFF' ? '#f0f2f5' : bgColor};font-family:${fontFamily},sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

<tr><td style="background:linear-gradient(135deg,${primaryColor},${darkPrimary});padding:28px 40px;text-align:center;">
${logoHtml}
</td></tr>

<tr><td style="padding:40px 48px;">
<h1 style="color:#111827;font-size:28px;font-weight:900;margin:0 0 16px;line-height:1.3;font-family:${fontFamily},sans-serif;">${headline}</h1>
<p style="color:#6B7280;font-size:16px;line-height:1.7;margin:0 0 24px;font-family:${fontFamily},sans-serif;">${bodyText}</p>

${discountHtml}
${productHtml}

${!productImage ? `<div style="text-align:center;margin:24px 0;">
<a href="${website}" style="display:inline-block;background:${primaryColor};color:${textOnPrimary};padding:16px 48px;border-radius:${borderRadius};text-decoration:none;font-weight:700;font-size:16px;font-family:${fontFamily},sans-serif;box-shadow:0 8px 24px ${getAlphaColor(primaryColor, 0.3)};">${ctaText}</a>
</div>` : ''}
</td></tr>

<tr><td style="background:#F8F9FA;padding:28px 40px;border-top:1px solid #F3F4F6;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="33%" style="text-align:center;padding:0 8px;"><div style="font-size:20px;margin-bottom:6px;">&#128666;</div><p style="color:#111827;font-size:12px;font-weight:700;margin:0 0 2px;font-family:${fontFamily},sans-serif;">Free Shipping</p><p style="color:#9CA3AF;font-size:11px;margin:0;">Orders over $50</p></td>
<td width="33%" style="text-align:center;padding:0 8px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;"><div style="font-size:20px;margin-bottom:6px;">&#8617;&#65039;</div><p style="color:#111827;font-size:12px;font-weight:700;margin:0 0 2px;font-family:${fontFamily},sans-serif;">Easy Returns</p><p style="color:#9CA3AF;font-size:11px;margin:0;">30-day policy</p></td>
<td width="33%" style="text-align:center;padding:0 8px;"><div style="font-size:20px;margin-bottom:6px;">&#11088;</div><p style="color:#111827;font-size:12px;font-weight:700;margin:0 0 2px;font-family:${fontFamily},sans-serif;">Top Rated</p><p style="color:#9CA3AF;font-size:11px;margin:0;">5-star reviews</p></td>
</tr></table>
</td></tr>

<tr><td style="background:#111827;padding:28px 40px;text-align:center;border-top:3px solid ${primaryColor};">
<p style="color:#fff;font-weight:700;font-size:15px;margin:0 0 6px;font-family:${fontFamily},sans-serif;">${storeName}</p>
<p style="color:#6B7280;font-size:12px;line-height:1.6;margin:0 0 14px;font-family:${fontFamily},sans-serif;">You received this because you subscribed to our store updates.</p>
<a href="{{UNSUBSCRIBE_URL}}" style="color:#9CA3AF;font-size:12px;text-decoration:underline;">Unsubscribe</a>
<span style="color:#374151;margin:0 8px;">|</span>
<a href="${website}" style="color:#9CA3AF;font-size:12px;text-decoration:underline;">Visit Store</a>
</td></tr>

</table></td></tr></table></body></html>`

    // Preview only — return without saving
    if (previewOnly) {
      return NextResponse.json({ success: true, html: htmlBody, subject })
    }

    // Save campaign
    const campaignName = templateName
      ? `${templateName} - ${new Date().toLocaleDateString()}`
      : `AI Campaign - ${new Date().toLocaleDateString()}`

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
      htmlBody,
    })
  } catch (error: any) {
    console.error('Generate campaign error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
