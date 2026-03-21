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

    const primaryColor = '#1E40AF'
    const storeName = store?.shopDomain?.replace('.myshopify.com', '') || 'Our Store'

    // Use smaller, faster model with less tokens
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are an expert email marketer. Create a promotional email.

Store: ${storeName}
Brand color: ${primaryColor}
Product: ${productName || 'Featured Product'}
Image: ${productImage || `https://source.unsplash.com/600x400/?${encodeURIComponent(productName || 'product')}`}
Brief: ${prompt}
Discount: ${discountCode ? `Code ${discountCode} for ${discountValue}% off` : 'No discount'}

Return ONLY valid JSON (no markdown):
{
  "subject": "subject line with emoji",
  "previewText": "preview under 100 chars",
  "htmlBody": "complete HTML email with inline styles, max-width 600px, brand color ${primaryColor} for buttons, product image, compelling copy, CTA button"
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
