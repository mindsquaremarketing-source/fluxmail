'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [expandedFlow, setExpandedFlow] = useState<string>('Welcome Flow')
  const [selectedEmail, setSelectedEmail] = useState<FlowEmail>(flows[0].emails[0])
  const [onlyNewContacts, setOnlyNewContacts] = useState(true)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [showSubjectEditor, setShowSubjectEditor] = useState(false)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [showTestEmailModal, setShowTestEmailModal] = useState(false)
  const [testEmailAddress, setTestEmailAddress] = useState('')
  const [testEmailSending, setTestEmailSending] = useState(false)
  const [testEmailSuccess, setTestEmailSuccess] = useState(false)
  const [testEmailError, setTestEmailError] = useState('')

  const toggleFlow = (flowName: string) => {
    setExpandedFlow(expandedFlow === flowName ? '' : flowName)
  }

  const selectEmail = (email: FlowEmail) => {
    setSelectedEmail(email)
  }

  const currentTrigger = triggerInfo[expandedFlow] || triggerInfo['Welcome Flow']

  const handleSendTestEmail = () => {
    setShowEditMenu(false)
    setTestEmailSuccess(false)
    setTestEmailError('')
    setTestEmailAddress('')
    setShowTestEmailModal(true)
  }

  const handleSubmitTestEmail = async () => {
    if (!testEmailAddress) {
      setTestEmailError('Please enter an email address')
      return
    }
    if (!testEmailAddress.includes('@')) {
      setTestEmailError('Please enter a valid email address')
      return
    }

    setTestEmailSending(true)
    setTestEmailError('')

    try {
      const res = await fetch('/api/flow-emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmailAddress,
          subject: 'Test: Welcome Email from Fluxmail',
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background:#1E40AF;padding:32px 40px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Fluxmail</h1><p style="color:#93C5FD;margin:8px 0 0;font-size:15px;">Your email marketing partner</p></td></tr><tr><td style="padding:48px 48px 32px;text-align:center;"><div style="width:80px;height:80px;background:#EFF6FF;border-radius:50%;display:inline-block;line-height:80px;margin-bottom:24px;font-size:36px;">&#127881;</div><h2 style="color:#111827;font-size:32px;font-weight:900;margin:0 0 16px;line-height:1.2;">Welcome to Fluxmail!</h2><p style="color:#6B7280;font-size:16px;line-height:1.7;margin:0 0 32px;">Thank you for joining us! We are thrilled to have you on board.<br>As a welcome gift, here is an exclusive offer just for you.</p><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#EFF6FF;border:2px dashed #1E40AF;border-radius:16px;padding:28px;text-align:center;"><p style="color:#1E40AF;font-size:13px;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:2px;">Your Welcome Gift</p><p style="color:#111827;font-size:40px;font-weight:900;margin:0 0 4px;letter-spacing:4px;">10% OFF</p><p style="color:#6B7280;font-size:14px;margin:0 0 16px;">Use this code at checkout:</p><div style="background:#1E40AF;color:#fff;display:inline-block;padding:12px 32px;border-radius:8px;font-size:20px;font-weight:900;letter-spacing:3px;">FW-WELCOME10</div></td></tr></table><div style="margin-top:32px;"><a href="#" style="display:inline-block;background:#1E40AF;color:#fff;padding:18px 56px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;letter-spacing:0.5px;box-shadow:0 8px 24px rgba(30,64,175,0.3);">Shop Now & Save</a></div></td></tr><tr><td style="background:#F9FAFB;padding:32px 48px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="33%" style="text-align:center;padding:0 12px;"><div style="font-size:28px;margin-bottom:8px;">&#128666;</div><p style="color:#111827;font-weight:700;font-size:13px;margin:0 0 4px;">Free Shipping</p><p style="color:#9CA3AF;font-size:12px;margin:0;">Orders over $50</p></td><td width="33%" style="text-align:center;padding:0 12px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;"><div style="font-size:28px;margin-bottom:8px;">&#8617;&#65039;</div><p style="color:#111827;font-weight:700;font-size:13px;margin:0 0 4px;">Easy Returns</p><p style="color:#9CA3AF;font-size:12px;margin:0;">30-day policy</p></td><td width="33%" style="text-align:center;padding:0 12px;"><div style="font-size:28px;margin-bottom:8px;">&#128172;</div><p style="color:#111827;font-weight:700;font-size:13px;margin:0 0 4px;">24/7 Support</p><p style="color:#9CA3AF;font-size:12px;margin:0;">Always here to help</p></td></tr></table></td></tr><tr><td style="background:#111827;padding:32px 48px;text-align:center;"><p style="color:#fff;font-weight:700;font-size:16px;margin:0 0 8px;">Fluxmail</p><p style="color:#9CA3AF;font-size:12px;line-height:1.6;margin:0 0 16px;">You are receiving this because you signed up for updates.<br>We respect your privacy.</p><a href="#" style="color:#9CA3AF;font-size:12px;text-decoration:underline;">Unsubscribe</a></td></tr></table></td></tr></table></body></html>`,
        }),
      })

      if (res.ok) {
        setTestEmailSuccess(true)
        setTestEmailSending(false)
      } else {
        const data = await res.json()
        setTestEmailError(data.error || 'Failed to send test email')
        setTestEmailSending(false)
      }
    } catch (err: any) {
      setTestEmailError(err.message)
      setTestEmailSending(false)
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
                    onClick={() => { setShowEditMenu(false); router.push('/app/flow-editor/email-editor') }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Edit Email Template
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={handleSendTestEmail}
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

      {/* Send Test Email Modal */}
      {showTestEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={() => !testEmailSending && setShowTestEmailModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all">
            {/* Header */}
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
                    <p className="text-blue-200 text-xs mt-0.5">Preview how your email looks in inbox</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTestEmailModal(false)}
                  disabled={testEmailSending}
                  className="w-8 h-8 flex items-center justify-center text-white text-opacity-70 hover:text-opacity-100 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                >
                  &#10005;
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {!testEmailSuccess ? (
                <>
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={testEmailAddress}
                        onChange={(e) => {
                          setTestEmailAddress(e.target.value)
                          setTestEmailError('')
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitTestEmail()}
                        placeholder="you@example.com"
                        autoFocus
                        disabled={testEmailSending}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm transition-all outline-none ${
                          testEmailError
                            ? 'border-red-300 bg-red-50 focus:border-red-400'
                            : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                        } disabled:opacity-50`}
                      />
                    </div>

                    {testEmailError && (
                      <div className="flex items-center gap-2 mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-500 text-xs">{testEmailError}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3 bg-blue-50 rounded-lg px-3 py-2.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-blue-600 text-xs">The email will be sent from your sender domain</p>
                    </div>
                  </div>

                  {/* Footer buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowTestEmailModal(false)}
                      disabled={testEmailSending}
                      className="flex-1 px-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSubmitTestEmail}
                      disabled={testEmailSending || !testEmailAddress}
                      className="flex-1 px-4 py-3 text-sm font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                    >
                      {testEmailSending ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                /* Success State */
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Email Sent!</h3>
                  <p className="text-gray-500 text-sm mb-1">We sent a test email to:</p>
                  <p className="text-blue-700 font-semibold text-sm mb-5">{testEmailAddress}</p>
                  <p className="text-gray-400 text-xs mb-6">
                    Check your inbox — it may take a minute to arrive. Don&apos;t forget to check your spam folder.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setTestEmailSuccess(false)
                        setTestEmailAddress('')
                      }}
                      className="flex-1 px-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      Send Another
                    </button>
                    <button
                      onClick={() => setShowTestEmailModal(false)}
                      className="flex-1 px-4 py-3 text-sm font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-200"
                    >
                      Done
                    </button>
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
