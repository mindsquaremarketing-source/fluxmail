import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
  from,
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  const { data, error } = await resend.emails.send({
    from: from || 'Fluxmail <hello@tryfluxmail.com>',
    to,
    subject,
    html,
  })

  if (error) throw new Error(error.message)
  return data
}

export async function sendCampaign({
  campaignId,
  storeId,
}: {
  campaignId: string
  storeId: string
}) {
  const { prisma } = await import('./db')

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId }
  })

  if (!campaign) throw new Error('Campaign not found')

  const contacts = await prisma.contact.findMany({
    where: {
      storeId,
      status: 'subscribed'
    }
  })

  let sent = 0
  for (const contact of contacts) {
    try {
      await sendEmail({
        to: contact.email,
        subject: campaign.subject,
        html: campaign.htmlContent,
      })
      sent++
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Failed to send to ${contact.email}:`, error)
    }
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'sent',
      emailsSent: sent,
    }
  })

  return { sent }
}
