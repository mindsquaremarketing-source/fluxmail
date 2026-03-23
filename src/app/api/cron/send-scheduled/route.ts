export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendFlowEmail } from '@/lib/flow-sender'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dueEmails = await prisma.scheduledEmail.findMany({
      where: { status: 'pending', scheduledFor: { lte: new Date() } },
      take: 50,
    })

    console.log(`Processing ${dueEmails.length} scheduled emails`)

    let sent = 0
    let failed = 0

    for (const scheduled of dueEmails) {
      try {
        await sendFlowEmail({
          storeId: scheduled.storeId,
          contactId: scheduled.contactId,
          contactEmail: scheduled.contactEmail,
          contactName: scheduled.contactName,
          flowType: scheduled.flowType as any,
          emailNumber: scheduled.emailNumber,
        })
        await prisma.scheduledEmail.update({
          where: { id: scheduled.id },
          data: { status: 'sent', sentAt: new Date() }
        })
        sent++
      } catch (e: any) {
        console.error(`Failed scheduled email ${scheduled.id}:`, e)
        await prisma.scheduledEmail.update({
          where: { id: scheduled.id },
          data: { status: 'failed' }
        })
        failed++
      }
    }

    return NextResponse.json({ success: true, processed: dueEmails.length, sent, failed })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
