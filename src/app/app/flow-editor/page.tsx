'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface FlowEmail {
  id: string
  name: string
  delay: string
  status: string
  subject: string
  previewText: string
  templateKey: string
}

interface Flow {
  id: string
  name: string
  count: string
  emails: FlowEmail[]
}

const flows: Flow[] = [
  { id: 'welcome', name: 'Welcome Flow', count: '3 of 3',
    emails: [
      { id: 'w1', name: '1st Welcome Email', delay: 'On trigger', status: 'active', subject: 'Welcome! Here is 10% off', previewText: 'Your welcome gift awaits', templateKey: 'welcome-1' },
      { id: 'w2', name: '2nd Welcome Email', delay: '48 hour(s) from previous', status: 'active', subject: 'Your discount is still waiting', previewText: 'Do not let your discount expire', templateKey: 'welcome-2' },
      { id: 'w3', name: '3rd Welcome Email', delay: '2 day(s) from previous', status: 'active', subject: 'LAST CHANCE! 10% off expires today', previewText: 'Final reminder', templateKey: 'welcome-3' },
    ]
  },
  { id: 'browse', name: 'Browse Abandonment', count: '2 of 2',
    emails: [
      { id: 'b1', name: 'Browse Abandonment', delay: '1 hour from trigger', status: 'active', subject: 'Still thinking about it?', previewText: 'Items you viewed are still available', templateKey: 'browse-1' },
      { id: 'b2', name: 'Browse Follow-up', delay: '24 hour(s) from previous', status: 'active', subject: 'We saved your picks + 10% off', previewText: 'Special offer just for you', templateKey: 'browse-2' },
    ]
  },
  { id: 'checkout', name: 'Abandoned Checkout', count: '3 of 3',
    emails: [
      { id: 'c1', name: '1st Checkout Recovery', delay: '1 hour from trigger', status: 'active', subject: 'You forgot something!', previewText: 'Your cart is waiting', templateKey: 'checkout-1' },
      { id: 'c2', name: '2nd Checkout Recovery', delay: '24 hour(s) from previous', status: 'active', subject: 'Still deciding? Here is 10% off', previewText: 'Complete your purchase and save', templateKey: 'checkout-2' },
      { id: 'c3', name: 'Final Checkout Recovery', delay: '48 hour(s) from previous', status: 'active', subject: 'Final reminder — 15% off your cart', previewText: 'Our biggest cart discount', templateKey: 'checkout-3' },
    ]
  },
  { id: 'thankyou', name: 'Thank You', count: '2 of 2',
    emails: [
      { id: 't1', name: 'Order Confirmation', delay: 'On trigger', status: 'active', subject: 'Thank you for your order!', previewText: 'Your order is confirmed', templateKey: 'thankyou-1' },
      { id: 't2', name: 'Thank You Gift', delay: '3 day(s) from previous', status: 'active', subject: 'We love you! 15% off your next order', previewText: 'A thank you gift just for you', templateKey: 'thankyou-2' },
    ]
  },
  { id: 'winback', name: 'Winback Email', count: '3 of 3',
    emails: [
      { id: 'wb1', name: 'We Miss You', delay: '30 days from last order', status: 'active', subject: 'We miss you! 20% off inside', previewText: 'Come back and save big', templateKey: 'winback-1' },
      { id: 'wb2', name: 'New Products', delay: '7 day(s) from previous', status: 'active', subject: 'Look what is new!', previewText: 'Amazing new products', templateKey: 'winback-2' },
      { id: 'wb3', name: 'Final Winback', delay: '7 day(s) from previous', status: 'active', subject: 'Our best offer yet — 25% off', previewText: 'One final offer', templateKey: 'winback-3' },
    ]
  },
]

export default function FlowEditor() {
  const router = useRouter()
  const [expandedFlow, setExpandedFlow] = useState<string>('welcome')
  const [selectedEmail, setSelectedEmail] = useState<FlowEmail | null>(null)
  const [selectedHtml, setSelectedHtml] = useState<string>('')
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [showSubjectEditor, setShowSubjectEditor] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testSending, setTestSending] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)
  const [storeData, setStoreData] = useState<any>(null)
  const [storeProducts, setStoreProducts] = useState<any[]>([])
  const [dynamicTemplates, setDynamicTemplates] = useState<Record<string, string>>({})
  const [loadingTemplate, setLoadingTemplate] = useState(false)

  useEffect(() => {
    const cacheKey = 'fluxmail_templates_v1'

    const refreshTemplates = async (store: any, products: any[]) => {
      try {
        const res = await fetch('/api/templates/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ generateAll: true, storeData: store || {}, products: products.slice(0, 2) })
        })
        const data = await res.json()
        if (data.all) {
          setDynamicTemplates(data.all)
          try { localStorage.setItem(cacheKey, JSON.stringify(data.all)) } catch {}
        }
      } catch {}
    }

    const init = async () => {
      try {
        // Check localStorage cache first
        let cachedTemplates: Record<string, string> | null = null
        try {
          const cached = localStorage.getItem(cacheKey)
          if (cached) cachedTemplates = JSON.parse(cached)
        } catch {}

        // Fetch store data
        const [settingsRes, productsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/products'),
        ])
        const settingsData = await settingsRes.json()
        const productsData = await productsRes.json()
        const store = settingsData.store
        const products = productsData.products || []

        setStoreData(store)
        setStoreProducts(products)
        setSelectedEmail(flows[0]?.emails[0] ?? null)

        if (cachedTemplates && cachedTemplates['welcome-1']) {
          // Use cache instantly — no spinner
          setDynamicTemplates(cachedTemplates)
          setSelectedHtml(cachedTemplates['welcome-1'])
          // Refresh in background
          refreshTemplates(store, products)
        } else {
          // Generate all in one API call
          setLoadingTemplate(true)
          const res = await fetch('/api/templates/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ generateAll: true, storeData: store || {}, products: products.slice(0, 2) })
          })
          const data = await res.json()
          if (data.all) {
            setDynamicTemplates(data.all)
            setSelectedHtml(data.all['welcome-1'] || '')
            try { localStorage.setItem(cacheKey, JSON.stringify(data.all)) } catch {}
          }
          setLoadingTemplate(false)
        }
      } catch (e) {
        console.error('Init failed:', e)
        setLoadingTemplate(false)
      }
    }
    init()
  }, [])

  const handleEmailClick = (email: FlowEmail) => {
    setSelectedEmail(email)

    // Instant from memory
    const cached = dynamicTemplates[email.templateKey]
    if (cached) {
      setSelectedHtml(cached)
      return
    }

    // Fallback: fetch single template
    setLoadingTemplate(true)
    fetch('/api/templates/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateKey: email.templateKey, storeData: storeData || {}, products: storeProducts.slice(0, 2) })
    })
      .then(r => r.json())
      .then(data => {
        if (data.html) {
          setSelectedHtml(data.html)
          setDynamicTemplates(prev => ({ ...prev, [email.templateKey]: data.html }))
        }
      })
      .catch(() => setSelectedHtml(''))
      .finally(() => setLoadingTemplate(false))
  }

  const handleSendTest = async () => {
    setTestSending(true)
    try {
      const res = await fetch('/api/flow-emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          subject: selectedEmail?.subject,
          html: selectedHtml
        })
      })
      if (res.ok) setTestSuccess(true)
    } catch (e) {
      alert('Failed to send')
    } finally {
      setTestSending(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* LEFT PANEL */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Flow Editor</h2>
          <p className="text-xs text-gray-500 mt-0.5">View and edit your email flows</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">Flow Selector</p>
            {flows.map(flow => (
              <div key={flow.id} className="mb-1">
                <button
                  onClick={() => setExpandedFlow(expandedFlow === flow.id ? '' : flow.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${expandedFlow === flow.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-800">{flow.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{flow.count}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </button>

                {expandedFlow === flow.id && (
                  <div className="ml-4 mt-1 space-y-1">
                    {flow.emails.map(email => (
                      <button
                        key={email.id}
                        onClick={() => handleEmailClick(email)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${selectedEmail?.id === email.id ? 'bg-blue-50 border-l-2 border-blue-600' : 'hover:bg-gray-50'}`}
                      >
                        <div>
                          <p className={`text-sm font-medium ${selectedEmail?.id === email.id ? 'text-blue-700' : 'text-gray-700'}`}>
                            {email.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{email.delay}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                          &#9679; Active
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 mt-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Triggers &amp; Funnel</p>
            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-2">
              <div>
                <p className="font-semibold text-gray-700 mb-1">User added when:</p>
                <p>&#8226; Valid email entered in popup</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">User removed when:</p>
                <p>&#8226; Places an order</p>
                <p>&#8226; Was in flow last 7 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-gray-900">{selectedEmail?.name} - Preview</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                &#9679; Active
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowEditMenu(!showEditMenu)}
                className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
              >
                Edit
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showEditMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEditMenu(false)} />
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-56 py-1">
                    <button onClick={() => { setShowEditMenu(false); setShowSubjectEditor(true) }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Subject Line
                    </button>
                    <button onClick={() => { setShowEditMenu(false); router.push('/app/flow-editor/email-editor') }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      Edit Email Template
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => { setShowEditMenu(false); setTestSuccess(false); setTestEmail(''); setShowTestModal(true) }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Test Email
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex gap-3">
              <span className="text-gray-500 w-24">From:</span>
              <span className="text-gray-900 font-medium">Fluxmail &lt;onboarding@resend.dev&gt;</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-500 w-24">Subject:</span>
              <span className="text-gray-900 font-medium">{selectedEmail?.subject}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-500 w-24">Preview:</span>
              <span className="text-gray-600">{selectedEmail?.previewText}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          {!selectedEmail || !selectedHtml ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <p className="text-sm text-gray-500 font-medium">Loading your brand template...</p>
                <p className="text-xs text-gray-400 mt-1">Fetching your logo and products</p>
              </div>
            </div>
          ) : loadingTemplate ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <p className="text-sm text-gray-500 font-medium">Generating with your brand...</p>
              </div>
            </div>
          ) : (
            <iframe
              key={selectedEmail?.id}
              srcDoc={selectedHtml}
              className="w-full bg-white rounded-xl shadow-sm"
              style={{ height: '600px', border: 'none', maxWidth: '650px', margin: '0 auto', display: 'block' }}
              title="Email Preview"
            />
          )}
        </div>
      </div>

      {/* Subject Editor Modal */}
      {showSubjectEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={() => setShowSubjectEditor(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Edit Subject Line</h2>
              <button onClick={() => setShowSubjectEditor(false)} className="text-gray-400 hover:text-gray-600">&#10005;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Subject Line</label>
                <input type="text" defaultValue={selectedEmail?.subject}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Preview Text</label>
                <input type="text" defaultValue={selectedEmail?.previewText}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowSubjectEditor(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowSubjectEditor(false)} className="px-4 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={() => !testSending && setShowTestModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-lg">Send Test Email</h2>
                    <p className="text-blue-200 text-xs">Preview in your inbox</p>
                  </div>
                </div>
                <button onClick={() => setShowTestModal(false)} disabled={testSending}
                  className="text-white text-opacity-70 hover:text-opacity-100 w-8 h-8 flex items-center justify-center hover:bg-white hover:bg-opacity-20 rounded-lg">&#10005;</button>
              </div>
            </div>
            <div className="px-6 py-6">
              {!testSuccess ? (
                <>
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                    <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendTest()}
                      placeholder="you@example.com" autoFocus disabled={testSending}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none disabled:opacity-50" />
                    <div className="flex items-center gap-2 mt-2 bg-blue-50 rounded-lg px-3 py-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-blue-600 text-xs">Sending: {selectedEmail?.subject}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowTestModal(false)} disabled={testSending}
                      className="flex-1 px-4 py-3 text-sm border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50">Discard</button>
                    <button onClick={handleSendTest} disabled={testSending || !testEmail}
                      className="flex-1 px-4 py-3 text-sm font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                      {testSending ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Test Email
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Email Sent!</h3>
                  <p className="text-gray-500 text-sm mb-1">Sent to: <strong className="text-blue-700">{testEmail}</strong></p>
                  <p className="text-gray-400 text-xs mb-6">Check your inbox (and spam folder)</p>
                  <div className="flex gap-3">
                    <button onClick={() => { setTestSuccess(false); setTestEmail('') }}
                      className="flex-1 px-4 py-3 text-sm border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Send Another</button>
                    <button onClick={() => setShowTestModal(false)}
                      className="flex-1 px-4 py-3 text-sm font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 shadow-lg shadow-blue-200">Done</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
