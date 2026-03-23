export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'

export default async function VerifyBrand() {
  const store = await prisma.store.findFirst({
    orderBy: { createdAt: 'desc' }
  })

  if (!store) return <div style={{padding:'40px',color:'#666'}}>No store found</div>

  let products: any[] = []
  try {
    const res = await fetch(
      `https://${store.shopDomain}/admin/api/2024-01/products.json?limit=4&fields=id,title,images,variants`,
      { headers: { 'X-Shopify-Access-Token': store.accessToken } }
    )
    const data = await res.json()
    products = data.products || []
  } catch (e) {
    console.error('Products error:', e)
  }

  const primaryColor = store.primaryColor || '#1E40AF'
  const storeName = store.companyName || store.senderName || 'Your Store'
  const logoUrl = store.logoUrl || ''

  return (
    <div style={{padding:'24px',fontFamily:'Arial',background:'#f9fafb',minHeight:'100vh'}}>
      <h1 style={{fontSize:'22px',fontWeight:'900',marginBottom:'24px',color:'#111827'}}>
        Brand Verification
      </h1>

      {/* Status Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'32px'}}>

        <div style={{background:'#fff',borderRadius:'12px',padding:'16px',border:'1px solid #E5E7EB'}}>
          <p style={{fontSize:'12px',color:'#6B7280',margin:'0 0 8px',textTransform:'uppercase'}}>Logo</p>
          {logoUrl ? (
            <div>
              <img src={logoUrl} style={{maxHeight:'40px',maxWidth:'120px',objectFit:'contain'}} alt="logo"/>
              <p style={{color:'#10B981',fontSize:'12px',fontWeight:'700',margin:'8px 0 0'}}>Uploaded</p>
            </div>
          ) : (
            <p style={{color:'#EF4444',fontSize:'13px',fontWeight:'700',margin:'0'}}>No logo yet</p>
          )}
        </div>

        <div style={{background:'#fff',borderRadius:'12px',padding:'16px',border:'1px solid #E5E7EB'}}>
          <p style={{fontSize:'12px',color:'#6B7280',margin:'0 0 8px',textTransform:'uppercase'}}>Brand Color</p>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'32px',height:'32px',background:primaryColor,borderRadius:'8px',border:'1px solid #E5E7EB'}}/>
            <div>
              <p style={{color:'#111827',fontSize:'13px',fontWeight:'700',margin:'0'}}>{primaryColor}</p>
              <p style={{color:'#10B981',fontSize:'11px',margin:'2px 0 0'}}>Set</p>
            </div>
          </div>
        </div>

        <div style={{background:'#fff',borderRadius:'12px',padding:'16px',border:'1px solid #E5E7EB'}}>
          <p style={{fontSize:'12px',color:'#6B7280',margin:'0 0 8px',textTransform:'uppercase'}}>Store Name</p>
          <p style={{color:'#111827',fontSize:'13px',fontWeight:'700',margin:'0'}}>{storeName}</p>
          <p style={{color:'#10B981',fontSize:'11px',margin:'4px 0 0'}}>Set</p>
        </div>

        <div style={{background:'#fff',borderRadius:'12px',padding:'16px',border:'1px solid #E5E7EB'}}>
          <p style={{fontSize:'12px',color:'#6B7280',margin:'0 0 8px',textTransform:'uppercase'}}>Products</p>
          <p style={{color:'#111827',fontSize:'22px',fontWeight:'900',margin:'0'}}>{products.length}</p>
          <p style={{color:products.length > 0 ? '#10B981' : '#EF4444',fontSize:'11px',margin:'2px 0 0'}}>
            {products.length > 0 ? 'From Shopify' : 'None found'}
          </p>
        </div>
      </div>

      {/* Products */}
      {products.length > 0 && (
        <div style={{background:'#fff',borderRadius:'16px',padding:'24px',marginBottom:'32px',border:'1px solid #E5E7EB'}}>
          <h2 style={{fontSize:'16px',fontWeight:'700',margin:'0 0 16px',color:'#111827'}}>
            Your Shopify Products ({products.length})
          </h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
            {products.map((p: any) => (
              <div key={p.id} style={{border:'1px solid #E5E7EB',borderRadius:'12px',overflow:'hidden'}}>
                {p.images?.[0]?.src
                  ? <img src={p.images[0].src} style={{width:'100%',height:'120px',objectFit:'cover'}} alt={p.title}/>
                  : <div style={{height:'120px',background:'#F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'32px'}}>&#128230;</div>
                }
                <div style={{padding:'10px'}}>
                  <p style={{fontSize:'12px',fontWeight:'700',color:'#111827',margin:'0 0 2px'}}>{p.title}</p>
                  <p style={{fontSize:'12px',color:primaryColor,fontWeight:'700',margin:'0'}}>${p.variants?.[0]?.price || '0.00'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Email Preview */}
      <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #E5E7EB',overflow:'hidden'}}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h2 style={{fontSize:'16px',fontWeight:'700',margin:'0',color:'#111827'}}>
            Live Email Preview — Using YOUR real brand data
          </h2>
          <span style={{background:'#DCFCE7',color:'#16A34A',padding:'4px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:'700'}}>
            Live
          </span>
        </div>
        <div style={{padding:'24px',background:'#F9FAFB'}}>
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f4f4f4;font-family:Arial">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
<tr><td style="background:${primaryColor};padding:28px 40px;text-align:center">
${logoUrl ? `<img src="${logoUrl}" style="max-height:60px;max-width:200px;display:block;margin:0 auto" alt="${storeName}">` : `<span style="color:#fff;font-size:24px;font-weight:900">${storeName}</span>`}
</td></tr>
<tr><td style="padding:40px;text-align:center">
<h1 style="color:#111827;font-size:26px;font-weight:900;margin:0 0 12px">Welcome to ${storeName}!</h1>
<p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px">Thank you for joining us! Here is your exclusive welcome gift.</p>
<div style="background:#EFF6FF;border:2px dashed ${primaryColor};border-radius:16px;padding:24px;margin-bottom:24px">
<p style="color:${primaryColor};font-size:12px;font-weight:700;margin:0 0 8px;letter-spacing:2px">YOUR WELCOME GIFT</p>
<div style="background:${primaryColor};color:#fff;display:inline-block;padding:12px 32px;border-radius:8px;font-size:22px;font-weight:900;letter-spacing:3px">WELCOME10</div>
<p style="color:#6B7280;font-size:13px;margin:10px 0 0">10% off your first order</p>
</div>
<a href="${store.website || '#'}" style="display:inline-block;background:${primaryColor};color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px">Shop Now</a>
</td></tr>
${products.length > 0 ? `
<tr><td style="padding:0 40px 32px">
<h3 style="color:#111827;font-size:16px;font-weight:700;margin:0 0 16px;text-align:center">Our Products</h3>
<table width="100%" cellpadding="0" cellspacing="0"><tr>
${products.slice(0, 2).map((p: any) => `<td width="48%" style="background:#F9FAFB;border-radius:12px;overflow:hidden;text-align:center;vertical-align:top">
${p.images?.[0]?.src ? `<img src="${p.images[0].src}" width="100%" style="height:160px;object-fit:cover;display:block">` : '<div style="height:160px;background:#E5E7EB;font-size:40px;text-align:center;line-height:160px">&#128230;</div>'}
<div style="padding:12px"><p style="color:#111827;font-weight:700;font-size:13px;margin:0 0 4px">${p.title}</p>
<p style="color:${primaryColor};font-weight:700;font-size:14px;margin:0">$${p.variants?.[0]?.price || '0.00'}</p></div>
</td>`).join('<td width="4%"></td>')}
</tr></table></td></tr>` : ''}
<tr><td style="background:#111827;padding:24px;text-align:center">
<p style="color:#fff;font-weight:700;margin:0 0 8px">${storeName}</p>
<a href="#" style="color:#9CA3AF;font-size:12px">Unsubscribe</a>
</td></tr>
</table></td></tr></table></body></html>`}
            style={{width:'100%',height:'700px',border:'none',borderRadius:'12px'}}
            title="Live Preview"
          />
        </div>
      </div>
    </div>
  )
}
