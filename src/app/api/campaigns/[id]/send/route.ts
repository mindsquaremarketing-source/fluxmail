export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendCampaign } from '@/lib/email'

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

    const result = await sendCampaign({
      campaignId: params.id,
      storeId: campaign.storeId,
    })

    return NextResponse.json({
      success: true,
      sent: result.sent,
      message: `Campaign sent to ${result.sent} contacts`
    })
  } catch (error: any) {
    console.error('Send campaign error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
