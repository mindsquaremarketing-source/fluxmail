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
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const duplicate = await prisma.campaign.create({
      data: {
        storeId: campaign.storeId,
        name: `${campaign.name} (Copy)`,
        subject: campaign.subject,
        htmlContent: campaign.htmlContent,
        status: 'draft',
        emailsSent: 0,
        opens: 0,
        clicks: 0,
        placedOrders: 0,
        revenue: 0,
      }
    })

    return NextResponse.json({ success: true, campaign: duplicate })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
