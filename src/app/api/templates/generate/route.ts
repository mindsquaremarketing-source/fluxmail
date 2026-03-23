export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { generateWelcomeEmail, generateAbandonedCheckoutEmail } from '@/lib/template-engine'

export async function POST(req: NextRequest) {
  try {
    const { type, storeData, products } = await req.json()

    const data = {
      storeName: storeData.companyName || storeData.storeName || storeData.senderName || 'Our Store',
      logoUrl: storeData.logoUrl || '',
      primaryColor: storeData.primaryColor || '#1E40AF',
      website: storeData.website || '#',
      products: products || [],
    }

    let html = ''

    switch (type) {
      case 'welcome':
        html = generateWelcomeEmail({ ...data, discountCode: 'WELCOME10' })
        break
      case 'checkout':
        html = generateAbandonedCheckoutEmail({ ...data, discountCode: 'SAVE10' })
        break
      default:
        html = generateWelcomeEmail({ ...data, discountCode: 'WELCOME10' })
    }

    return NextResponse.json({ html })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
