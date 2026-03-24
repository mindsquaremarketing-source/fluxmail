export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { sendFlowEmail } from '@/lib/flow-sender'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    const store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    const contact = await prisma.contact.findFirst({
      where: { email }
    })

    if (!store || !contact) {
      return NextResponse.json({
        error: 'Store or contact not found',
        store: !!store,
        contact: !!contact
      }, { status: 404 })
    }

    await sendFlowEmail({
      storeId: store.id,
      contactId: contact.id,
      contactEmail: email,
      contactName: contact.firstName || '',
      flowType: 'welcome',
      emailNumber: 1,
    })

    return NextResponse.json({ success: true, message: `Welcome email sent to ${email}` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
