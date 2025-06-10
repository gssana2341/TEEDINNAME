"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/utils/supabase/client"
import type { PropertyData } from "@/components/property-card"
import {
  newProperties as staticNewProperties,
  rentalProperties as staticRentalProperties,
  saleProperties as staticSaleProperties
} from "@/data/properties"

// Define a more specific type for the data expected from Supabase
type SupabasePropertyRaw = {
  id: string;
  agent_id: string;
  listing_type: string[];
  property_category: string;
  in_project: boolean;
  rental_duration: string | null;
  location: { address?: string; lat?: number; lng?: number } | null;
  created_at: string;
  property_details: Array<{
    project_name: string;
    address: string;
    usable_area: number;
    bedrooms: number;
    bathrooms: number;
    parking_spaces: number;
    house_condition: string;
    highlight: string;
    area_around: string;
    facilities: string[];
    project_facilities: string[];
    description: string;
    price: number;
    images: string[];
    view_count?: number;
  }>;
  agent_info: {
    company_name: string;
    license_number: string;
    property_types: string[];
    service_areas: {
      province: string;
      district: string;
    }[];
  };
};

interface PropertyContextType {
  // All properties (ข้อมูลทั้งหมด)
  allNewProperties: PropertyData[];
  allRentalProperties: PropertyData[];
  allSaleProperties: PropertyData[];
  
  // Limited properties for homepage (ข้อมูลจำกัดสำหรับหน้า home)
  homeNewProperties: PropertyData[];
  homeRentalProperties: PropertyData[];
  homeSaleProperties: PropertyData[];
  
  isLoading: boolean;
  dataSource: 'supabase' | 'static';
  debugLogs: string[];
  
  // Functions
  refreshData: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  // ข้อมูลทั้งหมด (สำหรับหน้า all-properties)
  const [allNewProperties, setAllNewProperties] = useState<PropertyData[]>([]);
  const [allRentalProperties, setAllRentalProperties] = useState<PropertyData[]>([]);
  const [allSaleProperties, setAllSaleProperties] = useState<PropertyData[]>([]);
  
  // ข้อมูลจำกัดสำหรับหน้า home
  const [homeNewProperties, setHomeNewProperties] = useState<PropertyData[]>([]);
  const [homeRentalProperties, setHomeRentalProperties] = useState<PropertyData[]>([]);
  const [homeSaleProperties, setHomeSaleProperties] = useState<PropertyData[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'static'>('supabase');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false); // เพิ่มตัวแปรเพื่อตรวจสอบว่าโหลดแล้วหรือยัง

  const addDebugLog = (log: string) => {
    console.log(log);
    setDebugLogs(prev => [...prev, `${new Date().toISOString()}: ${log}`]);
  };

  const fetchProperties = async () => {
    // ถ้าโหลดแล้วให้ข้ามการโหลดซ้ำ
    if (hasLoadedOnce) {
      addDebugLog("ข้อมูลถูกโหลดแล้ว ข้ามการโหลดซ้ำ");
      return;
    }

    try {
      addDebugLog("เริ่มต้นการเชื่อมต่อกับ Supabase...");

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        addDebugLog(`SUPABASE_URL มีค่าหรือไม่: ${!!supabaseUrl}`);
        addDebugLog(`SUPABASE_ANON_KEY มีค่าหรือไม่: ${!!supabaseKey}`);
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Supabase configuration is missing.");
        }
        createClient();
        addDebugLog("สร้าง Supabase client สำเร็จ");
      } catch (configError: any) {
        addDebugLog(`เกิดข้อผิดพลาดในการตรวจสอบ config: ${configError.message}`);
        throw configError;
      }

      addDebugLog("กำลังดึงข้อมูลอสังหาริมทรัพย์ผ่าน API endpoint...");
      const response = await fetch('/api/get-properties');

      if (!response.ok) {
        const errorData = await response.json();
        addDebugLog(`API ส่งค่า error: ${errorData.error || response.statusText}`);
        throw new Error(errorData.error || 'Failed to fetch data from API');
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        addDebugLog(`API ไม่สำเร็จ: ${result.error || 'ไม่มีข้อมูล'}`);
        return await fallbackAndFetchSeparately();
      }

      const data = result.data;
      addDebugLog(`ดึงข้อมูลผ่าน API สำเร็จ จำนวน: ${data?.length || 0} รายการ`);

      if (!data || data.length === 0) {
        addDebugLog("ไม่พบข้อมูลจาก API endpoint กำลังลองดึงข้อมูลจากแต่ละตารางแยกกัน...");
        return await fallbackAndFetchSeparately();
      }

      const rawProperties = data as SupabasePropertyRaw[];

      const transformedData = rawProperties.map(item => {
        addDebugLog(`กำลังแปลงข้อมูล property ${item.id}`);

        if (!item.property_details || item.property_details.length === 0) {
          addDebugLog(`ไม่พบ property_details สำหรับ property ID ${item.id}`);
          return null;
        }

        const detailsObject = item.property_details[0];
        const agentObject = item.agent_info;

        return {
          id: item.id,
          title: detailsObject.project_name || item.property_category || "Untitled Property",
          location: item.location?.address || detailsObject.address || "Unknown Location",
          price: detailsObject.price?.toLocaleString() || "0",
          isPricePerMonth: item.listing_type?.includes("เช่า"),
          details: {
            area: detailsObject.usable_area || 0,
            bedrooms: detailsObject.bedrooms || 0,
            bathrooms: detailsObject.bathrooms || 0,
            parking: detailsObject.parking_spaces || 0,
          },
          image: detailsObject.images?.[0] || "/placeholder.svg",
          isForRent: item.listing_type?.includes("เช่า"),
          isForSale: item.listing_type?.includes("ขาย"),
          isTopPick: false,
          description: detailsObject.description || "",
          highlight: detailsObject.highlight || "",
          facilities: detailsObject.facilities || [],
          projectFacilities: detailsObject.project_facilities || [],
          viewCount: detailsObject.view_count || 0,
          agentInfo: agentObject ? {
            companyName: agentObject.company_name || "",
            licenseNumber: agentObject.license_number || "",
            propertyTypes: agentObject.property_types || [],
            serviceAreas: Array.isArray(agentObject.service_areas)
              ? agentObject.service_areas?.map((sa: any) => `${sa.district}, ${sa.province}`)
              : []
          } : null
        } as PropertyData;
      }).filter(Boolean) as PropertyData[];

      addDebugLog(`แปลงข้อมูลแล้ว ${transformedData.length} รายการ`);

      if (transformedData.length > 0) {
        const sortedNewProps = transformedData.sort((a, b) => {
          const itemA = rawProperties.find(p => p.id === a.id);
          const itemB = rawProperties.find(p => p.id === b.id);
          return new Date(itemB?.created_at || 0).getTime() - new Date(itemA?.created_at || 0).getTime();
        });
        const allRentProps = transformedData.filter(p => p.isForRent);
        const allSalesProps = transformedData.filter(p => p.isForSale);

        // ตั้งค่าข้อมูลทั้งหมด
        setAllNewProperties(sortedNewProps);
        setAllRentalProperties(allRentProps);
        setAllSaleProperties(allSalesProps);

        // ตั้งค่าข้อมูลจำกัดสำหรับหน้า home (5 รายการ)
        setHomeNewProperties(sortedNewProps.slice(0, 5));
        setHomeRentalProperties(allRentProps.slice(0, 5));
        setHomeSaleProperties(allSalesProps.slice(0, 5));

        setDataSource('supabase');
        setHasLoadedOnce(true); // ทำเครื่องหมายว่าโหลดแล้ว
      } else {
        addDebugLog("ไม่มีข้อมูลหลังจากแปลงข้อมูล จะใช้ข้อมูลแบบ static แทน");
        fallbackToStaticData();
      }

    } catch (error: any) {
      addDebugLog(`เกิดข้อผิดพลาดที่ไม่คาดคิดใน fetchProperties: ${error.message}`);
      if (dataSource !== 'static') fallbackToStaticData();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackAndFetchSeparately = async () => {
    addDebugLog("เริ่มต้นการดึงข้อมูลแบบ fallback (แยกตาราง)...");

    try {
      const response = await fetch('/api/get-properties?mode=fallback');

      if (!response.ok) {
        addDebugLog(`API fallback ไม่สำเร็จ: ${response.statusText}`);
        fallbackToStaticData();
        return;
      }

      const result = await response.json();

      if (!result.success || !result.data || result.data.length === 0) {
        addDebugLog(`API fallback ไม่มีข้อมูล: ${result.error || 'ไม่มีข้อมูล'}`);
        fallbackToStaticData();
        return;
      }

      const transformedData = result.data as PropertyData[];

      if (transformedData.length > 0) {
        const allRentProps = transformedData.filter(p => p.isForRent);
        const allSalesProps = transformedData.filter(p => p.isForSale);

        // ตั้งค่าข้อมูลทั้งหมด
        setAllNewProperties(transformedData);
        setAllRentalProperties(allRentProps);
        setAllSaleProperties(allSalesProps);

        // ตั้งค่าข้อมูลจำกัดสำหรับหน้า home (5 รายการ)
        setHomeNewProperties(transformedData.slice(0, 5));
        setHomeRentalProperties(allRentProps.slice(0, 5));
        setHomeSaleProperties(allSalesProps.slice(0, 5));

        setDataSource('supabase');
        setHasLoadedOnce(true); // ทำเครื่องหมายว่าโหลดแล้ว
        addDebugLog("Fallback API: อัปเดต state ด้วยข้อมูลที่ดึงแบบแยกตารางแล้ว");
      } else {
        addDebugLog("Fallback API: ไม่มีข้อมูลหลังแปลงข้อมูล จะใช้ข้อมูล static");
        fallbackToStaticData();
      }
    } catch (error: any) {
      addDebugLog(`Fallback API: เกิดข้อผิดพลาด: ${error.message}`);
      fallbackToStaticData();
    }
  };

  const fallbackToStaticData = () => {
    addDebugLog("ใช้ข้อมูลแบบ static แทน");
    
    // ตั้งค่าข้อมูลทั้งหมด
    setAllNewProperties(staticNewProperties);
    setAllRentalProperties(staticRentalProperties);
    setAllSaleProperties(staticSaleProperties);

    // ตั้งค่าข้อมูลจำกัดสำหรับหน้า home (5 รายการ)
    setHomeNewProperties(staticNewProperties.slice(0, 5));
    setHomeRentalProperties(staticRentalProperties.slice(0, 5));
    setHomeSaleProperties(staticSaleProperties.slice(0, 5));

    setDataSource('static');
    setHasLoadedOnce(true); // ทำเครื่องหมายว่าโหลดแล้ว
  };

  const refreshData = async () => {
    setHasLoadedOnce(false); // รีเซ็ตการโหลด
    setIsLoading(true);
    await fetchProperties();
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const value: PropertyContextType = {
    allNewProperties,
    allRentalProperties,
    allSaleProperties,
    homeNewProperties,
    homeRentalProperties,
    homeSaleProperties,
    isLoading,
    dataSource,
    debugLogs,
    refreshData,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}
