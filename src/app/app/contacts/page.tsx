'use client'

import { useState, useEffect, useCallback } from 'react'

interface Contact {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  status: string
  source: string
  addedAt: string
}

interface ContactsData {
  contacts: Contact[]
  total: number
  totalAll: number
  subscribedCount: number
  unsubscribedCount: number
  notSubscribedCount: number
  last30Days: number
  page: number
  totalPages: number
}

export default function ContactsPage() {
  const [data, setData] = useState<ContactsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showBanner, setShowBanner] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') params.set('status', activeTab)
      if (search) params.set('search', search)
      params.set('page', page.toString())

      const res = await fetch(`/api/contacts?${params}`)
      const json = await res.json()
      if (res.ok) setData(json)
    } catch (err) {
      console.error('Fetch contacts error:', err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, page, search])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const handleUnsubscribe = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}/unsubscribe`, { method: 'POST' })
      if (res.ok) fetchContacts()
    } catch (err) {
      console.error('Unsubscribe error:', err)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (!data) return
    if (selectedIds.size === data.contacts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.contacts.map((c) => c.id)))
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const contactName = (c: Contact) => {
    const name = [c.firstName, c.lastName].filter(Boolean).join(' ')
    return name || '—'
  }

  const tabs = [
    { key: 'all', label: 'All', count: data?.totalAll || 0 },
    { key: 'subscribed', label: 'Subscribed', count: data?.subscribedCount || 0 },
    { key: 'unsubscribed', label: 'Unsubscribed', count: data?.unsubscribedCount || 0 },
    { key: 'not_subscribed', label: 'Not Subscribed', count: data?.notSubscribedCount || 0 },
  ]

  const startItem = data ? (data.page - 1) * 50 + 1 : 0
  const endItem = data ? Math.min(data.page * 50, data.total) : 0

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contacts</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Active Contacts</p>
          <p className="text-3xl font-bold text-gray-900">{data?.subscribedCount?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Contacts</p>
          <p className="text-3xl font-bold text-gray-900">{data?.totalAll?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Added Last 30 Days</p>
          <p className="text-3xl font-bold text-gray-900">{data?.last30Days?.toLocaleString() || '0'}</p>
        </div>
      </div>

      {/* Sync Banner */}
      {showBanner && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">Contact Sync In-Progress</p>
              <p className="text-xs text-blue-600">Your store contacts are still being synced</p>
            </div>
          </div>
          <button onClick={() => setShowBanner(false)} className="text-blue-400 hover:text-blue-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Tabs + Search */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-gray-300' : 'text-gray-400'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-56"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={data ? selectedIds.size === data.contacts.length && data.contacts.length > 0 : false}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Contact Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Email</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Source</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Date Added</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                    Loading contacts...
                  </td>
                </tr>
              ) : data && data.contacts.length > 0 ? (
                data.contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${contactName(contact) !== '—' ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                        {contactName(contact)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {contact.source === 'shopify' ? 'Shopify' : contact.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(contact.addedAt)}</td>
                    <td className="px-6 py-4">
                      {contact.status === 'subscribed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Subscribed
                        </span>
                      ) : contact.status === 'unsubscribed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          Unsubscribed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          Not Subscribed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {contact.status === 'subscribed' && (
                        <button
                          onClick={() => handleUnsubscribe(contact.id)}
                          className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                        >
                          Unsubscribe
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <p className="text-sm text-gray-500 mb-1">No contacts found</p>
                      <p className="text-sm text-gray-400">Sync your Shopify contacts to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {startItem}–{endItem} of {data.total.toLocaleString()} contacts
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  page <= 1
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    page === p
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  page >= data.totalPages
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
