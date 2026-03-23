export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    if (!store) return NextResponse.json({ error: 'No store' }, { status: 404 })

    // Fetch Shopify store info
    const shopRes = await fetch(
      `https://${store.shopDomain}/admin/api/2024-01/shop.json`,
      { headers: { 'X-Shopify-Access-Token': store.accessToken } }
    )
    const shopData = await shopRes.json()
    const shop = shopData.shop

    // Fetch store theme assets to get logo
    const themesRes = await fetch(
      `https://${store.shopDomain}/admin/api/2024-01/themes.json`,
      { headers: { 'X-Shopify-Access-Token': store.accessToken } }
    )
    const themesData = await themesRes.json()
    const mainTheme = themesData.themes?.find((t: any) => t.role === 'main')

    let logoUrl = ''
    let primaryColor = '#1E40AF'

    if (mainTheme) {
      // Try to extract colors from theme settings
      try {
        const assetsRes = await fetch(
          `https://${store.shopDomain}/admin/api/2024-01/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`,
          { headers: { 'X-Shopify-Access-Token': store.accessToken } }
        )
        const assetsData = await assetsRes.json()

        if (assetsData.asset?.value) {
          const settings = JSON.parse(assetsData.asset.value)
          const current = settings.current || settings.presets?.Default || {}

          if (current.colors_accent_1) primaryColor = current.colors_accent_1
          else if (current.color_button) primaryColor = current.color_button
          else if (current.colors_button_label) primaryColor = current.colors_button_label
        }
      } catch (e) {
        console.log('Could not extract theme colors:', e)
      }

      // Try to get logo from theme assets
      for (const ext of ['logo.png', 'logo.svg', 'logo.jpg']) {
        try {
          const logoRes = await fetch(
            `https://${store.shopDomain}/admin/api/2024-01/themes/${mainTheme.id}/assets.json?asset[key]=assets/${ext}`,
            { headers: { 'X-Shopify-Access-Token': store.accessToken } }
          )
          const logoData = await logoRes.json()
          if (logoData.asset?.public_url) {
            logoUrl = logoData.asset.public_url
            break
          }
        } catch {}
      }
    }

    // Update store with auto-detected branding
    const updated = await prisma.store.update({
      where: { id: store.id },
      data: {
        companyName: shop?.name || store.companyName,
        website: shop?.domain ? `https://${shop.domain}` : store.website,
        email: shop?.email || store.email,
        phone: shop?.phone || store.phone,
        city: shop?.city || store.city,
        country: shop?.country || store.country,
        zip: shop?.zip || store.zip,
        address: shop?.address1 || store.address,
        ...(logoUrl && { logoUrl }),
        ...(primaryColor !== '#1E40AF' && { primaryColor }),
      }
    })

    return NextResponse.json({
      success: true,
      synced: {
        storeName: updated.companyName,
        website: updated.website,
        email: updated.email,
        logoUrl: logoUrl || 'Not found in theme',
        primaryColor,
        city: updated.city,
        country: updated.country,
      }
    })
  } catch (error: any) {
    console.error('Branding sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
