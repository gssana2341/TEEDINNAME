"use client"

import { useEffect, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from "next/dynamic"

const StaticMapFallback = dynamic(() => import("./static-map"), { 
  ssr: false,
})

interface MapComponentProps {
  lat: number
  lng: number
  address: string
}

export default function MapComponent({ lat, lng, address }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasTriedToLoadRef = useRef(false)
  const [fallbackToStatic, setFallbackToStatic] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!mapRef.current) return
    if (mapInstanceRef.current) return
    if (hasTriedToLoadRef.current) return
    
    hasTriedToLoadRef.current = true

    // Add a specific timeout to make sure resources are properly loaded
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve()
          return
        }
        
        const script = document.createElement('script')
        script.src = src
        script.onload = () => resolve()
        script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`))
        document.head.appendChild(script)
      })
    }

    const initMap = async () => {
      try {
        // Load leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const linkEl = document.createElement('link')
          linkEl.id = 'leaflet-css'
          linkEl.rel = 'stylesheet'
          linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(linkEl)
        }

        // Try to load leaflet from CDN if module import fails
        let L: any
        try {
          L = await import('leaflet')
        } catch (importErr) {
          console.warn("Failed to import leaflet module, trying CDN fallback")
          try {
            await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
            // @ts-ignore
            L = window.L
            
            if (!L) {
              throw new Error("Could not load leaflet from CDN")
            }
          } catch (cdnErr) {
            // If both module import and CDN loading fail, show static map
            setFallbackToStatic(true)
            throw new Error("Failed to load leaflet from both module and CDN")
          }
        }

        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        if (!mapInstanceRef.current && mapRef.current) {
          mapInstanceRef.current = L.map(mapRef.current).setView([lat, lng], 15)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapInstanceRef.current)

          L.marker([lat, lng])
            .addTo(mapInstanceRef.current)
            .bindPopup(address)
            .openPopup()

          setIsLoaded(true)
        }
      } catch (err) {
        console.error("Error initializing map:", err)
        setError(`Map error: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // Use a reasonable timeout to ensure page is loaded
    setTimeout(() => {
      initMap()
    }, 500)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        setIsLoaded(false)
        hasTriedToLoadRef.current = false
      }
    }
  }, [lat, lng, address])

  if (fallbackToStatic) {
    return <StaticMapFallback lat={lat} lng={lng} address={address} isErrorFallback={true} />
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500 p-4">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      {!isLoaded && <Skeleton className="w-full h-full" />}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
} 