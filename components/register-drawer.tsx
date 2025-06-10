"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { OtpDrawer } from "@/components/otp-drawer"
import { TermsModal } from "@/components/terms-modal"
import { supabase } from "@/lib/supabase"

interface RegisterDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export function RegisterDrawer({ isOpen, onClose, onSwitchToLogin }: RegisterDrawerProps) {  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState("")
  const [showOtpDrawer, setShowOtpDrawer] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Reset all fields
      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setPassword("")
      setConfirmPassword("")
      setAgree(false)
      setError("")
      setShowOtpDrawer(false)
      setShowTermsModal(false)
      setIsLoading(false)
    } else {
      // Delay unmount for animation
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    // รูปแบบเบอร์โทรศัพท์ไทย เช่น 08x-xxx-xxxx หรือ 08xxxxxxxx
    const phoneRegex = /^(0[689]{1}[0-9]{8}|0[689]{1}-[0-9]{3}-[0-9]{4})$/
    return phoneRegex.test(phone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Basic validation
      if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        setError("กรุณากรอกข้อมูลให้ครบถ้วน")
        setIsLoading(false)
        return
      }

      if (!validateEmail(email)) {
        setError("รูปแบบอีเมลไม่ถูกต้อง")
        setIsLoading(false)
        return
      }

      if (!validatePhone(phone)) {
        setError("รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (เช่น 0812345678 หรือ 081-234-5678)")
        setIsLoading(false)
        return
      }

      if (password.length < 8) {
        setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("รหัสผ่านไม่ตรงกัน")
        setIsLoading(false)
        return
      }

      if (!agree) {
        setError("กรุณายอมรับเงื่อนไขและข้อตกลง")
        setIsLoading(false)
        return
      }      // สร้างผู้ใช้ใหม่ด้วย Supabase Auth (triggers จะทำการ sync อัตโนมัติ)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            role: 'customer'
          }
        }
      })

      if (authError) {
        console.error("Registration error:", authError.message)
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (!authData?.user?.id) {
        setError("ไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่อีกครั้ง")
        setIsLoading(false)
        return
      }

      // ตรวจสอบว่า triggers ทำงานและ sync ข้อมูลเรียบร้อยแล้วหรือไม่
      let retryCount = 0
      const maxRetries = 3
      let userSynced = false

      while (retryCount < maxRetries && !userSynced) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // รอ 1 วินาที

        const { data: userData, error: userCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authData.user.id)
          .single()

        if (!userCheckError && userData) {
          userSynced = true
          console.log("User successfully synced via triggers")
        } else {
          retryCount++
          console.log(`Sync check attempt ${retryCount}/${maxRetries}`)
        }
      }

      // หาก triggers ไม่ทำงาน ให้ทำการ sync manual
      if (!userSynced) {
        console.log("Triggers not working, performing manual sync...")
        
        // Manual sync สำหรับ users table
        const { error: usersError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            role: 'customer',
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (usersError) {
          console.error("Manual users table insert error:", usersError.message)
        }        // Manual sync สำหรับ customers table แทน profiles
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            user_id: authData.user.id,
            full_name: `${firstName} ${lastName}`.trim(),
            created_at: new Date().toISOString()
          })

        if (customerError) {
          console.error("Manual customers table insert error:", customerError.message)
        }
      }

      // สำเร็จ
      setError("")
      setIsLoading(false)

      // ส่ง OTP
      setSuccessMessage("ลงทะเบียนสำเร็จ! กรุณายืนยัน OTP เพื่อเข้าสู่ระบบ")
      setShowOtpDrawer(true)
    } catch (error: any) {
      console.error("Registration exception:", error)
      setError(error.message || "เกิดข้อผิดพลาดในการลงทะเบียน")
      setIsLoading(false)
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" aria-hidden="true"></div>
      )}
      <TermsModal
        isOpen={showTermsModal}
        onAccept={() => {
          setShowTermsModal(false)
          setAgree(true)
        }}
        onClose={() => setShowTermsModal(false)}
      />
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 transition-all duration-300 ease-in-out animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center max-w-md w-full mx-4 transition-all duration-300 ease-in-out scale-100 opacity-100">
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <svg width="64" height="64" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="12" fill="#10B981" />
                <path d="M8 12.5l2.5 2.5L16 9.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-green-700 mb-2 text-center">ลงทะเบียนสำเร็จ!</div>
            <div className="text-gray-600 mb-6 text-center">
              {successMessage}
            </div>
            <Button
              className="w-full h-14 text-lg bg-green-500 hover:bg-green-600 text-white"
              onClick={() => {
                setShowSuccessModal(false);
                onClose();
                onSwitchToLogin();
              }}
            >
              เข้าสู่ระบบ
            </Button>
          </div>
        </div>
      )}
      {!showTermsModal && !showSuccessModal && (
        <>          <div
            className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-gradient-to-br from-white via-gray-50 to-blue-50 backdrop-blur-sm z-[60] transform transition-all duration-300 ease-in-out shadow-2xl
              ${isOpen && isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
            style={{ marginTop: 0, paddingTop: 0 }}
          >
            <div className="h-full flex flex-col p-6 overflow-y-auto">
              <div className="flex justify-end">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/60 backdrop-blur-sm transition-all duration-200" disabled={isLoading}>
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
              <div className="flex-1 mt-4">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ลงทะเบียนใช้งาน</h2>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">ชื่อ</Label>                        <Input
                          id="firstName"
                          type="text"
                          placeholder="กรอกชื่อ"
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          className="h-12 text-lg text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">นามสกุล</Label>                        <Input
                          id="lastName"
                          type="text"
                          placeholder="กรอกนามสกุล"
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          className="h-12 text-lg text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                          disabled={isLoading}
                        />
                      </div>
                    </div><div className="space-y-2">
                      <Label htmlFor="email">อีเมล</Label>                      <Input
                        id="email"
                        type="email"
                        placeholder="Example@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="h-12 text-lg text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">เบอร์โทร</Label>                      <Input
                        id="phone"
                        type="tel"
                        placeholder="081-111-1111"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="h-12 text-lg text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                        disabled={isLoading}
                      />
                    </div><div className="space-y-2">
                      <Label htmlFor="password">รหัสผ่าน</Label>
                      <div className="relative">                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="อย่างน้อย 8 ตัวอักษร"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="h-12 text-lg pr-12 text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                      <div className="relative">                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="อย่างน้อย 8 ตัวอักษร"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="h-12 text-lg pr-12 text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="agree"
                        checked={agree}
                        onCheckedChange={checked => setAgree(checked as boolean)}
                        disabled={isLoading}
                      />                      <Label htmlFor="agree" className="text-sm text-gray-600 leading-relaxed">
                        ยอมรับ <button type="button" className="text-blue-600 hover:text-purple-600 font-semibold transition-colors duration-200 hover:underline" onClick={() => setShowTermsModal(true)}>ข้อกำหนดเเละนโยบายความเป็นส่วนตัว</button> ทั้งหมด
                      </Label>
                    </div>

                    {error && <div className="text-red-500 text-sm mt-1">{error}</div>}                    <Button
                      type="submit"
                      className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white mt-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          กำลังดำเนินการ...
                        </div>
                      ) : (
                        "ยืนยัน"
                      )}
                    </Button>
                  </div>
                </form>

                <div className="relative flex items-center my-6">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-600">หรือ</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-start pl-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-center w-6 h-6 mr-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <span className="flex-1 text-center pr-8">ลงทะเบียนด้วย Google</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base bg-[#06C755] hover:bg-[#05B54A] text-white flex items-center justify-start pl-4 border-0 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-center w-6 h-6 mr-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391-.082.783-.17 1.165-.283.066-.037.133-.08.2-.127.93-.738 1.222-1.85.32-2.734-.706-.703-1.061-1.574-1.061-2.592l.010-.012c.084 0 .156.035.217.09.328.348.391.852.391 1.284 0 .352.285.637.637.637.348 0 .631-.285.631-.637 0-.633-.197-1.248-.586-1.729-.344-.426-.815-.664-1.29-.664-.09 0-.176.008-.264.023v-.027c0-.352-.285-.637-.637-.637-.352 0-.637.285-.637.637v.748c-1.106.23-2.022 1.195-2.308 2.414-.02.08-.029.16-.029.242v1.775c0 .352.282.636.631.636.352 0 .637-.284.637-.636v-1.775c0-.012.006-.021.006-.033.15-.815.832-1.418 1.675-1.418.843 0 1.524.603 1.674 1.418.004.012.007.021.007.033v1.775c0 .352.285.636.637.636.348 0 .631-.284.631-.636v-1.775c0-.082-.012-.162-.029-.242-.188-.793-.629-1.478-1.244-1.929.244-.598.244-1.286.244-1.775v-.027c.088-.015.174-.023.264-.023.475 0 .946.238 1.29.664.389.481.586 1.096.586 1.729 0 .352.285.637.637.637.348 0 .631-.285.631-.637 0-.432-.063-.936-.391-1.284-.061-.055-.133-.09-.217-.09l.01.012c0 1.018-.355 1.889-1.061 2.592-.902.884-.61 1.996.32 2.734.067.047.134.09.2.127.382.113.774.201 1.165.283C19.73 19.156 24 15.125 24 10.314"/>
                      </svg>
                    </div>
                    <span className="flex-1 text-center pr-8">ลงทะเบียนด้วย LINE</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-start pl-4 border-0 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-center w-6 h-6 mr-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <span className="flex-1 text-center pr-8">ลงทะเบียนด้วย Facebook</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-start pl-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-center w-6 h-6 mr-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#6B7280">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </div>
                    <span className="flex-1 text-center pr-8">ลงทะเบียนด้วยเบอร์โทร</span>
                  </Button>
                </div><div className="mt-8 text-center">
                  <p className="text-gray-600">
                    มีบัญชีอยู่แล้ว?{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-purple-600 font-semibold transition-colors duration-200 hover:underline"
                      onClick={onSwitchToLogin}
                      disabled={isLoading}
                    >
                      เข้าสู่ระบบ
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <OtpDrawer
            isOpen={showOtpDrawer}
            phone={phone}
            onClose={() => {
              setShowOtpDrawer(false)
            }}
            onSuccess={() => {
              setShowOtpDrawer(false);
              onClose(); // ปิด RegisterDrawer
              onSwitchToLogin(); // เปิด LoginDrawer
            }}
          />
        </>
      )}
    </>
  )
}
