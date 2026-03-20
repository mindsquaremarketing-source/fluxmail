export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import SyncButton from './sync-button'

interface Props {
  searchParams: { [key: string]: string | undefined }
}

export default async function Dashboard({ searchParams }: Props) {
  const shop = searchParams?.shop

  let store = null
  let contactCount = 0

  if (shop) {
    store = await prisma.store.findUnique({
      where: { shopDomain: shop },
    })
    if (store) {
      contactCount = await prisma.contact.count({
        where: { storeId: store.id },
      })
    }
  }

  if (!store) {
    store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' },
    })
    if (store) {
      contactCount = await prisma.contact.count({
        where: { storeId: store.id },
      })
    }
  }

  const kpis = [
    { label: 'Revenue Attributed to Fluxmail', value: '$0.00', tooltip: 'Total revenue from Fluxmail email campaigns and flows' },
    { label: 'Emails Collected', value: contactCount.toLocaleString(), tooltip: 'Total email addresses collected via forms and Shopify sync' },
    { label: 'Emails Sent', value: '0', tooltip: 'Total emails sent across all campaigns and flows' },
    { label: 'Conversions', value: '0', tooltip: 'Total orders placed from email clicks' },
    { label: 'Revenue per Recipient', value: '$0.00', tooltip: 'Average revenue generated per email recipient' },
    { label: 'Return on Investment (ROI)', value: '0x', tooltip: 'Revenue earned per dollar spent on Fluxmail' },
  ]

  const flows = [
    { name: 'Welcome Flow', sent: 0, openRate: '0%', clickRate: '0%', conversions: 0, conversionValue: '$0.00' },
    { name: 'Browse Abandonment', sent: 0, openRate: '0%', clickRate: '0%', conversions: 0, conversionValue: '$0.00' },
    { name: 'Abandoned Checkout', sent: 0, openRate: '0%', clickRate: '0%', conversions: 0, conversionValue: '$0.00' },
    { name: 'Thank You', sent: 0, openRate: '0%', clickRate: '0%', conversions: 0, conversionValue: '$0.00' },
    { name: 'Winback Flow', sent: 0, openRate: '0%', clickRate: '0%', conversions: 0, conversionValue: '$0.00' },
  ]

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Top Nav */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          {store && (
            <p className="text-sm text-gray-500 mt-1">{store.shopDomain}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {store && <SyncButton shopDomain={store.shopDomain} />}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Last 30 days
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{kpi.label}</span>
              <span className="text-gray-400 cursor-help" title={kpi.tooltip}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Flows Table */}
      <div className="bg-white rounded-xl border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Flows</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Flow Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Emails Sent</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Open Rate</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Click Rate</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Conversions</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Conversion Value</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {flows.map((flow) => (
                <tr key={flow.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{flow.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{flow.sent}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{flow.openRate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{flow.clickRate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{flow.conversions}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{flow.conversionValue}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Campaigns</h2>
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
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">
                  No campaigns yet. Create your first campaign to get started.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Collection Forms Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Email Collection Forms</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Form</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Impressions</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Submitted Emails</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Submitted Phones</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Form Submit Rate</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Pop-up</td>
                <td className="px-6 py-4 text-sm text-gray-600">0</td>
                <td className="px-6 py-4 text-sm text-gray-600">0</td>
                <td className="px-6 py-4 text-sm text-gray-600">0</td>
                <td className="px-6 py-4 text-sm text-gray-600">0%</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
