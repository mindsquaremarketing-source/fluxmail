'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const EmailBlockEditor = dynamic(() => import('@/components/EmailBlockEditor'), { ssr: false })

interface TemplatePreviewModalProps {
  template: any
  store: any
  initialHtml: string
  initialLoading: boolean
  products?: any[]
  onClose: () => void
  onSave: (name: string, subject: string, html: string) => Promise<void>
  onSendNow: (name: string, subject: string, html: string) => Promise<void>
}

export default function TemplatePreviewModal({
  template,
  store,
  initialHtml,
  initialLoading,
  products = [],
  onClose,
  onSave,
  onSendNow,
}: TemplatePreviewModalProps) {
  const [previewHtml, setPreviewHtml] = useState(initialHtml)
  const [previewLoading, setPreviewLoading] = useState(initialLoading)
  const [campaignName, setCampaignName] = useState(template.name)
  const [campaignSubject, setCampaignSubject] = useState(template.subject)
  const [saving, setSaving] = useState(false)

  // If initialHtml was empty and initialLoading, fetch on demand
  useState(() => {
    if (initialLoading && !initialHtml) {
      fetch('/api/ai/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${template.description}. Headline: ${template.headline}. Body: ${template.bodyText}. CTA: ${template.ctaText}.`,
          discountCode: template.discountCode || '',
          discountValue: template.discountValue || '',
          templateName: template.name,
          previewOnly: true,
        })
      })
        .then(r => r.json())
        .then(data => { if (data.html) setPreviewHtml(data.html) })
        .catch(() => {})
        .finally(() => setPreviewLoading(false))
    }
  })

  const handleSave = async () => {
    if (!previewHtml) return
    setSaving(true)
    try { await onSave(campaignName, campaignSubject, previewHtml) }
    finally { setSaving(false) }
  }

  const handleSendNow = async () => {
    if (!previewHtml) return
    setSaving(true)
    try { await onSendNow(campaignName, campaignSubject, previewHtml) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h2 className="font-bold text-gray-900">{template.name}</h2>
              <p className="text-xs text-gray-500">Preview and customize your email</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving || previewLoading || !previewHtml}
              className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button onClick={handleSendNow} disabled={saving || previewLoading || !previewHtml}
              className="px-4 py-2 text-sm font-bold bg-blue-700 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200">
              {saving ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Sending...</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>Send Now</>
              )}
            </button>
          </div>
        </div>
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Campaign Name</label>
              <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Subject Line</label>
              <input type="text" value={campaignSubject} onChange={e => setCampaignSubject(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-auto bg-gray-100 p-6">
            {previewLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <p className="text-gray-500 font-medium">Generating branded email...</p>
                  <p className="text-gray-400 text-sm mt-1">Using your logo, colors &amp; products</p>
                </div>
              </div>
            ) : previewHtml ? (
              <iframe key={previewHtml.length} srcDoc={previewHtml} className="w-full bg-white rounded-xl shadow-lg"
                style={{ maxWidth: '650px', height: '550px', border: 'none', display: 'block', margin: '0 auto' }} title="Preview" />
            ) : (
              <div className="flex items-center justify-center h-full"><p className="text-gray-400">Failed to generate preview</p></div>
            )}
          </div>
          <div className="w-96 border-l border-gray-200 flex flex-col bg-white flex-shrink-0">
            {previewHtml && !previewLoading && (
              <EmailBlockEditor
                initialHtml={previewHtml}
                primaryColor={store?.primaryColor || '#1E40AF'}
                onHtmlChange={setPreviewHtml}
                products={products}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
