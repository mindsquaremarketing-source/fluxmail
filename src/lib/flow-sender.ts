import { prisma } from './db'
import { Resend } from 'resend'
import {
  generateWelcome1, generateWelcome2, generateWelcome3,
  generateBrowse1, generateBrowse2,
  generateCheckout1, generateCheckout2, generateCheckout3,
  generateThankYou1, generateThankYou2,
  generateWinback1, generateWinback2, generateWinback3,
} from './template-engine'

interface FlowEmailParams {
  storeId: string
  contactId: string
  contactEmail: string
  contactName: string
  flowType: 'welcome' | 'browse' | 'checkout' | 'thankyou' | 'winback'
  emailNumber: number
}

const flowDelays: Record<string, number[]> = {
  welcome: [0, 48, 96],
  browse: [1, 24],
  checkout: [1, 24, 48],
  thankyou: [0, 72],
  winback: [720, 888, 1056],
}

const flowSubjects: Record<string, string[]> = {
  welcome: [
    'Welcome! Here is 10% off',
    'Your discount expires in 48 hours',
    'LAST CHANCE — Your 10% off expires today',
  ],
  browse: [
    'Still thinking about it?',
    'We saved your picks + 10% off',
  ],
  checkout: [
    'You forgot something!',
    'Still deciding? Here is 10% off',
    'Final reminder — 15% off your cart',
  ],
  thankyou: [
    'Thank you for your order!',
    'We love you! 15% off your next order',
  ],
  winback: [
    'We miss you! 20% off inside',
    'Look what is new!',
    'Our best offer — 25% off',
  ],
}

const flowGenerators: Record<string, ((d: any) => string)[]> = {
  welcome: [generateWelcome1, generateWelcome2, generateWelcome3],
  browse: [generateBrowse1, generateBrowse2],
  checkout: [generateCheckout1, generateCheckout2, generateCheckout3],
  thankyou: [generateThankYou1, generateThankYou2],
  winback: [generateWinback1, generateWinback2, generateWinback3],
}

export async function sendFlowEmail({
  storeId,
  contactId,
  contactEmail,
  contactName,
  flowType,
  emailNumber,
}: FlowEmailParams) {
  try {
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) return

    let products: any[] = []
    try {
      const res = await fetch(
        `https://${store.shopDomain}/admin/api/2024-01/products.json?limit=2&fields=id,title,images,variants`,
        { headers: { 'X-Shopify-Access-Token': store.accessToken } }
      )
      const data = await res.json()
      products = data.products || []
    } catch {}

    const templateData = {
      storeName: store.companyName || store.senderName || 'Our Store',
      logoUrl: store.logoUrl || '',
      primaryColor: store.primaryColor || '#1E40AF',
      website: store.website || '#',
      products,
    }

    const generators = flowGenerators[flowType]
    const subjects = flowSubjects[flowType]
    if (!generators || !subjects) return

    const idx = emailNumber - 1
    if (idx >= generators.length) return

    let html = generators[idx](templateData)
    const subject = `${subjects[idx]} — ${templateData.storeName}`

    // Add tracking
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.HOST || 'https://fluxmail-silk.vercel.app'
    const pixel = `<img src="${baseUrl}/api/track/open?flow=${flowType}&e=${contactId}" width="1" height="1" style="display:none;" alt="">`
    html = html.replace('</body>', `${pixel}</body>`)

    // Send
    const resend = new Resend(process.env.RESEND_API_KEY)
    const result = await resend.emails.send({
      from: `${store.senderName || templateData.storeName} <hello@tryfluxmail.com>`,
      to: contactEmail,
      subject,
      html,
    })

    console.log(`Flow email sent [${flowType} #${emailNumber}] to ${contactEmail}:`, result)

    // Schedule next email
    const delays = flowDelays[flowType] || []
    const nextDelay = delays[emailNumber]
    if (nextDelay && emailNumber < generators.length) {
      await prisma.scheduledEmail.create({
        data: {
          storeId,
          contactId,
          contactEmail,
          contactName,
          flowType,
          emailNumber: emailNumber + 1,
          scheduledFor: new Date(Date.now() + nextDelay * 60 * 60 * 1000),
          status: 'pending',
        }
      })
      console.log(`Scheduled ${flowType} #${emailNumber + 1} for ${contactEmail} in ${nextDelay}h`)
    }

    return result
  } catch (error) {
    console.error('Flow email error:', error)
  }
}
