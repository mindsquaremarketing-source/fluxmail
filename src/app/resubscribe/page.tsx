export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'

export default async function ResubscribePage({
  searchParams
}: {
  searchParams: { email?: string; store?: string }
}) {
  const { email, store } = searchParams
  let resubscribed = false

  if (email && store) {
    try {
      await prisma.contact.updateMany({
        where: {
          email: decodeURIComponent(email),
          store: { shopDomain: store }
        },
        data: { status: 'subscribed' }
      })
      resubscribed = true
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        {resubscribed ? (
          <>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>&#127881;</div>
            <h1 style={{ color: '#111827', fontSize: '24px', fontWeight: '800', margin: '0 0 12px' }}>Welcome Back!</h1>
            <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: '1.6', margin: '0' }}>You have been successfully resubscribed. You will now receive our emails again!</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>&#10060;</div>
            <h1 style={{ color: '#111827', fontSize: '24px', fontWeight: '800', margin: '0 0 12px' }}>Invalid Link</h1>
            <p style={{ color: '#6B7280', fontSize: '15px', margin: '0' }}>Please use the link from your email.</p>
          </>
        )}
      </div>
    </div>
  )
}
