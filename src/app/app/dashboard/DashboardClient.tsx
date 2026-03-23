'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import DateRangePicker from '@/components/DateRangePicker'

interface Stats {
  revenue: number
  emailsCollected: number
  emailsSent: number
  conversions: number
  revenuePerRecipient: number
  roi: number
  totalContacts: number
  recentContacts: number
}

interface Props {
  stats: Stats
  campaigns: any[]
  flows: any[]
  shopDomain: string
}

export default function DashboardClient({ stats, campaigns, flows, shopDomain }: Props) {
  const [selectedRange, setSelectedRange] = useState('Last 30 days')
  const [count, setCount] = useState({
    revenue: 0,
    emailsCollected: 0,
    emailsSent: 0,
    conversions: 0,
  })

  // Animate numbers on load
  useEffect(() => {
    const duration = 1500
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)

      setCount({
        revenue: stats.revenue * eased,
        emailsCollected: Math.floor(stats.emailsCollected * eased),
        emailsSent: Math.floor(stats.emailsSent * eased),
        conversions: Math.floor(stats.conversions * eased),
      })

      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [stats])

  const kpiCards = [
    {
      label: 'Revenue Attributed to Fluxmail',
      value: `$${count.revenue.toFixed(2)}`,
      icon: '💰',
      tooltip: 'Total revenue from emails sent through Fluxmail'
    },
    {
      label: 'Emails Collected',
      value: count.emailsCollected.toLocaleString(),
      icon: '📧',
      tooltip: 'Total subscribed contacts in your list'
    },
    {
      label: 'Emails Sent',
      value: count.emailsSent.toLocaleString(),
      icon: '📤',
      tooltip: 'Total emails sent through campaigns and flows'
    },
    {
      label: 'Conversions',
      value: count.conversions.toLocaleString(),
      icon: '🛒',
      tooltip: 'Total orders placed from email campaigns'
    },
    {
      label: 'Revenue per Recipient',
      value: `$${stats.revenuePerRecipient.toFixed(2)}`,
      icon: '👤',
      tooltip: 'Average revenue generated per email recipient'
    },
    {
      label: 'Return on Investment (ROI)',
      value: `${stats.roi.toFixed(0)}%`,
      icon: '📈',
      tooltip: 'ROI based on plan cost vs revenue generated'
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Sent
        </span>
      )
      case 'draft': return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Draft</span>
      )
      default: return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">{status}</span>
      )
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{shopDomain}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app/campaigns/create">
            <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Create Campaign
            </button>
          </Link>
          <DateRangePicker
            selectedRange={selectedRange}
            onSave={(range) => setSelectedRange(range)}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{card.icon}</span>
                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              </div>
              <div className="relative">
                <button className="text-gray-300 hover:text-gray-500 transition-colors peer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div className="absolute right-0 top-6 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-48 opacity-0 peer-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {card.tooltip}
                </div>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Flows Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Flows</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Flow Name', 'Emails Sent', 'Open Rate', 'Click Rate', 'Conversions', 'Conversion Value', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {flows.map((flow) => (
              <tr key={flow.name} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{flow.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{flow.emailsSent.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{flow.openRate}%</td>
                <td className="px-4 py-3 text-sm text-gray-700">{flow.clickRate}%</td>
                <td className="px-4 py-3 text-sm text-gray-700">{flow.conversions}</td>
                <td className="px-4 py-3 text-sm text-gray-700">${flow.convValue.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"/>
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Campaigns</h2>
          <Link href="/app/campaigns" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all &rarr;
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Campaign Name', 'Date', 'Emails Sent', 'Open Rate', 'Click Rate', 'Orders', 'Revenue', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">📧</span>
                    <p className="text-sm">No campaigns yet</p>
                    <Link href="/app/campaigns/create">
                      <button className="mt-2 px-4 py-2 bg-blue-700 text-white text-xs rounded-lg hover:bg-blue-800">
                        Create Campaign
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ) : campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{campaign.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {(campaign.emailsSent || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {campaign.emailsSent > 0
                    ? `${((campaign.opens / campaign.emailsSent) * 100).toFixed(1)}%`
                    : '0%'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {campaign.emailsSent > 0
                    ? `${((campaign.clicks / campaign.emailsSent) * 100).toFixed(1)}%`
                    : '0%'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {campaign.placedOrders || 0}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  ${(Number(campaign.revenue) || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(campaign.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Email Collection Forms */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Email Collection Forms</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Form', 'Impressions', 'Submitted Emails', 'Submitted Phones', 'Form Submit Rate', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-blue-50/30 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">Pop-up</td>
              <td className="px-4 py-3 text-sm text-gray-700">0</td>
              <td className="px-4 py-3 text-sm text-gray-700">{stats.emailsCollected}</td>
              <td className="px-4 py-3 text-sm text-gray-700">0</td>
              <td className="px-4 py-3 text-sm text-gray-700">0%</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"/>
                  Active
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
