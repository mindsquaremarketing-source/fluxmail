import { prisma } from './db'

let cachedStore: any = null
let cacheTime = 0
const CACHE_DURATION = 60 * 1000 // 1 minute

export async function getStore() {
  const now = Date.now()
  if (cachedStore && (now - cacheTime) < CACHE_DURATION) {
    return cachedStore
  }

  cachedStore = await prisma.store.findFirst({
    orderBy: { createdAt: 'desc' }
  })
  cacheTime = now
  return cachedStore
}

export function invalidateStoreCache() {
  cachedStore = null
  cacheTime = 0
}
