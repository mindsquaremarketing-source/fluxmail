export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json()

    await sendEmail({
      to,
      subject: `[TEST] ${subject}`,
      html: html || '<h1>Test Email from Fluxmail</h1><p>Your email flow is working!</p>',
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
