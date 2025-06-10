"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, Share2, ChevronRight, Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import PropertyMap from "@/components/property-map"
import { Skeleton } from "@/components/ui/skeleton"

// เพิ่ม style สำหรับซ่อน scrollbar แต่ยังสามารถเลื่อนได้
function addCustomStyle() {
  if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none;  /* Chrome, Safari and Opera */
      }
    `;
    document.head.appendChild(style);
  }
}

// แยกส่วนที่ต้องเข้าถึง params ออกมาเป็น client component ต่างหาก
function PropertyContent({ id }: { id: string }) {
  const [activeImage, setActiveImage] = useState(0)
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [similarProperties, setSimilarProperties] = useState<any[]>([])
  const [loadingSimilar, setLoadingSimilar] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Track mouse position and dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
    // เรียกใช้ function เพิ่ม custom style สำหรับซ่อน scrollbar
  useEffect(() => {
    addCustomStyle();
  }, []);
  // Fetch property data from API
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/properties/${id}`)
        const result = await response.json()
        
        if (result.success) {
          setProperty(result.data)
        } else {
          setError(result.error || 'Failed to fetch property')
        }
      } catch (err) {
        setError('Network error occurred')
        console.error('Error fetching property:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProperty()
    }
  }, [id])
  // Fetch similar properties
  useEffect(() => {
    const fetchSimilarProperties = async () => {
      if (!property) return
      
      try {
        setLoadingSimilar(true)
        const response = await fetch('/api/get-properties?limit=5')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success && result.data) {
          // Filter out current property and limit to 5 properties
          const filtered = result.data
            .filter((p: any) => p.id !== id)
            .slice(0, 5)
          setSimilarProperties(filtered)
        } else {
          console.warn('Failed to fetch similar properties:', result.error || 'Unknown error')
          setSimilarProperties([])
        }
      } catch (err) {
        console.error('Error fetching similar properties:', err)
        setSimilarProperties([])
      } finally {
        setLoadingSimilar(false)
      }
    }

    fetchSimilarProperties()
  }, [property, id])

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  // Mouse down event - start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    
    // Change cursor style
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grabbing';
      scrollContainerRef.current.style.userSelect = 'none';
    }
  };
  
  // Mouse leave event - stop dragging
  const handleMouseLeave = () => {
    setIsDragging(false);
    
    // Reset cursor style
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
      scrollContainerRef.current.style.userSelect = '';
    }
  };
  
  // Mouse up event - stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Reset cursor style
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
      scrollContainerRef.current.style.userSelect = '';
    }
  };
    // Mouse move event - calculate scroll position
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-800">
        <header className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-blue-600 font-bold text-lg">TEDIN EASY</Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">ซื้อ</Link>
                <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">เช่า</Link>
                <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">เอเจ้นต์ทั่วไป</Link>
                <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">เอเจ้นต์พันธมิตร</Link>
                <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">ธรรมมาภิบาล</Link>
                <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">คอมมูนิตี้</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button className="text-gray-600">
                <Bell size={20} />
              </button>
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 rounded-full text-sm">เข้าสู่ระบบ</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-full text-sm">สมัคร</Button>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-96 w-full mb-6" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-800">
        <header className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-blue-600 font-bold text-lg">TEDIN EASY</Link>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">เกิดข้อผิดพลาด</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/" className="text-blue-600 hover:underline">กลับไปหน้าหลัก</Link>
          </div>
        </div>
      </div>
    )
  }

  // If no property data, show not found
  if (!property) {
    return (
      <div className="min-h-screen bg-white text-gray-800">
        <header className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-blue-600 font-bold text-lg">TEDIN EASY</Link>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">ไม่พบข้อมูลทรัพย์สิน</h1>
            <p className="text-gray-600 mb-6">ทรัพย์สินที่คุณต้องการดูไม่มีอยู่ในระบบ</p>
            <Link href="/" className="text-blue-600 hover:underline">กลับไปหน้าหลัก</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navbar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-blue-600 font-bold text-lg">TEDIN EASY</Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">ซื้อ</Link>
              <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">เช่า</Link>
              <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">เอเจ้นต์ทั่วไป</Link>
              <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">เอเจ้นต์พันธมิตร</Link>
              <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">ธรรมมาภิบาล</Link>
              <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">คอมมูนิตี้</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-600">
              <Bell size={20} />
            </button>
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 rounded-full text-sm">เข้าสู่ระบบ</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-full text-sm">สมัคร</Button>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="container mx-auto p-4">
        <Link href="/" className="flex items-center text-gray-800 mb-4">
          <ArrowLeft className="mr-2" size={20} />
          <span>ย้อนกลับ</span>
        </Link>
      </div>

      {/* Property Gallery */}
      <div className="container mx-auto px-4 mb-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-12 gap-2" style={{ height: '444.52px' }}>            <div className="col-span-6">
              <div className="relative h-full rounded-lg overflow-hidden">
                <Image
                  src={property.images && property.images.length > 0 ? property.images[activeImage] : "/placeholder.svg"}
                  alt={property.project_name || "Property"}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="col-span-6">
              <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
                {property.images && property.images.slice(1, 5).map((image: string, index: number) => (
                  <div
                    key={index}
                    className="relative rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setActiveImage(index + 1)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${property.project_name || "Property"} image ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
<div className="container mx-auto px-4">
  <div className="max-w-4xl mx-auto pb-20">    {/* Property Title and Actions */}
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">{property.project_name || "ไม่ระบุชื่อโครงการ"}</h1>
        <p className="text-sm text-gray-500">{property.address || "ไม่ระบุที่อยู่"}</p>
      </div>
      <div className="flex space-x-3">
        <button className="rounded-full bg-black p-3 flex items-center justify-center">
          <Heart size={20} className="text-white" />
        </button>
        <button className="rounded-full bg-black p-3 flex items-center justify-center">
          <Share2 size={20} className="text-white" />
        </button>
      </div>
    </div>

            {/* Price */}
          <div className="mb-6">
            <p className="text-gray-700">ราคา : <span className="text-xl font-semibold">{property.price ? `${parseInt(property.price).toLocaleString()} บาท` : "ไม่ระบุราคา"}</span></p>
          </div>
          
          {/* Property Area */}
          <div className="mb-6">
            <h3 className="text-gray-700 mb-1 font-medium underline">พื้นที่ใช้สอย</h3>
            <p className="text-gray-900">{property.usable_area ? `${property.usable_area} ตร.ม.` : "ไม่ระบุพื้นที่"}</p>
          </div>
          
          {/* Property Features Table */}
<div className="mb-8">
  <div className="border border-gray-300 rounded-lg overflow-hidden inline-block">
    <table className="table-fixed text-center">
      <thead>
        <tr className="border-b border-gray-300">
          <th className="px-4 py-2 text-sm text-gray-600 font-normal">พื้นที่</th>
          <th className="px-4 py-2 text-sm text-gray-600 font-normal">ห้องนอน</th>
          <th className="px-4 py-2 text-sm text-gray-600 font-normal">ห้องน้ำ</th>
          <th className="px-4 py-2 text-sm text-gray-600 font-normal">จอดรถ</th>
          <th className="px-4 py-2 text-sm text-gray-600 font-normal">สภาพบ้าน</th>
          <th className="px-4 py-2 text-sm text-gray-600 font-normal">ประเภท</th>
        </tr>
      </thead>      <tbody>
        <tr>
          <td className="px-4 pt-3 text-sm">
            <div className="text-base text-black leading-tight">{property.usable_area || "N/A"}</div>
            <div className="text-xs text-gray-500">ตร.ม.</div>
          </td>
          <td className="px-4 py-3 text-sm">{property.bedrooms || "N/A"}</td>
          <td className="px-4 py-3 text-sm">{property.bathrooms || "N/A"}</td>
          <td className="px-4 py-3 text-sm">{property.parking_spaces || "N/A"}</td>
          <td className="px-4 py-3 text-sm">{property.house_condition || "N/A"}</td>
          <td className="px-4 py-3 text-sm">ขาย/เช่า</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>


            {/* Property Highlights */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">จุดเด่นอสังหาฯ</h3>
            </div>
            {property.highlight ? (
              <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: property.highlight }} />
            ) : (
              <p className="text-sm text-gray-500">ไม่มีข้อมูลจุดเด่น</p>
            )}
            <div className="mt-4">
              <Button variant="outline" size="sm" className="rounded-full border-blue-500 text-blue-500 flex items-center">
                ดูทั้งหมด
                <div className="ml-2 bg-blue-500 rounded-full flex items-center justify-center w-5 h-5">
                  <ChevronRight size={14} className="text-white" />
                </div>
              </Button>
            </div>
          </div>
          
          {/* About Property */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">เกี่ยวกับอสังหาฯ</h3>
            </div>
            <p className="text-sm text-gray-600">{property.description || "ไม่มีข้อมูลรายละเอียด"}</p>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="rounded-full border-blue-500 text-blue-500 flex items-center">
                ดูทั้งหมด
                <div className="ml-2 bg-blue-500 rounded-full flex items-center justify-center w-5 h-5">
                  <ChevronRight size={14} className="text-white" />
                </div>
              </Button>
            </div>
          </div>
          
          {/* Property Location */}
          <div className="mb-8">
            <h3 className="text-xl font-medium mb-4">ที่ตั้งอสังหาฯ</h3>
            <div className="relative h-[300px] rounded-lg overflow-hidden" style={{ background: "#f0f0f0" }}>              <Suspense fallback={<Skeleton className="h-full w-full" />}>
                <PropertyMap 
                  lat={property.latitude || 13.7457211}  // Use property lat or default Thailand coordinates
                  lng={property.longitude || 100.5657291}  // Use property lng or default Thailand coordinates
                  address={property.address}
                />
              </Suspense>
            </div>            <div className="mt-2 text-right">
            </div>
          </div>

          {/* Facilities Section */}
          {(property.facilities && property.facilities.length > 0) || (property.project_facilities && property.project_facilities.length > 0) ? (
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">สิ่งอำนวยความสะดวก</h3>
              
              {property.facilities && property.facilities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-3 text-gray-700">สิ่งอำนวยความสะดวกในห้อง</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.facilities.map((facility: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {property.project_facilities && property.project_facilities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-3 text-gray-700">สิ่งอำนวยความสะดวกในโครงการ</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.project_facilities.map((facility: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Area Around Section */}
          {property.area_around && (
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">บริเวณโดยรอบ</h3>
              <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: property.area_around }} />
            </div>
          )}
          
          {/* Similar Properties Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">อสังหาฯ ใกล้เคียง</h3>
              <Button variant="outline" size="sm" className="rounded-full border-blue-500 text-blue-500 flex items-center">
                ดูทั้งหมด
                <div className="ml-2 bg-blue-500 rounded-full flex items-center justify-center w-5 h-5">
                  <ChevronRight size={14} className="text-white" />
                </div>
              </Button>
            </div>
          
            {/* Scrollable container for similar properties */}
            <div className="relative w-full">
              {/* Left scroll button */}
              <button 
                onClick={handleScrollLeft} 
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19L8 12L15 5" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {/* Right scroll button */}
              <button 
                onClick={handleScrollRight} 
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                style={{ transform: 'translate(50%, -50%)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5L16 12L9 19" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div 
                ref={scrollContainerRef} 
                className="overflow-x-auto pb-4 hide-scrollbar"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
              >                <div className="flex space-x-4 px-4 min-w-max">
                  {loadingSimilar ? (
                    // Loading skeletons
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex-shrink-0 w-72 bg-white rounded-lg overflow-hidden shadow-sm">
                        <Skeleton className="h-44 w-full" />
                        <div className="p-4">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2 mb-1" />
                          <Skeleton className="h-6 w-2/3 mb-3" />
                          <div className="grid grid-cols-4 gap-2 mb-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div key={i} className="flex flex-col items-center">
                                <Skeleton className="h-4 w-8 mb-1" />
                                <Skeleton className="h-3 w-12" />
                              </div>
                            ))}
                          </div>
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    ))
                  ) : similarProperties.length > 0 ? (
                    // Dynamic property cards
                    similarProperties.map((property) => {
                      // Format price with proper comma separation
                      const formatPrice = (price: string) => {
                        const numPrice = parseInt(price?.replace(/,/g, '') || '0');
                        return numPrice.toLocaleString();
                      };

                      // Determine property type based on rent_duration
                      const isForRent = property.rent_duration;
                      const propertyType = isForRent ? "ให้เช่า" : "ขาย";
                      const priceDisplay = isForRent 
                        ? `${formatPrice(property.price)} บาท / เดือน`
                        : `${formatPrice(property.price)} บาท`;

                      // Use fallback image if property image is not available
                      const imageUrl = property.image_url || "/modern-house-property.png";

                      return (
                        <div key={property.id} className="flex-shrink-0 w-72 bg-white rounded-lg overflow-hidden shadow-sm">
                          <div className="relative">
                            <Link href={`/property/${property.id}`}>
                              <div className="relative h-44 w-full">
                                <Image
                                  src={imageUrl}
                                  alt={property.project_name || "Property"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="absolute top-2 left-2">
                                <span className={`text-white text-sm font-medium px-4 py-1 rounded-full ${
                                  isForRent ? "bg-green-600" : "bg-blue-600"
                                }`}>
                                  {propertyType}
                                </span>
                              </div>
                              <div className="absolute top-2 right-2 flex space-x-2" onClick={(e) => e.preventDefault()}>
                                <button className="bg-gray-700 rounded-full p-2 shadow-md">
                                  <Heart size={20} className="text-white" />
                                </button>
                                <button className="bg-gray-700 rounded-full p-2 shadow-md">
                                  <Share2 size={20} className="text-white" />
                                </button>
                              </div>
                            </Link>
                          </div>
                          <div className="p-4 cursor-grab">
                            <Link href={`/property/${property.id}`} className="cursor-pointer">
                              <h4 className="text-lg font-bold">{property.project_name || "ไม่ระบุชื่อ"}</h4>
                              <p className="text-sm text-gray-500 mb-1">{property.address || "ไม่ระบุที่อยู่"}</p>
                              <p className="text-xl font-bold text-blue-600 mb-3">{priceDisplay}</p>
                            </Link>
                            <div className="grid grid-cols-4 gap-2 text-sm mb-2">
                              <div className="flex flex-col items-center">
                                <span className="flex items-center text-gray-700">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                  </svg>
                                  {property.usable_area || 0}
                                </span>
                                <span className="text-xs text-gray-500">ตารางเมตร</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="flex items-center text-gray-700">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                  </svg>
                                  {property.bedrooms || 0}
                                </span>
                                <span className="text-xs text-gray-500">ห้องนอน</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="flex items-center text-gray-700">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {property.bathrooms || 0}
                                </span>
                                <span className="text-xs text-gray-500">ห้องน้ำ</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="flex items-center text-gray-700">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {property.parking_spaces || 0}
                                </span>
                                <span className="text-xs text-gray-500">จอดรถ</span>
                              </div>
                            </div>
                            {property.view_count >= 50 && (
                              <div className="mt-3">
                                <span className="inline-block bg-orange-600 text-white text-xs font-medium px-3 py-1 rounded">แนะนำ</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Empty state
                    <div className="flex-shrink-0 w-full text-center py-8">
                      <p className="text-gray-500">ไม่พบอสังหาริมทรัพย์ที่คล้ายกัน</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <footer className="bg-[#006CE3] text-white p-6">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div><h3 className="text-lg font-bold mb-4">Teedin</h3><p className="text-sm text-gray-300">แพลตฟอร์มอสังหาริมทรัพย์ที่ช่วยให้คุณค้นหาบ้าน คอนโด และที่ดินได้ง่ายขึ้น</p></div>
                <div><h4 className="font-medium mb-3">เกี่ยวกับเรา</h4><ul className="space-y-2 text-sm text-gray-300"><li><a href="#" className="hover:text-white">เกี่ยวกับ Teedin</a></li><li><a href="#" className="hover:text-white">ติดต่อเรา</a></li><li><a href="#" className="hover:text-white">ร่วมงานกับเรา</a></li></ul></div>
                <div><h4 className="font-medium mb-3">บริการของเรา</h4><ul className="space-y-2 text-sm text-gray-300"><li><a href="#" className="hover:text-white">ซื้อบ้าน</a></li><li><a href="#" className="hover:text-white">เช่าบ้าน</a></li><li><a href="#" className="hover:text-white">ขายบ้าน</a></li><li><a href="#" className="hover:text-white">ประเมินราคา</a></li></ul></div>
                <div><h4 className="font-medium mb-3">ติดตามเรา</h4><div className="flex space-x-4">
                  <a href="#" className="text-white hover:text-gray-300"><span className="sr-only">Facebook</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></a>
                  <a href="#" className="text-white hover:text-gray-300"><span className="sr-only">Instagram</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416 1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353-.3.882-.344 1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg></a>
                  <a href="#" className="text-white hover:text-gray-300"><span className="sr-only">Twitter</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
                </div></div>
              </div>
          <div className="mt-8 pt-6 border-t border-white-700 text-sm text-white-400"><p>© 2023 Teedin. สงวนลิขสิทธิ์</p></div>
        </div>
        </footer>
      
      {/* Contact Agent Sidebar - Fixed on desktop, bottom sheet on mobile */}
      <div 
        className="fixed hidden md:block bg-blue-600 text-white rounded-[20px] overflow-hidden shadow-lg"
        style={{ 
          width: '255.61px', 
          height: 'auto', 
          top: '240px',
          right: '5%',
          padding: '30px 20px',
        }}
      >
        <div className="flex flex-col items-center gap-6">
          <h3 className="text-center text-xl font-medium">สอบถามเกี่ยวกับทรัพย์สิน</h3>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gray-300 mb-3 overflow-hidden relative">
              <Image src="/modern-building-center.jpg" alt="ชื่อเอเจ้นท์" fill className="object-cover" />
            </div>
            <p className="text-base text-center font-medium mt-2">ลี เบนจาบิน</p>
            <p className="text-sm text-center text-gray-100">ตัวแทนทรัพย์สิน</p>
          </div>
          <div className="w-full space-y-4">
            <Button className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-full border border-white">นัดหมายตัวแทน</Button>
            <Button className="w-full py-3 bg-white text-blue-600 hover:bg-gray-100 rounded-full">
              ขอต่อรองราคา
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Agent for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-blue-600 text-white rounded-t-lg overflow-hidden shadow-lg">
        <div className="p-6">
          <h3 className="text-center text-lg font-medium mb-4">สอบถามเกี่ยวกับทรัพย์สิน</h3>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 overflow-hidden relative">
              <Image src="/modern-building-center.jpg" alt="ชื่อเอเจ้นท์" fill className="object-cover" />
            </div>
            <div>
              <p className="text-sm">ชื่อเอเจ้นท์</p>
              <p className="text-xs text-gray-100">ตัวแทนทรัพย์สิน</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button className="flex-1 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-full border border-white">นัดหมายตัวแทน</Button>
            <Button className="flex-1 py-3 bg-white text-blue-600 hover:bg-gray-100 rounded-full">
              ขอต่อรองราคา
            </Button>
          </div>
        </div>
      </div>
    </div>

    
  )
}

// สร้างตัวจัดการ params เพื่อหลีกเลี่ยงการเข้าถึง params.id โดยตรง
function ParamsHandler({ children }: { children: (id: string) => React.ReactNode }) {
  const [id, setId] = useState("")
  
  // ดึงค่า id จาก URL ด้วย client-side only
  useEffect(() => {
    // ดึงค่า path ปัจจุบันจาก window.location.pathname
    const path = window.location.pathname
    // ใช้ regular expression ในการแยก id จาก path /property/{id}
    const match = path.match(/\/property\/([^\/]+)/)
    const extractedId = match ? match[1] : ""
    setId(extractedId)
  }, [])
  
  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-[600px] w-full max-w-4xl mx-auto rounded-lg" />
      </div>
    )
  }
  
  return <>{children(id)}</>
}

// Main component ที่จะรับ params แต่ไม่เข้าถึง params.id โดยตรง
export default function PropertyDetail() {
  return (
    <ParamsHandler>
      {(id) => <PropertyContent id={id} />}
    </ParamsHandler>
  )
}
