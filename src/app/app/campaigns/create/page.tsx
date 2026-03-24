'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateCampaignPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'choose' | 'ai'>('choose')

  const handleAIGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/ai/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      if (data.campaignId) {
        router.push('/app/campaigns')
      }
    } catch {}
    finally { setLoading(false) }
  }

  if (step === 'ai') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl w-full max-w-xl p-8">
          <button onClick={() => setStep('choose')} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4" style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}>
              &#129302;
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate with AI</h2>
            <p className="text-gray-500 text-sm">Describe your campaign and AI creates a beautiful branded email instantly</p>
          </div>
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick ideas</p>
            <div className="flex flex-wrap gap-2">
              {['Flash sale 20% off', 'New arrivals just dropped', 'Customer loyalty reward', 'Win back inactive customers', 'Holiday special offer'].map(idea => (
                <button key={idea} onClick={() => setPrompt(idea)} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 rounded-full transition-all">{idea}</button>
              ))}
            </div>
          </div>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your campaign... e.g. Summer sale with 25% off all products for loyal customers"
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-0 focus:border-blue-500 outline-none resize-none h-28 transition-colors mb-4" />
          <button onClick={handleAIGenerate} disabled={loading || !prompt.trim()}
            className="w-full py-3.5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 shadow-lg shadow-purple-200">
            {loading ? (
              <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Creating your campaign...</>
            ) : 'Generate Campaign'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Link href="/app/campaigns">
            <button className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mx-auto mb-6 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Campaigns
            </button>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Create Campaign</h1>
          <p className="text-gray-500">How do you want to build your email?</p>
        </div>

        <div className="space-y-4">
          <Link href="/app/campaigns/templates">
            <div className="relative bg-white rounded-3xl border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-16 translate-x-16 group-hover:bg-blue-100 transition-colors" />
              <div className="flex items-center gap-5 relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg,#1E40AF,#3B82F6)' }}>&#10024;</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-gray-900">Start with Template</h3>
                    <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">Recommended</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">Pick from 6 AI-generated templates using your brand, colors and real products</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </Link>

          <div onClick={() => setStep('ai')} className="relative bg-white rounded-3xl border-2 border-gray-200 p-6 hover:border-purple-500 hover:shadow-xl transition-all cursor-pointer group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -translate-y-16 translate-x-16 group-hover:bg-purple-100 transition-colors" />
            <div className="flex items-center gap-5 relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}>&#129302;</div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-gray-900 mb-1">Generate with AI</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Describe your idea and AI creates a completely custom email from scratch</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">All campaigns automatically use your brand colors, logo and Shopify products</p>
      </div>
    </div>
  )
}
