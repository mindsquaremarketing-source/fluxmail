'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [previewCampaign, setPreviewCampaign] = useState<any>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns')
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch (e) {
      console.error('Error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (campaign: any) => {
    if (campaign.status === 'sent') return
    if (!confirm(`Send "${campaign.name}" to all subscribed contacts?`)) return
    setSendingId(campaign.id)
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/send`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        await fetchCampaigns()
        alert(`Sent to ${data.sent} contacts!`)
      } else {
        alert('Error: ' + data.error)
      }
    } catch {
      alert('Failed to send')
    } finally {
      setSendingId(null)
    }
  }

  const handleDuplicate = async (id: string) => {
    setOpenMenuId(null)
    await fetch(`/api/campaigns/${id}/duplicate`, { method: 'POST' })
    await fetchCampaigns()
  }

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) return
    await fetch(`/api/campaigns/${id}/rename`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: renameValue })
    })
    setRenamingId(null)
    await fetchCampaigns()
  }

  const handleDelete = async (id: string) => {
    setOpenMenuId(null)
    if (!confirm('Delete this campaign?')) return
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
    await fetchCampaigns()
  }

  const filtered = campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
          Sent
        </span>
      )
      case 'sending': return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
          Sending
        </span>
      )
      default: return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          Draft
        </span>
      )
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {campaigns.length} total campaign{campaigns.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/app/campaigns/create">
          <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
            </svg>
            Create Campaign
          </button>
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* Search */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Campaigns</h2>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-52"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Campaign Name', 'Date', 'Emails Sent', 'Open Rate', 'Click Rate', 'Orders', 'Revenue', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <svg className="animate-spin h-8 w-8 text-blue-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <p className="text-gray-400 text-sm">Loading campaigns...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-700">No campaigns yet</p>
                    <p className="text-sm text-gray-400 mt-1 mb-4">Create your first campaign to get started</p>
                    <Link href="/app/campaigns/create">
                      <button className="px-4 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800">Create Campaign</button>
                    </Link>
                  </td>
                </tr>
              ) : filtered.map((campaign, rowIndex) => (
                <tr key={campaign.id} className="hover:bg-blue-50/30 transition-colors group">
                  {/* Name */}
                  <td className="px-4 py-4">
                    {renamingId === campaign.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRename(campaign.id)
                            if (e.key === 'Escape') setRenamingId(null)
                          }}
                          autoFocus
                          className="border border-blue-400 rounded-lg px-2 py-1 text-sm w-40"
                        />
                        <button onClick={() => handleRename(campaign.id)} className="text-xs bg-blue-700 text-white px-2 py-1 rounded">Save</button>
                        <button onClick={() => setRenamingId(null)} className="text-xs text-gray-400">&#10005;</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                          {campaign.name}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(campaign.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 font-medium">{(campaign.emailsSent || 0).toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{campaign.emailsSent > 0 ? `${((campaign.opens / campaign.emailsSent) * 100).toFixed(1)}%` : '0%'}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{campaign.emailsSent > 0 ? `${((campaign.clicks / campaign.emailsSent) * 100).toFixed(1)}%` : '0%'}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{campaign.placedOrders || 0}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">${(Number(campaign.revenue) || 0).toFixed(2)}</td>
                  <td className="px-4 py-4">{getStatusBadge(campaign.status)}</td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setPreviewCampaign(campaign)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Preview">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {campaign.status !== 'sent' && (
                        <button onClick={() => handleSend(campaign)} disabled={sendingId === campaign.id} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50" title="Send">
                          {sendingId === campaign.id ? (
                            <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                          )}
                        </button>
                      )}

                      <div className="relative">
                        <button onClick={() => setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                        </button>

                        {openMenuId === campaign.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                            <div className={`absolute right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-[999] w-44 py-1 ${rowIndex >= filtered.length - 2 ? 'bottom-8' : 'top-8'}`}>
                              <button onClick={() => { setOpenMenuId(null); router.push(`/app/campaigns/${campaign.id}`) }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                View Report
                              </button>
                              <button onClick={() => handleDuplicate(campaign.id)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                Duplicate
                              </button>
                              <button onClick={() => { setOpenMenuId(null); setRenamingId(campaign.id); setRenameValue(campaign.name) }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Rename
                              </button>
                              <div className="border-t border-gray-100 my-1" />
                              <button onClick={() => handleDelete(campaign.id)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Showing {filtered.length} of {campaigns.length} campaigns</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewCampaign && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setPreviewCampaign(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="font-semibold text-gray-900">{previewCampaign.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{previewCampaign.subject}</p>
              </div>
              <div className="flex items-center gap-3">
                {previewCampaign.status !== 'sent' && (
                  <button onClick={() => { setPreviewCampaign(null); handleSend(previewCampaign) }}
                    className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800">
                    Send Now
                  </button>
                )}
                <button onClick={() => setPreviewCampaign(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">&#10005;</button>
              </div>
            </div>

            <div className="flex border-b border-gray-100 bg-gray-50 flex-shrink-0">
              {[
                { label: 'Emails Sent', value: previewCampaign.emailsSent || 0 },
                { label: 'Opens', value: previewCampaign.opens || 0 },
                { label: 'Clicks', value: previewCampaign.clicks || 0 },
                { label: 'Revenue', value: `$${(Number(previewCampaign.revenue) || 0).toFixed(2)}` },
              ].map(stat => (
                <div key={stat.label} className="flex-1 px-4 py-3 text-center border-r border-gray-100 last:border-r-0">
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              <iframe
                srcDoc={previewCampaign.htmlContent || '<p style="text-align:center;padding:40px;color:#999">No preview available</p>'}
                className="w-full bg-white rounded-xl shadow-sm"
                style={{ height: '500px', border: 'none' }}
                title="Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
