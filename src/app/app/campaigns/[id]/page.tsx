export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'
import CampaignDetail from './CampaignDetail'

export default async function CampaignPage({
  params
}: {
  params: { id: string }
}) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id }
  })

  if (!campaign) {
    return <div className="p-8">Campaign not found</div>
  }

  return <CampaignDetail campaign={JSON.parse(JSON.stringify(campaign))} />
}
