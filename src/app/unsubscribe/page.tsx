export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'

export default async function UnsubscribePage({
  searchParams
}: {
  searchParams: { email?: string; store?: string }
}) {
  const { email, store } = searchParams
  let unsubscribed = false
  let error = false

  if (email && store) {
    try {
      await prisma.contact.updateMany({
        where: {
          email: decodeURIComponent(email),
          store: { shopDomain: store }
        },
        data: { status: 'unsubscribed' }
      })
      unsubscribed = true
    } catch {
      error = true
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        {unsubscribed ? (
          <>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>&#9989;</div>
            <h1 style={{ color: '#111827', fontSize: '24px', fontWeight: '800', margin: '0 0 12px' }}>Unsubscribed Successfully</h1>
            <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: '1.6', margin: '0 0 8px' }}>
              <strong>{decodeURIComponent(email || '')}</strong> has been removed from our mailing list.
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '13px', margin: '0 0 32px' }}>You will no longer receive marketing emails from us.</p>
            <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '16px' }}>
              <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 4px' }}>Changed your mind?</p>
              <a href={`/resubscribe?email=${email}&store=${store}`} style={{ color: '#1E40AF', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>Click here to resubscribe</a>
            </div>
          </>
        ) : error ? (
          <>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>&#10060;</div>
            <h1 style={{ color: '#111827', fontSize: '24px', fontWeight: '800', margin: '0 0 12px' }}>Something went wrong</h1>
            <p style={{ color: '#6B7280', fontSize: '15px', margin: '0' }}>Please try again or contact support.</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>&#128231;</div>
            <h1 style={{ color: '#111827', fontSize: '24px', fontWeight: '800', margin: '0 0 12px' }}>Unsubscribe</h1>
            <p style={{ color: '#6B7280', fontSize: '15px', margin: '0' }}>Invalid unsubscribe link. Please use the link from your email.</p>
          </>
        )}
      </div>
    </div>
  )
}
