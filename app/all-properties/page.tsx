"use client"
import { HeroSection } from "@/components/hero-section"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Search, ChevronDown, X, Sliders, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PropertyCard } from "@/components/property-card"
import { Slider } from "@/components/ui/slider"
import type { PropertyData } from "@/components/property-card"
import Link from "next/link"
import { useProperty } from "@/contexts/property-context"

export default function AllPropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState([0, 34001000])
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null)
  const [selectedRentalType, setSelectedRentalType] = useState<string | null>(null)
  const [selectedRooms, setSelectedRooms] = useState<string | null>(null)
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 30

  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // ใช้ข้อมูลจาก context แทนการโหลดใหม่
  const {
    allNewProperties,
    allRentalProperties,
    allSaleProperties,
    isLoading,
    dataSource,
    debugLogs
  } = useProperty();

  // รวมข้อมูลทั้งหมดจาก context และกรองข้อมูลซ้ำ
  const allProperties = [
    ...allNewProperties,
    ...allRentalProperties,
    ...allSaleProperties
  ].filter((property, index, self) => 
    // กรองข้อมูลซ้ำ (ถ้ามี property เดียวกันอยู่ในหลายหมวด)
    index === self.findIndex((p) => p.id === property.id)
  );

  // Fix for TypeScript ref callback error
  const setDropdownRef = (key: string) => (el: HTMLDivElement | null) => {
    dropdownRefs.current[key] = el;
    return undefined;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !dropdownRefs.current[openDropdown]?.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  // Filter logic
  const filteredProperties = allProperties.filter(property => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        property.title?.toLowerCase().includes(searchLower) ||
        property.location?.toLowerCase().includes(searchLower) ||
        property.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Property type filter
    if (selectedPropertyType) {
      if (selectedPropertyType === "คอนโด" && !property.title?.toLowerCase().includes("คอนโด")) return false;
      if (selectedPropertyType === "บ้าน" && !property.title?.toLowerCase().includes("บ้าน")) return false;
      if (selectedPropertyType === "ที่ดิน" && !property.title?.toLowerCase().includes("ที่ดิน")) return false;
    }

    // Rental type filter
    if (selectedRentalType) {
      if (selectedRentalType === "เช่า" && !property.isForRent) return false;
      if (selectedRentalType === "ขาย" && !property.isForSale) return false;
    }

    // Room filter
    if (selectedRooms) {
      const rooms = parseInt(selectedRooms);
      if (property.details?.bedrooms !== rooms) return false;
    }

    // Price filter
    const price = parseInt(property.price?.replace(/,/g, '') || '0');
    if (price < priceRange[0] || price > priceRange[1]) return false;

    return true;
  });

  // Pagination logic
  const totalItems = filteredProperties.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedPropertyType, selectedRentalType, selectedRooms, priceRange])

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) return // Don't interfere with browser shortcuts
      
      if (event.key === 'ArrowLeft' && currentPage > 1) {
        event.preventDefault()
        setCurrentPage(prev => prev - 1)
      } else if (event.key === 'ArrowRight' && currentPage < totalPages) {
        event.preventDefault()
        setCurrentPage(prev => prev + 1)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages])

  return (
    <div className="min-h-screen bg-white">
      <HeroSection activeFilter={activeFilter} onFilterChangeAction={setActiveFilter} />
      
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-xl">กำลังโหลดข้อมูลอสังหาริมทรัพย์...</p>
          </div>
        ) : (
          <>
            {dataSource === 'static' && (
              <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 rounded-md">
                <p className="font-medium">⚠️ กำลังแสดงข้อมูลตัวอย่าง เนื่องจากไม่สามารถเชื่อมต่อกับฐานข้อมูลได้</p>
              </div>
            )}

            {/* Search and Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              {/* Search */}
              <div className="flex-grow min-w-64">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาตำแหน่ง, โครงการ หรือคีย์เวิร์ด"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                    >
                      <X />
                    </button>
                  )}
                </div>
              </div>

              {/* Property Type Filter */}
              <div className="relative" ref={setDropdownRef('propertyType')}>
                <FilterButton
                  label={selectedPropertyType || "ประเภท"}
                  isActive={!!selectedPropertyType}
                  onClick={() => setOpenDropdown(openDropdown === 'propertyType' ? null : 'propertyType')}
                  hasDropdown
                />
                {openDropdown === 'propertyType' && (
                  <div className="absolute top-full mt-2 z-20 bg-white shadow-lg rounded-md border border-gray-200 w-48 p-4">
                    <div className="space-y-2">
                      <PropertyTypeOption
                        label="คอนโด"
                        isSelected={selectedPropertyType === "คอนโด"}
                        onClick={() => {
                          setSelectedPropertyType(selectedPropertyType === "คอนโด" ? null : "คอนโด");
                          setOpenDropdown(null);
                        }}
                      />
                      <PropertyTypeOption
                        label="บ้าน"
                        isSelected={selectedPropertyType === "บ้าน"}
                        onClick={() => {
                          setSelectedPropertyType(selectedPropertyType === "บ้าน" ? null : "บ้าน");
                          setOpenDropdown(null);
                        }}
                      />
                      <PropertyTypeOption
                        label="ที่ดิน"
                        isSelected={selectedPropertyType === "ที่ดิน"}
                        onClick={() => {
                          setSelectedPropertyType(selectedPropertyType === "ที่ดิน" ? null : "ที่ดิน");
                          setOpenDropdown(null);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Rental Type Filter */}
              <div className="relative" ref={setDropdownRef('rentalType')}>
                <FilterButton
                  label={selectedRentalType || "เช่า/ขาย"}
                  isActive={!!selectedRentalType}
                  onClick={() => setOpenDropdown(openDropdown === 'rentalType' ? null : 'rentalType')}
                  hasDropdown
                />
                {openDropdown === 'rentalType' && (
                  <div className="absolute top-full mt-2 z-20 bg-white shadow-lg rounded-md border border-gray-200 w-32 p-4">
                    <div className="space-y-2">
                      <PropertyTypeOption
                        label="เช่า"
                        isSelected={selectedRentalType === "เช่า"}
                        onClick={() => {
                          setSelectedRentalType(selectedRentalType === "เช่า" ? null : "เช่า");
                          setOpenDropdown(null);
                        }}
                      />
                      <PropertyTypeOption
                        label="ขาย"
                        isSelected={selectedRentalType === "ขาย"}
                        onClick={() => {
                          setSelectedRentalType(selectedRentalType === "ขาย" ? null : "ขาย");
                          setOpenDropdown(null);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Rooms Filter */}
              <div className="relative" ref={setDropdownRef('rooms')}>
                <FilterButton
                  label={selectedRooms ? `${selectedRooms} ห้องนอน` : "ห้องนอน"}
                  isActive={!!selectedRooms}
                  onClick={() => setOpenDropdown(openDropdown === 'rooms' ? null : 'rooms')}
                  hasDropdown
                />
                {openDropdown === 'rooms' && (
                  <div className="absolute top-full mt-2 z-20 bg-white shadow-lg rounded-md border border-gray-200 w-48 p-4">
                    <div className="grid grid-cols-3 gap-2">
                      {["1", "2", "3", "4", "5+"].map((room) => (
                        <RoomOption
                          key={room}
                          label={room}
                          isSelected={selectedRooms === room}
                          onClick={() => {
                            setSelectedRooms(selectedRooms === room ? null : room);
                            setOpenDropdown(null);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="relative" ref={setDropdownRef('price')}>
                <FilterButton
                  label="ราคา"
                  isActive={priceRange[0] !== 0 || priceRange[1] !== 34001000}
                  onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
                  hasDropdown
                />
                {openDropdown === 'price' && (
                  <div className="absolute top-full mt-2 z-20 bg-white shadow-lg rounded-md border border-gray-200 w-80 p-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">ช่วงราคา (บาท)</h4>
                      <Slider
                        defaultValue={[priceRange[0], priceRange[1]]}
                        max={34001000}
                        step={1000}
                        onValueChange={(value) => setPriceRange(value)}
                        className="mb-6"
                      />
                      <div className="flex justify-between mt-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">ราคาต่ำสุด</span>
                          <input
                            type="text"
                            value={priceRange[0].toLocaleString()}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-32 mt-1"
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/,/g, ''));
                              if (!isNaN(value)) {
                                setPriceRange([value, priceRange[1]]);
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">ราคาสูงสุด</span>
                          <input
                            type="text"
                            value={priceRange[1].toLocaleString()}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-32 mt-1"
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/,/g, ''));
                              if (!isNaN(value)) {
                                setPriceRange([priceRange[0], value]);
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between mt-5">
                        <Button variant="outline" className="text-sm px-4 py-2" onClick={() => setPriceRange([0, 34001000])}>
                          รีเซ็ต
                        </Button>
                        <Button className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setOpenDropdown(null)}>
                          ใช้งาน
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-grow"></div>              {/* Map View Toggle - Navigate to Map Page */}
              <Link href="/map">
                <Button className="px-4 py-2 rounded-md flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
                  <MapPin size={16} />
                  แสดงแผนที่
                </Button>
              </Link>

              {/* Clear Filters */}
              {(searchQuery || selectedPropertyType || selectedRentalType || selectedRooms || priceRange[0] !== 0 || priceRange[1] !== 34001000) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedPropertyType(null);
                    setSelectedRentalType(null);
                    setSelectedRooms(null);
                    setPriceRange([0, 34001000]);
                  }}
                  className="text-gray-600"
                >
                  ล้างตัวกรอง
                </Button>
              )}
            </div>            {/* Results Count and Pagination Info */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold mb-2">ผลการค้นหาอสังหาริมทรัพย์</h1>                <div className="flex items-center gap-3">
                  <p className="text-gray-600">
                    แสดง {startIndex + 1}-{Math.min(endIndex, totalItems)} จาก {totalItems} รายการ
                    {totalPages > 1 && ` (หน้า ${currentPage} จาก ${totalPages})`}
                  </p>
                </div>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    ← ก่อนหน้า
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    ถัดไป →
                  </Button>
                </div>
              )}
            </div>

            {/* Main Content */}            {filteredProperties.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500">ไม่พบอสังหาริมทรัพย์ที่ตรงกับเงื่อนไขการค้นหา</p>
                <p className="text-gray-400 mt-2">ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {paginatedProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
                  {/* Bottom Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <div className="flex flex-col items-center gap-4">
                      {/* Navigation hint */}
                      <p className="text-sm text-gray-500">
       
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="flex items-center gap-2 px-6 py-2 disabled:opacity-50"
                          title="หน้าก่อนหน้า (←)"
                        >
                          ← ก่อนหน้า
                        </Button>
                        
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
                          <span className="text-sm text-gray-600">หน้า</span>
                          <span className="px-4 py-1 bg-blue-600 text-white rounded-lg font-medium min-w-[3rem] text-center">
                            {currentPage}
                          </span>
                          <span className="text-sm text-gray-600">จาก {totalPages}</span>
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-2 px-6 py-2 disabled:opacity-50"
                          title="หน้าถัดไป (→)"
                        >
                          ถัดไป →
                        </Button>
                      </div>                      
                      {/* Performance info */}
                      <div className="text-xs text-gray-400">
            
                      </div>
                    </div>
                  </div>
                )}
              </>            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#006CE3] text-white p-6 mt-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Teedin</h3>
              <p className="text-sm text-gray-300">แพลตฟอร์มอสังหาริมทรัพย์ที่ช่วยให้คุณค้นหาบ้าน คอนโด และที่ดินได้ง่ายขึ้น</p>
            </div>
            <div>
              <h4 className="font-medium mb-3">เกี่ยวกับเรา</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">เกี่ยวกับ Teedin</a></li>
                <li><a href="#" className="hover:text-white">ติดต่อเรา</a></li>
                <li><a href="#" className="hover:text-white">ร่วมงานกับเรา</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">บริการของเรา</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">ซื้อบ้าน</a></li>
                <li><a href="#" className="hover:text-white">เช่าบ้าน</a></li>
                <li><a href="#" className="hover:text-white">ขายบ้าน</a></li>
                <li><a href="#" className="hover:text-white">ประเมินราคา</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">ติดตามเรา</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-gray-300">Facebook</a>
                <a href="#" className="text-white hover:text-gray-300">Instagram</a>
                <a href="#" className="text-white hover:text-gray-300">Twitter</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white-700 text-sm text-white-400">
            <p>© 2023 Teedin. สงวนลิขสิทธิ์</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Helper Components
interface FilterButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
  hasDropdown?: boolean
}

function FilterButton({ label, isActive, onClick, hasDropdown = false }: FilterButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-md flex items-center ${isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
      onClick={onClick}
    >
      <span>{label}</span>
      {hasDropdown && <ChevronDown className="ml-1 h-4 w-4" />}
    </button>
  )
}

interface PropertyTypeOptionProps {
  label: string
  isSelected: boolean
  onClick: () => void
  hot?: boolean
}

function PropertyTypeOption({ label, isSelected, onClick, hot = false }: PropertyTypeOptionProps) {
  return (
    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={onClick}>
      <span className={`${isSelected ? 'text-blue-600 font-medium' : 'text-gray-800'}`}>{label}</span>
      <div className="flex items-center">
        {hot && <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded mr-2">HOT</span>}
        {isSelected && <div className="w-4 h-4 flex items-center justify-center bg-blue-600 rounded-full text-white">✓</div>}
      </div>
    </div>
  )
}

interface RoomOptionProps {
  label: string
  isSelected: boolean
  onClick: () => void
}

function RoomOption({ label, isSelected, onClick }: RoomOptionProps) {
  return (
    <div
      className={`px-3 py-2 rounded-md cursor-pointer text-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
      onClick={onClick}
    >
      {label}
    </div>
  )
}


