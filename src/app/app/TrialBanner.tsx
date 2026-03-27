"use client"
import { useEffect, useState } from "react"

export default function TrialBanner() {
  const [billingStatus, setBillingStatus] = useState<string | null>(null)
  const [daysRemaining, setDaysRemaining] = useState(30)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        const store = data.store
        setBillingStatus(store?.billingStatus ?? "trial")
        if (store?.trialStartDate) {
          const days = Math.max(0, 30 - Math.floor(
            (Date.now() - new Date(store.trialStartDate).getTime()) / (1000 * 60 * 60 * 24)
          ))
          setDaysRemaining(days)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  if (!loaded) return null
  if (billingStatus === "active") return null

  return (
    <div className="w-full bg-blue-600 text-white px-4 py-2 flex items-center justify-between text-sm shrink-0" style={{zIndex: 9999}}>
      <span>🎉 You are on a 30-day free trial — <strong>{daysRemaining} days remaining</strong></span>
      <a href="/app/billing" className="bg-white text-blue-600 px-3 py-1 rounded-lg font-semibold text-xs ml-4 whitespace-nowrap">Choose Plan</a>
    </div>
  )
}
