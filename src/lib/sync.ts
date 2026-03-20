import { prisma } from '@/lib/db'

interface ShopifyCustomer {
  id: number
  email: string | null
  first_name: string | null
  last_name: string | null
}

export async function syncAllContacts(
  storeId: string,
  accessToken: string,
  shopDomain: string
) {
  let url: string | null =
    `https://${shopDomain}/admin/api/2025-01/customers.json?limit=250`

  let totalSynced = 0

  while (url) {
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const customers: ShopifyCustomer[] = data.customers || []

    const contactsToUpsert = customers.filter((c) => c.email)

    for (const customer of contactsToUpsert) {
      await prisma.contact.upsert({
        where: {
          storeId_email: {
            storeId,
            email: customer.email!,
          },
        },
        update: {
          firstName: customer.first_name || null,
          lastName: customer.last_name || null,
        },
        create: {
          storeId,
          email: customer.email!,
          firstName: customer.first_name || null,
          lastName: customer.last_name || null,
          source: 'shopify',
        },
      })
    }

    totalSynced += contactsToUpsert.length

    // Handle pagination via Link header
    const linkHeader = response.headers.get('link')
    url = null
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
      if (nextMatch) {
        url = nextMatch[1]
      }
    }
  }

  return { totalSynced }
}
