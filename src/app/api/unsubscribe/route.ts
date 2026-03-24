import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const store = searchParams.get('store')

    if (!email || !store) {
      return NextResponse.redirect(new URL('/unsubscribe/success', req.url))
    }

    await prisma.contact.updateMany({
      where: {
        email: decodeURIComponent(email),
      },
      data: { status: 'unsubscribed' }
    })

    return NextResponse.redirect(
      new URL('/unsubscribe/success', req.url)
    )
  } catch (error: any) {
    return NextResponse.redirect(new URL('/unsubscribe/success', req.url))
  }
}