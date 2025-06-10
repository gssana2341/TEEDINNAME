"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for agent dashboard
const viewsData = {
  labels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
  values: [800, 1800, 3000, 700, 1800, 3000, 1500, 1000, 2000, 1200, 2000, 3000],
}

const interestData = {
  labels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  values: [1200, 800, 1800, 1000, 2313, 600, 1500],
}

const sharesData = {
  total: "1.05k",
  platforms: [
    { name: "Line", value: 24, count: 410 },
    { name: "Facebook", value: 26, count: 142 },
    { name: "Link", value: 39, count: 340 },
    { name: "Instagram", value: 11, count: 590 },
  ],
}

const offersData = {
  labels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  values: [1200, 800, 1800, 1000, 2313, 600, 1500],
}

const topListingsData = [
  { name: "คอนโด", views: 121799 },
  { name: "บ้านเดี่ยว", views: 50799 },
  { name: "บ้านแฝด", views: 25567 },
  { name: "อพาร์ทเม้นท์", views: 5789 },
]

const recentLeadsData = [
  { name: "คุณกมล สุขเกษม", property: "คอนโด ริเวอร์ วิว", date: "10/05/2025", status: "รอติดต่อกลับ" },
  { name: "คุณวิภา จันทร์เพ็ญ", property: "บ้านเดี่ยว การ์เด้น", date: "09/05/2025", status: "ติดต่อแล้ว" },
  { name: "คุณสมชาย พงษ์พัฒน์", property: "ทาวน์โฮม ซิตี้", date: "08/05/2025", status: "นัดชมทรัพย์" },
  { name: "คุณนภา สุวรรณ", property: "คอนโด ลุมพินี", date: "07/05/2025", status: "ปิดการขาย" },
]

export default function AgentDashboard() {
  const [viewsTimeframe, setViewsTimeframe] = useState("monthly")
  const [interestTimeframe, setInterestTimeframe] = useState("weekly")
  const [sharesTimeframe, setSharesTimeframe] = useState("weekly")
  const [offersTimeframe, setOffersTimeframe] = useState("weekly")
  const [topListingsTimeframe, setTopListingsTimeframe] = useState("weekly")

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">แดชบอร์ดสำหรับเอเจนท์</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">ประกาศของฉัน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <div className="text-sm text-gray-500 mt-1">รายการ</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">ยอดเข้าชม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3.2k</div>
            <div className="text-sm text-gray-500 mt-1">ครั้ง (30 วัน)</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">การติดต่อ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18</div>
            <div className="text-sm text-gray-500 mt-1">ลูกค้า (30 วัน)</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">ปิดการขาย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <div className="text-sm text-gray-500 mt-1">รายการ (30 วัน)</div>
          </CardContent>
        </Card>
      </div>

      {/* Views Chart */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">จำนวนคนเข้าชมประกาศ</CardTitle>
          <div className="text-sm text-gray-500">วัน / เดือน / ปี</div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <MonthlyViewsChart data={viewsData} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Interest Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">จำนวนคนกดสนใจ</CardTitle>
            <Select value={interestTimeframe} onValueChange={setInterestTimeframe}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Weekly" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] relative">
              <WeeklyInterestChart data={interestData} />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-md">
                2,313
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">ลูกค้าล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[200px] overflow-auto">
              {recentLeadsData.map((lead, index) => (
                <div key={index} className="border-b border-gray-100 pb-2">
                  <div className="flex justify-between">
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-gray-400">{lead.date}</div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-gray-500">{lead.property}</div>
                    <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{lead.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shares Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">จำนวนคนกดแชร์</CardTitle>
            <Select value={sharesTimeframe} onValueChange={setSharesTimeframe}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Weekly" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-between">
              <div className="relative w-[150px] h-[150px]">
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-2xl font-bold">{sharesData.total}</div>
                  <div className="text-xs text-gray-500">total</div>
                </div>
                <SharesDonutChart data={sharesData} />
              </div>
              <div className="space-y-2">
                {sharesData.platforms.map((platform, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 bg-${getPlatformColor(platform.name)}`}></div>
                    <div className="flex-1">{platform.name}</div>
                    <div className="text-gray-500 ml-4">{platform.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <div className="text-sm text-gray-500">Top 4</div>
              <CardTitle className="text-lg font-medium">ประกาศที่มีคนดูมากที่สุด</CardTitle>
            </div>
            <Select value={topListingsTimeframe} onValueChange={setTopListingsTimeframe}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Weekly" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topListingsData.map((listing, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <div>{listing.name}</div>
                    <div>{listing.views.toLocaleString()}</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(listing.views / topListingsData[0].views) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Chart Components
function MonthlyViewsChart({ data }: { data: { labels: string[]; values: number[] } }) {
  const maxValue = Math.max(...data.values)
  return (
    <div className="w-full h-full flex items-end">
      <div className="flex-shrink-0 h-full flex flex-col justify-between pr-2">
        {[6, 5, 4, 3, 2, 1, 0].map((value) => (
          <div key={value} className="text-sm text-gray-500">
            {value}k
          </div>
        ))}
      </div>
      <div className="flex-1 flex items-end">
        {data.labels.map((label, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-6 bg-gray-600 rounded-sm"
              style={{
                height: `${(data.values[index] / maxValue) * 250}px`,
              }}
            ></div>
            <div className="text-xs mt-2">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeeklyInterestChart({ data }: { data: { labels: string[]; values: number[] } }) {
  const maxValue = Math.max(...data.values)

  return (
    <div className="w-full h-full flex items-end">
      <div className="flex-shrink-0 h-full flex flex-col justify-between pr-2">
        {[3, 2, 1, 0].map((value) => (
          <div key={value} className="text-sm text-gray-500">
            {value}k
          </div>
        ))}
      </div>
      <div className="flex-1 flex items-end">
        {data.labels.map((label, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className={`w-6 ${index === 4 ? "bg-gray-600" : "bg-purple-200"} rounded-sm`}
              style={{
                height: `${(data.values[index] / maxValue) * 150}px`,
              }}
            ></div>
            <div className="text-xs mt-2">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SharesDonutChart({ data }: { data: { platforms: { name: string; value: number }[] } }) {
  // This is a simplified donut chart representation
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e0e0e0" strokeWidth="15" />

      {/* We'll create segments for each platform */}
      {data.platforms.map((platform, index) => {
        const previousValues = data.platforms.slice(0, index).reduce((sum, p) => sum + p.value, 0)
        const startAngle = (previousValues / 100) * 360
        const endAngle = ((previousValues + platform.value) / 100) * 360

        return (
          <DonutSegment
            key={platform.name}
            startAngle={startAngle}
            endAngle={endAngle}
            color={getPlatformColor(platform.name)}
          />
        )
      })}
    </svg>
  )
}

function DonutSegment({ startAngle, endAngle, color }: { startAngle: number; endAngle: number; color: string }) {
  const radius = 40
  const center = 50

  // Convert angles to radians
  const startRad = (startAngle - 90) * (Math.PI / 180)
  const endRad = (endAngle - 90) * (Math.PI / 180)

  // Calculate points
  const x1 = center + radius * Math.cos(startRad)
  const y1 = center + radius * Math.sin(startRad)
  const x2 = center + radius * Math.cos(endRad)
  const y2 = center + radius * Math.sin(endRad)

  // Determine if the arc should be drawn the long way around
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

  // Create the path
  const pathData = [
    `M ${center} ${center}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    "Z",
  ].join(" ")

  return <path d={pathData} fill={color} />
}

function getPlatformColor(platform: string): string {
  switch (platform) {
    case "Line":
      return "purple-500"
    case "Facebook":
      return "blue-500"
    case "Link":
      return "gray-500"
    case "Instagram":
      return "pink-500"
    default:
      return "gray-300"
  }
}
