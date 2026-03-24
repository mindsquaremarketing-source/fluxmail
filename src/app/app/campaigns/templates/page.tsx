'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [generating, setGenerating] = useState<string | null>(null)

  useEffect(() => { fetchTemplates() }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns/templates')
      const data = await res.json()
      setTemplates(data.templates || [])
      setStore(data.store)
      setProducts(data.products || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleUseTemplate = async (template: any) => {
    setGenerating(template.id)
    try {
      const res = await fetch('/api/ai/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${template.headline}. ${template.bodyText}`,
          discountCode: template.discountCode,
          discountValue: template.discountValue,
        })
      })
      const data = await res.json()
      if (data.campaign?.id) {
        router.push('/app/campaigns')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(null)
    }
  }

  const categoryColors: Record<string, string> = {
    sale: 'bg-red-100 text-red-700',
    new_arrival: 'bg-blue-100 text-blue-700',
    seasonal: 'bg-orange-100 text-orange-700',
    winback: 'bg-purple-100 text-purple-700',
    loyalty: 'bg-green-100 text-green-700',
    announcement: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/app/campaigns/create">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Choose a Template</h1>
              <p className="text-sm text-gray-500 mt-0.5">AI-generated templates based on your brand and products</p>
            </div>
          </div>
          <button onClick={fetchTemplates} disabled={loading}
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
              <p className="text-sm text-gray-500">Templates generated using your brand colors and {products.length} products</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ background: store.primaryColor }} />
              <span className="text-sm text-gray-500 font-mono">{store.primaryColor}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-8 bg-gray-100 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">&#129302;</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to generate templates</h3>
            <p className="text-gray-500 mb-6">Make sure your AI API key is set correctly</p>
            <button onClick={fetchTemplates} className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800">Try Again</button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                <div className="relative h-52 flex flex-col items-center justify-center p-6 text-center"
                  style={{ background: `linear-gradient(135deg, ${store?.primaryColor || '#1E40AF'}, ${store?.primaryColor || '#1E40AF'}dd)` }}>
                  {template.badge && (
                    <div className="absolute top-3 right-3 bg-white bg-opacity-20 text-white text-xs font-bold px-2.5 py-1 rounded-full">{template.badge}</div>
                  )}
                  {store?.logoUrl ? (
                    <img src={store.logoUrl} alt={store.name} className="h-8 w-auto object-contain mb-3 brightness-0 invert opacity-90" />
                  ) : (
                    <p className="text-white font-bold text-sm mb-3 opacity-90">{store?.name}</p>
                  )}
                  <div className="text-4xl mb-2">{template.emoji}</div>
                  <h3 className="text-white font-bold text-lg leading-tight">{template.headline}</h3>
                  {template.discountCode && (
                    <div className="mt-3 bg-white bg-opacity-20 rounded-lg px-3 py-1.5">
                      <span className="text-white font-mono font-bold text-sm tracking-widest">{template.discountCode}</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{template.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${categoryColors[template.category] || 'bg-gray-100 text-gray-600'}`}>
                      {(template.category || '').replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                  <p className="text-xs text-gray-400 mb-4 italic">&quot;{template.subject}&quot;</p>
                  <button onClick={() => handleUseTemplate(template)} disabled={generating === template.id}
                    className="w-full py-2.5 text-sm font-semibold rounded-xl transition-all bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">
                    {generating === template.id ? (
                      <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Generating...</>
                    ) : 'Use This Template'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
