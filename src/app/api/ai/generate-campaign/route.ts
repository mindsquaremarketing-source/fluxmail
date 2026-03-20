export const dynamic = 'force-dynamic'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { prompt, storeId, discountCode, discountValue, productName, productImage } = await req.json()

    const store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    const primaryColor = '#6C47FF'
    const storeName = store?.shopDomain?.replace('.myshopify.com', '') || 'Our Store'

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are an expert email designer creating beautiful, high-converting Shopify email campaigns.

Campaign brief: ${prompt}
Store name: ${storeName}
Primary brand color: ${primaryColor}
Product name: ${productName || 'Featured Product'}
Product image URL: ${productImage || 'https://via.placeholder.com/600x400/6C47FF/FFFFFF?text=Featured+Product'}
Discount code: ${discountCode || ''}
Discount value: ${discountValue || '10'}%

Create a stunning, professional HTML email with:
1. Clean modern design with brand colors
2. Header with store name and logo area
3. Hero section with large product image
4. Compelling headline and subheadline
5. Product showcase with description
6. Big discount/offer section if discount provided
7. Clear CTA button in brand color
8. Professional footer with unsubscribe link

Use these design principles:
- Use ${primaryColor} as the main color for buttons and accents
- Clean white background with subtle gray sections
- Professional typography (font-family: Arial, sans-serif)
- Mobile-responsive using inline styles and max-width: 600px
- Attractive product image display
- Urgency elements like "Limited Time Offer"
- Social proof elements

Return ONLY valid JSON with no markdown backticks:
{
  "subject": "compelling subject line with emoji",
  "previewText": "preview text under 100 chars",
  "htmlBody": "complete beautiful HTML email"
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
