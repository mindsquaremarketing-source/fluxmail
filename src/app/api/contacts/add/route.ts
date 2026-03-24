import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'

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
    const resend = new Resend(process.env.RESEND_API_KEY)
    let welcomeEmailSent = false
    let welcomeEmailError = null
    try {
      await resend.emails.send({
        from: 'Fluxmail <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome! Here is 10% off your first order',
        html: '<h1>Welcome!</h1><p>Thank you for joining us! Use code WELCOME10 for 10% off.</p>'
      })
      welcomeEmailSent = true
    } catch (e: any) { welcomeEmailError = e.message }
    return NextResponse.json({ success: true, welcomeEmailSent, welcomeEmailError })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}