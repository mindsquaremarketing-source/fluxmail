export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function addTracking(html: string, campaignId: string, baseUrl: string): string {
  const pixel = `<img src="${baseUrl}/api/track/open?c=${campaignId}" width="1" height="1" style="display:none;" alt="">`
  html = html.replace('</body>', `${pixel}</body>`)
  html = html.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (match, url) => {
      if (url.includes('unsubscribe') || url.includes('track')) return match
      const tracked = `${baseUrl}/api/track/click?c=${campaignId}&url=${encodeURIComponent(url)}`
      return `href="${tracked}"`
    }
  )
  return html
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const logs: string[] = []

  try {
    logs.push(`Starting send for campaign: ${params.id}`)

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id }
    })
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    logs.push(`Campaign found: ${campaign.name}`)

    const store = await prisma.store.findFirst({
      where: { id: campaign.storeId }
    })
    logs.push(`Store found: ${store?.shopDomain}`)

    const contacts = await prisma.contact.findMany({
      where: { storeId: campaign.storeId, status: { not: 'unsubscribed' } }
    })
    logs.push(`Contacts found: ${contacts.length}`)
    logs.push(`Contact emails: ${contacts.map(c => c.email).join(', ')}`)

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts found', logs }, { status: 400 })
    }

    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: 'sending' }
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.HOST || 'https://fluxmail-silk.vercel.app'
    const trackedHtml = addTracking(campaign.htmlContent, campaign.id, baseUrl)

    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    logs.push('Resend initialized')

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const contact of contacts) {
      try {
        logs.push(`Sending to: ${contact.email}`)

        const personalizedHtml = trackedHtml.replace(
          /href="#"/g,
          `href="${baseUrl}/unsubscribe?email=${encodeURIComponent(contact.email)}&store=${store?.shopDomain || ''}"`
        )

        const result = await resend.emails.send({
          from: store?.senderName
            ? `${store.senderName} <onboarding@resend.dev>`
            : 'Fluxmail <onboarding@resend.dev>',
          to: contact.email,
          subject: campaign.subject,
          html: personalizedHtml,
        })

        logs.push(`Result for ${contact.email}: ${JSON.stringify(result)}`)

        if (result.error) {
          errors.push(`${contact.email}: ${result.error.message}`)
          failed++
        } else {
          sent++
        }

        await new Promise(r => setTimeout(r, 200))
      } catch (e: any) {
        errors.push(`${contact.email}: ${e.message}`)
        failed++
        logs.push(`Error for ${contact.email}: ${e.message}`)
      }
    }

    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: 'sent', emailsSent: sent }
    })

    logs.push(`Done. Sent: ${sent}, Failed: ${failed}`)

    return NextResponse.json({ success: true, sent, failed, errors, logs })
  } catch (error: any) {
    logs.push(`Fatal error: ${error.message}`)
    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: 'draft' }
    }).catch(() => {})
    return NextResponse.json({ error: error.message, logs }, { status: 500 })
  }
}
