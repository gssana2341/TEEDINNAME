"use client"

import Image from "next/image"

interface StaticMapProps {
  lat?: number
  lng?: number
  address?: string
  height?: string
  className?: string
  isErrorFallback?: boolean
}

export default function StaticMap({
  lat = 13.7457211, // Default to Bangkok (Sukhumvit) coordinates
  lng = 100.5657291,
  address = "สุขุมวิท - กรุงเทพฯ",
  height = "300px",
  className = "",
  isErrorFallback = false,
}: StaticMapProps) {
  // ใช้ Mapbox Static Maps API (มีแผนฟรี)
  // เปลี่ยน YOUR_MAPBOX_TOKEN นี้เป็น token ที่คุณได้จาก Mapbox
  const token = "pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2t0NzM3cTd5MGxtczJvcGY5OGR3dXFneiJ9.ftYHvTU6Art_-wFYqtFgxQ"
  
  // สร้าง URL สำหรับแผนที่
  const width = 600
  const height_px = 300
  const zoom = 15
  const pinColor = "ff0000" // สีแดง
  
  // ใช้ Mapbox Static Images API
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+${pinColor}(${lng},${lat})/${lng},${lat},${zoom},0/${width}x${height_px}?access_token=${token}`
  
  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      {isErrorFallback && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-yellow-100 text-yellow-800 text-xs p-1 text-center">
          ใช้แผนที่สำรองเนื่องจากแผนที่หลักโหลดไม่สำเร็จ
        </div>
      )}
      <Image
        src={mapUrl}
        alt={`Map showing location at ${address}`}
        fill
        className="object-cover"
        unoptimized
      />
    </div>
  )
} 