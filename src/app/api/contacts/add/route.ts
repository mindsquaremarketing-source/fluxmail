export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!store) {
      return NextResponse.json({ error: 'No store found' }, { status: 404 })
    }

    const contact = await prisma.contact.upsert({
      where: {
        storeId_email: { storeId: store.id, email: email.toLowerCase().trim() }
      },
      update: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        status: 'subscribed',
      },
      create: {
        storeId: store.id,
        email: email.toLowerCase().trim(),
        firstName: firstName || null,
        lastName: lastName || null,
        status: 'subscribed',
        source: 'manual',
      }
    })

    return NextResponse.json({ success: true, contact })
  } catch (error: any) {
    console.error('Add contact error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
