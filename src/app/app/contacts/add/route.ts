import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendFlowEmail } from '@/lib/flow-sender'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const logs: string[] = []
  try {
    const { email, firstName, lastName } = await req.json()
    logs.push(`Adding: ${email}`)
    
    const store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    if (!store) return NextResponse.json(
      { error: 'No store', logs }, { status: 404 }
    )

    const contact = await prisma.contact.upsert({
      where: {
        storeId_email: {
          storeId: store.id,
          email: email.toLowerCase().trim()
        }
      },
      update: { firstName: firstName || '', status: 'subscribed' },
      create: {
        storeId: store.id,
        email: email.toLowerCase().trim(),
        firstName: firstName || '',
        lastName: lastName || '',
        status: 'subscribed',
        source: 'manual',
      }
    })
    logs.push(`Saved: ${contact.id}`)

    let welcomeEmailSent = false
    let welcomeEmailError = null
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
      logs.push('Welcome email sent!')
    } catch (e: any) {
      welcomeEmailError = e.message
      logs.push(`Email error: ${e.message}`)
    }

    return NextResponse.json({ 
      success: true,
      welcomeEmailSent,
      welcomeEmailError,
      logs
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message, logs 
    }, { status: 500 })
  }
}