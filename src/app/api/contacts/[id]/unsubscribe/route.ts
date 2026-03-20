export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: { status: 'unsubscribed' },
    })

    return NextResponse.json({ success: true, contact })
  } catch (error: any) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
