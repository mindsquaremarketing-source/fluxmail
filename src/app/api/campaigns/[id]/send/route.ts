export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    // Update to sending first
    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: 'sending' }
    })

    const contacts = await prisma.contact.findMany({
      where: { storeId: campaign.storeId, status: { in: ['subscribed', 'not_subscribed'] } }
    })

    let sent = 0
    for (const contact of contacts) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'Fluxmail <onboarding@resend.dev>',
          to: contact.email,
          subject: campaign.subject,
          html: campaign.htmlContent,
        })
        sent++
        await new Promise(r => setTimeout(r, 100))
      } catch (e) {
        console.error('Failed to send to:', contact.email, e)
      }
    }

    await prisma.campaign.update({
      where: { id: params.id },
      data: {
        status: 'sent',
        emailsSent: sent,
      }
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
