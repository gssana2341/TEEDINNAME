'use client';

import React, { useState } from 'react';
import { Search, MapPin, Filter, ArrowLeft, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { PropertyCard } from '@/components/property-card';
import { useProperty } from '@/contexts/property-context';
import Link from 'next/link';

interface MapMarkerProps {
  price: string;
  x: number;
  y: number;
  color?: string;
}

const MapMarker = ({ price, x, y, color = "bg-blue-500" }: MapMarkerProps) => (
  <div 
    className={`absolute ${color} text-white px-2 py-1 rounded text-sm font-semibold shadow-lg`}
    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
  >
    {price}
  </div>
);

export default function PropertySearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [bedrooms, setBedrooms] = useState('all');
  const [showRentals, setShowRentals] = useState(true);
  const [showSales, setShowSales] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  // ใช้ข้อมูลจาก Property Context เหมือนกับหน้าอื่นๆ
  const {
    allNewProperties,
    allRentalProperties,
    allSaleProperties,
    isLoading,
    dataSource
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
  
  // Filter properties based on search query and filters
  const filteredProperties = allProperties.filter(property => {
    // ตัวกรองคำค้นหา
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = (
        property.title?.toLowerCase().includes(searchLower) ||
        property.location?.toLowerCase().includes(searchLower) ||
        property.description?.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    // ตัวกรองประเภท (เช่า/ขาย)
    if (!showRentals && property.isForRent) return false;
    if (!showSales && property.isForSale) return false;

    // ตัวกรองจำนวนห้องนอน
    if (bedrooms !== 'all') {
      const bedroomNum = parseInt(bedrooms);
      if (property.details.bedrooms !== bedroomNum) return false;
    }

    // ตัวกรองราคา
    if (priceRange !== 'all') {
      const price = parseInt(property.price.replace(/[^0-9]/g, ''));
      switch (priceRange) {
        case 'under-20k':
          if (price >= 20000) return false;
          break;
        case '20k-50k':
          if (price < 20000 || price >= 50000) return false;
          break;
        case '50k-100k':
          if (price < 50000 || price >= 100000) return false;
          break;
        case 'over-100k':
          if (price < 100000) return false;
          break;
      }
    }

    return true;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          <Link href="/all-properties" className="text-white hover:text-blue-200 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            ย้อนกลับ
          </Link>
          
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="ค้นหาทำเล, โครงการ, หรือคีย์เวิร์ด"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="bg-blue-500 border border-blue-400 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">ทุกระดับราคา</option>
              <option value="under-20k">ต่ำกว่า 20,000</option>
              <option value="20k-50k">20,000 - 50,000</option>
              <option value="50k-100k">50,000 - 100,000</option>
              <option value="over-100k">มากกว่า 100,000</option>
            </select>
            
            <select 
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="bg-blue-500 border border-blue-400 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">ประเภทอสังหาฯ</option>
              <option value="condo">คอนโด</option>
              <option value="house">บ้าน</option>
              <option value="townhouse">ทาวน์เฮาส์</option>
            </select>
            
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="bg-blue-500 border border-blue-400 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">จำนวนห้องนอน</option>
              <option value="1">1 ห้องนอน</option>
              <option value="2">2 ห้องนอน</option>
              <option value="3">3 ห้องนอน</option>
              <option value="4">4+ ห้องนอน</option>
            </select>
            
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={showRentals}
                  onChange={(e) => setShowRentals(e.target.checked)}
                  className="rounded"
                />
                เช่า
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={showSales}
                  onChange={(e) => setShowSales(e.target.checked)}
                  className="rounded"
                />
                ขาย
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 w-full h-full overflow-hidden">
        {/* Property List Sidebar */}
        <div 
          className={`bg-white border-r flex flex-col transition-all duration-300 ease-in-out relative ${
            showSidebar ? 'w-1/3' : 'w-0'
          }`}
        >
          {/* ปุ่มลูกศรที่ขอบด้านขวา */}
          <button
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all duration-200 z-20"
            onClick={() => setShowSidebar(!showSidebar)}
            aria-label={showSidebar ? "ปิดรายการ" : "แสดงรายการ"}
          >
            {showSidebar ? (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* เนื้อหา sidebar */}
          <div className={`flex flex-col h-full ${showSidebar ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
            {/* Header ข้อมูลสถิติ */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <div className="text-sm text-gray-600">
                พบ {filteredProperties.length} รายการ ({dataSource === 'supabase' ? 'จากฐานข้อมูล' : 'จากข้อมูลตัวอย่าง'})
              </div>
            </div>
            
            {/* รายการการ์ด - มี scroll เฉพาะส่วนนี้ */}
            <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
                </div>
              ) : (
                <div>
                  {/* รายการ Property แบบกริด 2 คอลัมน์ */}
                  <div className="grid grid-cols-2 gap-3">
                    {filteredProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                  
                  {filteredProperties.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 py-8">
                      ไม่พบรายการที่ค้นหา
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative overflow-hidden">
          <div className="w-full h-full bg-gray-200 relative">
            {/* OpenStreetMap */}
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=100.3000%2C13.5000%2C100.9000%2C14.0000&layer=mapnik&marker=13.7563%2C100.5018"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bangkok Property Map"
            ></iframe>
            
            {/* Map Overlays */}
            <div className="absolute inset-0 bg-blue-50 opacity-10 pointer-events-none"></div>
            
            {/* Price Markers */}
            <MapMarker price="30,000/เดือน" x={25} y={30} />
            <MapMarker price="30,000/เดือน" x={45} y={45} color="bg-red-500" />
            
            {/* Location Labels */}
            <div className="absolute top-20 left-1/4 text-lg font-semibold text-gray-700">
              วิทยาลัยโพธิ์พระอาราม หลวง
            </div>
            
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-lg font-semibold text-gray-700">
              ตลาดกลางดิน พฒนา
            </div>
            
            <div className="absolute bottom-1/3 right-1/4 text-lg font-semibold text-gray-700">
              แขวงสีลม
            </div>

            {/* Hotel Markers */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-3 py-2 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                  <span className="text-pink-500 text-xs">🏨</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Bangkok Marriott</div>
                  <div className="text-xs">Hotel The Surawongse</div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <button className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 text-xl font-semibold">
                +
              </button>
              <button className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 text-xl font-semibold">
                −
              </button>
            </div>

            {/* Location Type Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="text-sm">ประเภทบ้าน</span>
              </div>
              <div className="bg-purple-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="text-sm">ประเภทลงนาม</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}