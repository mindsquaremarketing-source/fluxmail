export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendFlowEmail } from '@/lib/flow-sender'

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    const store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    if (!store) return NextResponse.json(
      { error: 'No store' }, { status: 404 }
    )

    const contact = await prisma.contact.findFirst({
      where: { email }
    })
    if (!contact) return NextResponse.json(
      { error: 'Contact not found' }, { status: 404 }
    )

    await sendFlowEmail({
      storeId: store.id,
      contactId: contact.id,
      contactEmail: email,
      contactName: contact.firstName || '',
      flowType: 'welcome',
      emailNumber: 1,
    })

    return NextResponse.json({
      success: true,
      message: `Welcome email sent to ${email}`
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
