'use client'

import { useState } from 'react'

export default function SyncButton({ shopDomain }: { shopDomain: string }) {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSync() {
    setSyncing(true)
    setResult(null)

    try {
      const res = await fetch('/api/sync/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop: shopDomain }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult(`Synced ${data.totalSynced} contacts`)
      } else {
        setResult(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={syncing || !shopDomain}
        style={{
          background: syncing ? '#666' : '#000',
          color: '#fff',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: syncing ? 'not-allowed' : 'pointer',
        }}
      >
        {syncing ? 'Syncing...' : 'Sync Contacts from Shopify'}
      </button>
      {result && (
        <p style={{ marginTop: '12px', color: result.startsWith('Error') ? '#e00' : '#090' }}>
          {result}
        </p>
      )}
    </div>
  )
}
