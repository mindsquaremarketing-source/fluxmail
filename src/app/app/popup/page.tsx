'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/app-context'

export default function PopupPage() {
  const { state } = useApp()
  const [popupEnabled, setPopupEnabled] = useState(true)
  const [popupTitle, setPopupTitle] = useState('Get 10% Off Your First Order')
  const [popupSubtitle, setPopupSubtitle] = useState('Subscribe to our newsletter and get an exclusive discount on your first purchase.')
  const [popupDiscount, setPopupDiscount] = useState('10')
  const [popupDelay, setPopupDelay] = useState(5)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [registerMsg, setRegisterMsg] = useState('')
  const [loaded, setLoaded] = useState(false)

  const brandColor = state.store?.primaryColor || '#1E40AF'

  useEffect(() => {
    fetch('/api/popup/settings')
      .then(r => r.json())
      .then(data => {
        if (data.popupEnabled !== undefined) setPopupEnabled(data.popupEnabled)
        if (data.popupTitle) setPopupTitle(data.popupTitle)
        if (data.popupSubtitle) setPopupSubtitle(data.popupSubtitle)
        if (data.popupDiscount) setPopupDiscount(data.popupDiscount)
        if (data.popupDelay !== undefined) setPopupDelay(data.popupDelay)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/popup/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popupEnabled, popupTitle, popupSubtitle, popupDiscount, popupDelay }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  const handleRegister = async () => {
    setRegistering(true)
    setRegisterMsg('')
    try {
      const res = await fetch('/api/popup/register-script', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setRegisterMsg(data.message || 'Popup script registered on your store!')
      } else {
        setRegisterMsg(data.error || 'Failed to register script tag')
      }
    } catch {
      setRegisterMsg('Something went wrong. Please try again.')
    }
    setRegistering(false)
  }

  if (!loaded) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <svg className="animate-spin h-6 w-6 text-blue-700" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Email Popup</h1>
        <p className="text-gray-500 text-sm mt-1">Collect subscriber emails from your storefront</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Preview */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Live Preview</h2>
          <div className="bg-gray-100 rounded-xl p-6 flex items-end justify-end min-h-[400px]">
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', padding: '28px', maxWidth: '340px', fontFamily: 'sans-serif', position: 'relative' }}>
              <button style={{ position: 'absolute', top: '12px', right: '14px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>x</button>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎁</div>
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{popupTitle}</h3>
              <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>{popupSubtitle}</p>
              <input
                type="email"
                placeholder="Enter your email"
                disabled
                style={{ width: '100%', boxSizing: 'border-box' as const, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '10px', outline: 'none', background: 'white' }}
              />
              <button style={{ width: '100%', padding: '12px', background: brandColor, color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
                Subscribe & Get Discount
              </button>
              <p style={{ margin: '12px 0 0', fontSize: '11px', textAlign: 'center' as const, color: '#94a3b8' }}>We respect your privacy. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-5">Popup Settings</h2>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-medium text-gray-900">Enable Popup</p>
                <p className="text-xs text-gray-400">Show popup on your storefront</p>
              </div>
              <button
                onClick={() => setPopupEnabled(!popupEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${popupEnabled ? 'bg-blue-700' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${popupEnabled ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Popup Title</label>
              <input
                type="text"
                value={popupTitle}
                onChange={(e) => setPopupTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Subtitle */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Popup Subtitle</label>
              <textarea
                value={popupSubtitle}
                onChange={(e) => setPopupSubtitle(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            {/* Discount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Percentage</label>
              <div className="relative">
                <input
                  type="number"
                  value={popupDiscount}
                  onChange={(e) => setPopupDiscount(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
              </div>
            </div>

            {/* Delay */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Delay Before Popup (seconds)</label>
              <input
                type="number"
                value={popupDelay}
                onChange={(e) => setPopupDelay(parseInt(e.target.value) || 0)}
                min="0"
                max="120"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : saved ? (
                'Saved!'
              ) : (
                'Save Settings'
              )}
            </button>
          </div>

          {/* Register Script Tag */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Install on Store</h2>
            <p className="text-xs text-gray-400 mb-4">Register the popup script on your Shopify storefront. Only needed once.</p>
            <button
              onClick={handleRegister}
              disabled={registering}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {registering ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registering...
                </>
              ) : (
                'Register Popup on Store'
              )}
            </button>
            {registerMsg && (
              <p className={`mt-3 text-xs text-center ${registerMsg.includes('Failed') || registerMsg.includes('wrong') ? 'text-red-500' : 'text-green-600'}`}>
                {registerMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
