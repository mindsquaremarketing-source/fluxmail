export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  )
  try {
    const campaignId = req.nextUrl.searchParams.get('c')
    if (campaignId) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { opens: { increment: 1 } }
      })
    }
  } catch {}

  return new NextResponse(pixel, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  })
}
