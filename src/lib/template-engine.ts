import { prisma } from './db'
import { getContrastColor, getAlphaColor, darkenColor, getLogoBackground } from './color-utils'

export async function getStoreTemplateData(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId }
  })

  const shopName = store?.shopDomain?.replace('.myshopify.com', '') || 'Our Store'

  return {
    storeName: store?.companyName || store?.senderName || (shopName.charAt(0).toUpperCase() + shopName.slice(1)),
    logoUrl: store?.logoUrl || '',
    primaryColor: store?.primaryColor || '#1E40AF',
    website: store?.website || (store ? `https://${store.shopDomain}` : '#'),
    senderEmail: 'noreply@store.com',
    shopDomain: store?.shopDomain || '',
    accessToken: store?.accessToken || '',
  }
}

export async function getStoreProducts(storeId: string, limit = 4) {
  const store = await prisma.store.findUnique({
    where: { id: storeId }
  })
  if (!store) return []

  try {
    const res = await fetch(
      `https://${store.shopDomain}/admin/api/2024-01/products.json?limit=${limit}&fields=id,title,images,variants`,
      { headers: { 'X-Shopify-Access-Token': store.accessToken } }
    )
    const data = await res.json()
    return data.products || []
  } catch {
    return []
  }
}

export function generateWelcomeEmail(data: {
  storeName: string
  logoUrl: string
  primaryColor: string
  website: string
  discountCode?: string
  products?: any[]
}) {
  const { storeName, logoUrl, primaryColor, website, discountCode, products } = data

  const textOnPrimary = getContrastColor(primaryColor)
  const lightPrimary = getAlphaColor(primaryColor, 0.08)
  const darkPrimary = darkenColor(primaryColor, 20)
  const logoBg = getLogoBackground(primaryColor)

  const logoHtml = logoUrl
    ? logoBg.needsWhiteBg
      ? `<div style="display:inline-block;background:rgba(255,255,255,0.95);padding:10px 20px;border-radius:12px;"><img src="${logoUrl}" alt="${storeName}" style="max-height:50px;max-width:180px;display:block;"></div>`
      : `<img src="${logoUrl}" alt="${storeName}" style="max-height:60px;max-width:200px;display:block;margin:0 auto;">`
    : `<span style="color:${textOnPrimary};font-size:26px;font-weight:900;letter-spacing:-0.5px;">${storeName}</span>`

  const productsHtml = products && products.length > 0
    ? `<tr><td style="padding:0 40px 32px;">
        <h3 style="color:#111827;font-size:17px;font-weight:700;margin:0 0 16px;text-align:center;">Featured Products</h3>
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
        ${products.slice(0, 2).map(p => `
          <td width="48%" style="border-radius:16px;overflow:hidden;border:2px solid #F3F4F6;vertical-align:top;text-align:center;">
            ${p.images?.[0]?.src
              ? `<img src="${p.images[0].src}" width="100%" style="height:180px;object-fit:cover;display:block;">`
              : `<div style="height:180px;background:${lightPrimary};text-align:center;line-height:180px;font-size:48px;">&#128717;</div>`
            }
            <div style="padding:14px;">
              <p style="color:#111827;font-weight:700;font-size:14px;margin:0 0 4px;line-height:1.3;">${p.title}</p>
              <p style="color:${primaryColor};font-weight:800;font-size:16px;margin:0 0 10px;">$${p.variants?.[0]?.price || '0.00'}</p>
              <a href="${website}" style="display:inline-block;background:${primaryColor};color:${textOnPrimary};padding:8px 20px;border-radius:20px;text-decoration:none;font-size:12px;font-weight:700;">Buy Now</a>
            </div>
          </td>
        `).join('<td width="4%"></td>')}
        </tr></table>
      </td></tr>`
    : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">

<tr><td style="background:${primaryColor};padding:32px 40px;text-align:center;background-image:linear-gradient(135deg,${primaryColor},${darkPrimary});">
  ${logoHtml}
</td></tr>

<tr><td style="background:linear-gradient(135deg,${lightPrimary},transparent);padding:40px 48px 32px;text-align:center;">
  <div style="font-size:48px;margin-bottom:12px;">&#127881;</div>
  <h1 style="color:#111827;font-size:30px;font-weight:900;margin:0 0 12px;line-height:1.2;letter-spacing:-0.5px;">
    Welcome to ${storeName}!
  </h1>
  <p style="color:#6B7280;font-size:16px;line-height:1.7;margin:0 0 28px;max-width:400px;margin-left:auto;margin-right:auto;">
    Thank you for joining our community. We are thrilled to have you here!
  </p>

  <div style="background:#fff;border:2px solid ${primaryColor};border-radius:20px;padding:28px;margin:0 0 28px;box-shadow:0 4px 20px ${getAlphaColor(primaryColor, 0.15)};">
    <p style="color:${primaryColor};font-size:11px;font-weight:800;margin:0 0 10px;letter-spacing:3px;text-transform:uppercase;">
      Your Exclusive Welcome Gift
    </p>
    <div style="background:${primaryColor};color:${textOnPrimary};display:inline-block;padding:14px 36px;border-radius:12px;font-size:24px;font-weight:900;letter-spacing:4px;box-shadow:0 4px 16px ${getAlphaColor(primaryColor, 0.4)};">
      ${discountCode || 'WELCOME10'}
    </div>
    <p style="color:#6B7280;font-size:14px;margin:12px 0 0;">
      Use at checkout to save <strong style="color:${primaryColor};">10%</strong> on your entire order
    </p>
  </div>

  <a href="${website}" style="display:inline-block;background:${primaryColor};color:${textOnPrimary};padding:18px 56px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;letter-spacing:0.3px;box-shadow:0 8px 28px ${getAlphaColor(primaryColor, 0.35)};">
    Start Shopping
  </a>
</td></tr>

${productsHtml}

<tr><td style="background:#F8F9FA;padding:32px 48px;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td width="33%" style="text-align:center;padding:0 8px;">
      <div style="width:48px;height:48px;background:${lightPrimary};border-radius:12px;margin:0 auto 10px;text-align:center;line-height:48px;font-size:22px;">&#128666;</div>
      <p style="color:#111827;font-size:13px;font-weight:700;margin:0 0 3px;">Free Shipping</p>
      <p style="color:#9CA3AF;font-size:11px;margin:0;">On orders over $50</p>
    </td>
    <td width="33%" style="text-align:center;padding:0 8px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
      <div style="width:48px;height:48px;background:${lightPrimary};border-radius:12px;margin:0 auto 10px;text-align:center;line-height:48px;font-size:22px;">&#8617;&#65039;</div>
      <p style="color:#111827;font-size:13px;font-weight:700;margin:0 0 3px;">Easy Returns</p>
      <p style="color:#9CA3AF;font-size:11px;margin:0;">30-day policy</p>
    </td>
    <td width="33%" style="text-align:center;padding:0 8px;">
      <div style="width:48px;height:48px;background:${lightPrimary};border-radius:12px;margin:0 auto 10px;text-align:center;line-height:48px;font-size:22px;">&#11088;</div>
      <p style="color:#111827;font-size:13px;font-weight:700;margin:0 0 3px;">Top Rated</p>
      <p style="color:#9CA3AF;font-size:11px;margin:0;">5-star reviews</p>
    </td>
  </tr>
  </table>
</td></tr>

<tr><td style="background:#111827;padding:32px 48px;text-align:center;">
  <p style="color:#fff;font-weight:700;font-size:16px;margin:0 0 8px;">${storeName}</p>
  <p style="color:#6B7280;font-size:12px;line-height:1.6;margin:0 0 16px;">You received this because you subscribed to our store updates.</p>
  <a href="#" style="color:#9CA3AF;font-size:12px;text-decoration:underline;margin:0 8px;">Unsubscribe</a>
  <span style="color:#374151;">|</span>
  <a href="${website}" style="color:#9CA3AF;font-size:12px;text-decoration:underline;margin:0 8px;">Visit Store</a>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`
}

export function generateAbandonedCheckoutEmail(data: {
  storeName: string
  logoUrl: string
  primaryColor: string
  website: string
  discountCode?: string
  products?: any[]
}) {
  const { storeName, logoUrl, primaryColor, website, discountCode, products } = data

  const textOnPrimary = getContrastColor(primaryColor)
  const logoBg = getLogoBackground(primaryColor)

  const logoHtml = logoUrl
    ? logoBg.needsWhiteBg
      ? `<div style="display:inline-block;background:rgba(255,255,255,0.95);padding:10px 20px;border-radius:12px;"><img src="${logoUrl}" alt="${storeName}" style="max-height:50px;max-width:180px;display:block;"></div>`
      : `<img src="${logoUrl}" alt="${storeName}" style="max-height:60px;max-width:200px;display:block;margin:0 auto;">`
    : `<span style="color:${textOnPrimary};font-size:24px;font-weight:900;">${storeName}</span>`

  const productsHtml = products && products.length > 0
    ? products.slice(0, 2).map(p => `
      <tr><td style="padding:12px;background:#F9FAFB;border-radius:12px;margin-bottom:8px;">
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="80">
            ${p.images?.[0]?.src
              ? `<img src="${p.images[0].src}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;">`
              : `<div style="width:72px;height:72px;background:#E5E7EB;border-radius:8px;text-align:center;line-height:72px;font-size:24px;">&#128230;</div>`
            }
          </td>
          <td style="padding-left:12px;">
            <p style="color:#111827;font-weight:700;font-size:14px;margin:0 0 4px;">${p.title}</p>
            <p style="color:${primaryColor};font-weight:700;margin:0;">$${p.variants?.[0]?.price || '0.00'}</p>
          </td>
        </tr>
        </table>
      </td></tr>
    `).join('')
    : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
<tr><td align="center">
<table width="600" style="max-width:600px;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">

<tr><td style="background:linear-gradient(135deg,#F59E0B,#EF4444);padding:28px 40px;text-align:center;">
  ${logoHtml}
  <p style="color:#fff;margin:12px 0 0;font-size:18px;font-weight:700;">You left something behind! &#128722;</p>
</td></tr>

<tr><td style="padding:40px;">
  <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">Your cart is waiting for you</h2>
  <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">You were so close! Complete your purchase before these items sell out.</p>

  ${productsHtml ? `<table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom:24px;">${productsHtml}</table>` : ''}

  ${discountCode ? `
  <div style="background:#FFF7ED;border:2px dashed #F59E0B;border-radius:16px;padding:20px;margin-bottom:24px;text-align:center;">
    <p style="color:#92400E;font-size:13px;font-weight:700;margin:0 0 8px;">Special offer for you</p>
    <div style="background:#F59E0B;color:#fff;display:inline-block;padding:10px 24px;border-radius:8px;font-size:18px;font-weight:900;letter-spacing:2px;">${discountCode}</div>
    <p style="color:#78350F;font-size:13px;margin:8px 0 0;">Use this code to save on your order!</p>
  </div>` : ''}

  <div style="text-align:center;">
    <a href="${website}" style="display:inline-block;background:#F59E0B;color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 8px 24px rgba(245,158,11,0.3);">Complete My Order</a>
  </div>
</td></tr>

<tr><td style="background:#111827;padding:24px 40px;text-align:center;">
  <p style="color:#fff;font-weight:700;margin:0 0 8px;">${storeName}</p>
  <a href="#" style="color:#9CA3AF;font-size:12px;">Unsubscribe</a>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`
}
