'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function CampaignDetail({ campaign }: { campaign: any }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleSend = async () => {
    if (!confirm('Are you sure you want to send this campaign to all subscribed contacts?')) return

    setSending(true)
    setError('')

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/send`, {
        method: 'POST'
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setResult(data)
      setSent(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/app/campaigns" className="text-gray-500 hover:text-gray-700">
            ← Back to Campaigns
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900">{campaign.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          {!sent && campaign.status !== 'sent' && (
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Sending...
                </>
              ) : 'Send Campaign'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {sent && result && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          Campaign sent successfully to {result.sent} contacts!
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Status', value: sent ? 'sent' : campaign.status },
          { label: 'Emails Sent', value: result?.sent || campaign.emailsSent || 0 },
          { label: 'Open Rate', value: '0%' },
          { label: 'Click Rate', value: '0%' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <p className="text-sm text-gray-500 mb-1">Subject Line</p>
        <p className="font-medium text-gray-900">{campaign.subject}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Email Preview</h3>
        </div>
        <iframe
          srcDoc={campaign.htmlContent}
          className="w-full"
          style={{ height: '600px', border: 'none' }}
          title="Email Preview"
        />
      </div>
    </div>
  )
}
