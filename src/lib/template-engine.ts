import { prisma } from './db'
import { isDark, getContrastColor, getAlphaColor, darkenColor } from './color-utils'

export async function getStoreTemplateData(storeId: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  return {
    storeName: store?.companyName || store?.senderName || 'Our Store',
    logoUrl: store?.logoUrl || '',
    primaryColor: store?.primaryColor || '#1E40AF',
    website: store?.website || '#',
    senderEmail: store?.replyToEmail || '',
  }
}

export async function getStoreProducts(storeId: string, limit = 4) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) return []
  try {
    const res = await fetch(
      `https://${store.shopDomain}/admin/api/2024-01/products.json?limit=${limit}&fields=id,title,images,variants`,
      { headers: { 'X-Shopify-Access-Token': store.accessToken } }
    )
    const data = await res.json()
    return data.products || []
  } catch { return [] }
}

// ─── SHARED BUILDING BLOCKS ──────────────────────────────

function getColors(primaryColor: string) {
  const textOnPrimary = getContrastColor(primaryColor)
  const darkPrimary = darkenColor(primaryColor, 25)
  const lightPrimary = getAlphaColor(primaryColor, 0.08)
  const borderPrimary = getAlphaColor(primaryColor, 0.25)
  const shadowPrimary = getAlphaColor(primaryColor, 0.30)
  return { textOnPrimary, darkPrimary, lightPrimary, borderPrimary, shadowPrimary }
}

function getLogoHtml(logoUrl: string, storeName: string, primaryColor: string) {
  const textOnPrimary = getContrastColor(primaryColor)
  if (!logoUrl) return `<span style="color:${textOnPrimary};font-size:26px;font-weight:900;letter-spacing:-0.5px;">${storeName}</span>`
  if (isDark(primaryColor)) return `<img src="${logoUrl}" alt="${storeName}" width="180" height="55" loading="eager" style="max-height:55px;max-width:180px;display:block;margin:0 auto;">`
  return `<div style="display:inline-block;background:rgba(255,255,255,0.92);padding:8px 18px;border-radius:10px;"><img src="${logoUrl}" alt="${storeName}" width="170" height="50" loading="eager" style="max-height:50px;max-width:170px;display:block;"></div>`
}

function header(logoUrl: string, storeName: string, primaryColor: string) {
  const { darkPrimary } = getColors(primaryColor)
  return `<tr><td style="background:linear-gradient(135deg,${primaryColor} 0%,${darkPrimary} 100%);padding:28px 40px;text-align:center;">${getLogoHtml(logoUrl, storeName, primaryColor)}</td></tr>`
}

function footer(storeName: string, website: string, primaryColor: string) {
  return `<tr><td style="background:#111827;padding:28px 40px;text-align:center;border-top:3px solid ${primaryColor};">
    <p style="color:#fff;font-weight:700;font-size:15px;margin:0 0 6px;">${storeName}</p>
    <p style="color:#6B7280;font-size:12px;line-height:1.6;margin:0 0 14px;">You received this because you subscribed to our store updates.</p>
    <a href="#" style="color:#9CA3AF;font-size:12px;text-decoration:underline;margin:0 8px;">Unsubscribe</a>
    <span style="color:#374151;">|</span>
    <a href="${website}" style="color:#9CA3AF;font-size:12px;text-decoration:underline;margin:0 8px;">Visit Store</a>
  </td></tr>`
}

function discountBox(code: string, description: string, primaryColor: string) {
  const { textOnPrimary, lightPrimary } = getColors(primaryColor)
  return `<div style="background:${lightPrimary};border:2px dashed ${primaryColor};border-radius:16px;padding:24px;margin:0 0 24px;text-align:center;">
    <p style="color:${primaryColor};font-size:11px;font-weight:800;margin:0 0 10px;letter-spacing:3px;text-transform:uppercase;">Exclusive Offer</p>
    <div style="background:${primaryColor};color:${textOnPrimary};display:inline-block;padding:14px 36px;border-radius:10px;font-size:22px;font-weight:900;letter-spacing:4px;box-shadow:0 4px 16px ${getAlphaColor(primaryColor, 0.35)};">${code}</div>
    <p style="color:#6B7280;font-size:13px;margin:10px 0 0;">${description}</p>
  </div>`
}

function ctaButton(text: string, url: string, primaryColor: string) {
  const { textOnPrimary, shadowPrimary } = getColors(primaryColor)
  return `<a href="${url}" style="display:inline-block;background:${primaryColor};color:${textOnPrimary};padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.3px;box-shadow:0 8px 24px ${shadowPrimary};">${text}</a>`
}

function productsSection(products: any[], primaryColor: string, website: string) {
  if (!products || products.length === 0) return ''
  const { textOnPrimary, lightPrimary } = getColors(primaryColor)
  return `<tr><td style="padding:0 40px 32px;">
    <h3 style="color:#111827;font-size:16px;font-weight:700;margin:0 0 16px;text-align:center;padding-top:8px;">Featured Products</h3>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
    ${products.slice(0, 2).map(p => `
      <td width="48%" style="border-radius:16px;overflow:hidden;border:1px solid #F3F4F6;vertical-align:top;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        ${p.images?.[0]?.src
          ? `<img src="${p.images[0].src}" width="100%" style="height:170px;object-fit:cover;display:block;">`
          : `<div style="height:170px;background:${lightPrimary};text-align:center;line-height:170px;font-size:40px;">&#128717;</div>`
        }
        <div style="padding:14px;">
          <p style="color:#111827;font-weight:700;font-size:13px;margin:0 0 6px;line-height:1.3;">${p.title}</p>
          <p style="color:${primaryColor};font-weight:800;font-size:16px;margin:0 0 12px;">$${p.variants?.[0]?.price || '0.00'}</p>
          <a href="${website}" style="display:inline-block;background:${primaryColor};color:${textOnPrimary};padding:8px 20px;border-radius:20px;text-decoration:none;font-size:12px;font-weight:700;">Buy Now</a>
        </div>
      </td>
    `).join('<td width="4%"></td>')}
    </tr></table>
  </td></tr>`
}

function featuresSection(primaryColor: string) {
  const { lightPrimary } = getColors(primaryColor)
  return `<tr><td style="background:#F8F9FA;padding:28px 40px;border-top:1px solid #F3F4F6;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="33%" style="text-align:center;padding:0 8px;">
        <div style="width:44px;height:44px;background:${lightPrimary};border-radius:12px;margin:0 auto 8px;font-size:20px;line-height:44px;text-align:center;">&#128666;</div>
        <p style="color:#111827;font-size:12px;font-weight:700;margin:0 0 2px;">Free Shipping</p>
        <p style="color:#9CA3AF;font-size:11px;margin:0;">Orders over $50</p>
      </td>
      <td width="33%" style="text-align:center;padding:0 8px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
        <div style="width:44px;height:44px;background:${lightPrimary};border-radius:12px;margin:0 auto 8px;font-size:20px;line-height:44px;text-align:center;">&#8617;&#65039;</div>
        <p style="color:#111827;font-size:12px;font-weight:700;margin:0 0 2px;">Easy Returns</p>
        <p style="color:#9CA3AF;font-size:11px;margin:0;">30-day policy</p>
      </td>
      <td width="33%" style="text-align:center;padding:0 8px;">
        <div style="width:44px;height:44px;background:${lightPrimary};border-radius:12px;margin:0 auto 8px;font-size:20px;line-height:44px;text-align:center;">&#11088;</div>
        <p style="color:#111827;font-size:12px;font-weight:700;margin:0 0 2px;">Top Rated</p>
        <p style="color:#9CA3AF;font-size:11px;margin:0;">5-star reviews</p>
      </td>
    </tr></table>
  </td></tr>`
}

function urgencyBanner(message: string, primaryColor: string) {
  const { lightPrimary } = getColors(primaryColor)
  return `<div style="background:${lightPrimary};border-left:4px solid ${primaryColor};border-radius:8px;padding:14px 18px;margin:0 0 20px;">
    <p style="color:#111827;font-weight:700;margin:0;">&#9200; ${message}</p>
  </div>`
}

function wrap(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
${content}
</table></td></tr></table></body></html>`
}

// ─── WELCOME EMAILS ──────────────────────────────────────

export function generateWelcome1(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  return wrap(`
    ${header(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px 32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:14px;">&#127881;</div>
      <h1 style="color:#111827;font-size:28px;font-weight:900;margin:0 0 12px;line-height:1.2;">Welcome to ${storeName}!</h1>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 28px;">Thank you for joining our community! As a special welcome gift, enjoy 10% off your first order.</p>
      ${discountBox('WELCOME10', '10% off your entire first order', primaryColor)}
      ${ctaButton('Start Shopping', website, primaryColor)}
    </td></tr>
    ${productsSection(products, primaryColor, website)}
    ${featuresSection(primaryColor)}
    ${footer(storeName, website, primaryColor)}
  `)
}

export function generateWelcome2(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  return wrap(`
    ${header(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;">
      <h2 style="color:#111827;font-size:24px;font-weight:800;margin:0 0 12px;">Your discount expires in 48 hours!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 20px;">We noticed you have not used your welcome discount yet. Do not let it go to waste!</p>
      ${urgencyBanner('Expires in 48 hours — use code WELCOME10 for 10% off', primaryColor)}
    </td></tr>
    ${productsSection(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      ${ctaButton('Use My Discount Now', website, primaryColor)}
    </td></tr>
    ${footer(storeName, website, primaryColor)}
  `)
}

export function generateWelcome3(d: any) {
  const { storeName, logoUrl, primaryColor, website } = d
  const { textOnPrimary, lightPrimary } = getColors(primaryColor)
  return wrap(`
    ${header(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <div style="background:${lightPrimary};border-radius:16px;padding:32px;margin-bottom:24px;">
        <p style="color:${primaryColor};font-size:12px;font-weight:800;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">EXPIRES TODAY</p>
        <p style="color:#111827;font-size:40px;font-weight:900;margin:0 0 8px;">10% OFF</p>
        <div style="background:${primaryColor};color:${textOnPrimary};display:inline-block;padding:12px 28px;border-radius:8px;font-size:20px;font-weight:900;letter-spacing:3px;">WELCOME10</div>
      </div>
      <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">Final reminder from ${storeName}!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">This is our last email about your welcome discount. It expires at midnight tonight!</p>
      ${ctaButton('Claim My Discount NOW', website, primaryColor)}
    </td></tr>
    ${footer(storeName, website, primaryColor)}
  `)
}

// ─── BROWSE ABANDONMENT ──────────────────────────────────

export function generateBrowse1(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  const { lightPrimary } = getColors(primaryColor)
  return wrap(`
    ${header(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;">
      <h2 style="color:#111827;font-size:24px;font-weight:800;margin:0 0 12px;">Still thinking about it?</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 20px;">We noticed you were browsing ${storeName}. The items you viewed are still available — but they might not be for long!</p>
    </td></tr>
    ${productsSection(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;">
      <div style="background:${lightPrimary};border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
        <p style="color:#111827;font-weight:700;margin:0;">These items are selling fast — secure yours now!</p>
      </div>
      <div style="text-align:center;">${ctaButton('Continue Shopping', website, primaryColor)}</div>
    </td></tr>
    ${footer(storeName, website, primaryColor)}
  `)
}

export function generateBrowse2(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  return wrap(`
    ${header(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">We saved your picks — here is 10% off!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">Come back to ${storeName} and use this exclusive comeback discount!</p>
      ${discountBox('COMEBACK10', '10% off your next order — just for you', primaryColor)}
    </td></tr>
    ${productsSection(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      ${ctaButton('Shop With Discount', website, primaryColor)}
    </td></tr>
    ${footer(storeName, website, primaryColor)}
  `)
}

// ─── ABANDONED CHECKOUT ──────────────────────────────────

export function generateCheckout1(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  const { lightPrimary } = getColors(primaryColor)
  return wrap(`
    ${header(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;">
      <h2 style="color:#111827;font-size:24px;font-weight:800;margin:0 0 12px;">You left something at ${storeName}!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 20px;">Your cart is saved — complete your purchase before these items sell out!</p>
    </td></tr>
    ${productsSection(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;">
      <div style="background:${lightPrimary};border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
        <p style="color:#111827;font-weight:700;margin:0;">Items in your cart may sell out soon!</p>
      </div>
      <div style="text-align:center;">${ctaButton('Complete My Order', website, primaryColor)}</div>
    </td></tr>
    ${footer(storeName, website, primaryColor)}
  `)
}

export function generateCheckout2(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  return wrap(`
    ${header(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">Still deciding? Here is 10% off!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">Complete your ${storeName} purchase with this exclusive discount:</p>
      ${discountBox('SAVE10NOW', '10% off your abandoned cart — limited time', primaryColor)}
    </td></tr>
    ${productsSection(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      ${ctaButton('Complete Purchase &amp; Save', website, primaryColor)}
    </td></tr>
    ${footer(storeName, website, primaryColor)}
  `)
}

export function generateCheckout3(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  const { textOnPrimary, lightPrimary } = getColors(primaryColor)
  return wrap(`
    ${header(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <div style="background:${lightPrimary};border-radius:16px;padding:32px;margin-bottom:24px;">
        <p style="color:${primaryColor};font-size:12px;font-weight:800;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">Final Reminder</p>
        <p style="color:#111827;font-size:40px;font-weight:900;margin:0 0 8px;">15% OFF</p>
        <div style="background:${primaryColor};color:${textOnPrimary};display:inline-block;padding:12px 28px;border-radius:8px;font-size:18px;font-weight:900;letter-spacing:3px;">LASTCHANCE15</div>
        <p style="color:#6B7280;font-size:13px;margin:10px 0 0;">Valid 24 hours only</p>
      </div>
      <h2 style="color:#111827;font-size:20px;font-weight:800;margin:0 0 12px;">Last email about your ${storeName} cart!</h2>
      <p style="color:#6B7280;font-size:14px;margin:0 0 24px;">Use LASTCHANCE15 for 15% off — our biggest cart discount ever!</p>
    </td></tr>
    ${productsSection(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      ${ctaButton('Save 15% &amp; Complete Order', website, primaryColor)}
    </td></tr>
    ${footer(storeName, website, primaryColor)}
  `)
}

// ─── THANK YOU ───────────────────────────────────────────

export function generateThankYou1(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  const { lightPrimary } = getColors(primaryColor)
  return wrap(`
    ${header(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <div style="font-size:56px;margin-bottom:16px;">&#127882;</div>
      <h1 style="color:#111827;font-size:28px;font-weight:900;margin:0 0 12px;">Thank You for Your Order!</h1>
      <div style="background:${lightPrimary};border-radius:16px;padding:24px;margin-bottom:24px;">
        <p style="color:#111827;font-size:18px;font-weight:800;margin:0 0 8px;">Order Confirmed!</p>
        <p style="color:#6B7280;font-size:14px;margin:0;">Your order is being processed and will ship soon.</p>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr>
        <td width="48%" style="background:#F9FAFB;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:28px;">&#128230;</div>
          <p style="color:#111827;font-weight:700;font-size:13px;margin:8px 0 4px;">Processing</p>
          <p style="color:${primaryColor};font-size:12px;margin:0;font-weight:600;">In progress</p>
        </td>
        <td width="4%"></td>
        <td width="48%" style="background:#F9FAFB;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:28px;">&#128666;</div>
          <p style="color:#111827;font-weight:700;font-size:13px;margin:8px 0 4px;">Shipping Soon</p>
          <p style="color:#9CA3AF;font-size:12px;margin:0;font-weight:600;">Pending</p>
        </td>
      </tr></table>
    </td></tr>
    ${productsSection(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      ${ctaButton('Shop More Products', website, primaryColor)}
    </td></tr>
    ${footer(storeName, website, primaryColor)}
  `)
}

export function generateThankYou2(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  return wrap(`
    ${header(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">&#128157;</div>
      <h2 style="color:#111827;font-size:24px;font-weight:800;margin:0 0 12px;">Thank you for being our customer!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">As our appreciation for shopping at ${storeName}, enjoy 15% off your next purchase!</p>
      ${discountBox('THANKYOU15', '15% off your next order at ' + storeName, primaryColor)}
    </td></tr>
    ${productsSection(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      ${ctaButton('Shop Again &amp; Save 15%', website, primaryColor)}
    </td></tr>
    ${footer(storeName, website, primaryColor)}
  `)
}

// ─── WINBACK ─────────────────────────────────────────────

export function generateWinback1(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  const { textOnPrimary, lightPrimary } = getColors(primaryColor)
  return wrap(`
    ${header(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <div style="font-size:56px;margin-bottom:12px;">&#128546;</div>
      <h2 style="color:#111827;font-size:24px;font-weight:800;margin:0 0 12px;">We miss you at ${storeName}!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">It has been a while! Here is an exclusive 20% discount to welcome you back.</p>
      <div style="background:${lightPrimary};border:2px dashed ${primaryColor};border-radius:16px;padding:28px;margin-bottom:24px;">
        <p style="color:${primaryColor};font-size:11px;font-weight:800;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">We Miss You Gift</p>
        <p style="color:#111827;font-size:36px;font-weight:900;margin:0 0 8px;">20% OFF</p>
        <div style="background:${primaryColor};color:${textOnPrimary};display:inline-block;padding:12px 28px;border-radius:8px;font-size:18px;font-weight:900;letter-spacing:3px;">MISSYOU20</div>
      </div>
    </td></tr>
    ${productsSection(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      ${ctaButton('Come Back &amp; Save 20%', website, primaryColor)}
    </td></tr>
    ${footer(storeName, website, primaryColor)}
  `)
}

export function generateWinback2(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  return wrap(`
    ${header(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;">
      <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">Look what is new at ${storeName}!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 20px;">Since your last visit we have added amazing new products. Here is 15% off!</p>
    </td></tr>
    ${productsSection(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;">
      ${discountBox('WELCOME15', '15% off everything at ' + storeName, primaryColor)}
      <div style="text-align:center;">${ctaButton('Explore New Products', website, primaryColor)}</div>
    </td></tr>
    ${footer(storeName, website, primaryColor)}
  `)
}

export function generateWinback3(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  const { textOnPrimary, lightPrimary } = getColors(primaryColor)
  return wrap(`
    ${header(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">One final offer from ${storeName}</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">We do not want to lose you. Here is our absolute best offer — 25% off everything!</p>
      <div style="background:${lightPrimary};border-radius:16px;padding:32px;margin-bottom:24px;">
        <p style="color:${primaryColor};font-size:12px;font-weight:800;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">Our Best Offer Ever</p>
        <p style="color:#111827;font-size:48px;font-weight:900;margin:0 0 8px;">25% OFF</p>
        <div style="background:${primaryColor};color:${textOnPrimary};display:inline-block;padding:12px 32px;border-radius:8px;font-size:20px;font-weight:900;letter-spacing:3px;">COMEBACK25</div>
        <p style="color:#6B7280;font-size:13px;margin:12px 0 0;">Valid for 24 hours only</p>
      </div>
    </td></tr>
    ${productsSection(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      ${ctaButton('Claim 25% Off Now', website, primaryColor)}
    </td></tr>
    ${footer(storeName, website, primaryColor)}
  `)
}

// ─── BACKWARD COMPAT ─────────────────────────────────────
export function generateWelcomeEmail(data: any) { return generateWelcome1(data) }
export function generateAbandonedCheckoutEmail(data: any) { return generateCheckout1(data) }
