import { prisma } from './db'

export async function syncAllContacts(storeId: string, accessToken: string, shopDomain: string) {
  let hasNextPage = true
  let cursor = null
  let totalSynced = 0

  while (hasNextPage) {
    const query = `
      query getCustomers($cursor: String) {
        customers(first: 250, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              email
              firstName
              lastName
              emailMarketingConsent {
                marketingState
              }
            }
          }
        }
      }
    `

    const response = await fetch(
      `https://${shopDomain}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { cursor }
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Shopify API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`)
    }

    const customers = data.data?.customers?.edges || []

    for (const { node: customer } of customers) {
      if (!customer.email) continue

      await prisma.contact.upsert({
        where: {
          storeId_email: {
            storeId,
            email: customer.email,
          },
        },
        update: {
          firstName: customer.firstName || null,
          lastName: customer.lastName || null,
          status: customer.emailMarketingConsent?.marketingState === 'UNSUBSCRIBED'
            ? 'unsubscribed'
            : 'subscribed',
        },
        create: {
          storeId,
          email: customer.email,
          firstName: customer.firstName || null,
          lastName: customer.lastName || null,
          status: customer.emailMarketingConsent?.marketingState === 'UNSUBSCRIBED'
            ? 'unsubscribed'
            : 'subscribed',
          source: 'shopify',
        },
      })
      totalSynced++
    }

    hasNextPage = data.data?.customers?.pageInfo?.hasNextPage || false
    cursor = data.data?.customers?.pageInfo?.endCursor || null
  }

  return totalSynced
}
