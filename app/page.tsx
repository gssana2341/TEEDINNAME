"use client"

import { useState } from "react"
import { FeaturedProperty } from "@/components/featured-property"
import { PopularLocations } from "@/components/popular-locations"
import { HeroSection } from "@/components/hero-section"
import { PropertySection } from "@/components/property-section"
import { useProperty } from "@/contexts/property-context"

export default function PropertyListing() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  
  // ใช้ข้อมูลจาก context
  const {
    homeNewProperties,
    homeRentalProperties,
    homeSaleProperties,
    isLoading,
    dataSource,
    debugLogs,
    refreshData
  } = useProperty();

  const popularLocations = [
    { name: "สุขุมวิท", image: "/locations/sukhumvit.jpg", url: "/locations/sukhumvit" },
    { name: "พระราม 9", image: "/locations/rama9.jpg", url: "/locations/rama9" },
    { name: "ห้าแยกลาดพร้าว", image: "/locations/ladprao.jpg", url: "/locations/ladprao" },
    { name: "สาทร", image: "/locations/sathorn.jpg", url: "/locations/sathorn" },
  ];
  return (
    <div className="flex flex-col min-h-screen bg-white font-sukhumvit">
      <HeroSection activeFilter={activeFilter} onFilterChangeAction={setActiveFilter} />
      <main className="flex-grow">
        {isLoading ? (
          <div className="container mx-auto px-4 py-20 text-center font-sukhumvit">
            <p className="text-xl font-medium">กำลังโหลดข้อมูลอสังหาริมทรัพย์...</p>
          </div>
        ) : (
          <>            {dataSource === 'static' && (
              <div className="container mx-auto px-4 py-4 text-center bg-yellow-100 text-yellow-700 rounded-md my-4 font-sukhumvit">
                <div className="flex flex-col items-center">
                  <p className="font-bold">⚠️ ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้อย่างสมบูรณ์</p>
                  <p className="text-sm mt-2 font-medium">
                    {debugLogs.find(log => log.includes('No internet connection available'))
                      ? 'ไม่พบการเชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อของท่าน'
                      : 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้ กำลังแสดงข้อมูลตัวอย่างแทน'}
                  </p>
                  <div className="mt-3 flex space-x-3">
                    <button
                      onClick={() => {
                        window.location.reload();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                      ลองโหลดข้อมูลใหม่
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/seed-data');
                          const data = await response.json();
                          if (data.success) {
                            alert('เพิ่มข้อมูลตัวอย่างสำเร็จ กรุณารีเฟรชหน้าเว็บ');
                            window.location.reload();
                          } else {
                            alert(`เกิดข้อผิดพลาด: ${data.error}`);
                          }
                        } catch (error: any) {
                          alert(`เกิดข้อผิดพลาด: ${error.message}`);
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors font-medium"
                    >
                      เพิ่มข้อมูลตัวอย่าง
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* แสดงรายละเอียดการดำเนินการสำหรับนักพัฒนา (ปิดเอาไว้) */}
            {/* {debugLogs.length > 0 && (
              <div className="container mx-auto px-4 mt-4 mb-4">
                <details className="bg-gray-100 p-4 rounded-lg shadow">
                  <summary className="font-medium cursor-pointer text-gray-700 hover:text-black">
                    แสดงรายละเอียดการดำเนินการ (สำหรับนักพัฒนา)
                  </summary>
                  <div className="mt-2 bg-black text-green-400 p-4 rounded overflow-auto max-h-96 font-mono text-sm">
                    {debugLogs.map((log, i) => (
                      <div key={i} className="whitespace-pre-wrap break-all mb-1">{log}</div>
                    ))}
                  </div>
                </details>
              </div>
            )} */}
              <div className="container mx-auto px-4 mt-10 mb-12">
              <PropertySection title="อสังหามาใหม่ล่าสุด! พร้อมเข้าอยู่/ลงทุน ราคาดี ทำเลเด่น" properties={homeNewProperties} />
            </div>
            {/* ส่วนพื้นหลังสีเทาสำหรับประกาศเช่าและขาย */}
            <div className="bg-gray-50 py-16 mt-12">
              <div className="container mx-auto px-4 space-y-12">
                <PropertySection title="ประกาศเช่าบ้าน/คอนโด/ที่ดิน พร้อมเข้าอยู่ ราคาดี ทำเลเยี่ยม!" properties={homeRentalProperties} />
              </div>
            </div>
              <FeaturedProperty
              title="THE GRAND RESIDENCE"
              location="สุขุมวิท - กรุงเทพฯ"
              description="โครงการคอนโดมิเนียมสไตล์โมเดิร์นลักชัวรี่ ใกล้รถไฟฟ้า ตั้งอยู่ในทำเลศักยภาพ ใกล้ห้างสรรพสินค้า และสิ่งอำนวยความสะดวกครบครัน"
              price="เริ่มต้น 5.5 ล้านบาท"
              images={["/properties/new-property-1.jpg", "/properties/sale-2.jpg", "/properties/rental-3.jpg"]}
              details={{ totalUnits: "406 ยูนิต", roomSize: "27-32.7 ตร.ม.", pricePerSqm: "(57,098 บาท/ตร.ม.)", maintenanceFee: "18 บาท" }}              tags={["โครงการใหม่", "บ้านจัดสรร"]}
            />
            <div className="container mx-auto px-4 mt-12 mb-12">
              <PropertySection title="ประกาศ เช่า/ขาย บ้าน/คอนโด ทำเลทอง ใกล้ห้างฯ ร้านอาหาร แหล่งไลฟ์สไตล์ครบครัน" properties={[...homeRentalProperties.slice(0, 3), ...homeSaleProperties.slice(0, 2)]} />
            </div>
          <div className="bg-gray-50 py-16 mt-12">
              <div className="container mx-auto px-4 mt-12 mb-12">
                <PropertySection title="ประกาศขาย บ้าน/คอนโด/ที่ดิน ทำเลทอง ลงทุนก็คุ้ม อยู่เองก็สบาย" properties={homeSaleProperties} />
              </div>
          </div>
            <PopularLocations title="ทำเลยอดนิยม" locations={popularLocations} />
          </>
        )}
      </main>      <footer className="bg-[#006CE3] text-white p-6 font-sukhumvit">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div><h3 className="text-lg font-bold mb-4">Teedin</h3><p className="text-sm text-gray-300 font-medium">แพลตฟอร์มอสังหาริมทรัพย์ที่ช่วยให้คุณค้นหาบ้าน คอนโด และที่ดินได้ง่ายขึ้น</p></div>
            <div><h4 className="font-semibold mb-3">เกี่ยวกับเรา</h4><ul className="space-y-2 text-sm text-gray-300"><li><a href="#" className="hover:text-white font-medium">เกี่ยวกับ Teedin</a></li><li><a href="#" className="hover:text-white font-medium">ติดต่อเรา</a></li><li><a href="#" className="hover:text-white font-medium">ร่วมงานกับเรา</a></li></ul></div>
            <div><h4 className="font-semibold mb-3">บริการของเรา</h4><ul className="space-y-2 text-sm text-gray-300"><li><a href="#" className="hover:text-white font-medium">ซื้อบ้าน</a></li><li><a href="#" className="hover:text-white font-medium">เช่าบ้าน</a></li><li><a href="#" className="hover:text-white font-medium">ขายบ้าน</a></li><li><a href="#" className="hover:text-white font-medium">ประเมินราคา</a></li></ul></div>
            <div><h4 className="font-semibold mb-3">ติดตามเรา</h4><div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-300"><span className="sr-only">Facebook</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></a>
              <a href="#" className="text-white hover:text-gray-300"><span className="sr-only">Instagram</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416 1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353-.3.882-.344 1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg></a>
              <a href="#" className="text-white hover:text-gray-300"><span className="sr-only">Twitter</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
            </div></div>
          </div>
          <div className="mt-8 pt-6 border-t border-white-700 text-sm text-white-400"><p>© 2023 Teedin. สงวนลิขสิทธิ์</p></div>
        </div>
      </footer>
    </div>
  )
}
