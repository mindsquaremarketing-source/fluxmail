'use client'
import { useState, useEffect } from 'react'
import { useApp } from '@/lib/app-context'

export default function ContactsPage() {
  const { state, refreshContacts } = useApp()
  const { contacts, loaded } = state
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [syncing, setSyncing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addFirstName, setAddFirstName] = useState('')
  const [addLastName, setAddLastName] = useState('')
  const [adding, setAdding] = useState(false)

  // Auto sync contacts if last sync was more than 1 hour ago
  useEffect(() => {
    if (!loaded || !state.store?.shopDomain) return
    const oneHour = 60 * 60 * 1000
    if (Date.now() - state.lastContactSync > oneHour) {
      fetch('/api/sync/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop: state.store.shopDomain })
      }).then(() => refreshContacts()).catch(() => {})
    }
  }, [loaded])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const storeRes = await fetch('/api/store')
      const storeData = await storeRes.json()
      const shopDomain = storeData.store?.shopDomain
      if (!shopDomain) { setSyncing(false); return }
      await fetch('/api/sync/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop: shopDomain })
      })
      await refreshContacts()
    } catch (e) {
      console.error('Sync failed:', e)
    } finally {
      setSyncing(false)
    }
  }

  const filtered = contacts.filter((c: any) => {
    const matchesSearch =
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName?.toLowerCase().includes(search.toLowerCase())
    if (tab === 'subscribed') return matchesSearch && c.status === 'subscribed'
    if (tab === 'unsubscribed') return matchesSearch && c.status === 'unsubscribed'
    return matchesSearch
  })

  const subscribed = contacts.filter((c: any) => c.status === 'subscribed').length
  const unsubscribed = contacts.filter((c: any) => c.status === 'unsubscribed').length

  const handleAddContact = async () => {
    if (!addEmail.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/contacts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail, firstName: addFirstName, lastName: addLastName })
      })
      if (res.ok) {
        setShowAddModal(false)
        setAddEmail('')
        setAddFirstName('')
        setAddLastName('')
        await refreshContacts()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add contact')
      }
    } catch {
      alert('Failed to add contact')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Contact
          </button>
          <button onClick={handleSync} disabled={syncing}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all">
          {syncing ? (
            <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Syncing...</>
          ) : (
            <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Sync New Customers</>
          )}
        </button>
        {state.lastContactSync > 0 && (
          <p className="text-xs text-gray-400 mt-1">Last synced: {new Date(state.lastContactSync).toLocaleString()}</p>
        )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Contacts', value: subscribed },
          { label: 'Total Contacts', value: contacts.length },
          { label: 'Added Last 30 Days', value: contacts.filter((c: any) => new Date(c.addedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500">{s.label}</p>
            {!loaded
              ? <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mt-1" />
              : <p className="text-3xl font-bold text-gray-900 mt-1">{s.value.toLocaleString()}</p>
            }
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex gap-1">
            {[
              { key: 'all', label: `All ${contacts.length}` },
              { key: 'subscribed', label: `Subscribed ${subscribed}` },
              { key: 'unsubscribed', label: `Unsubscribed ${unsubscribed}` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-48" />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Name', 'Email', 'Source', 'Date Added', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {!loaded ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  {[140, 180, 80, 100, 80].map((w, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${w}px` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  </div>
                  <p className="text-gray-500">No contacts found</p>
                  <button onClick={handleSync} className="mt-3 px-4 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800">Sync from Shopify</button>
                </td>
              </tr>
            ) : filtered.map((contact: any) => (
              <tr key={contact.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                      {(contact.firstName?.[0] || contact.email?.[0] || '?').toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {[contact.firstName, contact.lastName].filter(Boolean).join(' ') || '—'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{contact.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium capitalize">{contact.source || 'shopify'}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(contact.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${contact.status === 'subscribed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${contact.status === 'subscribed' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {contact.status === 'subscribed' ? 'Subscribed' : 'Unsubscribed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">{filtered.length} of {contacts.length} contacts</p>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add Contact</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">&#10005;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email *</label>
                <input type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="contact@example.com" autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">First name</label>
                  <input type="text" value={addFirstName} onChange={e => setAddFirstName(e.target.value)} placeholder="John"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Last name</label>
                  <input type="text" value={addLastName} onChange={e => setAddLastName(e.target.value)} placeholder="Doe"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddContact} disabled={adding || !addEmail.trim()}
                className="px-4 py-2.5 text-sm font-semibold bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2">
                {adding ? (
                  <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Adding...</>
                ) : 'Add Contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
