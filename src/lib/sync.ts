import { prisma } from './db'

export async function syncAllContacts(storeId: string, accessToken: string, shopDomain: string) {
  let page = 1
  let hasMore = true
  let totalSynced = 0
  let pageInfo = null

  const baseUrl = `https://${shopDomain}/admin/api/2024-01/customers.json`

  while (hasMore) {
    const url = pageInfo
      ? `https://${shopDomain}/admin/api/2024-01/customers.json?limit=250&page_info=${pageInfo}`
      : `${baseUrl}?limit=250`

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Shopify API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    const customers = data.customers || []

    if (customers.length === 0) {
      hasMore = false
      break
    }

    for (const customer of customers) {
      await prisma.contact.upsert({
        where: {
          storeId_email: {
            storeId,
            email: customer.email || `noemail_${customer.id}@placeholder.com`,
          },
        },
        update: {
          firstName: customer.first_name || null,
          lastName: customer.last_name || null,
          status: customer.email_marketing_consent?.state === 'subscribed'
            ? 'subscribed'
            : 'not_subscribed',
        },
        create: {
          storeId,
          email: customer.email || `noemail_${customer.id}@placeholder.com`,
          firstName: customer.first_name || null,
          lastName: customer.last_name || null,
          status: customer.email_marketing_consent?.state === 'subscribed'
            ? 'subscribed'
            : 'not_subscribed',
          source: 'shopify',
        },
      })
      totalSynced++
    }

    // Check for next page
    const linkHeader = response.headers.get('Link')
    if (linkHeader && linkHeader.includes('rel="next"')) {
      const match = linkHeader.match(/page_info=([^&>]+).*rel="next"/)
      pageInfo = match ? match[1] : null
      hasMore = !!pageInfo
    } else {
      hasMore = false
    }
  }

  return totalSynced
}
