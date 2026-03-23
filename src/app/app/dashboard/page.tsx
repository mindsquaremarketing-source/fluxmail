export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import DashboardClient from './DashboardClient'

export default async function Dashboard() {
  const store = await prisma.store.findFirst({
    orderBy: { createdAt: 'desc' }
  })

  if (!store) {
    return (
      <div className="p-8 text-center text-gray-500">
        No store connected. Please reinstall the app.
      </div>
    )
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Parallel queries for speed
  const [campaigns, totalContacts, subscribedContacts, recentContacts] = await Promise.all([
    prisma.campaign.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.contact.count({
      where: { storeId: store.id }
    }),
    prisma.contact.count({
      where: { storeId: store.id, status: 'subscribed' }
    }),
    prisma.contact.count({
      where: {
        storeId: store.id,
        addedAt: { gte: thirtyDaysAgo }
      }
    }),
  ])

  // Calculate real stats from campaigns
  const sentCampaigns = campaigns.filter(c => c.status === 'sent')

  const totalEmailsSent = sentCampaigns.reduce(
    (sum, c) => sum + (c.emailsSent || 0), 0
  )

  const totalRevenue = sentCampaigns.reduce(
    (sum, c) => sum + (Number(c.revenue) || 0), 0
  )

  const totalOpens = sentCampaigns.reduce(
    (sum, c) => sum + (c.opens || 0), 0
  )

  const totalClicks = sentCampaigns.reduce(
    (sum, c) => sum + (c.clicks || 0), 0
  )

  const totalOrders = sentCampaigns.reduce(
    (sum, c) => sum + (c.placedOrders || 0), 0
  )

  const openRate = totalEmailsSent > 0 ? ((totalOpens / totalEmailsSent) * 100).toFixed(1) : '0'
  const clickRate = totalEmailsSent > 0 ? ((totalClicks / totalEmailsSent) * 100).toFixed(1) : '0'

  const revenuePerRecipient = totalEmailsSent > 0
    ? totalRevenue / totalEmailsSent
    : 0

  const roi = totalRevenue > 0 ? ((totalRevenue / 29) * 100) : 0

  // Flow stats (static for now)
  const flows = [
    { name: 'Welcome Flow', emailsSent: totalEmailsSent > 0 ? Math.floor(totalEmailsSent * 0.4) : 0, openRate: 19, clickRate: 2, conversions: 0, convValue: 0, status: 'active' },
    { name: 'Browse Abandonment', emailsSent: 0, openRate: 0, clickRate: 0, conversions: 0, convValue: 0, status: 'active' },
    { name: 'Abandoned Checkout', emailsSent: 0, openRate: 0, clickRate: 0, conversions: 0, convValue: 0, status: 'active' },
    { name: 'Thank You', emailsSent: 0, openRate: 0, clickRate: 0, conversions: 0, convValue: 0, status: 'active' },
    { name: 'Winback Flow', emailsSent: 0, openRate: 0, clickRate: 0, conversions: 0, convValue: 0, status: 'active' },
  ]

  const stats = {
    revenue: totalRevenue,
    emailsCollected: subscribedContacts,
    emailsSent: totalEmailsSent,
    conversions: totalOrders,
    revenuePerRecipient,
    roi,
    totalContacts,
    recentContacts,
    openRate,
    clickRate,
  }

  return (
    <DashboardClient
      stats={stats}
      campaigns={campaigns.slice(0, 8)}
      flows={flows}
      shopDomain={store.shopDomain}
    />
  )
}
