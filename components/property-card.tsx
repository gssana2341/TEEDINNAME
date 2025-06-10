import type React from "react"
import Link from "next/link"
import ImageWithFallback from "./ImageWithFallback"
import { Heart, Share2, Check, Copy, X } from "lucide-react"
import type { ReactNode } from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from '@supabase/supabase-js'

// Define TypeScript interfaces for property data
export interface PropertyDetails {
  area: number
  bedrooms: number
  bathrooms: number
  parking: number
}

export interface PropertyData {
  id: string
  title: string
  location: string
  price: string
  isPricePerMonth?: boolean
  details: PropertyDetails
  image: string | string[]
  isForRent?: boolean
  isForSale?: boolean
  isTopPick?: boolean
  description?: string
  highlight?: string
  facilities?: string[]
  projectFacilities?: string[]
  viewCount?: number
  isRecommended?: boolean
}

interface PropertyCardProps {
  property: PropertyData
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { id, title, location, price, isPricePerMonth, details, image, isForRent, isForSale, isTopPick, viewCount = 0 } = property
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [currentViewCount, setCurrentViewCount] = useState(viewCount)
  const { user } = useAuth()

  // กำหนดเกณฑ์การแนะนำ (ถ้าดูเกิน 50 ครั้งจะเป็น "แนะนำ")
  const isRecommended = currentViewCount >= 50

  // ฟังก์ชันแสดง Toast
  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // ตรวจสอบว่าผู้ใช้ถูกใจอสังหาริมทรัพย์นี้หรือไม่
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user?.id) return
      
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('customer_id', user.id)
          .eq('property_id', id)
          .maybeSingle()
        
        if (!error && data) {
          setIsLiked(true)
        }
      } catch (error) {
        console.error('Error checking like status:', error)
      }
    }

    checkLikeStatus()
  }, [user?.id, id])
  // ฟังก์ชันจัดการการกดถูกใจ - แก้ไขเพื่อจัดการ 409 error
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      showToastMessage('กรุณาเข้าสู่ระบบก่อนใช้งานฟีเจอร์นี้', 'error')
      return
    }

    if (isLoading) {
      return // ป้องกันการกดหลายครั้ง
    }

    setIsLoading(true)
    
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      if (isLiked) {
        // ลบออกจากรายการโปรด
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('customer_id', user.id)
          .eq('property_id', id)
        
        if (!error) {
          setIsLiked(false)
          showToastMessage('ลบออกจากรายการโปรดแล้ว', 'success')
        } else {
          throw error
        }
      } else {
        // ตรวจสอบก่อนว่ามีอยู่แล้วหรือไม่
        const { data: existingFavorite, error: checkError } = await supabase
          .from('favorites')
          .select('id')
          .eq('customer_id', user.id)
          .eq('property_id', id)
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 หมายถึง "not found" ซึ่งเป็นสิ่งที่เราต้องการ
          throw checkError
        }

        if (existingFavorite) {
          // ถ้ามีอยู่แล้ว แค่อัพเดท state
          setIsLiked(true)
          showToastMessage('เพิ่มเข้ารายการโปรดแล้ว', 'success')
        } else {
          // เพิ่มเข้ารายการโปรด
          const { error: insertError } = await supabase
            .from('favorites')
            .insert({
              customer_id: user.id,
              property_id: id
            })
          
          if (!insertError) {
            setIsLiked(true)
            showToastMessage('เพิ่มเข้ารายการโปรดแล้ว', 'success')
          } else if (insertError.code === '23505') {
            // 23505 คือ unique_violation - หมายถึงข้อมูลซ้ำ
            // แค่อัพเดท state เป็น liked
            setIsLiked(true)
            showToastMessage('เพิ่มเข้ารายการโปรดแล้ว', 'success')
          } else {
            throw insertError
          }
        }
      }
    } catch (error: any) {
      console.error('Error toggling like:', error)
      
      // จัดการข้อผิดพลาดตามประเภท
      if (error?.code === '23505') {
        // Unique constraint violation - แค่อัพเดท state
        setIsLiked(true)
        showToastMessage('เพิ่มเข้ารายการโปรดแล้ว', 'success')
      } else {
        showToastMessage('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ฟังก์ชันจัดการการแชร์
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const shareData = {
      title: title,
      text: `${title} - ${location} ราคา ${price}${isPricePerMonth ? " บาท/เดือน" : " บาท"}`,
      url: `${window.location.origin}/property/${id}`
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        showToastMessage('แชร์สำเร็จ!', 'success')
      } else {
        await navigator.clipboard.writeText(shareData.url)
        showToastMessage('คัดลอกลิงก์เรียบร้อยแล้ว!', 'success')
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(shareData.url)
        showToastMessage('คัดลอกลิงก์เรียบร้อยแล้ว!', 'success')
      } catch (clipboardError) {
        showToastMessage('ไม่สามารถแชร์ได้ กรุณาลองใหม่อีกครั้ง', 'error')
      }
    }
  }

  // ฟังก์ชันจัดการการคลิกดูรายละเอียดและนับจำนวนการดู
  const handleCardClick = async (e: React.MouseEvent) => {
    // ไม่ต้อง preventDefault เพราะเราต้องการให้ Link ทำงานตามปกติ
    
    try {
      // เรียก API เพื่อเพิ่มจำนวนการดู
      const response = await fetch('/api/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyId: id }),
      })

      if (response.ok) {
        const data = await response.json()
        // อัปเดต view count ใน state
        setCurrentViewCount(data.view_count || currentViewCount + 1)
      }
    } catch (error) {
      console.error('Error tracking view:', error)
      // ไม่แสดงข้อผิดพลาดให้ผู้ใช้เห็น เพราะไม่ส่งผลต่อการใช้งาน
    }
  }

  // Determine the button text based on property type
  const buttonText = isForRent ? "ให้เช่า" : isForSale ? "ขาย" : "ให้เช่า"

  // แปลง image เป็น URL ที่ใช้งานได้
  let imageUrl = "";

  try {
    // กรณีที่ image เป็น array
    if (Array.isArray(image)) {
      if (image.length > 0) {
        const firstImage = image[0];
        // ตรวจสอบว่าเป็น JSON string หรือไม่
        if (typeof firstImage === "string") {
          if (firstImage.startsWith("{")) {
            // กรณีเป็น JSON string ที่มี url อยู่ภายใน
            const parsedImage = JSON.parse(firstImage);
            imageUrl = parsedImage.url || "";
          } else {
            // กรณีเป็น URL ตรงๆ
            imageUrl = firstImage;
          }
        }
      }
    }
    // กรณีที่ image เป็น string เดี่ยว
    else if (typeof image === "string") {
      if (image.startsWith("{")) {
        // กรณีเป็น JSON string
        const parsedImage = JSON.parse(image);
        imageUrl = parsedImage.url || "";
      } else {
        // กรณีเป็น URL ตรงๆ
        imageUrl = image;
      }
    }
  } catch (err) {
    console.error(`Failed to parse image data for property ${id}:`, err);
  }

  // ตรวจสอบว่า imageUrl ใช้งานได้จริง
  const isValidImageUrl = imageUrl && (
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("/")
  );

  const displayImage = isValidImageUrl ? imageUrl : "/placeholder.svg"; // fallback ถ้า URL ผิด
  
  console.log(`Property ID: ${id}, Image URL:`, imageUrl);
  console.log(`Valid image for "${title}":`, isValidImageUrl);
  return (
    <Link href={`/property/${id}`} className="block font-thai" onClick={handleCardClick}>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"><div className="relative">
          <div className="w-full h-48 relative">
            <ImageWithFallback
              src={displayImage}
              alt={title}
              width={400}
              height={192}
              className="object-cover w-full h-full"
              fallbackSrc="/placeholder-property.jpg"
            />
          </div>          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            <span className={`text-white px-2 py-0.5 text-xs font-bold rounded-md shadow-sm font-sukhumvit ${isForRent ? "bg-green-600" :
              isForSale ? "bg-blue-600" :
                "bg-green-600"
              }`}>
              {buttonText}
            </span>            {isRecommended && (
              <span className="bg-orange-600 text-white px-2 py-0.5 text-xs font-bold rounded-md shadow-sm flex items-center font-sukhumvit">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                ยอดนิยม
              </span>
            )}
            {isTopPick && (
              <span className="bg-amber-600 text-white px-2 py-0.5 text-xs font-bold rounded-md shadow-sm flex items-center font-sukhumvit">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                เด่น
              </span>
            )}
          </div><div className="absolute top-3 right-3 flex space-x-1">
            <button 
              className={`bg-white/90 backdrop-blur-sm p-1 rounded-full hover:bg-white transition-colors shadow-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleLike}
              disabled={isLoading}
              title={isLiked ? "ลบออกจากรายการโปรด" : "เพิ่มเข้ารายการโปรด"}
              aria-label={isLiked ? "ลบออกจากรายการโปรด" : "เพิ่มเข้ารายการโปรด"}
            >
              <Heart 
                className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} 
              />
            </button>
            <button 
              className="bg-white/90 backdrop-blur-sm p-1 rounded-full hover:bg-white transition-colors shadow-sm"
              onClick={handleShare}
              title="แชร์ประกาศนี้"
              aria-label="แชร์ประกาศนี้"
            >
              <Share2 className="h-4 w-4 text-gray-600" />
            </button>          </div>
        </div>        <div className="p-4 font-sukhumvit">
          <h3 className="text-lg font-extrabold mb-1 font-sukhumvit">{title}</h3>
          <p className="text-gray-600 text-sm mb-2 font-sukhumvit font-semibold">{location}</p>
          <p className="text-[#006ce3] font-black text-xl mb-4 font-sukhumvit">
            {price} {isPricePerMonth ? "บาท / เดือน" : "บาท"}
          </p><div className="grid grid-cols-4 gap-2 text-xs text-gray-600 mb-3">
            <PropertyDetail icon={<SquareIcon className="h-4 w-4 mr-1" />} value={details.area} label="ตารางเมตร" />
            <PropertyDetail icon={<BedIcon className="h-4 w-4 mr-1" />} value={details.bedrooms} label="ห้องนอน" />
            <PropertyDetail icon={<BathIcon className="h-4 w-4 mr-1" />} value={details.bathrooms} label="ห้องน้ำ" />
            <PropertyDetail icon={<CarIcon className="h-4 w-4 mr-1" />} value={details.parking} label="จอดรถ" />
          </div>          {/* View count แสดงในส่วนข้อมูล - อยู่ตรงกลาง */}
          <div className="flex items-center justify-center text-gray-500 text-sm font-sukhumvit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span className="font-medium">ดู {currentViewCount.toLocaleString()} ครั้ง</span>
          </div>          {isTopPick && (
            <div className="mt-4">
              <span className="bg-gray-500 text-white text-xs px-3 py-1 rounded-full uppercase font-sukhumvit font-bold">Top Pick</span>
            </div>
          )}
        </div>
      </div>
        {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm font-sukhumvit ${
            toastType === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {toastType === 'success' ? (
              <Check className="h-5 w-5 flex-shrink-0" />
            ) : (
              <X className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </Link>
  )
}

interface PropertyDetailProps {
  icon: ReactNode
  value: number
  label: string
}

function PropertyDetail({ icon, value, label }: PropertyDetailProps) {
  return (
    <div className="flex flex-col items-center font-sukhumvit">
      <div className="flex items-center mb-1">
        {icon}
        <span className="font-bold">{value}</span>
      </div>
      <span className="font-medium">{label}</span>
    </div>
  )
}

function SquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}

function BedIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 4v16" />
      <path d="M22 4v16" />
      <path d="M2 8h20" />
      <path d="M2 16h20" />
      <path d="M12 4v4" />
      <path d="M12 16v4" />
    </svg>
  )
}

function BathIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z" />
      <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25" />
      <path d="m4 21 1-1.5" />
      <path d="M20 21 19 19.5" />
    </svg>
  )
}

function CarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
}