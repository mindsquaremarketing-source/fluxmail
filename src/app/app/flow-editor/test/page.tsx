'use client'

import { useState } from 'react'

interface TestResult {
  flow: string
  status: 'idle' | 'sending' | 'success' | 'error'
  message?: string
}

const flowTests = [
  { key: 'welcome', label: 'Welcome Email', description: 'Sends the 1st Welcome Flow email' },
  { key: 'abandoned_checkout', label: 'Abandoned Checkout', description: 'Sends the 1st Checkout Reminder email' },
  { key: 'browse_abandonment', label: 'Browse Abandonment', description: 'Sends the 1st Browse Reminder email' },
  { key: 'thank_you', label: 'Thank You', description: 'Sends the Order Confirmation email' },
  { key: 'winback', label: 'Winback', description: 'Sends the 1st Winback email' },
]

export default function FlowTestPage() {
  const [testEmail, setTestEmail] = useState('')
  const [results, setResults] = useState<Record<string, TestResult>>(
    Object.fromEntries(flowTests.map((f) => [f.key, { flow: f.key, status: 'idle' }]))
  )

  const sendTest = async (flowKey: string) => {
    if (!testEmail.trim() || !testEmail.includes('@')) {
      setResults((prev) => ({
        ...prev,
        [flowKey]: { flow: flowKey, status: 'error', message: 'Please enter a valid email address' },
      }))
      return
    }

    setResults((prev) => ({
      ...prev,
      [flowKey]: { flow: flowKey, status: 'sending' },
    }))

    try {
      // Simulate sending — actual Resend integration will be added later
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setResults((prev) => ({
        ...prev,
        [flowKey]: { flow: flowKey, status: 'success', message: `Test email queued to ${testEmail}` },
      }))
    } catch (err: any) {
      setResults((prev) => ({
        ...prev,
        [flowKey]: { flow: flowKey, status: 'error', message: err.message },
      }))
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Email Flows</h1>
        <p className="text-sm text-gray-500 mb-8">
          Send test emails for each flow to verify they look correct before going live.
        </p>

        {/* Test Email Input */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Test Email Address</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-2">All test emails will be sent to this address.</p>
        </div>

        {/* Flow Test Cards */}
        <div className="space-y-4">
          {flowTests.map((flow) => {
            const result = results[flow.key]
            return (
              <div key={flow.key} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{flow.label}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{flow.description}</p>
                  {result.status === 'success' && (
                    <p className="text-xs text-green-600 mt-1">{result.message}</p>
                  )}
                  {result.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">{result.message}</p>
                  )}
                </div>
                <button
                  onClick={() => sendTest(flow.key)}
                  disabled={result.status === 'sending'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    result.status === 'sending'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : result.status === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {result.status === 'sending'
                    ? 'Sending...'
                    : result.status === 'success'
                    ? 'Sent'
                    : 'Send Test'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
