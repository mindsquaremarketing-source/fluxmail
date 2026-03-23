export const dynamic = 'force-dynamic'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getContrastColor, darkenColor } from '@/lib/color-utils'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { prompt, storeId, discountCode, discountValue, productName, productImage } = await req.json()

    const store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    const primaryColor = store?.primaryColor || '#1E40AF'
    const storeName = store?.companyName || store?.senderName || store?.shopDomain?.replace('.myshopify.com', '') || 'Our Store'
    const textOnPrimary = getContrastColor(primaryColor)
    const darkPrimary = darkenColor(primaryColor, 20)
    const logoUrl = store?.logoUrl || ''

    // Fetch real products from Shopify
    let realProductName = productName || 'Featured Product'
    let realProductImage = productImage || ''
    let realProductPrice = '0.00'

    if (store) {
      try {
        const productsRes = await fetch(
          `https://${store.shopDomain}/admin/api/2024-01/products.json?limit=10&fields=id,title,images,variants`,
          { headers: { 'X-Shopify-Access-Token': store.accessToken } }
        )
        const productsData = await productsRes.json()
        const shopifyProducts = productsData.products || []

        if (shopifyProducts.length > 0) {
          const featured = shopifyProducts[0]
          if (!productName) realProductName = featured.title
          if (!productImage) realProductImage = featured.images?.[0]?.src || ''
          realProductPrice = featured.variants?.[0]?.price || '0.00'
        }
      } catch (e) {
        console.error('Failed to fetch products for AI:', e)
      }
    }

    // Use smaller, faster model with less tokens
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a world-class email designer for Shopify stores.
Create a stunning, conversion-focused HTML email.

Store: ${storeName}
Brand color: ${primaryColor}
Product: ${realProductName}
Product price: $${realProductPrice}
Image: ${realProductImage || `https://source.unsplash.com/600x400/?${encodeURIComponent(realProductName || 'shopping,product')}`}
Brief: ${prompt}
Discount: ${discountCode ? `Code ${discountCode} for ${discountValue}% off` : 'No discount'}
Text color on primary background: ${textOnPrimary}
Header gradient: linear-gradient(135deg,${primaryColor},${darkPrimary})
Logo: ${logoUrl ? 'Use this logo image: ' + logoUrl : 'Use store name as text logo'}

Create a BEAUTIFUL HTML email with this EXACT structure:

<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<!-- HEADER with logo -->
<tr><td style="background:${primaryColor};padding:24px 40px;text-align:center;">
  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">${storeName}</h1>
</td></tr>

<!-- HERO IMAGE -->
<tr><td style="padding:0;">
  <img src="{PRODUCT_IMAGE}" alt="${productName}" border="0" width="600" style="width:100%;max-width:600px;height:auto;display:block;">
</td></tr>

<!-- MAIN CONTENT -->
<tr><td style="padding:40px 48px 32px;">
  <h2 style="color:#111827;font-size:28px;font-weight:800;margin:0 0 12px;line-height:1.2;">{HEADLINE}</h2>
  <p style="color:#6B7280;font-size:16px;line-height:1.6;margin:0 0 24px;">{SUBHEADLINE}</p>

  {DISCOUNT_SECTION}

  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:8px 0 24px;">
    <a href="#" style="display:inline-block;background:${primaryColor};color:#ffffff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">{CTA_TEXT}</a>
  </td></tr>
  </table>
</td></tr>

<!-- FEATURES SECTION -->
<tr><td style="background:#F9FAFB;padding:32px 48px;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td width="33%" style="text-align:center;padding:0 8px;">
      <div style="font-size:32px;margin-bottom:8px;">🚚</div>
      <p style="color:#111827;font-weight:700;font-size:13px;margin:0 0 4px;">Free Shipping</p>
      <p style="color:#9CA3AF;font-size:12px;margin:0;">On orders over $50</p>
    </td>
    <td width="33%" style="text-align:center;padding:0 8px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
      <div style="font-size:32px;margin-bottom:8px;">↩️</div>
      <p style="color:#111827;font-weight:700;font-size:13px;margin:0 0 4px;">Easy Returns</p>
      <p style="color:#9CA3AF;font-size:12px;margin:0;">30-day return policy</p>
    </td>
    <td width="33%" style="text-align:center;padding:0 8px;">
      <div style="font-size:32px;margin-bottom:8px;">⭐</div>
      <p style="color:#111827;font-weight:700;font-size:13px;margin:0 0 4px;">Top Rated</p>
      <p style="color:#9CA3AF;font-size:12px;margin:0;">Loved by customers</p>
    </td>
  </tr>
  </table>
</td></tr>

<!-- FOOTER -->
<tr><td style="background:#111827;padding:32px 48px;text-align:center;">
  <p style="color:#ffffff;font-weight:700;font-size:16px;margin:0 0 8px;">${storeName}</p>
  <p style="color:#9CA3AF;font-size:12px;margin:0 0 16px;line-height:1.6;">You received this email because you subscribed to our store updates.<br>We respect your privacy and will never share your information.</p>
  <a href="#" style="color:#9CA3AF;font-size:12px;text-decoration:underline;">Unsubscribe</a>
  <span style="color:#4B5563;margin:0 8px;">|</span>
  <a href="#" style="color:#9CA3AF;font-size:12px;text-decoration:underline;">View in browser</a>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>

For {DISCOUNT_SECTION} if discount code exists use:
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="background:linear-gradient(135deg,#667eea22,#764ba222);border:2px dashed ${primaryColor};border-radius:12px;padding:24px;text-align:center;">
  <p style="color:#6B7280;font-size:14px;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Limited Time Offer</p>
  <p style="color:#111827;font-size:32px;font-weight:900;margin:0 0 4px;letter-spacing:3px;">${discountCode}</p>
  <p style="color:${primaryColor};font-size:14px;font-weight:700;margin:0;">Save ${discountValue}% on your order</p>
</td></tr>
</table>

Return ONLY valid JSON (no markdown, no backticks):
{
  "subject": "compelling subject with emoji",
  "previewText": "preview text under 90 chars",
  "htmlBody": "the complete HTML above with all placeholders replaced with real compelling content based on the campaign brief"
}`
        }
      ]
    })

    const content = message.content[0]
    if (!content || content.type !== 'text') throw new Error('Invalid response')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const campaign = JSON.parse(cleaned)

    const saved = await prisma.campaign.create({
      data: {
        storeId: store?.id || storeId,
        name: `ai_based - ${new Date().toLocaleDateString()}`,
        subject: campaign.subject,
        htmlContent: campaign.htmlBody,
        status: 'draft',
      }
    })

    return NextResponse.json({
      success: true,
      campaign: saved,
      subject: campaign.subject,
      previewText: campaign.previewText,
      htmlBody: campaign.htmlBody,
    })
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
