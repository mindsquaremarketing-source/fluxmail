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

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found - add yourself as contact first' }, { status: 404 })
    }

    const result = await sendFlowEmail({
      storeId: store.id,
      contactId: contact.id,
      contactEmail: email,
      contactName: contact.firstName || '',
      flowType: 'welcome',
      emailNumber: 1,
    })

    return NextResponse.json({ success: true, message: `Welcome email sent to ${email}`, result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Test route is working!' })
}
