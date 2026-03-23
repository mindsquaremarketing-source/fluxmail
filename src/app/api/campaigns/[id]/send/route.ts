export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function addTracking(html: string, campaignId: string, baseUrl: string): string {
  // Add open tracking pixel before </body>
  const pixel = `<img src="${baseUrl}/api/track/open?c=${campaignId}" width="1" height="1" style="display:none;border:0;" alt="">`
  html = html.replace('</body>', `${pixel}</body>`)

  // Add click tracking to all links (except unsubscribe)
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
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id }
    })
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: 'sending' }
    })

    const store = await prisma.store.findFirst({
      where: { id: campaign.storeId }
    })

    const contacts = await prisma.contact.findMany({
      where: { storeId: campaign.storeId, status: { in: ['subscribed', 'not_subscribed'] } }
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.HOST || 'https://fluxmail-silk.vercel.app'
    const trackedHtml = addTracking(campaign.htmlContent, campaign.id, baseUrl)

    let sent = 0
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    for (const contact of contacts) {
      try {
        const personalizedHtml = trackedHtml.replace(
          /href="[^"]*#[^"]*"[^>]*>([^<]*[Uu]nsubscribe[^<]*)<\/a>/g,
          `href="${baseUrl}/unsubscribe?email=${encodeURIComponent(contact.email)}&store=${store?.shopDomain || ''}">${'$1'}</a>`
        )

        await resend.emails.send({
          from: store?.senderName
            ? `${store.senderName} <onboarding@resend.dev>`
            : 'Fluxmail <onboarding@resend.dev>',
          to: contact.email,
          subject: campaign.subject,
          html: personalizedHtml,
        })
        sent++
        await new Promise(r => setTimeout(r, 100))
      } catch (e) {
        console.error('Failed to send to:', contact.email, e)
      }
    }

    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: 'sent', emailsSent: sent }
    })

    return NextResponse.json({ success: true, sent })
  } catch (error: any) {
    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: 'draft' }
    }).catch(() => {})
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
