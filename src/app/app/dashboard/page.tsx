export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import SyncButton from './sync-button'

interface Props {
  searchParams: { [key: string]: string | undefined }
}

export default async function Dashboard({ searchParams }: Props) {
  const shop = searchParams?.shop

  let store = null
  let contactCount = 0

  if (shop) {
    store = await prisma.store.findUnique({
      where: { shopDomain: shop }
    })

    if (store) {
      contactCount = await prisma.contact.count({
        where: { storeId: store.id }
      })
    }
  }

  // If no shop in URL, get the most recently created store
  if (!store) {
    store = await prisma.store.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    if (store) {
      contactCount = await prisma.contact.count({
        where: { storeId: store.id }
      })
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>Welcome to Fluxmail</h1>
      <p style={{ color: '#666' }}>
        {store ? `Connected: ${store.shopDomain}` : 'No store connected'}
      </p>
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', margin: '20px 0', maxWidth: '300px' }}>
        <p style={{ margin: 0, color: '#666' }}>Total Contacts</p>
        <h2 style={{ margin: '8px 0 0 0', fontSize: '48px' }}>{contactCount}</h2>
      </div>
      {store && <SyncButton shopDomain={store.shopDomain} />}
    </div>
  )
}
