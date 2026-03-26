export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'
import {
  generateWelcome1, generateWelcome2, generateWelcome3,
  generateBrowse1, generateBrowse2,
  generateCheckout1, generateCheckout2, generateCheckout3,
  generateThankYou1, generateThankYou2,
  generateWinback1, generateWinback2, generateWinback3,
} from '@/lib/template-engine'
import FlowEditorClient from './FlowEditorClient'

export default async function FlowEditorPage() {
  const store = await prisma.store.findFirst({
    orderBy: { createdAt: 'desc' }
  })

  let products: any[] = []
  try {
    if (store) {
      const res = await fetch(
        `https://${store.shopDomain}/admin/api/2024-01/products.json?limit=2&fields=id,title,images,variants`,
        { headers: { 'X-Shopify-Access-Token': store.accessToken } }
      )
      const data = await res.json()
      products = data.products || []
    }
  } catch {}

  const data = {
    storeName: store?.companyName || store?.senderName || 'Our Store',
    logoUrl: store?.logoUrl || '',
    primaryColor: store?.primaryColor || '#1E40AF',
    website: store?.website || '#',
    products,
  }

  const templates: Record<string, string> = {
    'welcome-1': generateWelcome1(data),
    'welcome-2': generateWelcome2(data),
    'welcome-3': generateWelcome3(data),
    'browse-1': generateBrowse1(data),
    'browse-2': generateBrowse2(data),
    'checkout-1': generateCheckout1(data),
    'checkout-2': generateCheckout2(data),
    'checkout-3': generateCheckout3(data),
    'thankyou-1': generateThankYou1(data),
    'thankyou-2': generateThankYou2(data),
    'winback-1': generateWinback1(data),
    'winback-2': generateWinback2(data),
    'winback-3': generateWinback3(data),
  }

  return (
    <FlowEditorClient
      templates={templates}
      storeName={data.storeName}
      senderEmail={store?.replyToEmail || 'hello@tryfluxmail.com'}
    />
  )
}
