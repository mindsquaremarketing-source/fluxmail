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
  lastContactSync: number
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
    lastContactSync: 0,
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

      let campaigns = campaignsData.campaigns || []
      let contacts = contactsData.contacts || []
      let store = settingsData.store

      // Auto sync branding if companyName is empty
      if (store && !store.companyName) {
        try {
          await fetch('/api/sync/branding', { method: 'POST' })
          const refreshed = await fetch('/api/settings')
          const refreshedData = await refreshed.json()
          if (refreshedData.store) store = refreshedData.store
        } catch {}
      }

      // Auto sync contacts if none exist
      let contactSyncTime = 0
      if (contacts.length === 0 && store?.shopDomain) {
        try {
          await fetch('/api/sync/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shop: store.shopDomain })
          })
          const refreshed = await fetch('/api/contacts')
          const refreshedData = await refreshed.json()
          contacts = refreshedData.contacts || []
          contactSyncTime = now
        } catch {}
      }

      const sentCampaigns = campaigns.filter((c: any) => c.status === 'sent')
      const totalEmailsSent = sentCampaigns.reduce((sum: number, c: any) => sum + (c.emailsSent || 0), 0)
      const totalRevenue = sentCampaigns.reduce((sum: number, c: any) => sum + (Number(c.revenue) || 0), 0)
      const totalOpens = sentCampaigns.reduce((sum: number, c: any) => sum + (c.opens || 0), 0)
      const totalClicks = sentCampaigns.reduce((sum: number, c: any) => sum + (c.clicks || 0), 0)

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
          openRate: totalEmailsSent > 0 ? ((totalOpens / totalEmailsSent) * 100).toFixed(1) : '0',
          clickRate: totalEmailsSent > 0 ? ((totalClicks / totalEmailsSent) * 100).toFixed(1) : '0',
        },
        loaded: true,
        lastFetch: now,
        lastContactSync: contactSyncTime || now,
      })
    } catch (e) {
      console.error('AppProvider fetch failed:', e)
    }
  }

  const refreshCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
      const data = await res.json()
      setState(prev => ({ ...prev, campaigns: data.campaigns || [] }))
    } catch (e) {
      console.error('Refresh campaigns failed:', e)
    }
  }

  const refreshContacts = async () => {
    try {
      const res = await fetch('/api/contacts', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
      const data = await res.json()
      setState(prev => ({ ...prev, contacts: data.contacts || [], lastContactSync: Date.now() }))
    } catch {}
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
