export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import {
  generateWelcome1, generateWelcome2, generateWelcome3,
  generateBrowse1, generateBrowse2,
  generateCheckout1, generateCheckout2, generateCheckout3,
  generateThankYou1, generateThankYou2,
  generateWinback1, generateWinback2, generateWinback3,
} from '@/lib/template-engine'

const generators: Record<string, (d: any) => string> = {
  'welcome-1': generateWelcome1,
  'welcome-2': generateWelcome2,
  'welcome-3': generateWelcome3,
  'browse-1': generateBrowse1,
  'browse-2': generateBrowse2,
  'checkout-1': generateCheckout1,
  'checkout-2': generateCheckout2,
  'checkout-3': generateCheckout3,
  'thankyou-1': generateThankYou1,
  'thankyou-2': generateThankYou2,
  'winback-1': generateWinback1,
  'winback-2': generateWinback2,
  'winback-3': generateWinback3,
}

export async function POST(req: NextRequest) {
  try {
    const { templateKey, storeData, products, generateAll } = await req.json()

    const data = {
      storeName: storeData?.companyName || storeData?.storeName || storeData?.senderName || 'Our Store',
      logoUrl: storeData?.logoUrl || '',
      primaryColor: storeData?.primaryColor || '#1E40AF',
      website: storeData?.website || '#',
      products: products || [],
    }

    // Generate ALL templates at once
    if (generateAll) {
      const all: Record<string, string> = {}
      for (const [key, gen] of Object.entries(generators)) {
        all[key] = gen(data)
      }
      return NextResponse.json({ all, success: true })
    }

    // Single template
    const generator = generators[templateKey] || generateWelcome1
    const html = generator(data)
    return NextResponse.json({ html, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
