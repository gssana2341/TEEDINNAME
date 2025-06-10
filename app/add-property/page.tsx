"use client"

import type React from "react"
import { useState } from "react"
import { Check, Home, MapPin, FileText } from "lucide-react"

const AddPropertyPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [images, setImages] = useState<File[]>([])
  const [projectName, setProjectName] = useState("")
  const [address, setAddress] = useState("")
  const [area, setArea] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [parking, setParking] = useState("")
  const [houseAge, setHouseAge] = useState("")
  const [highlights, setHighlights] = useState("")
  const [facilities, setFacilities] = useState("")
  const [price, setPrice] = useState("")

  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleAddImage = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (event.target.files && event.target.files[0]) {
      const newImages = [...images]
      newImages[index] = event.target.files[0]
      setImages(newImages)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  // Steps data for the progress bar
  const steps = [
    { id: 1, name: "แนะนำการลงประกาศ", icon: <FileText className="w-5 h-5" /> },
    { id: 2, name: "กรอกรายละเอียดเบื้องต้น", icon: <Home className="w-5 h-5" /> },
    { id: 3, name: "กรอกรายละเอียดอสังหา", icon: <MapPin className="w-5 h-5" /> },
    { id: 4, name: "ตรวจสอบข้อมูล", icon: <Check className="w-5 h-5" /> },
  ]

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">TEEDIN EASY</h1>
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="hover:underline">
              ซื้อ
            </a>
            <a href="/" className="hover:underline">
              เช่า
            </a>
            <a href="/" className="hover:underline">
              อสังหาแนะนำ
            </a>
            <a href="/" className="hover:underline">
              อสังหาใหม่
            </a>
            <a href="/" className="hover:underline">
              โครงการใหม่
            </a>
            <a href="/add-property" className="hover:underline">
              ลงประกาศ
            </a>
            <a href="/" className="hover:underline">
              สมัคร AGEN
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-white">
              <span className="sr-only">การแจ้งเตือน</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">ภาษาไทย</button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">โปรไฟล์</button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 mt-8">
        <div className="relative max-w-4xl mx-auto">
          {/* เส้นพื้นหลังและเส้นความคืบหน้า */}
          <div className="absolute top-[30px] left-0 w-full h-1 bg-gray-200"></div>
          <div
            className="absolute top-[30px] left-0 h-1 bg-blue-600 transition-all duration-500"
            style={{ width: `${(currentStep - 1) * 33.33}%` }}
          ></div>

          {/* จุดและข้อความ */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* จุดแสดงสถานะ */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-300
                  ${
                    currentStep > index + 1
                      ? "bg-blue-600 text-white"
                      : currentStep === index + 1
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <span className="text-lg font-medium">{index + 1}</span>
                </div>
                {/* ข้อความ */}
                <p
                  className={`text-sm text-center max-w-[120px] transition-colors duration-300
              ${currentStep >= index + 1 ? "text-blue-600 font-medium" : "text-gray-400"}`}
                >
                  {step.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto mt-12 px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 font-mono">🌟 ลงประกาศอสังหาริมทรัพย์ง่าย ๆ ในไม่กี่ขั้นตอน! 🌟</h2>
                <p className="text-gray-600 mt-4 text-sm/6 leading-6 ">
                  Teedin Easy ช่วยให้คุณลงประกาศได้สะดวก รวดเร็ว โดยใช้แผนที่ (Maps) ในการค้นหาอสังหาริมทรัพย์ เพียงแค่มีบัญชี
                  ระบบจะช่วยบันทึกข้อมูลที่อยู่และรายละเอียดการกรอกให้ไวขึ้น ลดเวลาการกรอกข้อมูล ให้คุณสามารถสร้างโอกาสทางการขายได้ง่ายขึ้น!
                </p>
              </div>

              {/* วิธีลงประกาศง่าย ๆ */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <span className="text-green-600 mr-2 text-xl ">✓</span> <span className="text-gray-700 font-bold font-sans">วิธีลงประกาศง่าย ๆ</span>
                </h3>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">1.</span>
                    <span className="text-gray-700">เลือกการ ขาย หรือ เช่า หรือ ทั้งขายและเช่า</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">2.</span>
                    <span className="text-gray-700">เลือกประเภทอสังหาริมทรัพย์ - บ้าน, คอนโด, ที่ดิน หรืออื่น ๆ</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">3.</span>
                    <span className="text-gray-700">ปักหมุดบนแผนที่ - ระบุตำแหน่งของอสังหาริมทรัพย์</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">4.</span>
                    <span className="text-gray-700">ตรวจสอบข้อมูล - ระบบช่วยบันทึกข้อมูลการกรอกให้ไวขึ้น ลดเวลาการกรอกการ</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">5.</span>
                    <span className="text-gray-700">ปิดการประกาศ - เพิ่มพลังการขายอสังหาริมทรัพย์ให้กับคุณ</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">6.</span>
                    <span className="text-gray-700">กดเผยแพร่ - ประกาศของคุณจะพร้อมแสดงให้ผู้ซื้อ/เช่าเห็นทันที</span>
                  </li>
                </ul>
              </div>

              {/* ทำไมต้อง Teedin Easy? */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <span className="mr-2 text-xl">🔍</span> <span className="text-gray-700 font-bold font-sans">ทำไมต้อง Teedin Easy?</span>
                </h3>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">มีแผนที่ช่วย - ไม่ต้องกรอกที่อยู่เอง ระบบทำให้สะดวก!</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">ลดเวลาลงประกาศ - มีข้อมูลให้การกรอกไวเป็นพิเศษ</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">เข้าถึงลูกค้าได้เร็ว - แสดงประกาศของคุณให้กับผู้สนใจอสังหาฯ ได้เห็น</span>
                  </li>
                </ul>
              </div>

              {/* ปุ่มดำเนินการต่อ */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  ดำเนินการต่อ
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-4xl mx-auto mt-8 px-4">
              <div className="space-y-8">
                {/* ต้องการขายหรือปล่อยเช่า */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-700">ต้องการขายหรือปล่อยเช่า</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="w-5 h-5 mr-3 bg-gray-800 text-gray-900 border-gray-700 rounded focus:ring-0" />
                      <span className="text-gray-700">ฉันต้องการ ขาย</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="w-5 h-5 mr-3 bg-gray-800 text-gray-900 border-gray-700 rounded focus:ring-0" />
                      <span className="text-gray-700">ฉันต้องการปล่อยเช่า</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="w-5 h-5 mr-3 bg-gray-800 text-gray-900 border-gray-700 rounded focus:ring-0" />
                      <span className="text-gray-700">ฉันต้องการขายและปล่อยเช่า</span>
                    </label>
                  </div>
                </div>

                {/* เลือกประเภทอสังหาริมทรัพย์ */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-700">เลือกประเภทอสังหาริมทรัพย์ ที่คุณต้องการลงประกาศ</h3>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-md py-3 px-4 pr-8 bg-white text-gray-700 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      <option>เลือกประเภทอสังหา</option>
                      <option>บ้าน</option>
                      <option>คอนโด</option>
                      <option>ที่ดิน</option>
                      <option>อื่น ๆ</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* บ้านเช่าของคุณอยู่ในโครงการหรือไม่ */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-700">บ้านเช่าของคุณอยู่ในโครงการใช่หรือไม่?</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="radio" name="project" className="w-5 h-5 mr-3 bg-gray-800 text-gray-900 border-gray-700 focus:ring-0" />
                      <span className="text-gray-700">ใช่</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="project" className="w-5 h-5 mr-3 bg-gray-800 text-gray-900 border-gray-700 focus:ring-0" />
                      <span className="text-gray-700">ไม่ใช่</span>
                    </label>
                  </div>
                </div>

                {/* จำนวนวันที่ปล่อยเช่า */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-700">จำนวนวันที่ปล่อยเช่า ( 3 เดือน, 6 เดือน, 9 เดือน 12 เดือน )</h3>
                  <div className="relative">
                    <select className="w-full appearance-none rounded-md py-3 px-4 pr-8 bg-white text-gray-700 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      <option>เลือกจำนวนวันที่ปล่อยเช่า</option>
                      <option>3 เดือน</option>
                      <option>6 เดือน</option>
                      <option>9 เดือน</option>
                      <option>12 เดือน</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ปักหมุดเพื่อหาโครงการหรือที่อยู่ */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-700">ปักหมุดเพื่อหาโครงการหรือที่อยู่บ้านเช่าของคุณ</h3>
                  <input
                    type="text"
                    placeholder="คลิกเพื่อปักหมุด"
                    className="w-full rounded-md py-3 px-4 bg-white text-gray-700 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* ปุ่มย้อนกลับและดำเนินการต่อ */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handlePreviousStep}
                    className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    ดำเนินการต่อ
                  </button>
                </div>
              </div>
            </div>
          )}          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto mt-8 px-4">
              <div className="space-y-6">
                {/* ชื่อโครงการ */}
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">ชื่อโครงการ</h3>
                  <input
                    type="text"
                    placeholder="ระบุ โครงการ"
                    className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base text-black placeholder-gray-500 bg-white"
                  />
                </div>

                {/* ที่อยู่ */}
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">ที่อยู่</h3>
                  <input
                    type="text"
                    placeholder="ซอย, ประชาอุทิศ, ซอยพัฒนาการ, ราชพฤกษ์ (ตัวอย่าง ซอย 12/2)"
                    className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base text-black placeholder-gray-500 bg-white"
                  />
                </div>                {/* พื้นที่ใช้สอย */}
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">พื้นที่ใช้สอย (ตร.ม.)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label htmlFor="area-total" className="block text-base font-medium text-gray-800 mb-1">พื้นที่</label>
                      <input type="number" id="area-total" placeholder="0" className="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base text-black placeholder-gray-500 bg-white" />
                    </div>
                    <div>
                      <label htmlFor="bedrooms" className="block text-base font-medium text-gray-800 mb-1">ห้องนอน</label>
                      <input type="number" id="bedrooms" placeholder="0" className="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base text-black placeholder-gray-500 bg-white" />
                    </div>
                    <div>
                      <label htmlFor="bathrooms" className="block text-base font-medium text-gray-800 mb-1">ห้องน้ำ</label>
                      <input type="number" id="bathrooms" placeholder="0" className="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base text-black placeholder-gray-500 bg-white" />
                    </div>
                    <div>
                      <label htmlFor="parking" className="block text-base font-medium text-gray-800 mb-1">จอดรถ (คัน)</label>
                      <input type="number" id="parking" placeholder="0" className="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base text-black placeholder-gray-500 bg-white" />
                    </div>
                    <div>
                      <label htmlFor="house-age" className="block text-base font-medium text-gray-800 mb-1">อายุบ้าน (ปี)</label>
                      <input type="number" id="house-age" placeholder="0" className="w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-base text-black placeholder-gray-500 bg-white" />
                    </div>
                  </div>
                </div>

                {/* จุดเด่นของอสังหา */}
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">จุดเด่นของอสังหา (เลือกได้มากกว่า 1)</h3>
                  <div className="flex flex-wrap gap-2">
                    {['ใกล้รถไฟฟ้า', 'วิวสวย', 'สระว่ายน้ำ', 'ห้องมุม', 'ตกแต่งพร้อมอยู่', 'ราคาพิเศษ'].map((feature) => (
                      <button key={feature} type="button" className="px-3 py-1.5 border border-gray-400 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-800">
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* สิ่งอำนวยความสะดวก */}
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">สิ่งอำนวยความสะดวก (เลือกได้มากกว่า 1)</h3>
                  <div className="flex flex-wrap gap-2">
                    {['รปภ.', 'สนามเด็กเล่น', 'สระว่ายน้ำ', 'ฟิตเนส', 'สวนหย่อม', 'ที่จอดรถ'].map((facility) => (
                      <button key={facility} type="button" className="px-3 py-1.5 border border-gray-400 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-800">
                        {facility}
                      </button>
                    ))}
                  </div>
                </div>

                {/* สิ่งอำนวยความสะดวกในโครงการ */}
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">สิ่งอำนวยความสะดวกในโครงการ (เลือกได้มากกว่า 1)</h3>
                  <div className="flex flex-wrap gap-2">
                    {['รปภ.', 'สวนสาธารณะ', 'สนามเด็กเล่น', 'คลับเฮาส์', 'กล้องวงจรปิด', 'คีย์การ์ด'].map((projectFacility) => (
                      <button key={projectFacility} type="button" className="px-3 py-1.5 border border-gray-400 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-800">
                        {projectFacility}
                      </button>
                    ))}
                  </div>
                </div>

                {/* สิ่งอำนวยความสะดวกใกล้เคียง */}                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">สิ่งอำนวยความสะดวกใกล้เคียง (ระบุชื่อสถานที่)</h3>
                  <input
                    type="text"
                    placeholder="โรงพยาบาล, ห้างสรรพสินค้า, สถานศึกษา"
                    className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base text-black placeholder-gray-500 bg-white"
                  />
                </div>

                {/* ราคา */}                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">ราคา (บาท)</h3>
                  <input
                    type="text"
                    placeholder="5,000,000"
                    className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base text-black placeholder-gray-500 bg-white"
                  />
                </div>

                {/* รูปภาพ */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">รูปภาพ</h3>
                  {images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square border border-gray-300 rounded-md flex items-center justify-center bg-gray-100"
                        >
                          <img
                            src={URL.createObjectURL(image) || "/placeholder.svg"}
                            alt={`Uploaded ${index}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 border border-gray-300 rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 mx-auto mb-2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <p>ยังไม่มีรูปภาพ กรุณาอัปโหลดรูปภาพอย่างน้อย 3 รูป</p>
                    </div>
                  )}
                </div>

                {/* ปุ่มย้อนกลับและเผยแพร่ */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handlePreviousStep}
                    className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    onClick={() => alert("ประกาศของคุณถูกเผยแพร่แล้ว!")}
                    className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    เผยแพร่ประกาศ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AddPropertyPage
