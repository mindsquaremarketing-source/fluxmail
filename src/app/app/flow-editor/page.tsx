'use client'

import { useState } from 'react'

interface FlowEmail {
  id: string
  name: string
  subject: string
  previewText: string
  from: string
  heroColor: string
  heading: string
  body: string
  cta: string
  ctaCode?: string
}

interface Flow {
  name: string
  emails: FlowEmail[]
}

const flows: Flow[] = [
  {
    name: 'Welcome Flow',
    emails: [
      {
        id: 'welcome-1',
        name: '1st Welcome Email',
        subject: 'Welcome to Fluxmail! 🎉',
        previewText: 'Your welcome gift awaits',
        from: 'Fluxmail <contact@fluxmail.com>',
        heroColor: '#1E40AF',
        heading: 'Welcome to Fluxmail',
        body: "We're thrilled to have you! As a thank you for joining, here's an exclusive discount on your next order.",
        cta: "Here's 10% Off your next order",
        ctaCode: 'FW-WELCOME',
      },
      {
        id: 'welcome-2',
        name: '2nd Welcome Email',
        subject: 'Your favorites are waiting ✨',
        previewText: 'Check out our best sellers',
        from: 'Fluxmail <contact@fluxmail.com>',
        heroColor: '#6d28d9',
        heading: 'Discover Our Best Sellers',
        body: 'Our most popular products are flying off the shelves. See what everyone is loving right now.',
        cta: 'Shop Best Sellers',
      },
      {
        id: 'welcome-3',
        name: '3rd Welcome Email',
        subject: "Don't miss out on your discount 🎁",
        previewText: 'Your 10% off expires soon',
        from: 'Fluxmail <contact@fluxmail.com>',
        heroColor: '#5b21b6',
        heading: 'Last Chance!',
        body: "Your welcome discount is about to expire. Don't let it go to waste — treat yourself today!",
        cta: 'Use Your 10% Off Now',
        ctaCode: 'FW-WELCOME',
      },
    ],
  },
  {
    name: 'Browse Abandonment',
    emails: [
      {
        id: 'browse-1',
        name: '1st Browse Reminder',
        subject: 'Still thinking about it? 👀',
        previewText: 'The items you viewed are still available',
        from: 'Fluxmail <contact@fluxmail.com>',
        heroColor: '#2563eb',
        heading: 'You Left Something Behind',
        body: "We noticed you were checking out some great items. They're still available — come take another look!",
        cta: 'Continue Browsing',
      },
      {
        id: 'browse-2',
        name: '2nd Browse Reminder',
        subject: 'These are going fast ⚡',
        previewText: "Don't miss out on your favorites",
        from: 'Fluxmail <contact@fluxmail.com>',
        heroColor: '#1d4ed8',
        heading: 'Going Fast!',
        body: 'The products you viewed are popular and selling quickly. Grab them before they are gone.',
        cta: 'Shop Now',
      },
    ],
  },
  {
    name: 'Abandoned Checkout',
    emails: [
      {
        id: 'checkout-1',
        name: '1st Checkout Reminder',
        subject: 'You left items in your cart 🛒',
        previewText: 'Complete your purchase',
        from: 'Fluxmail <contact@fluxmail.com>',
        heroColor: '#dc2626',
        heading: 'Complete Your Order',
        body: "You're so close! Your cart is saved and ready for checkout.",
        cta: 'Return to Cart',
      },
      {
        id: 'checkout-2',
        name: '2nd Checkout Reminder',
        subject: "Don't forget your cart! 💫",
        previewText: 'Your items are waiting',
        from: 'Fluxmail <contact@fluxmail.com>',
        heroColor: '#b91c1c',
        heading: 'Your Cart Misses You',
        body: 'Your items are reserved but not for long. Complete your purchase today.',
        cta: 'Finish Checkout',
      },
      {
        id: 'checkout-3',
        name: '3rd Checkout - Discount',
        subject: 'Special offer on your cart items 🎉',
        previewText: 'Get 5% off to complete your order',
        from: 'Fluxmail <contact@fluxmail.com>',
        heroColor: '#991b1b',
        heading: 'Here\'s a Little Extra',
        body: "We really want you to have these items. Here's an exclusive 5% off to help you decide.",
        cta: 'Get 5% Off Your Cart',
        ctaCode: 'FW-CART5',
      },
    ],
  },
  {
    name: 'Thank You',
    emails: [
      {
        id: 'thankyou-1',
        name: 'Order Confirmation',
        subject: 'Thank you for your order! 🙏',
        previewText: 'Your order has been confirmed',
        from: 'Fluxmail <contact@fluxmail.com>',
        heroColor: '#059669',
        heading: 'Thank You!',
        body: 'Your order has been confirmed and is being prepared. We appreciate your business!',
        cta: 'Track Your Order',
      },
      {
        id: 'thankyou-2',
        name: 'Review Request',
        subject: 'How was your experience? ⭐',
        previewText: 'We\'d love your feedback',
        from: 'Fluxmail <contact@fluxmail.com>',
        heroColor: '#047857',
        heading: 'Share Your Experience',
        body: 'We hope you are loving your purchase! Your review helps other customers and helps us improve.',
        cta: 'Leave a Review',
      },
    ],
  },
  {
    name: 'Winback Email',
    emails: [
      {
        id: 'winback-1',
        name: '1st Winback Email',
        subject: 'We miss you! 💜',
        previewText: 'It\'s been a while',
        from: 'Fluxmail <contact@fluxmail.com>',
        heroColor: '#9333ea',
        heading: 'We Miss You!',
        body: "It's been a while since your last visit. We've got new arrivals we think you'll love.",
        cta: "See What's New",
      },
      {
        id: 'winback-2',
        name: '2nd Winback Email',
        subject: 'A special gift just for you 🎁',
        previewText: 'Exclusive discount inside',
        from: 'Fluxmail <contact@fluxmail.com>',
        heroColor: '#7e22ce',
        heading: 'Welcome Back Gift',
        body: "We'd love to see you again. Here's an exclusive 15% off to welcome you back.",
        cta: 'Get 15% Off',
        ctaCode: 'FW-BACK15',
      },
      {
        id: 'winback-3',
        name: '3rd Winback - Last Chance',
        subject: 'Last chance for your discount ⏰',
        previewText: 'Your 15% off expires tomorrow',
        from: 'Fluxmail <contact@fluxmail.com>',
        heroColor: '#6b21a8',
        heading: 'Last Chance!',
        body: 'Your exclusive 15% discount expires tomorrow. This is your final reminder!',
        cta: 'Use Your Discount',
        ctaCode: 'FW-BACK15',
      },
    ],
  },
  {
    name: 'Pop-up',
    emails: [
      {
        id: 'popup-1',
        name: 'Welcome Pop-up',
        subject: 'Pop-up Configuration',
        previewText: 'Shown to new visitors',
        from: 'System',
        heroColor: '#1E40AF',
        heading: 'Get 10% Off',
        body: 'Sign up for our newsletter and get 10% off your first order. Join thousands of happy customers!',
        cta: 'Subscribe & Save',
        ctaCode: 'FW-POPUP10',
      },
      {
        id: 'popup-2',
        name: 'Exit Intent Pop-up',
        subject: 'Exit Intent Configuration',
        previewText: 'Shown when user tries to leave',
        from: 'System',
        heroColor: '#dc2626',
        heading: 'Wait! Before You Go...',
        body: "Don't leave empty-handed! Get a special discount just for you.",
        cta: 'Claim My Discount',
        ctaCode: 'FW-EXIT10',
      },
    ],
  },
]

const triggerInfo: Record<string, { addedWhen: string; removedWhen: string }> = {
  'Welcome Flow': {
    addedWhen: 'Valid email entered in popup form',
    removedWhen: 'Places order or was in flow last 7 days',
  },
  'Browse Abandonment': {
    addedWhen: 'User views a product page without adding to cart',
    removedWhen: 'Adds item to cart or places order',
  },
  'Abandoned Checkout': {
    addedWhen: 'User starts checkout but does not complete',
    removedWhen: 'Completes purchase or was in flow last 3 days',
  },
  'Thank You': {
    addedWhen: 'Customer places an order',
    removedWhen: 'N/A — single sequence per order',
  },
  'Winback Email': {
    addedWhen: 'Customer inactive for 60+ days',
    removedWhen: 'Places a new order or was in flow last 30 days',
  },
  'Pop-up': {
    addedWhen: 'New visitor lands on storefront',
    removedWhen: 'Submits email or closes popup',
  },
}

const emailDelays: Record<string, string> = {
  'welcome-1': 'On trigger',
  'welcome-2': '48 hour(s) from previous',
  'welcome-3': '72 hour(s) from previous',
  'browse-1': '1 hour(s) from trigger',
  'browse-2': '24 hour(s) from previous',
  'checkout-1': '1 hour(s) from trigger',
  'checkout-2': '24 hour(s) from previous',
  'checkout-3': '48 hour(s) from previous',
  'thankyou-1': 'On trigger',
  'thankyou-2': '7 day(s) from previous',
  'winback-1': 'On trigger',
  'winback-2': '3 day(s) from previous',
  'winback-3': '7 day(s) from previous',
  'popup-1': 'On trigger',
  'popup-2': 'On exit intent',
}

export default function FlowEditorPage() {
  const [expandedFlow, setExpandedFlow] = useState<string>('Welcome Flow')
  const [selectedEmail, setSelectedEmail] = useState<FlowEmail>(flows[0].emails[0])
  const [onlyNewContacts, setOnlyNewContacts] = useState(true)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [showSubjectEditor, setShowSubjectEditor] = useState(false)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)

  const toggleFlow = (flowName: string) => {
    setExpandedFlow(expandedFlow === flowName ? '' : flowName)
  }

  const selectEmail = (email: FlowEmail) => {
    setSelectedEmail(email)
  }

  const currentTrigger = triggerInfo[expandedFlow] || triggerInfo['Welcome Flow']

  const handleSendTestEmail = async () => {
    const email = prompt('Enter your email address to receive the test:')
    if (!email) return

    try {
      const res = await fetch('/api/flow-emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: selectedEmail.subject,
          html: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif"><div style="text-align:center;padding:24px;border-bottom:1px solid #eee"><strong style="font-size:20px;color:#1E40AF">Fluxmail</strong></div><div style="padding:48px 32px;text-align:center;background:${selectedEmail.heroColor}"><h1 style="color:white;margin:0 0 12px">${selectedEmail.heading}</h1><p style="color:rgba(255,255,255,0.9);font-size:14px">${selectedEmail.body}</p></div><div style="padding:32px;text-align:center"><p style="font-size:14px;color:#374151">${selectedEmail.cta}</p>${selectedEmail.ctaCode ? `<div style="display:inline-block;border:2px dashed #93c5fd;border-radius:8px;padding:12px 24px;margin:16px 0;background:#eff6ff"><p style="font-size:10px;color:#6b7280;text-transform:uppercase;margin:0 0 4px">Use Code</p><p style="font-size:18px;font-weight:bold;color:#1E40AF;letter-spacing:2px;margin:0">${selectedEmail.ctaCode}</p></div>` : ''}<br><a href="#" style="display:inline-block;padding:12px 32px;background:${selectedEmail.heroColor};color:white;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">${selectedEmail.ctaCode ? 'Shop Now' : selectedEmail.cta}</a></div><div style="padding:16px;text-align:center;background:#f9fafb;border-top:1px solid #f3f4f6"><p style="font-size:11px;color:#9ca3af;margin:0">Sent via Fluxmail</p></div></div>`,
        }),
      })
      if (res.ok) {
        alert(`Test email sent to ${email}!`)
      } else {
        const data = await res.json()
        alert(`Failed: ${data.error}`)
      }
    } catch (error) {
      alert('Failed to send test email')
    }
  }

  return (
    <div className="flex h-[calc(100vh-0px)] bg-gray-50">
      {/* Left Panel - Flow Selector */}
      <div className="w-[35%] border-r border-gray-200 bg-white overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Flow Editor</h2>
          <p className="text-xs text-gray-500 mt-1">View and edit your flows, emails, and pop-ups.</p>
        </div>

        {/* Flow Accordion */}
        <div className="divide-y divide-gray-100">
          {flows.map((flow) => (
            <div key={flow.name}>
              {/* Flow Header */}
              <button
                onClick={() => toggleFlow(flow.name)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform ${expandedFlow === flow.name ? 'rotate-90' : ''}`}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">{flow.name}</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {flow.emails.length} of {flow.emails.length}
                </span>
              </button>

              {/* Flow Emails */}
              {expandedFlow === flow.name && (
                <div className="bg-gray-50 border-t border-gray-100">
                  {flow.emails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => selectEmail(email)}
                      className={`w-full flex items-center justify-between px-5 pl-12 py-3 text-left transition-colors ${
                        selectedEmail.id === email.id
                          ? 'bg-blue-50 border-l-2 border-blue-600'
                          : 'hover:bg-gray-100 border-l-2 border-transparent'
                      }`}
                    >
                      <div>
                        <span className={`text-sm ${selectedEmail.id === email.id ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                          {email.name}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">Delay: {emailDelays[email.id] || 'On trigger'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700">
                          <span className="w-1 h-1 rounded-full bg-green-500"></span>
                          Active
                        </span>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Triggers & Funnel */}
        <div className="border-t border-gray-200 mt-2">
          <div className="px-5 py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Triggers &amp; Funnel</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">User added to funnel when</p>
                <p className="text-sm text-gray-800">{currentTrigger.addedWhen}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">User removed when</p>
                <p className="text-sm text-gray-800">{currentTrigger.removedWhen}</p>
              </div>
              <label className="flex items-center gap-2 px-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyNewContacts}
                  onChange={(e) => setOnlyNewContacts(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Only send to new contacts</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Email Preview */}
      <div className="w-[65%] overflow-y-auto p-6">
        {/* Email Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">{selectedEmail.name}</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Active
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
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 py-1">
                  <button
                    onClick={() => { setShowEditMenu(false); setShowSubjectEditor(true) }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Subject Line &amp; Preview Text
                  </button>
                  <button
                    onClick={() => { setShowEditMenu(false); setShowTemplateEditor(true) }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Edit Email Template
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => { setShowEditMenu(false); handleSendTestEmail() }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
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

        {/* Email Meta */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6 shadow-sm">
          <div className="divide-y divide-gray-100">
            <div className="flex px-5 py-3">
              <span className="text-sm text-gray-500 w-28">From</span>
              <span className="text-sm text-gray-700">{selectedEmail.from}</span>
            </div>
            <div className="flex px-5 py-3">
              <span className="text-sm text-gray-500 w-28">Subject Line</span>
              <span className="text-sm font-semibold text-gray-900">{selectedEmail.subject}</span>
            </div>
            <div className="flex px-5 py-3">
              <span className="text-sm text-gray-500 w-28">Preview Text</span>
              <span className="text-sm text-gray-500 italic">{selectedEmail.previewText}</span>
            </div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Preview</span>
          </div>
          <div className="p-8 flex justify-center">
            <div className="w-full max-w-[500px] border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* Logo Area */}
              <div className="bg-white px-8 py-6 text-center border-b border-gray-100">
                <span className="text-xl font-bold text-blue-700">Fluxmail</span>
              </div>

              {/* Hero Section */}
              <div
                className="px-8 py-12 text-center"
                style={{ backgroundColor: selectedEmail.heroColor }}
              >
                <h1 className="text-2xl font-bold text-white mb-3">{selectedEmail.heading}</h1>
                <p className="text-white/90 text-sm leading-relaxed max-w-sm mx-auto">
                  {selectedEmail.body}
                </p>
              </div>

              {/* CTA Section */}
              <div className="bg-white px-8 py-8 text-center">
                <p className="text-gray-700 text-sm font-medium mb-4">{selectedEmail.cta}</p>
                {selectedEmail.ctaCode && (
                  <div className="mb-6">
                    <div className="inline-block border-2 border-dashed border-blue-300 rounded-lg px-6 py-3 bg-blue-50">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Use Code</p>
                      <p className="text-lg font-bold text-blue-700 tracking-widest">{selectedEmail.ctaCode}</p>
                    </div>
                  </div>
                )}
                <button
                  className="inline-block px-8 py-3 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: selectedEmail.heroColor }}
                >
                  {selectedEmail.ctaCode ? 'Shop Now' : selectedEmail.cta}
                </button>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
                <p className="text-[11px] text-gray-400">
                  Sent via Fluxmail · Unsubscribe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Line Editor Modal */}
      {showSubjectEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Edit Subject Line &amp; Preview Text</h2>
              <button onClick={() => setShowSubjectEditor(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Subject Line</label>
                <input
                  type="text"
                  defaultValue={selectedEmail.subject}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter subject line..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Preview Text</label>
                <input
                  type="text"
                  defaultValue={selectedEmail.previewText}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter preview text..."
                />
                <p className="text-xs text-gray-400 mt-1">Shown in inbox before opening the email</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowSubjectEditor(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowSubjectEditor(false)} className="px-4 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Edit Email Template</h2>
              <button onClick={() => setShowTemplateEditor(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Heading</label>
                <input type="text" defaultValue={selectedEmail.heading} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Body Text</label>
                <textarea defaultValue={selectedEmail.body} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">CTA Button Text</label>
                <input type="text" defaultValue={selectedEmail.cta} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              {selectedEmail.ctaCode && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Discount Code</label>
                  <input type="text" defaultValue={selectedEmail.ctaCode} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Hero Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" defaultValue={selectedEmail.heroColor} className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5" />
                  <input type="text" defaultValue={selectedEmail.heroColor} className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowTemplateEditor(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowTemplateEditor(false)} className="px-4 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
