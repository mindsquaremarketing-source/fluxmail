'use client'
import { useState } from 'react'

const presets = [
  'Today', 'Yesterday', 'Last 7 days', 'Last 30 days',
  'Last 90 days', 'Last 365 days', 'Last month',
  'Last 12 months', 'Last year', 'Week to date',
  'Month to date', 'Year to date'
]

function getDatesForPreset(preset: string) {
  const today = new Date()
  const end = new Date(today)
  let start = new Date(today)

  switch (preset) {
    case 'Today': break
    case 'Yesterday':
      start.setDate(start.getDate() - 1)
      end.setDate(end.getDate() - 1)
      break
    case 'Last 7 days': start.setDate(start.getDate() - 7); break
    case 'Last 30 days': start.setDate(start.getDate() - 30); break
    case 'Last 90 days': start.setDate(start.getDate() - 90); break
    case 'Last 365 days': start.setDate(start.getDate() - 365); break
    case 'Last month':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      end.setDate(0)
      break
    case 'Last 12 months': start.setMonth(start.getMonth() - 12); break
    case 'Last year':
      start = new Date(today.getFullYear() - 1, 0, 1)
      end.setFullYear(today.getFullYear() - 1, 11, 31)
      break
    case 'Week to date':
      start.setDate(start.getDate() - start.getDay())
      break
    case 'Month to date':
      start = new Date(today.getFullYear(), today.getMonth(), 1)
      break
    case 'Year to date':
      start = new Date(today.getFullYear(), 0, 1)
      break
  }
  return { start, end }
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

export default function DateRangePicker({
  selectedRange,
  onSave
}: {
  selectedRange: string
  onSave: (range: string, start: Date, end: Date) => void
}) {
  const [open, setOpen] = useState(false)
  const [activePreset, setActivePreset] = useState(selectedRange)
  const today = new Date()
  const [leftMonth, setLeftMonth] = useState(today.getMonth() === 0 ? 11 : today.getMonth() - 1)
  const [leftYear, setLeftYear] = useState(today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear())
  const [rightMonth, setRightMonth] = useState(today.getMonth())
  const [rightYear, setRightYear] = useState(today.getFullYear())
  const [startDate, setStartDate] = useState(() => getDatesForPreset(selectedRange).start)
  const [endDate, setEndDate] = useState(() => getDatesForPreset(selectedRange).end)
  const [selecting, setSelecting] = useState<'start' | 'end'>('start')

  const handlePreset = (preset: string) => {
    setActivePreset(preset)
    const { start, end } = getDatesForPreset(preset)
    setStartDate(start)
    setEndDate(end)
  }

  const handleDayClick = (date: Date) => {
    if (date > today) return
    if (selecting === 'start') {
      setStartDate(date)
      setEndDate(date)
      setSelecting('end')
    } else {
      if (date < startDate) {
        setEndDate(startDate)
        setStartDate(date)
      } else {
        setEndDate(date)
      }
      setSelecting('start')
      setActivePreset('')
    }
  }

  const isInRange = (date: Date) => {
    return date >= startDate && date <= endDate
  }

  const isStart = (date: Date) => formatDate(date) === formatDate(startDate)
  const isEnd = (date: Date) => formatDate(date) === formatDate(endDate)

  const prevMonth = () => {
    if (leftMonth === 0) {
      setLeftMonth(11); setLeftYear(y => y - 1)
      setRightMonth(0); setRightYear(leftYear)
    } else {
      setLeftMonth(m => m - 1)
      setRightMonth(leftMonth)
      setRightYear(leftYear)
    }
  }

  const nextMonth = () => {
    if (rightMonth === 11) {
      setRightMonth(0); setRightYear(y => y + 1)
      setLeftMonth(11); setLeftYear(rightYear)
    } else {
      setRightMonth(m => m + 1)
      setLeftMonth(rightMonth)
      setLeftYear(rightYear)
    }
  }

  const renderCalendar = (month: number, year: number) => {
    const days = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const cells = []

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} />)
    }

    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d)
      const inRange = isInRange(date)
      const start = isStart(date)
      const end = isEnd(date)
      const isToday = formatDate(date) === formatDate(today)
      const isFuture = date > today

      cells.push(
        <div
          key={d}
          onClick={() => handleDayClick(date)}
          className={`
            w-9 h-9 flex items-center justify-center text-sm cursor-pointer rounded-full
            ${start || end ? 'bg-gray-900 text-white font-bold' : ''}
            ${inRange && !start && !end ? 'bg-gray-100 text-gray-800 rounded-none' : ''}
            ${isToday && !start && !end ? 'font-bold' : ''}
            ${!inRange && !start && !end && !isFuture ? 'hover:bg-gray-100' : ''}
            ${isFuture ? 'text-gray-300 cursor-not-allowed' : ''}
          `}
        >
          {d}
        </div>
      )
    }

    return (
      <div className="w-72">
        <div className="grid grid-cols-7 mb-2">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} className="w-9 h-8 flex items-center justify-center text-xs text-gray-500 font-medium">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {activePreset || `${formatDate(startDate)} → ${formatDate(endDate)}`}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 flex" style={{minWidth: '700px'}}>

            {/* Presets */}
            <div className="w-44 border-r border-gray-100 py-2 overflow-y-auto max-h-96">
              {presets.map(preset => (
                <button
                  key={preset}
                  onClick={() => handlePreset(preset)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50
                    ${activePreset === preset ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
                >
                  {preset}
                  {activePreset === preset && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Calendar */}
            <div className="flex flex-col p-4">
              {/* Date inputs */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-500">Start</span>
                  <span className="font-medium">{formatDate(startDate)}</span>
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-500">End</span>
                  <span className="font-medium">{formatDate(endDate)}</span>
                </div>
              </div>

              {/* Dual calendars */}
              <div className="flex gap-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-sm font-semibold">{MONTHS[leftMonth]} {leftYear}</span>
                    <div className="w-6" />
                  </div>
                  {renderCalendar(leftMonth, leftYear)}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-6" />
                    <span className="text-sm font-semibold">{MONTHS[rightMonth]} {rightYear}</span>
                    <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  {renderCalendar(rightMonth, rightYear)}
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onSave(activePreset || `${formatDate(startDate)} - ${formatDate(endDate)}`, startDate, endDate)
                    setOpen(false)
                  }}
                  className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
