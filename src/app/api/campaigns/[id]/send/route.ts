export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get all subscribed contacts for this store
    const subscribedCount = await prisma.contact.count({
      where: {
        storeId: campaign.storeId,
        status: 'subscribed',
      },
    })

    // Update campaign status and emailsSent count
    const updated = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        status: 'sent',
        emailsSent: subscribedCount,
      },
    })

    // Actual email sending will be implemented with Resend later
    console.log(`Campaign "${campaign.name}" marked as sent to ${subscribedCount} contacts`)

    return NextResponse.json({
      success: true,
      campaign: updated,
      emailsSent: subscribedCount,
    })
  } catch (error: any) {
    console.error('Campaign send error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
