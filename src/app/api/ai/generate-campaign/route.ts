export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { prompt, storeId, discountCode, discountValue } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    // Get store
    let store
    if (storeId) {
      store = await prisma.store.findUnique({ where: { id: storeId } })
    } else {
      store = await prisma.store.findFirst({ orderBy: { createdAt: 'desc' } })
    }

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const primaryColor = '#6C47FF'
    const secondaryColor = '#FFFFFF'

    const discountInfo = discountCode
      ? `Include a discount code "${discountCode}" for ${discountValue}% off.`
      : 'No discount code for this campaign.'

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: `You are an expert email marketer for Shopify stores. Generate a compelling promotional email campaign.
Return ONLY valid JSON with these fields: subject, previewText, htmlBody
Use these brand colors: primary: ${primaryColor}, secondary: ${secondaryColor}
Make the email professional, engaging and conversion-focused.
The htmlBody should be a complete, responsive HTML email with inline styles.
Include a header with the store name, a hero section, body content, a CTA button, and a footer.
Use the brand primary color (${primaryColor}) for buttons and accents.
Keep the design clean and modern with good spacing.`,
      messages: [
        {
          role: 'user',
          content: `Generate an email campaign for the Shopify store "${store.shopDomain}".

Campaign description: ${prompt}

${discountInfo}

Return only valid JSON: { "subject": "...", "previewText": "...", "htmlBody": "..." }`,
        },
      ],
    })

    // Extract text content
    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from AI')
    }

    // Parse JSON from response (handle markdown code blocks)
    let responseText = textBlock.text.trim()
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const generated = JSON.parse(responseText)

    // Create campaign in database
    const campaign = await prisma.campaign.create({
      data: {
        storeId: store.id,
        name: generated.subject,
        subject: generated.subject,
        htmlContent: generated.htmlBody,
        status: 'draft',
      },
    })

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: generated.subject,
        previewText: generated.previewText,
        htmlBody: generated.htmlBody,
        status: campaign.status,
      },
    })
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
