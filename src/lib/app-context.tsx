'use client'
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'

interface AppState {
  store: any
  campaigns: any[]
  contacts: any[]
  products: any[]
  stats: any
  loaded: boolean
  lastFetch: number
}

interface AppContextType {
  state: AppState
  refreshCampaigns: () => Promise<void>
  refreshContacts: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

const CACHE_MS = 5 * 60 * 1000

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    store: null,
    campaigns: [],
    contacts: [],
    products: [],
    stats: null,
    loaded: false,
    lastFetch: 0,
  })
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const now = Date.now()
    if (state.loaded && (now - state.lastFetch) < CACHE_MS) return

    try {
      const [settingsRes, campaignsRes, contactsRes, productsRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/campaigns'),
        fetch('/api/contacts'),
        fetch('/api/products'),
      ])

      const [settingsData, campaignsData, contactsData, productsData] = await Promise.all([
        settingsRes.json(),
        campaignsRes.json(),
        contactsRes.json(),
        productsRes.json(),
      ])

      const campaigns = campaignsData.campaigns || []
      const contacts = contactsData.contacts || []
      const store = settingsData.store

      const sentCampaigns = campaigns.filter((c: any) => c.status === 'sent')
      const totalEmailsSent = sentCampaigns.reduce((sum: number, c: any) => sum + (c.emailsSent || 0), 0)
      const totalRevenue = sentCampaigns.reduce((sum: number, c: any) => sum + (Number(c.revenue) || 0), 0)

      setState({
        store,
        campaigns,
        contacts,
        products: productsData.products || [],
        stats: {
          revenue: totalRevenue,
          emailsCollected: contacts.filter((c: any) => c.status === 'subscribed').length,
          emailsSent: totalEmailsSent,
          conversions: sentCampaigns.reduce((sum: number, c: any) => sum + (c.placedOrders || 0), 0),
          totalContacts: contacts.length,
          revenuePerRecipient: totalEmailsSent > 0 ? totalRevenue / totalEmailsSent : 0,
        },
        loaded: true,
        lastFetch: now,
      })
    } catch (e) {
      console.error('AppProvider fetch failed:', e)
    }
  }

  const refreshCampaigns = async () => {
    const res = await fetch('/api/campaigns')
    const data = await res.json()
    setState(prev => ({ ...prev, campaigns: data.campaigns || [] }))
  }

  const refreshContacts = async () => {
    const res = await fetch('/api/contacts')
    const data = await res.json()
    setState(prev => ({ ...prev, contacts: data.contacts || [] }))
  }

  return (
    <AppContext.Provider value={{ state, refreshCampaigns, refreshContacts }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
