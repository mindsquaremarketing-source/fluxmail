'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppProvider, useApp } from '@/lib/app-context'

const navItems = [
  { name: 'Dashboard', href: '/app/dashboard', icon: DashboardIcon },
  { name: 'Flow Editor', href: '/app/flow-editor', icon: FlowIcon },
  { name: 'Campaigns', href: '/app/campaigns', icon: CampaignIcon },
  { name: 'Brand & Settings', href: '/app/settings', icon: SettingsIcon },
  { name: 'Contacts', href: '/app/contacts', icon: ContactsIcon },
  { name: 'Popup', href: '/app/popup', icon: PopupIcon },
  { name: 'Billing', href: '/app/billing', icon: BillingIcon },
]

function TrialBanner() {
  const { state } = useApp()
  const store = state.store
  const billingStatus = store?.billingStatus

  // Show banner when on trial OR when billingStatus is null (pre-existing stores)
  if (!store || (billingStatus && billingStatus !== 'trial')) return null

  const trialStart = store.trialStartDate ? new Date(store.trialStartDate) : new Date()
  const now = new Date()
  const daysSinceStart = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = Math.max(0, 30 - daysSinceStart)

  return (
    <div className="w-full bg-blue-600 text-white px-4 py-2 flex items-center justify-between text-sm z-50">
      <span>
        🎉 You are on a 30-day free trial — {daysRemaining} days remaining
      </span>
      <a
        href="/app/billing"
        className="bg-white text-blue-600 px-3 py-1 rounded-lg font-semibold text-xs"
      >
        Choose Plan
      </a>
    </div>
  )
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <TrialBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-56' : 'w-16'}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            {sidebarOpen && (
              <span className="font-bold text-blue-700 text-lg">Fluxmail</span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-3 space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  title={!sidebarOpen ? item.name : ''}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } ${!sidebarOpen ? 'justify-center' : ''}`}
                >
                  <span className="flex-shrink-0"><item.icon active={isActive} /></span>
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </AppProvider>
  )
}

function DashboardIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#1E40AF' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function FlowIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#1E40AF' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function CampaignIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#1E40AF' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function SettingsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#1E40AF' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function ContactsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#1E40AF' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function PopupIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#1E40AF' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v12H5.17L4 17.17V4z" /><path d="M12 8v1" /><path d="M12 12h.01" />
    </svg>
  )
}

function BillingIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#1E40AF' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

