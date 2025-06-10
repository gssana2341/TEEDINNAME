"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RegisterDrawer } from "@/components/register-drawer"
import { ForgotPasswordDrawer } from "@/components/forgot-password-drawer"
import { useAuth } from "@/contexts/auth-context"

interface LoginDrawerProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess?: () => void
}

export function LoginDrawer({ isOpen, onClose, onLoginSuccess }: LoginDrawerProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Reset state when drawer is closed
  useEffect(() => {
    if (!isOpen) {
      setError("")
      setIsLoading(false)
    }
  }, [isOpen])

  // Import useAuth here
  const { login: authLogin } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate input
    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน")
      setIsLoading(false)
      return
    }

    // Normal login logic with Supabase
    try {
      const { error } = await authLogin(email, password)

      if (error) {
        console.error("Login error:", error.message)
        setError(error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
        setIsLoading(false)
        return
      }

      console.log("Login successful")

      // Call login success callback
      if (onLoginSuccess) {
        onLoginSuccess()
      }

      // Close the drawer
      onClose()
      setIsLoading(false)
    } catch (error) {
      console.error("Login exception:", error)
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && !showRegister && !showForgot && (
        <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={onClose} aria-hidden="true"></div>
      )}      {/* Drawer */}      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white z-[60] transform transition-transform duration-300 ease-in-out shadow-lg border-l border-gray-200 ${isOpen && !showRegister && !showForgot ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ marginTop: 0, paddingTop: 0 }}
      >
        <div className="h-full flex flex-col p-6 overflow-y-auto">          <div className="flex justify-end mb-4">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <X size={24} className="text-gray-400" />
            </button>
          </div>          <div className="flex-1 mt-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">
                ล็อกอิน เข้าสู่ระบบ
              </h2>
            </div>            <form onSubmit={handleSubmit}>
              <div className="space-y-6">                <div className="space-y-3">
                  <Label htmlFor="email" className="text-gray-700 text-sm font-medium">อีเมล</Label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full text-base text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 outline-none transition-colors duration-200"
                    style={{ backgroundColor: '#ffffff' }}
                    disabled={isLoading}
                  />
                </div>                <div className="space-y-3">
                  <Label htmlFor="password" className="text-gray-700 text-sm font-medium">รหัสผ่าน</Label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="กรอกรหัสผ่าน"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full text-base pr-10 text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 outline-none transition-colors duration-200"
                      style={{ backgroundColor: '#ffffff' }}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                      จดจำฉันในระบบ
                    </Label>
                  </div>

                  <button
                    type="button"
                    className="text-blue-500 text-sm hover:text-blue-700 hover:underline transition-colors duration-200"
                    onClick={() => setShowForgot(true)}
                    disabled={isLoading}
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>                {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "กำลังดำเนินการ..." : "ยืนยัน"}
                </Button>
              </div>
            </form>            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">หรือ</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-start pl-4"
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
                <span className="flex-1 text-center pr-8">เข้าสู่ระบบด้วย Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base bg-[#06C755] hover:bg-[#05B54A] text-white border-0 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-start pl-4"
                disabled={isLoading}
              >
                <div className="flex items-center justify-center w-6 h-6 mr-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391-.082.783-.17 1.165-.283.066-.037.133-.08.2-.127.93-.738 1.222-1.85.32-2.734-.706-.703-1.061-1.574-1.061-2.592l.010-.012c.084 0 .156.035.217.09.328.348.391.852.391 1.284 0 .352.285.637.637.637.348 0 .631-.285.631-.637 0-.633-.197-1.248-.586-1.729-.344-.426-.815-.664-1.29-.664-.09 0-.176.008-.264.023v-.027c0-.352-.285-.637-.637-.637-.352 0-.637.285-.637.637v.748c-1.106.23-2.022 1.195-2.308 2.414-.02.08-.029.16-.029.242v1.775c0 .352.282.636.631.636.352 0 .637-.284.637-.636v-1.775c0-.012.006-.021.006-.033.15-.815.832-1.418 1.675-1.418.843 0 1.524.603 1.674 1.418.004.012.007.021.007.033v1.775c0 .352.285.636.637.636.348 0 .631-.284.631-.636v-1.775c0-.082-.012-.162-.029-.242-.188-.793-.629-1.478-1.244-1.929.244-.598.244-1.286.244-1.775v-.027c.088-.015.174-.023.264-.023.475 0 .946.238 1.29.664.389.481.586 1.096.586 1.729 0 .352.285.637.637.637.348 0 .631-.285.631-.637 0-.432-.063-.936-.391-1.284-.061-.055-.133-.09-.217-.09l.01.012c0 1.018-.355 1.889-1.061 2.592-.902.884-.61 1.996.32 2.734.067.047.134.09.2.127.382.113.774.201 1.165.283C19.73 19.156 24 15.125 24 10.314"/>
                  </svg>
                </div>
                <span className="flex-1 text-center pr-8">เข้าสู่ระบบด้วย LINE</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base bg-[#1877F2] hover:bg-[#166FE5] text-white border-0 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-start pl-4"
                disabled={isLoading}
              >
                <div className="flex items-center justify-center w-6 h-6 mr-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="flex-1 text-center pr-8">เข้าสู่ระบบด้วย Facebook</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-start pl-4"
                disabled={isLoading}
              >
                <div className="flex items-center justify-center w-6 h-6 mr-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#6B7280">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                </div>
                <span className="flex-1 text-center pr-8">เข้าสู่ระบบด้วยเบอร์โทร</span>
              </Button>
            </div><div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                คุณยังไม่มีบัญชีใช่ไหม?{" "}
                <button
                  type="button"
                  className="text-blue-500 hover:text-blue-700 hover:underline transition-colors duration-200 font-medium"
                  onClick={() => setShowRegister(true)}
                  disabled={isLoading}
                >
                  สมัครสมาชิก
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      <RegisterDrawer
        isOpen={isOpen && showRegister}
        onClose={() => {
          setShowRegister(false)
          onClose()
        }}
        onSwitchToLogin={() => setShowRegister(false)}
      />
      <ForgotPasswordDrawer
        isOpen={isOpen && showForgot}
        onClose={() => setShowForgot(false)}
      />
    </>
  )
}
