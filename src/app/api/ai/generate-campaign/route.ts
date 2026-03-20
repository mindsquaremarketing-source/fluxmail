export const dynamic = 'force-dynamic'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { prompt, storeId, discountCode, discountValue } = await req.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are an expert email marketer for Shopify stores.
Generate a promotional email campaign.
Campaign brief: ${prompt}
Discount code: ${discountCode || 'none'}
Discount value: ${discountValue || '10'}%

Return ONLY valid JSON with no markdown:
{
  "subject": "email subject line",
  "previewText": "preview text",
  "htmlBody": "complete HTML email body"
}`
        }
      ]
    })

    const content = message.content[0]
    if (!content || content.type !== 'text') throw new Error('Invalid response')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const campaign = JSON.parse(cleaned)

    const store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })

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
