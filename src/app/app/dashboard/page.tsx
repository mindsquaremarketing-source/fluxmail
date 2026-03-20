export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { SyncButton } from './sync-button'

interface Props {
  searchParams: { [key: string]: string | undefined }
}

export default async function Dashboard({ searchParams }: Props) {
  const shop = searchParams?.shop || ''

  let contactCount = 0
  let storeDomain = shop

  if (shop) {
    const store = await prisma.store.findUnique({
      where: { shopDomain: shop },
      include: { _count: { select: { contacts: true } } },
    })

    if (store) {
      contactCount = store._count.contacts
      storeDomain = store.shopDomain
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome to Fluxmail</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        {storeDomain ? `Connected to ${storeDomain}` : 'No store connected'}
      </p>

      <div style={{
        background: '#f5f5f5',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <p style={{ fontSize: '14px', color: '#888', margin: '0 0 4px 0' }}>Total Contacts</p>
        <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{contactCount}</p>
      </div>

      <SyncButton shop={storeDomain} />
    </div>
  )
}
