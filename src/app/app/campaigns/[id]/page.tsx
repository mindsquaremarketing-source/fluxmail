'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  subject: string
  htmlContent: string
  status: string
  emailsSent: number
  opens: number
  clicks: number
  placedOrders: number
  revenue: number
  createdAt: string
}

export default function CampaignPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch(`/api/campaigns/${params.id}`)
      .then((res) => res.json())
      .then((data) => setCampaign(data.campaign))
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleSend = async () => {
    if (!campaign) return
    setSending(true)
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/send`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setCampaign((prev) => prev ? { ...prev, status: 'sent', emailsSent: data.emailsSent || prev.emailsSent } : prev)
      }
    } catch (err) {
      console.error('Send error:', err)
    } finally {
      setSending(false)
    }
  }

  const openRate = campaign && campaign.emailsSent > 0
    ? `${((campaign.opens / campaign.emailsSent) * 100).toFixed(1)}%` : '0%'
  const clickRate = campaign && campaign.emailsSent > 0
    ? `${((campaign.clicks / campaign.emailsSent) * 100).toFixed(1)}%` : '0%'

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading campaign...</div>
  }

  if (!campaign) {
    return <div className="p-8 text-center text-gray-400">Campaign not found.</div>
  }

  const statusStyles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    sent: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Sent' },
    scheduled: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'Scheduled' },
    draft: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Draft' },
  }
  const badge = statusStyles[campaign.status] || statusStyles.draft

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/app/campaigns" className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{campaign.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
            {badge.label}
          </span>
          {campaign.status === 'draft' && (
            <button
              onClick={handleSend}
              disabled={sending}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                sending ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              {sending ? 'Sending...' : 'Send Campaign'}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Emails Sent</p>
          <p className="text-2xl font-bold text-gray-900">{campaign.emailsSent}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Open Rate</p>
          <p className="text-2xl font-bold text-gray-900">{openRate}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Click Rate</p>
          <p className="text-2xl font-bold text-gray-900">{clickRate}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Revenue</p>
          <p className="text-2xl font-bold text-gray-900">${campaign.revenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Email Preview */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Preview</span>
        </div>
        <div className="p-6 flex justify-center">
          <iframe
            srcDoc={campaign.htmlContent}
            className="w-full max-w-[620px] border border-gray-200 rounded-lg"
            style={{ height: '700px' }}
            sandbox="allow-same-origin"
            title="Campaign Preview"
          />
        </div>
      </div>
    </div>
  )
}
