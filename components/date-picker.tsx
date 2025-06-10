
"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface DatePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (date: Date) => void
}

export function DatePicker({ isOpen, onClose, onSelect }: DatePickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Get calendar data
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = getDaysInMonth(currentDate)
    const days = []
    
    // Previous month days
    const prevMonthDays = getDaysInMonth(new Date(year, month - 1))
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }

    // Next month days
    const remainingDays = 42 - days.length // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      })
    }

    return days
  }

  const calendar = generateCalendarDays()
  const today = new Date()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[90%] max-w-md p-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Select Date</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
              <div key={day} className="text-gray-500 text-sm font-medium text-center py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendar.map(({ date, isCurrentMonth }, index) => {
              const isToday = date.toDateString() === today.toDateString()
              const isSelected = selectedDate?.toDateString() === date.toDateString()

              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedDate(date)
                    onSelect(date)
                  }}
                  className={`
                    h-10 rounded-full flex items-center justify-center text-sm
                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100'}
                    ${isToday && !isSelected ? 'ring-2 ring-blue-600' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>

        {/* Today button */}
        <div className="text-center">
          <button 
            onClick={() => {
              setCurrentDate(new Date())
              setSelectedDate(new Date())
              onSelect(new Date())
            }}
            className="text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded-full transition-colors"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  )
}
