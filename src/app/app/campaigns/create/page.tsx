'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Method = 'ai' | 'template' | null
type FeatureType = 'product' | 'collection' | 'all'
type DiscountMethod = 'code' | 'none'

interface GeneratedCampaign {
  id: string
  subject: string
  previewText: string
  htmlBody: string
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [step, setStep] = useState(1)
  const [method, setMethod] = useState<Method>(null)
  const [prompt, setPrompt] = useState('')
  const [featureType, setFeatureType] = useState<FeatureType>('product')
  const [featuredProduct, setFeaturedProduct] = useState('')
  const [discountMethod, setDiscountMethod] = useState<DiscountMethod>('code')
  const [discountCode, setDiscountCode] = useState('')
  const [discountValue, setDiscountValue] = useState('10')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [hasEndDate, setHasEndDate] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<GeneratedCampaign | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'FW-'
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setDiscountCode(code)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe your campaign')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          discountCode: discountMethod === 'code' ? discountCode : undefined,
          discountValue: discountMethod === 'code' ? discountValue : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setGenerated(data.campaign)
      setStep(3)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleBack = () => {
    if (step === 3) {
      setGenerated(null)
      setStep(2)
    } else if (step === 2) {
      setStep(1)
    } else {
      router.push('/app/campaigns')
    }
  }

  const stepCount = generated ? 3 : 2

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {step === 3 ? 'Campaign Preview' : 'Create Campaign'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].slice(0, stepCount).map((s) => (
            <span key={s} className={`w-2.5 h-2.5 rounded-full ${step >= s ? 'bg-purple-600' : 'bg-gray-300'}`}></span>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Step 1 - Choose Method */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">How do you want to create your campaign?</h2>
            <p className="text-sm text-gray-500 text-center mb-8">Choose a method to get started</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setMethod('ai')}
                className={`flex flex-col items-center gap-3 p-8 rounded-xl border-2 transition-all ${
                  method === 'ai' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method === 'ai' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={method === 'ai' ? '#7c3aed' : '#6b7280'}>
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${method === 'ai' ? 'text-purple-700' : 'text-gray-700'}`}>Generate with AI</span>
                <span className="text-xs text-gray-400">Let AI create your campaign</span>
              </button>

              <button
                onClick={() => setMethod('template')}
                className={`flex flex-col items-center gap-3 p-8 rounded-xl border-2 transition-all ${
                  method === 'template' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method === 'template' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={method === 'template' ? '#7c3aed' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${method === 'template' ? 'text-purple-700' : 'text-gray-700'}`}>Start from template</span>
                <span className="text-xs text-gray-400">Choose from pre-built designs</span>
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => method && setStep(2)}
                disabled={!method}
                className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  method ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2 - AI Campaign Form */}
        {step === 2 && method === 'ai' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate Campaign with AI</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tell Fluxmail AI more info about this campaign</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: a campaign to promote our new collection with a 15% discount for loyal customers"
                rows={4}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">What should the campaign feature?</label>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {(['product', 'collection', 'all'] as FeatureType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFeatureType(type)}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                      featureType === type ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {type === 'product' ? 'Product' : type === 'collection' ? 'Collection' : 'All Products'}
                  </button>
                ))}
              </div>
            </div>

            {featureType !== 'all' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured {featureType === 'product' ? 'Product' : 'Collection'}
                </label>
                <select
                  value={featuredProduct}
                  onChange={(e) => setFeaturedProduct(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a {featureType}...</option>
                  <option value="sample-1">Sample {featureType === 'product' ? 'Product' : 'Collection'} 1</option>
                  <option value="sample-2">Sample {featureType === 'product' ? 'Product' : 'Collection'} 2</option>
                </select>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Campaign Discount</h3>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Method</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
                  <button onClick={() => setDiscountMethod('code')} className={`px-4 py-2 text-sm font-medium transition-colors ${discountMethod === 'code' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Discount Code</button>
                  <button onClick={() => setDiscountMethod('none')} className={`px-4 py-2 text-sm font-medium transition-colors ${discountMethod === 'none' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>No Discount</button>
                </div>
              </div>

              {discountMethod === 'code' && (
                <>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Discount Code</label>
                    <div className="flex items-center gap-3">
                      <input type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} placeholder="e.g. SAVE10" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                      <button onClick={generateRandomCode} className="text-sm text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap">Generate random code</button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Discount Value</label>
                    <div className="relative w-32">
                      <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-8" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Discount Active Dates</label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start time</label>
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={hasEndDate} onChange={(e) => setHasEndDate(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-sm text-gray-700">Set end date</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">Discard</button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  generating ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {generating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 - Template (placeholder) */}
        {step === 2 && method === 'template' && (
          <div className="text-center py-16">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Templates Coming Soon</h3>
            <p className="text-sm text-gray-400 mb-6">Pre-built email templates will be available shortly.</p>
            <button onClick={() => setStep(1)} className="px-6 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Go Back</button>
          </div>
        )}

        {/* Step 3 - Preview Generated Campaign */}
        {step === 3 && generated && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Campaign Preview</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Draft
              </span>
            </div>

            {/* Email Meta */}
            <div className="bg-white rounded-xl border border-gray-200 mb-6">
              <div className="divide-y divide-gray-100">
                <div className="flex px-5 py-3">
                  <span className="text-sm text-gray-500 w-28">Subject</span>
                  <span className="text-sm text-gray-900 font-medium">{generated.subject}</span>
                </div>
                <div className="flex px-5 py-3">
                  <span className="text-sm text-gray-500 w-28">Preview Text</span>
                  <span className="text-sm text-gray-900">{generated.previewText}</span>
                </div>
              </div>
            </div>

            {/* HTML Preview */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Preview</span>
              </div>
              <div className="p-4">
                <iframe
                  ref={iframeRef}
                  srcDoc={generated.htmlBody}
                  className="w-full border border-gray-200 rounded-lg"
                  style={{ height: '600px' }}
                  sandbox="allow-same-origin"
                  title="Email Preview"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setGenerated(null); setStep(2) }}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Discard
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setGenerated(null); setStep(2) }}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => router.push('/app/campaigns')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Send Campaign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
