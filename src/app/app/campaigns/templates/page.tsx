'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Fix 4: Lazy load the modal so it doesn't block initial page render
const TemplatePreviewModal = dynamic(() => import('@/components/TemplatePreviewModal'), { ssr: false })

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

function getCacheKey(storeId: string) {
  return `fluxmail_templates_${storeId}`
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)
  const [templatePreviews, setTemplatePreviews] = useState<Record<string, string>>({})

  // Fix 5: Preload product images into browser cache
  useEffect(() => {
    if (products.length === 0) return
    products.forEach((p: any) => {
      const src = p.images?.[0]?.src
      if (src) {
        const img = new Image()
        img.src = src
      }
    })
  }, [products])

  // Also preload store logo
  useEffect(() => {
    if (store?.logoUrl) {
      const img = new Image()
      img.src = store.logoUrl
    }
  }, [store])

  useEffect(() => { loadTemplates() }, [])

  // Fix 1: Load from per-store localStorage cache or generate fresh
  const loadTemplates = async () => {
    setLoading(true)
    try {
      // Check if we have a last known storeId to look up cache
      const lastStoreId = localStorage.getItem('fluxmail_last_store_id')
      if (lastStoreId) {
        const cached = localStorage.getItem(getCacheKey(lastStoreId))
        if (cached) {
          const { templates: ct, store: cs, products: cp, previews: cpv, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < CACHE_TTL && ct?.length > 0) {
            setTemplates(ct)
            setStore(cs)
            setProducts(cp || [])
            setTemplatePreviews(cpv || {})
            setLoading(false)
            return
          }
        }
      }
    } catch {}
    await generateFresh()
  }

  // Fix 2: Fetch templates from AI API and pre-generate all previews immediately
  const generateFresh = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns/templates')
      const data = await res.json()
      const tpls = data.templates || []
      setTemplates(tpls)
      setStore(data.store)
      setProducts(data.products || [])

      // Save storeId for cache key lookup on next load
      const storeId = data.store?.id
      if (storeId) {
        try { localStorage.setItem('fluxmail_last_store_id', storeId) } catch {}
      }

      // Pre-generate all 6 previews in parallel
      const previews: Record<string, string> = {}
      await Promise.all(tpls.map(async (t: any) => {
        try {
          const r = await fetch('/api/ai/generate-campaign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `${t.description}. Headline: ${t.headline}. Body: ${t.bodyText}. CTA: ${t.ctaText}.`,
              discountCode: t.discountCode || '',
              discountValue: t.discountValue || '',
              templateName: t.name,
              previewOnly: true,
            })
          })
          const d = await r.json()
          if (d.html) previews[t.id] = d.html
        } catch {}
      }))

      setTemplatePreviews(previews)

      // Cache everything with per-store key
      if (storeId) {
        try {
          localStorage.setItem(getCacheKey(storeId), JSON.stringify({
            templates: tpls,
            store: data.store,
            products: data.products || [],
            previews,
            timestamp: Date.now(),
          }))
        } catch {}
      }
    } catch {}
    finally { setLoading(false) }
  }

  // Regenerate button — clear cache and start fresh
  const handleRegenerate = () => {
    const storeId = store?.id
    if (storeId) {
      try { localStorage.removeItem(getCacheKey(storeId)) } catch {}
    }
    setTemplatePreviews({})
    generateFresh()
  }

  // Fix 2: Open modal instantly with pre-loaded preview from previewHtmlMap
  const handleSelectTemplate = (template: any) => {
    setPreviewTemplate(template)
  }

  const handleSave = async (name: string, subject: string, html: string) => {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, htmlContent: html, status: 'draft' })
      })
      const data = await res.json()
      if (data.campaign?.id || data.success) router.push('/app/campaigns')
    } catch {}
  }

  const handleSendNow = async (name: string, subject: string, html: string) => {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, htmlContent: html, status: 'draft' })
      })
      const data = await res.json()
      const id = data.campaign?.id
      if (id) {
        const sendRes = await fetch(`/api/campaigns/${id}/send`, { method: 'POST' })
        const sendData = await sendRes.json()
        if (sendRes.ok) {
          alert(`Sent to ${sendData.sent} contacts!`)
          router.push('/app/campaigns')
        } else {
          alert('Error: ' + (sendData.error || 'Send failed'))
        }
      }
    } catch {}
  }

  const cc: Record<string, string> = {
    sale: 'bg-red-100 text-red-700', new_arrival: 'bg-blue-100 text-blue-700',
    seasonal: 'bg-orange-100 text-orange-700', winback: 'bg-purple-100 text-purple-700',
    loyalty: 'bg-green-100 text-green-700', announcement: 'bg-yellow-100 text-yellow-700',
    flash_sale: 'bg-red-100 text-red-700', product_launch: 'bg-blue-100 text-blue-700',
    holiday: 'bg-orange-100 text-orange-700', reengagement: 'bg-purple-100 text-purple-700',
    vip: 'bg-green-100 text-green-700', story: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/app/campaigns/create">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Choose a Template</h1>
              <p className="text-sm text-gray-500">AI-generated using your brand &amp; products</p>
            </div>
          </div>
          <button onClick={handleRegenerate} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50">
            {loading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            )}
            Regenerate
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {store && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4">
            {store.logoUrl && <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />}
            <div>
              <p className="font-semibold text-gray-900">{store.name}</p>
              <p className="text-sm text-gray-500">{products.length} products available</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-white shadow" style={{ background: store.primaryColor }} />
              <span className="text-sm font-mono text-gray-500">{store.primaryColor}</span>
            </div>
          </div>
        )}

        {/* Fix 3: Skeleton loading cards on first load */}
        {loading ? (
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-100" /><div className="p-5 space-y-3"><div className="h-4 bg-gray-100 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded" /><div className="h-8 bg-gray-100 rounded mt-2" /></div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">&#129302;</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No templates generated</h3>
            <button onClick={handleRegenerate} className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800">Try Again</button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {templates.map(t => (
              <div key={t.id} onClick={() => handleSelectTemplate(t)}
                className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all group cursor-pointer">
                <div className="relative h-48 flex flex-col items-center justify-center p-6 text-center"
                  style={{ background: `linear-gradient(135deg, ${store?.primaryColor || '#1E40AF'}, ${store?.primaryColor || '#1E40AF'}cc)` }}>
                  {t.badge && <span className="absolute top-3 right-3 bg-white bg-opacity-25 text-white text-xs font-bold px-2.5 py-1 rounded-full">{t.badge}</span>}
                  <div className="text-3xl mb-2">{t.emoji}</div>
                  <h3 className="text-white font-bold text-base leading-tight mb-2">{t.headline}</h3>
                  {t.discountCode && <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1"><span className="text-white font-mono font-bold text-sm tracking-widest">{t.discountCode}</span></div>}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 text-sm font-bold px-4 py-2 rounded-full transition-all transform scale-90 group-hover:scale-100">Preview &amp; Edit</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{t.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${cc[t.category] || 'bg-gray-100 text-gray-600'}`}>{(t.category || '').replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{t.description}</p>
                  <p className="text-xs text-gray-400 italic truncate">&quot;{t.subject}&quot;</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fix 4: Lazy-loaded preview modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          store={store}
          initialHtml={templatePreviews[previewTemplate.id] || ''}
          initialLoading={!templatePreviews[previewTemplate.id]}
          products={products}
          onClose={() => setPreviewTemplate(null)}
          onSave={handleSave}
          onSendNow={handleSendNow}
        />
      )}
    </div>
  )
}
