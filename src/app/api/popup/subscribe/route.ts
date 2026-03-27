import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'
import { generateWelcome1 } from '@/lib/template-engine'

export const dynamic = 'force-dynamic'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(req: NextRequest) {
  try {
    const { storeId, email, firstName } = await req.json()

    if (!storeId || !email) {
      return NextResponse.json(
        { error: 'Missing storeId or email' },
        { status: 400, headers: corsHeaders }
      )
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    await prisma.contact.upsert({
      where: { storeId_email: { storeId: store.id, email: email.toLowerCase() } },
      update: { firstName: firstName || '', status: 'subscribed' },
      create: {
        storeId: store.id,
        email: email.toLowerCase(),
        firstName: firstName || '',
        status: 'subscribed',
        source: 'popup',
      },
    })

    // Send welcome email
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)

      let products: any[] = []
      try {
        const res = await fetch(
          `https://${store.shopDomain}/admin/api/2024-01/products.json?limit=2&fields=id,title,images,variants`,
          { headers: { 'X-Shopify-Access-Token': store.accessToken } }
        )
        const data = await res.json()
        products = data.products || []
      } catch {}

      const html = generateWelcome1({
        storeName: store.companyName || store.senderName || 'Our Store',
        logoUrl: store.logoUrl || '',
        primaryColor: store.primaryColor || '#1E40AF',
        website: store.website || '#',
        products,
      })

      const baseUrl = process.env.HOST || 'https://fluxmail-silk.vercel.app'
      const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&store=${store.shopDomain}`
      const finalHtml = html.replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl)

      await resend.emails.send({
        from: 'Fluxmail <hello@tryfluxmail.com>',
        to: email.toLowerCase(),
        subject: `Welcome to ${store.companyName || 'Our Store'}! Here is 10% off`,
        html: finalHtml,
      })
    } catch (e: any) {
      console.error('Popup welcome email failed:', e.message)
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Popup subscribe error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    )
  }
}
