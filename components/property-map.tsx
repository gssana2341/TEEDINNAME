"use client"

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from "next/dynamic"

// ใช้ dynamic import แบบ No SSR เพื่อแก้ปัญหา Leaflet ที่ต้องการ window object
const MapWithNoSSR = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
})

interface PropertyMapProps {
  lat?: number
  lng?: number
  address?: string
  height?: string
  className?: string
}

export default function PropertyMap({
  lat = 13.7457211, // Default to Bangkok (Sukhumvit) coordinates
  lng = 100.5657291,
  address = "สุขุมวิท - กรุงเทพฯ",
  height = "300px",
  className = "",
}: PropertyMapProps) {
  // Add error boundary for robustness
  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <Suspense fallback={<Skeleton className="h-full w-full rounded-lg" />}>
        <MapWithNoSSR lat={lat} lng={lng} address={address} />
      </Suspense>
    </div>
  )
} 