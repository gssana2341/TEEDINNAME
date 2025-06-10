
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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
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

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }

    // Next month
    const remainingDays = 42 - days.length
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
  const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

  const handleConfirm = () => {
    if (selectedDate) {
      onSelect(selectedDate)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[90%] max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">เลือกวันที่นัดหมาย</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Month/Year Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <select 
              value={currentDate.getMonth()}
              onChange={(e) => {
                const newDate = new Date(currentDate)
                newDate.setMonth(parseInt(e.target.value))
                setCurrentDate(newDate)
              }}
              className="py-1 px-2 rounded-lg border hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
              ].map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={currentDate.getFullYear()}
              onChange={(e) => {
                const newDate = new Date(currentDate)
                newDate.setFullYear(parseInt(e.target.value))
                setCurrentDate(newDate)
              }}
              className="py-1 px-2 rounded-lg border hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 10 }, (_, i) => 
                currentDate.getFullYear() - 5 + i
              ).map(year => (
                <option key={year} value={year}>{year + 543}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setMonth(newDate.getMonth() - 1)
                setCurrentDate(newDate)
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button 
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setMonth(newDate.getMonth() + 1)
                setCurrentDate(newDate)
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-6">
          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-2">
            {['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map(day => (
              <div key={day} className="text-center text-gray-500 text-sm py-2">{day}</div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map(({ date, isCurrentMonth }, index) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString()

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    h-10 rounded-full flex items-center justify-center text-sm
                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100'}
                  `}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="mt-6 flex justify-end border-t pt-4">
          <button
            onClick={() => {
              if (selectedDate) {
                onSelect(selectedDate)
                onClose()
              }
            }}
            disabled={!selectedDate}
            className={`
              px-6 py-2 rounded-lg transition-colors
              ${selectedDate 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  )
}
