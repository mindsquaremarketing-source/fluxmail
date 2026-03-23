export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const campaignId = req.nextUrl.searchParams.get('c')
    const url = req.nextUrl.searchParams.get('url')

    if (campaignId) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { clicks: { increment: 1 } }
      })
    }

    const redirectUrl = url ? decodeURIComponent(url) : '/'
    return NextResponse.redirect(redirectUrl)
  } catch {
    return NextResponse.redirect('/')
  }
}
