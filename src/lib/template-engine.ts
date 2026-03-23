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

// ─── SHARED HELPERS ──────────────────────────────────────

function getHeaderHtml(logoUrl: string, storeName: string, primaryColor: string) {
  const textOnPrimary = getContrastColor(primaryColor)
  const darkPrimary = darkenColor(primaryColor, 20)
  const logoDark = isDark(primaryColor)

  const logoHtml = logoUrl
    ? logoDark
      ? `<img src="${logoUrl}" alt="${storeName}" style="max-height:55px;max-width:180px;display:block;margin:0 auto;">`
      : `<div style="display:inline-block;background:rgba(255,255,255,0.95);padding:8px 16px;border-radius:10px;"><img src="${logoUrl}" alt="${storeName}" style="max-height:45px;max-width:160px;display:block;"></div>`
    : `<span style="color:${textOnPrimary};font-size:24px;font-weight:900;">${storeName}</span>`

  return `<tr><td style="background:linear-gradient(135deg,${primaryColor},${darkPrimary});padding:28px 40px;text-align:center;">${logoHtml}</td></tr>`
}

function getProductsHtml(products: any[], primaryColor: string, website: string, limit = 2) {
  if (!products || products.length === 0) return ''
  const textOnPrimary = getContrastColor(primaryColor)
  const lightPrimary = getAlphaColor(primaryColor, 0.08)

  return `<tr><td style="padding:0 40px 32px;">
    <h3 style="color:#111827;font-size:16px;font-weight:700;margin:0 0 16px;text-align:center;">Featured Products</h3>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
    ${products.slice(0, limit).map(p => `
      <td width="48%" style="border-radius:16px;overflow:hidden;border:2px solid #F3F4F6;vertical-align:top;text-align:center;">
        ${p.images?.[0]?.src
          ? `<img src="${p.images[0].src}" width="100%" style="height:160px;object-fit:cover;display:block;">`
          : `<div style="height:160px;background:${lightPrimary};text-align:center;line-height:160px;font-size:40px;">&#128717;</div>`
        }
        <div style="padding:12px;">
          <p style="color:#111827;font-weight:700;font-size:13px;margin:0 0 4px;">${p.title}</p>
          <p style="color:${primaryColor};font-weight:800;font-size:15px;margin:0 0 10px;">$${p.variants?.[0]?.price || '0.00'}</p>
          <a href="${website}" style="display:inline-block;background:${primaryColor};color:${textOnPrimary};padding:8px 20px;border-radius:20px;text-decoration:none;font-size:12px;font-weight:700;">Buy Now</a>
        </div>
      </td>
    `).join('<td width="4%"></td>')}
    </tr></table>
  </td></tr>`
}

function getFeaturesHtml(primaryColor: string) {
  const lp = getAlphaColor(primaryColor, 0.1)
  return `<tr><td style="background:#F8F9FA;padding:28px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="33%" style="text-align:center;padding:0 8px;">
        <div style="width:44px;height:44px;background:${lp};border-radius:10px;margin:0 auto 8px;font-size:20px;line-height:44px;">&#128666;</div>
        <p style="color:#111827;font-size:12px;font-weight:700;margin:0 0 2px;">Free Shipping</p>
        <p style="color:#9CA3AF;font-size:11px;margin:0;">Orders over $50</p>
      </td>
      <td width="33%" style="text-align:center;padding:0 8px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
        <div style="width:44px;height:44px;background:${lp};border-radius:10px;margin:0 auto 8px;font-size:20px;line-height:44px;">&#8617;&#65039;</div>
        <p style="color:#111827;font-size:12px;font-weight:700;margin:0 0 2px;">Easy Returns</p>
        <p style="color:#9CA3AF;font-size:11px;margin:0;">30-day policy</p>
      </td>
      <td width="33%" style="text-align:center;padding:0 8px;">
        <div style="width:44px;height:44px;background:${lp};border-radius:10px;margin:0 auto 8px;font-size:20px;line-height:44px;">&#11088;</div>
        <p style="color:#111827;font-size:12px;font-weight:700;margin:0 0 2px;">Top Rated</p>
        <p style="color:#9CA3AF;font-size:11px;margin:0;">5-star reviews</p>
      </td>
    </tr></table>
  </td></tr>`
}

function getFooterHtml(storeName: string, website: string) {
  return `<tr><td style="background:#111827;padding:28px 40px;text-align:center;">
    <p style="color:#fff;font-weight:700;font-size:15px;margin:0 0 6px;">${storeName}</p>
    <p style="color:#6B7280;font-size:12px;line-height:1.6;margin:0 0 12px;">You received this because you subscribed to our store updates.</p>
    <a href="#" style="color:#9CA3AF;font-size:12px;margin:0 8px;">Unsubscribe</a>
    <span style="color:#374151;">|</span>
    <a href="${website}" style="color:#9CA3AF;font-size:12px;margin:0 8px;">Visit Store</a>
  </td></tr>`
}

function wrapEmail(content: string) {
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
  const tp = getContrastColor(primaryColor)
  const lp = getAlphaColor(primaryColor, 0.08)

  return wrapEmail(`
    ${getHeaderHtml(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px 32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">&#127881;</div>
      <h1 style="color:#111827;font-size:28px;font-weight:900;margin:0 0 12px;">Welcome to ${storeName}!</h1>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 28px;">Thank you for joining us! As a special welcome gift, enjoy 10% off your first order!</p>
      <div style="background:${lp};border:2px dashed ${primaryColor};border-radius:16px;padding:24px;margin-bottom:28px;">
        <p style="color:${primaryColor};font-size:11px;font-weight:800;margin:0 0 10px;letter-spacing:3px;text-transform:uppercase;">Your Welcome Gift</p>
        <div style="background:${primaryColor};color:${tp};display:inline-block;padding:14px 36px;border-radius:10px;font-size:22px;font-weight:900;letter-spacing:4px;">WELCOME10</div>
        <p style="color:#6B7280;font-size:13px;margin:10px 0 0;">10% off your entire first order</p>
      </div>
      <a href="${website}" style="display:inline-block;background:${primaryColor};color:${tp};padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 8px 24px ${getAlphaColor(primaryColor, 0.3)};">Start Shopping</a>
    </td></tr>
    ${getProductsHtml(products, primaryColor, website)}
    ${getFeaturesHtml(primaryColor)}
    ${getFooterHtml(storeName, website)}
  `)
}

export function generateWelcome2(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  const tp = getContrastColor(primaryColor)

  return wrapEmail(`
    ${getHeaderHtml(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;">
      <h2 style="color:#111827;font-size:24px;font-weight:800;margin:0 0 12px;">Your discount is still waiting!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 20px;">We noticed you have not used your welcome discount yet. It expires in 48 hours!</p>
      <div style="background:#FFF7ED;border-left:4px solid #F59E0B;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="color:#92400E;font-weight:700;margin:0 0 4px;">Expires in 48 hours!</p>
        <p style="color:#78350F;font-size:13px;margin:0;">Use code <strong style="font-size:16px;letter-spacing:2px;">WELCOME10</strong> for 10% off at ${storeName}</p>
      </div>
    </td></tr>
    ${getProductsHtml(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      <a href="${website}" style="display:inline-block;background:${primaryColor};color:${tp};padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px ${getAlphaColor(primaryColor, 0.3)};">Use My Discount Now</a>
    </td></tr>
    ${getFooterHtml(storeName, website)}
  `)
}

export function generateWelcome3(d: any) {
  const { storeName, logoUrl, primaryColor, website } = d
  return wrapEmail(`
    ${getHeaderHtml(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <div style="background:#FEF2F2;border-radius:16px;padding:32px;margin-bottom:24px;">
        <p style="color:#DC2626;font-size:12px;font-weight:800;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">EXPIRES TODAY</p>
        <p style="color:#111827;font-size:40px;font-weight:900;margin:0 0 8px;">10% OFF</p>
        <div style="background:#DC2626;color:#fff;display:inline-block;padding:12px 28px;border-radius:8px;font-size:20px;font-weight:900;letter-spacing:3px;">WELCOME10</div>
      </div>
      <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">Final reminder from ${storeName}!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">Your welcome discount expires at midnight tonight!</p>
      <a href="${website}" style="display:inline-block;background:#DC2626;color:#fff;padding:18px 56px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 8px 24px rgba(220,38,38,0.3);">Claim My Discount NOW</a>
    </td></tr>
    ${getFooterHtml(storeName, website)}
  `)
}

// ─── BROWSE ABANDONMENT ──────────────────────────────────

export function generateBrowse1(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  const tp = getContrastColor(primaryColor)
  return wrapEmail(`
    ${getHeaderHtml(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;">
      <h2 style="color:#111827;font-size:24px;font-weight:800;margin:0 0 12px;">Still thinking about it?</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">We noticed you were browsing ${storeName}. The items you viewed are still available!</p>
    </td></tr>
    ${getProductsHtml(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;">
      <div style="background:#FFF7ED;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
        <p style="color:#92400E;font-weight:700;margin:0;">These items are selling fast!</p>
      </div>
      <div style="text-align:center;">
        <a href="${website}" style="display:inline-block;background:${primaryColor};color:${tp};padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px ${getAlphaColor(primaryColor, 0.3)};">Continue Shopping</a>
      </div>
    </td></tr>
    ${getFooterHtml(storeName, website)}
  `)
}

export function generateBrowse2(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  const tp = getContrastColor(primaryColor)
  const lp = getAlphaColor(primaryColor, 0.08)
  return wrapEmail(`
    ${getHeaderHtml(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">We saved your picks + 10% off!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">Come back to ${storeName} with this exclusive discount!</p>
      <div style="background:${lp};border:2px dashed ${primaryColor};border-radius:16px;padding:24px;margin-bottom:24px;">
        <p style="color:${primaryColor};font-size:11px;font-weight:800;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">Special Offer</p>
        <div style="background:${primaryColor};color:${tp};display:inline-block;padding:12px 32px;border-radius:8px;font-size:20px;font-weight:900;letter-spacing:3px;">COMEBACK10</div>
        <p style="color:#6B7280;font-size:13px;margin:10px 0 0;">10% off your next order</p>
      </div>
    </td></tr>
    ${getProductsHtml(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      <a href="${website}" style="display:inline-block;background:${primaryColor};color:${tp};padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px ${getAlphaColor(primaryColor, 0.3)};">Shop With Discount</a>
    </td></tr>
    ${getFooterHtml(storeName, website)}
  `)
}

// ─── ABANDONED CHECKOUT ──────────────────────────────────

export function generateCheckout1(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  return wrapEmail(`
    ${getHeaderHtml(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;">
      <h2 style="color:#111827;font-size:24px;font-weight:800;margin:0 0 12px;">You left something at ${storeName}!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 20px;">Your cart is saved and ready — complete your purchase before these items sell out!</p>
    </td></tr>
    ${getProductsHtml(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;">
      <div style="background:#FEF2F2;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
        <p style="color:#DC2626;font-weight:700;margin:0;">Items in your cart may sell out soon!</p>
      </div>
      <div style="text-align:center;">
        <a href="${website}" style="display:inline-block;background:#F59E0B;color:#fff;padding:18px 56px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 8px 24px rgba(245,158,11,0.3);">Complete My Order</a>
      </div>
    </td></tr>
    ${getFooterHtml(storeName, website)}
  `)
}

export function generateCheckout2(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  return wrapEmail(`
    ${getHeaderHtml(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">Still deciding? Here is 10% off!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">Complete your ${storeName} purchase with this exclusive discount:</p>
      <div style="background:#FEF2F2;border:2px dashed #EF4444;border-radius:16px;padding:24px;margin-bottom:24px;">
        <p style="color:#EF4444;font-size:11px;font-weight:800;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">Exclusive Offer</p>
        <div style="background:#EF4444;color:#fff;display:inline-block;padding:12px 32px;border-radius:8px;font-size:22px;font-weight:900;letter-spacing:3px;">SAVE10NOW</div>
        <p style="color:#6B7280;font-size:13px;margin:10px 0 0;">10% off your abandoned cart</p>
      </div>
    </td></tr>
    ${getProductsHtml(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      <a href="${website}" style="display:inline-block;background:#EF4444;color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px rgba(239,68,68,0.3);">Complete Purchase &amp; Save</a>
    </td></tr>
    ${getFooterHtml(storeName, website)}
  `)
}

export function generateCheckout3(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  return wrapEmail(`
    ${getHeaderHtml(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <div style="background:#FEF2F2;border-radius:16px;padding:32px;margin-bottom:24px;">
        <p style="color:#DC2626;font-size:12px;font-weight:800;margin:0 0 8px;letter-spacing:2px;">FINAL REMINDER</p>
        <p style="color:#111827;font-size:40px;font-weight:900;margin:0 0 8px;">15% OFF</p>
        <div style="background:#DC2626;color:#fff;display:inline-block;padding:10px 28px;border-radius:8px;font-size:18px;font-weight:900;letter-spacing:3px;">LASTCHANCE15</div>
        <p style="color:#6B7280;font-size:13px;margin:10px 0 0;">Valid 24 hours only</p>
      </div>
      <h2 style="color:#111827;font-size:20px;font-weight:800;margin:0 0 12px;">Last email about your ${storeName} cart!</h2>
      <p style="color:#6B7280;font-size:14px;margin:0 0 24px;">Use LASTCHANCE15 for 15% off and complete your order now!</p>
    </td></tr>
    ${getProductsHtml(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      <a href="${website}" style="display:inline-block;background:#111827;color:#fff;padding:18px 56px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;">Save 15% &amp; Complete Order</a>
    </td></tr>
    ${getFooterHtml(storeName, website)}
  `)
}

// ─── THANK YOU ───────────────────────────────────────────

export function generateThankYou1(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  return wrapEmail(`
    ${getHeaderHtml(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <div style="font-size:56px;margin-bottom:16px;">&#127882;</div>
      <h1 style="color:#111827;font-size:28px;font-weight:900;margin:0 0 12px;">Thank You for Your Order!</h1>
      <div style="background:#F0FDF4;border-radius:16px;padding:24px;margin-bottom:28px;">
        <div style="font-size:40px;margin-bottom:8px;">&#9989;</div>
        <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">Order Confirmed!</h2>
        <p style="color:#6B7280;font-size:14px;margin:0;">Your order is being processed and will ship soon.</p>
      </div>
      <p style="color:#6B7280;font-size:14px;margin:0 0 20px;">We will send tracking info once your order from ${storeName} ships!</p>
    </td></tr>
    ${getProductsHtml(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      <a href="${website}" style="display:inline-block;background:#10B981;color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px rgba(16,185,129,0.3);">Shop More Products</a>
    </td></tr>
    ${getFooterHtml(storeName, website)}
  `)
}

export function generateThankYou2(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  return wrapEmail(`
    ${getHeaderHtml(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">&#128154;</div>
      <h2 style="color:#111827;font-size:24px;font-weight:800;margin:0 0 12px;">We love you! Here is 15% off</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">Thank you for shopping at ${storeName}! Enjoy 15% off your next purchase.</p>
      <div style="background:#F0FDF4;border:2px dashed #10B981;border-radius:16px;padding:24px;margin-bottom:24px;">
        <p style="color:#10B981;font-size:11px;font-weight:800;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">Thank You Gift</p>
        <div style="background:#10B981;color:#fff;display:inline-block;padding:12px 32px;border-radius:8px;font-size:22px;font-weight:900;letter-spacing:3px;">THANKYOU15</div>
        <p style="color:#6B7280;font-size:13px;margin:10px 0 0;">15% off your next order</p>
      </div>
    </td></tr>
    ${getProductsHtml(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      <a href="${website}" style="display:inline-block;background:#10B981;color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px rgba(16,185,129,0.3);">Shop Again &amp; Save 15%</a>
    </td></tr>
    ${getFooterHtml(storeName, website)}
  `)
}

// ─── WINBACK ─────────────────────────────────────────────

export function generateWinback1(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  const tp = getContrastColor(primaryColor)
  const lp = getAlphaColor(primaryColor, 0.08)
  return wrapEmail(`
    ${getHeaderHtml(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <div style="font-size:56px;margin-bottom:12px;">&#128546;</div>
      <h2 style="color:#111827;font-size:24px;font-weight:800;margin:0 0 12px;">We miss you at ${storeName}!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">It has been a while! Here is an exclusive 20% discount to welcome you back.</p>
      <div style="background:${lp};border:2px dashed ${primaryColor};border-radius:16px;padding:28px;margin-bottom:24px;">
        <p style="color:${primaryColor};font-size:11px;font-weight:800;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase;">We Miss You Gift</p>
        <p style="color:#111827;font-size:36px;font-weight:900;margin:0 0 8px;">20% OFF</p>
        <div style="background:${primaryColor};color:${tp};display:inline-block;padding:12px 28px;border-radius:8px;font-size:18px;font-weight:900;letter-spacing:3px;">MISSYOU20</div>
      </div>
    </td></tr>
    ${getProductsHtml(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      <a href="${website}" style="display:inline-block;background:${primaryColor};color:${tp};padding:18px 56px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 8px 24px ${getAlphaColor(primaryColor, 0.3)};">Come Back &amp; Save 20%</a>
    </td></tr>
    ${getFooterHtml(storeName, website)}
  `)
}

export function generateWinback2(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  const tp = getContrastColor(primaryColor)
  const lp = getAlphaColor(primaryColor, 0.08)
  return wrapEmail(`
    ${getHeaderHtml(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;">
      <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">Look what is new at ${storeName}!</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">Since your last visit we added amazing new products. Here is 15% off!</p>
    </td></tr>
    ${getProductsHtml(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;">
      <div style="background:${lp};border:2px dashed ${primaryColor};border-radius:16px;padding:20px;margin-bottom:24px;text-align:center;">
        <div style="background:${primaryColor};color:${tp};display:inline-block;padding:10px 28px;border-radius:8px;font-size:18px;font-weight:900;letter-spacing:3px;">WELCOME15</div>
        <p style="color:#6B7280;font-size:13px;margin:8px 0 0;">15% off everything</p>
      </div>
      <div style="text-align:center;">
        <a href="${website}" style="display:inline-block;background:${primaryColor};color:${tp};padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;box-shadow:0 8px 24px ${getAlphaColor(primaryColor, 0.3)};">Explore New Products</a>
      </div>
    </td></tr>
    ${getFooterHtml(storeName, website)}
  `)
}

export function generateWinback3(d: any) {
  const { storeName, logoUrl, primaryColor, website, products } = d
  return wrapEmail(`
    ${getHeaderHtml(logoUrl, storeName, primaryColor)}
    <tr><td style="padding:40px 48px;text-align:center;">
      <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;">One final offer from ${storeName}</h2>
      <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px;">We do not want to lose you. Here is our best offer ever — 25% off!</p>
      <div style="background:linear-gradient(135deg,#111827,#374151);border-radius:16px;padding:32px;margin-bottom:24px;">
        <p style="color:#9CA3AF;font-size:11px;font-weight:800;margin:0 0 8px;letter-spacing:2px;">OUR BEST OFFER EVER</p>
        <p style="color:#fff;font-size:48px;font-weight:900;margin:0 0 8px;">25% OFF</p>
        <div style="background:#fff;color:#111827;display:inline-block;padding:12px 32px;border-radius:8px;font-size:20px;font-weight:900;letter-spacing:3px;">COMEBACK25</div>
        <p style="color:#9CA3AF;font-size:13px;margin:12px 0 0;">Valid for 24 hours only</p>
      </div>
    </td></tr>
    ${getProductsHtml(products, primaryColor, website)}
    <tr><td style="padding:0 48px 32px;text-align:center;">
      <a href="${website}" style="display:inline-block;background:#111827;color:#fff;padding:18px 56px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 8px 24px rgba(0,0,0,0.3);">Claim 25% Off Now</a>
    </td></tr>
    ${getFooterHtml(storeName, website)}
  `)
}

// ─── BACKWARD COMPAT ─────────────────────────────────────
export function generateWelcomeEmail(data: any) { return generateWelcome1(data) }
export function generateAbandonedCheckoutEmail(data: any) { return generateCheckout1(data) }
