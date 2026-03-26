import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'
import { generateWelcome1 } from '@/lib/template-engine'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  console.log('Contact add triggered')
  try {
    const { email, firstName, lastName } = await req.json()
    const store = await prisma.store.findFirst({ orderBy: { createdAt: 'desc' } })
    if (!store) return NextResponse.json({ error: 'No store' }, { status: 404 })
    const contact = await prisma.contact.upsert({
      where: { storeId_email: { storeId: store.id, email: email.toLowerCase() } },
      update: { firstName: firstName || '', status: 'subscribed' },
      create: { storeId: store.id, email: email.toLowerCase(), firstName: firstName || '', lastName: lastName || '', status: 'subscribed', source: 'manual' }
    })
    const resend = new Resend(process.env.RESEND_API_KEY)
    let welcomeEmailSent = false
    let welcomeEmailError = null
    try {
      // Fetch real products
      let products: any[] = []
      try {
        const res = await fetch(
          `https://${store.shopDomain}/admin/api/2024-01/products.json?limit=2&fields=id,title,images,variants`,
          { headers: { 'X-Shopify-Access-Token': store.accessToken } }
        )
        const data = await res.json()
        products = data.products || []
      } catch {}

      // Generate beautiful template
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

      const fromAddress = 'Fluxmail <hello@tryfluxmail.com>'
      const toAddress = email
      const subjectLine = `Welcome to ${store.companyName || 'Our Store'}! Here is 10% off`
      console.log('Sending welcome email:', { from: fromAddress, to: toAddress, subject: subjectLine })

      try {
        const result = await resend.emails.send({
          from: fromAddress,
          to: toAddress,
          subject: subjectLine,
          html: finalHtml,
        })
        console.log('Resend response:', JSON.stringify(result))
        welcomeEmailSent = true
      } catch (sendError: any) {
        console.error('Resend send failed:', sendError)
        console.error('Full error details:', JSON.stringify(sendError, Object.getOwnPropertyNames(sendError)))
        throw sendError
      }
    } catch (e: any) { welcomeEmailError = e.message }
    return NextResponse.json({ success: true, welcomeEmailSent, welcomeEmailError })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
