import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendFlowEmail } from '@/lib/flow-sender'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName } = await req.json()
    const store = await prisma.store.findFirst({ orderBy: { createdAt: 'desc' } })
    if (!store) return NextResponse.json({ error: 'No store' }, { status: 404 })
    const contact = await prisma.contact.upsert({
      where: { storeId_email: { storeId: store.id, email: email.toLowerCase() } },
      update: { firstName: firstName || '', status: 'subscribed' },
      create: { storeId: store.id, email: email.toLowerCase(), firstName: firstName || '', lastName: lastName || '', status: 'subscribed', source: 'manual' }
    })
    let welcomeEmailSent = false
    let welcomeEmailError = null
    try {
      await sendFlowEmail({ storeId: store.id, contactId: contact.id, contactEmail: email.toLowerCase(), contactName: firstName || '', flowType: 'welcome', emailNumber: 1 })
      welcomeEmailSent = true
    } catch (e: any) { welcomeEmailError = e.message }
    return NextResponse.json({ success: true, welcomeEmailSent, welcomeEmailError, contactId: contact.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}