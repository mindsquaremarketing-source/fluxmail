'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateCampaignPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [productId, setProductId] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [step, setStep] = useState<'choose' | 'ai'>('choose')

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || [])
        if (data.products?.[0]) setProductId(data.products[0].id.toString())
      })
      .catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, productId })
      })
      const data = await res.json()
      if (data.campaignId) {
        router.push('/app/campaigns')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  if (step === 'ai') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <button onClick={() => setStep('choose')} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Generate with AI</h2>
          <p className="text-gray-500 text-sm mb-6">Describe your campaign and AI will create a beautiful branded email</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Select Product</label>
              <select value={productId} onChange={e => setProductId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">No specific product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id.toString()}>{p.title} — ${p.variants?.[0]?.price}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Campaign Description</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. Winter sale with 20% off snowboards, targeting customers who love outdoor sports..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32" />
            </div>

            <button onClick={handleGenerate} disabled={generating || !prompt.trim()}
              className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">
              {generating ? (
                <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Generating...</>
              ) : 'Generate Campaign'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/app/campaigns">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
      </div>

      <div className="space-y-4">
        <Link href="/app/campaigns/templates">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1E40AF,#3B82F6)' }}>&#10024;</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">Start with Template</h3>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">Recommended</span>
                </div>
                <p className="text-sm text-gray-500">AI-generated templates using your brand, colors and real products</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </Link>

        <div onClick={() => setStep('ai')} className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'linear-gradient(135deg,#374151,#111827)' }}>&#129302;</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Generate with AI</h3>
              <p className="text-sm text-gray-500">Describe your campaign and AI creates a custom email from scratch</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>
      </div>
    </div>
  )
}
