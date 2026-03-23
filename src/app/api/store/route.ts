export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    if (!store) {
      return NextResponse.json({ error: 'No store found' }, { status: 404 })
    }
    return NextResponse.json({ store: { id: store.id, shopDomain: store.shopDomain } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
