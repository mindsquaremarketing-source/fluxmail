import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendFlowEmail } from '@/lib/flow-sender'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName } = await req.json()

    const store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    if (!store) {
      return NextResponse.json({ error: 'No store' }, { status: 404 })
    }

    const existing = await prisma.contact.findFirst({
      where: { storeId: store.id, email: email.toLowerCase().trim() }
    })

    const contact = await prisma.contact.upsert({
      where: {
        storeId_email: { storeId: store.id, email: email.toLowerCase().trim() }
      },
      update: {
        firstName: firstName || '',
        lastName: lastName || '',
        status: 'subscribed',
      },
      create: {
        storeId: store.id,
        email: email.toLowerCase().trim(),
        firstName: firstName || '',
        lastName: lastName || '',
        status: 'subscribed',
        source: 'manual',
      }
    })

    let welcomeEmailSent = false
    let welcomeEmailError = null

    if (!existing) {
      try {
        await sendFlowEmail({
          storeId: store.id,
          contactId: contact.id,
          contactEmail: email.toLowerCase().trim(),
          contactName: firstName || '',
          flowType: 'welcome',
          emailNumber: 1,
        })
        welcomeEmailSent = true
      } catch (e: any) {
        welcomeEmailError = e.message
      }
    }

    return NextResponse.json({
      success: true,
      contact,
      isNew: !existing,
      welcomeEmailSent,
      welcomeEmailError
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
