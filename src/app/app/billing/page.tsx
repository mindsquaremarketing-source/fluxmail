'use client'

import { useState } from 'react'
import { useApp } from '@/lib/app-context'

const PLANS = [
  { name: 'STARTER',    price: 7.99,   contacts: 500 },
  { name: 'BASIC',      price: 9.99,   contacts: 1000 },
  { name: 'PRO',        price: 14.99,  contacts: 2500 },
  { name: 'BUSINESS',   price: 24.99,  contacts: 5000 },
  { name: 'GROWTH',     price: 39.99,  contacts: 10000,  popular: true },
  { name: 'ADVANCED',   price: 59.99,  contacts: 25000 },
  { name: 'PREMIUM',    price: 89.99,  contacts: 50000 },
  { name: 'ENTERPRISE', price: 139.99, contacts: 100000 },
  { name: 'SCALE',      price: 224.99, contacts: 200000 },
]

const FEATURES = [
  'AI Campaign Generation',
  'Automated Flow Emails',
  'Email Tracking & Analytics',
  'Brand Customization',
  'Unlimited Campaigns',
  '30-Day Free Trial',
]

function formatContacts(n: number) {
  return n >= 1000 ? `${(n / 1000).toLocaleString()}k` : n.toLocaleString()
}

export default function BillingPage() {
  const { state } = useApp()
  const [loading, setLoading] = useState<string | null>(null)
  const currentPlan = state.store?.plan

  const handleSelectPlan = async (planName: string) => {
    setLoading(planName)
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName,
          shop: state.store?.shopDomain,
        }),
      })
      const data = await res.json()
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl
      } else {
        alert(data.error || 'Failed to create subscription')
        setLoading(null)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Simple Pricing, Half the Price of Competitors
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          30-day free trial on all plans. No credit card required to start.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.name
          const isPopular = plan.popular
          const isLoading = loading === plan.name

          return (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-sm border-2 p-6 flex flex-col transition-all ${
                isPopular
                  ? 'border-blue-700 ring-1 ring-blue-700'
                  : isCurrent
                  ? 'border-green-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Badges */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              {/* Plan Info */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 text-sm">/mo</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  Up to {formatContacts(plan.contacts)} contacts
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan.name)}
                disabled={isCurrent || isLoading}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                  isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isPopular
                    ? 'bg-blue-700 text-white hover:bg-blue-800'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : isCurrent ? (
                  'Current Plan'
                ) : (
                  'Start Free Trial'
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
