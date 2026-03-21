'use client'

import Link from 'next/link'
import DateRangePicker from '@/components/DateRangePicker'

export default function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="flex items-center gap-3">
        <Link
          href="/app/campaigns/create"
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          Create Campaign
        </Link>
        <DateRangePicker selectedRange="Last 30 days" onSave={() => {}} />
      </div>
    </div>
  )
}
