export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { getStoreTemplateData, getStoreProducts, generateWelcomeEmail } from '@/lib/template-engine'

export async function POST(req: NextRequest) {
  try {
    const { contactEmail, storeId } = await req.json()

    const templateData = await getStoreTemplateData(storeId)
    const products = await getStoreProducts(storeId, 2)

    const html = generateWelcomeEmail({
      ...templateData,
      discountCode: 'WELCOME10',
      products,
    })

    await sendEmail({
      to: contactEmail,
      subject: `Welcome to ${templateData.storeName}!`,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
