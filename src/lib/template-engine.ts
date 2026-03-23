import { prisma } from './db'

export async function getStoreTemplateData(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId }
  })

  const shopName = store?.shopDomain?.replace('.myshopify.com', '') || 'Our Store'

  return {
    storeName: shopName.charAt(0).toUpperCase() + shopName.slice(1),
    logoUrl: '',
    primaryColor: '#1E40AF',
    website: store ? `https://${store.shopDomain}` : '#',
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

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${storeName}" style="max-height:60px;max-width:200px;">`
    : `<span style="color:#fff;font-size:24px;font-weight:900;">${storeName}</span>`

  const productsHtml = products && products.length > 0
    ? `
    <tr><td style="padding:32px 40px;">
      <h3 style="color:#111827;font-size:18px;font-weight:700;margin:0 0 16px;text-align:center;">
        Our Popular Products
      </h3>
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${products.slice(0, 2).map(p => `
        <td width="48%" style="background:#F9FAFB;border-radius:12px;overflow:hidden;text-align:center;">
          ${p.images?.[0]?.src
            ? `<img src="${p.images[0].src}" style="width:100%;height:160px;object-fit:cover;">`
            : `<div style="height:160px;background:#E5E7EB;text-align:center;line-height:160px;font-size:32px;">&#128230;</div>`
          }
          <div style="padding:12px;">
            <p style="color:#111827;font-weight:700;font-size:13px;margin:0 0 4px;">${p.title}</p>
            <p style="color:${primaryColor};font-weight:700;font-size:14px;margin:0;">
              $${(p.variants?.[0]?.price || '0.00')}
            </p>
          </div>
        </td>
        `).join('<td width="4%"></td>')}
      </tr>
      </table>
    </td></tr>`
    : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
<tr><td align="center">
<table width="600" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<tr><td style="background:${primaryColor};padding:28px 40px;text-align:center;">
  ${logoHtml}
</td></tr>

<tr><td style="padding:40px 40px 32px;text-align:center;">
  <h1 style="color:#111827;font-size:28px;font-weight:900;margin:0 0 12px;">
    Welcome to ${storeName}!
  </h1>
  <p style="color:#6B7280;font-size:16px;line-height:1.7;margin:0 0 28px;">
    Thank you for joining us! As a special welcome gift, here is an exclusive discount just for you.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="background:#EFF6FF;border:2px dashed ${primaryColor};border-radius:16px;padding:24px;text-align:center;">
    <p style="color:${primaryColor};font-size:12px;font-weight:700;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">
      Your Welcome Gift
    </p>
    <div style="background:${primaryColor};color:#fff;display:inline-block;padding:12px 32px;border-radius:8px;font-size:22px;font-weight:900;letter-spacing:3px;">
      ${discountCode || 'WELCOME10'}
    </div>
    <p style="color:#6B7280;font-size:13px;margin:10px 0 0;">
      Use at checkout for 10% off your order
    </p>
  </td></tr>
  </table>

  <a href="${website}" style="display:inline-block;background:${primaryColor};color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;margin-top:24px;box-shadow:0 8px 24px rgba(0,0,0,0.15);">
    Shop Now
  </a>
</td></tr>

${productsHtml}

<tr><td style="background:#F9FAFB;padding:28px 40px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
  <td width="33%" style="text-align:center;">
    <div style="font-size:24px;">&#128666;</div>
    <p style="color:#111827;font-size:12px;font-weight:700;margin:6px 0 2px;">Free Shipping</p>
    <p style="color:#9CA3AF;font-size:11px;margin:0;">On orders over $50</p>
  </td>
  <td width="33%" style="text-align:center;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
    <div style="font-size:24px;">&#8617;&#65039;</div>
    <p style="color:#111827;font-size:12px;font-weight:700;margin:6px 0 2px;">Easy Returns</p>
    <p style="color:#9CA3AF;font-size:11px;margin:0;">30-day policy</p>
  </td>
  <td width="33%" style="text-align:center;">
    <div style="font-size:24px;">&#128172;</div>
    <p style="color:#111827;font-size:12px;font-weight:700;margin:6px 0 2px;">24/7 Support</p>
    <p style="color:#9CA3AF;font-size:11px;margin:0;">Always here</p>
  </td>
</tr></table>
</td></tr>

<tr><td style="background:#111827;padding:28px 40px;text-align:center;">
  <p style="color:#fff;font-weight:700;font-size:15px;margin:0 0 8px;">${storeName}</p>
  <p style="color:#9CA3AF;font-size:12px;line-height:1.6;margin:0 0 12px;">
    You received this because you subscribed to our store updates.
  </p>
  <a href="#" style="color:#9CA3AF;font-size:12px;text-decoration:underline;">Unsubscribe</a>
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

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${storeName}" style="max-height:60px;max-width:200px;">`
    : `<span style="color:#fff;font-size:24px;font-weight:900;">${storeName}</span>`

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
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
<tr><td align="center">
<table width="600" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<tr><td style="background:linear-gradient(135deg,#F59E0B,#EF4444);padding:28px 40px;text-align:center;">
  ${logoHtml}
  <p style="color:#fff;margin:12px 0 0;font-size:18px;font-weight:700;">You left something behind! &#128722;</p>
</td></tr>

<tr><td style="padding:40px;">
  <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">
    Your cart is waiting for you
  </h2>
  <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">
    You were so close! Complete your purchase before these items sell out.
  </p>

  ${productsHtml ? `
  <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom:24px;">
    ${productsHtml}
  </table>` : ''}

  ${discountCode ? `
  <div style="background:#FFF7ED;border:2px dashed #F59E0B;border-radius:16px;padding:20px;margin-bottom:24px;text-align:center;">
    <p style="color:#92400E;font-size:13px;font-weight:700;margin:0 0 8px;">Special offer for you</p>
    <div style="background:#F59E0B;color:#fff;display:inline-block;padding:10px 24px;border-radius:8px;font-size:18px;font-weight:900;letter-spacing:2px;">
      ${discountCode}
    </div>
    <p style="color:#78350F;font-size:13px;margin:8px 0 0;">Use this code to save on your order!</p>
  </div>` : ''}

  <div style="text-align:center;">
    <a href="${website}" style="display:inline-block;background:#F59E0B;color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 8px 24px rgba(245,158,11,0.3);">
      Complete My Order
    </a>
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
