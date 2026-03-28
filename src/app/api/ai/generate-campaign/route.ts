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
      selectedProduct: inputSelectedProduct,
      discountCode,
      discountValue,
      discountStartDate,
      discountStartTime,
      hasEndDate,
      templateName,
      previewOnly,
    } = body

    console.log('Received selectedProduct:', JSON.stringify(inputSelectedProduct))
    console.log('Received description:', prompt)

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

    // Prioritize the full selectedProduct object from the client over Shopify re-fetch
    const productName = inputSelectedProduct?.title || featuredProduct?.title || inputProductName || 'Featured Product'
    const productImage = inputSelectedProduct?.image || featuredProduct?.images?.[0]?.src || inputProductImage || ''
    const productPrice = inputSelectedProduct?.price || featuredProduct?.variants?.[0]?.price || inputProductPrice || '0.00'
    const productUrl = inputSelectedProduct?.url || (featuredProduct?.handle ? `${website}/products/${featuredProduct.handle}` : website)

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

    const aiPrompt = `You are a world-class email designer for premium Shopify brands like Gymshark, Allbirds and Glossier.

MERCHANT BRAND:
- Company: ${storeName}
- Primary color: ${primaryColor}
- Secondary color: ${secondaryColor}
- Background: ${bgColor}
- Logo: ${logoUrl}
- Font: ${fontFamily}
- Button shape: ${buttonShape} (rounded=24px, pill=50px, square=4px)

PRODUCT:
- Name: ${productName}
- Price: $${productPrice}
- Image: ${productImage}
- URL: ${productUrl}

CAMPAIGN:
- Goal: ${prompt || 'General promotional campaign for ' + storeName}
${discountCode ? `- Discount code: ${discountCode}` : '- No discount'}
${discountValue ? `- Discount value: ${discountValue}%` : ''}
${discountDateInfo ? `- Discount dates: ${discountDateInfo}` : ''}

STYLE REFERENCE — this is the level of design quality you must match:
<div style="background:${bgColor};padding:40px 16px;font-family:${fontFamily},sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

    <!-- HERO: full width, gradient, logo + headline -->
    <div style="background:linear-gradient(135deg,${primaryColor} 0%,${primaryColor}bb 100%);padding:52px 40px 44px;text-align:center;">
      <img src="${logoUrl}" height="42" style="display:block;margin:0 auto 20px;filter:brightness(0) invert(1);">
      <p style="color:rgba(255,255,255,0.75);font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 18px;">WRITE SOMETHING RELEVANT TO CAMPAIGN GOAL HERE</p>
      <h1 style="color:#ffffff;font-size:38px;font-weight:800;line-height:1.15;margin:0 0 16px;">WRITE A BOLD BENEFIT-DRIVEN HEADLINE FOR ${productName}</h1>
      <p style="color:rgba(255,255,255,0.88);font-size:17px;line-height:1.65;margin:0;">WRITE A COMPELLING SUBHEADLINE BASED ON THE CAMPAIGN GOAL</p>
    </div>

    <!-- PRODUCT: large image, name, price, CTA -->
    <div style="padding:48px 40px 36px;text-align:center;">
      <img src="${productImage}" style="width:100%;max-width:480px;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,0.12);display:block;margin:0 auto 32px;">
      <p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${primaryColor};font-weight:700;margin:0 0 10px;">WRITE A SHORT PRODUCT CATEGORY OR TAGLINE</p>
      <h2 style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 10px;">${productName}</h2>
      <p style="font-size:15px;color:#64748b;line-height:1.7;margin:0 0 20px;">WRITE 2 SENTENCES ABOUT THE PRODUCT BENEFIT BASED ON ITS NAME AND THE CAMPAIGN GOAL</p>
      <p style="font-size:26px;font-weight:900;color:${primaryColor};margin:0 0 28px;">$${productPrice}</p>
      <a href="${productUrl}" style="background:linear-gradient(135deg,${primaryColor},${primaryColor}cc);color:#ffffff;padding:18px 52px;border-radius:${borderRadius};font-size:16px;font-weight:700;text-decoration:none;display:inline-block;letter-spacing:0.4px;box-shadow:0 6px 20px ${primaryColor}44;">WRITE A SPECIFIC URGENT CTA FOR THIS PRODUCT</a>
    </div>

    <!-- DISCOUNT: only if discount exists -->
    <div style="margin:0 40px 40px;background:${primaryColor}0f;border:2px dashed ${primaryColor}55;border-radius:14px;padding:28px;text-align:center;">
      <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${primaryColor};font-weight:700;margin:0 0 12px;">EXCLUSIVE OFFER</p>
      <p style="font-size:32px;font-weight:900;color:${primaryColor};letter-spacing:5px;margin:0 0 10px;">${discountCode || 'DISCOUNT'}</p>
      <p style="font-size:14px;color:#64748b;margin:0;">Save ${discountValue || '10'}% — ${discountDateInfo || 'limited time'}</p>
    </div>

    <!-- TRUST BAR: 3 columns -->
    <div style="background:#f8fafc;padding:28px 40px;display:table;width:100%;box-sizing:border-box;">
      <div style="display:table-cell;text-align:center;padding:0 12px;border-right:1px solid #e2e8f0;">
        <p style="font-size:24px;margin:0 0 6px;">🚚</p>
        <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 4px;">Free Shipping</p>
        <p style="font-size:12px;color:#94a3b8;margin:0;">WRITE RELEVANT SHIPPING DETAIL</p>
      </div>
      <div style="display:table-cell;text-align:center;padding:0 12px;border-right:1px solid #e2e8f0;">
        <p style="font-size:24px;margin:0 0 6px;">🔄</p>
        <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 4px;">Easy Returns</p>
        <p style="font-size:12px;color:#94a3b8;margin:0;">WRITE RELEVANT RETURN DETAIL</p>
      </div>
      <div style="display:table-cell;text-align:center;padding:0 12px;">
        <p style="font-size:24px;margin:0 0 6px;">⭐</p>
        <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 4px;">Top Rated</p>
        <p style="font-size:12px;color:#94a3b8;margin:0;">WRITE RELEVANT SOCIAL PROOF</p>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="background:#1e293b;padding:36px 40px;text-align:center;">
      <p style="color:#ffffff;font-size:15px;font-weight:700;margin:0 0 6px;">${storeName}</p>
      <p style="color:#94a3b8;font-size:13px;margin:0 0 20px;">WRITE A SHORT BRAND TAGLINE</p>
      <p style="margin:0;"><a href="{{unsubscribe_url}}" style="color:#94a3b8;font-size:12px;margin:0 12px;">Unsubscribe</a><a href="${productUrl}" style="color:#94a3b8;font-size:12px;margin:0 12px;">Visit Store</a></p>
    </div>

  </div>
</div>

IMPORTANT RULES:
- Replace every WRITE... placeholder with real compelling copy based on the actual product, brand and campaign goal
- Replace all {variables} with the actual provided values
- Only show the discount block if a discount code was provided
- Keep all styles 100% inline
- Output only raw HTML starting with <div — no markdown, no backticks, no explanation
- Make the copy sound human, premium and conversion-focused — never generic
- Analyze the product name and campaign goal to write copy that feels tailored to this specific merchant`

    console.log('AI prompt:', aiPrompt)

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: aiPrompt }]
    })

    const firstBlock = response.content[0]
    const text = firstBlock?.type === 'text' ? firstBlock.text : '{}'
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
