'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  emailsSent: number
  opens: number
  clicks: number
  placedOrders: number
  revenue: number
  createdAt: string
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'sent':
      return { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Sent' }
    case 'scheduled':
      return { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'Scheduled' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Draft' }
  }
}

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/campaigns')
      .then((res) => res.json())
      .then((data) => setCampaigns(data.campaigns || []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSendNow = async (id: string) => {
    setMenuOpen(null)
    try {
      const res = await fetch(`/api/campaigns/${id}/send`, { method: 'POST' })
      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: 'sent' } : c))
        )
      }
    } catch (err) {
      console.error('Send error:', err)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const openRate = (c: Campaign) =>
    c.emailsSent > 0 ? `${((c.opens / c.emailsSent) * 100).toFixed(1)}%` : '0%'
  const clickRate = (c: Campaign) =>
    c.emailsSent > 0 ? `${((c.clicks / c.emailsSent) * 100).toFixed(1)}%` : '0%'

  const filtered = campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <Link
          href="/app/campaigns/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          Create Campaign
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Campaign Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Emails Sent</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Open Rate</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Click Rate</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Placed Order</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Revenue</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-400">Loading campaigns...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                      </svg>
                      <p className="text-sm text-gray-500 mb-1">No campaigns yet.</p>
                      <p className="text-sm text-gray-400">Create your first campaign to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((campaign) => {
                  const badge = statusBadge(campaign.status)
                  return (
                    <tr key={campaign.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/app/campaigns/${campaign.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-700">
                          {campaign.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(campaign.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{campaign.emailsSent}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{openRate(campaign)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{clickRate(campaign)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{campaign.placedOrders}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">${campaign.revenue.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === campaign.id ? null : campaign.id)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                        {menuOpen === campaign.id && (
                          <div className="absolute right-6 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 w-36">
                            <Link
                              href={`/app/campaigns/${campaign.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Preview
                            </Link>
                            {campaign.status === 'draft' && (
                              <button
                                onClick={() => handleSendNow(campaign.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Send Now
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {filtered.length} of {campaigns.length} campaigns
          </p>
        </div>
      </div>
    </div>
  )
}
