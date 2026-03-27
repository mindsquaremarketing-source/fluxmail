import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const store = await prisma.store.findFirst({ orderBy: { createdAt: 'desc' } })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }
    console.log('Register script using token preview:', store.accessToken?.substring(0, 12))

    const appHost = process.env.HOST || 'https://fluxmail-silk.vercel.app'
    const scriptSrc = `${appHost}/api/popup/script?storeId=${store.id}`

    // Use GraphQL Admin API instead of REST to register script tag
    const response = await fetch(`https://${store.shopDomain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': store.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `mutation scriptTagCreate($input: ScriptTagInput!) {
          scriptTagCreate(input: $input) {
            scriptTag {
              id
              src
            }
            userErrors {
              field
              message
            }
          }
        }`,
        variables: {
          input: {
            src: scriptSrc,
            displayScope: "ALL"
          }
        }
      })
    })

    const data = await response.json()
    console.log('Script tag registration response:', JSON.stringify(data, null, 2))

    const userErrors = data?.data?.scriptTagCreate?.userErrors
    if (userErrors && userErrors.length > 0) {
      return NextResponse.json({ error: userErrors }, { status: 400 })
    }

    if (data.errors) {
      return NextResponse.json({ error: data.errors }, { status: 400 })
    }

    return NextResponse.json({ success: true, scriptTag: data?.data?.scriptTagCreate?.scriptTag })
  } catch (error: any) {
    console.error('Register script tag error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
