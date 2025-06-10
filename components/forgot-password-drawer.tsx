"use client"

import React, { useState, useRef, useEffect } from "react"
import { X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

interface ForgotPasswordDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function ForgotPasswordDrawer({ isOpen, onClose }: ForgotPasswordDrawerProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');

  const { sendPasswordResetOtp, verifyPasswordResetOtp, resetPassword } = useAuth()

  // Helper function for smooth step transitions with slide animation
  const changeStep = (newStep: number) => {
    const isGoingForward = newStep > step;
    setAnimationDirection(isGoingForward ? 'forward' : 'backward');
    setIsTransitioning(true);
    
    setTimeout(() => {
      setStep(newStep);
      setIsTransitioning(false);
    }, 200); // Reduced for snappier feel
  }  // Reset all state when drawer is opened
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setStep(1);
      setIsTransitioning(false);
      setAnimationDirection('forward');
      setEmail("")
      setCode("")
      setNewPassword("")
      setConfirmPassword("")
      setError("")
      setResetToken("")
      setIsLoading(false)
    } else {
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen])
  // Step 1: Request email OTP
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("กรุณากรอกอีเมล")
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง")
      return
    }
      setIsLoading(true)
    setError("")
    
    try {
      const { error } = await sendPasswordResetOtp(email)
      
      if (error) {
        setError(error)
        setIsLoading(false)
        return
      }      
      setError("")
      changeStep(2)
      setIsLoading(false)
      
    } catch (error: any) {
      console.error("Send OTP exception:", error)
      setError("เกิดข้อผิดพลาดในการส่งอีเมล")
      setIsLoading(false)
    }
  }  // Step 2: Verify OTP
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length !== 6) {
      setError("กรุณากรอกรหัส OTP 6 หลัก")
      return
    }
    
    setIsLoading(true)
    setError("")
    
    try {
      console.log("Verifying OTP:", { email, code })
      const { error, resetToken: token } = await verifyPasswordResetOtp(email, code)
      console.log("Verify OTP result:", { error, token })
      
      if (error) {
        setError(error)
        setIsLoading(false)
        return
      }
      
      // Set reset token if provided, otherwise use email+code combination as fallback
      if (token) {
        setResetToken(token)
        console.log("Reset token set:", token)
      } else {
        // Fallback: use combination of email and code as reset token
        setResetToken(`${email}:${code}`)
        console.log("Using fallback reset token")
      }      console.log("Moving to step 3")
      setError("")
      changeStep(3)
      setIsLoading(false)
      
    } catch (error: any) {
      console.error("Verify OTP exception:", error)
      setError("เกิดข้อผิดพลาดในการยืนยัน OTP")
      setIsLoading(false)
    }
  }  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Reset password button clicked!")
    console.log("Current data:", { email, resetToken, newPassword, confirmPassword })
    
    // Validation
    if (!newPassword || !confirmPassword) {
      setError("กรุณากรอกรหัสผ่านใหม่")
      console.log("Password validation failed: empty passwords")
      return
    }
    if (newPassword.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      console.log("Password validation failed: length < 8")
      return
    }
      // ต้องมีตัวอักษรอย่างน้อย 1 ตัว
    const letterCount = (newPassword.match(/[A-Za-z]/g) || []).length
    if (letterCount < 1) {
      setError("รหัสผ่านต้องมีตัวอักษรอย่างน้อย 1 ตัว")
      console.log("Password validation failed: letters < 1, found:", letterCount)
      return
    }
    
    // ต้องมีตัวเลขอย่างน้อย 1 ตัว
    const digitCount = (newPassword.match(/[0-9]/g) || []).length
    if (digitCount < 1) {
      setError("รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว")
      console.log("Password validation failed: digits < 1, found:", digitCount)
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน")
      console.log("Password validation failed: passwords don't match")
      return
    }
    
    console.log("All validations passed, calling API...")
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          resetToken, 
          newPassword 
        }),
      })
      
      const data = await response.json()
      console.log("API response:", { status: response.status, data })
      
      if (!response.ok) {
        setError(data.error || "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน")
        setIsLoading(false)
        return
      }      console.log("Password reset successful, showing success modal")
      setError("")
      changeStep(4)
      setShowSuccessModal(true)
      setIsLoading(false)
      
    } catch (error: any) {
      console.error("Reset password exception:", error)
      setError("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน")
      setIsLoading(false)
    }
  }
  // Resend OTP function
  const handleResendOtp = async () => {
    if (!email) return
    
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || "เกิดข้อผิดพลาดในการส่งอีเมล")
        setIsLoading(false)
        return
      }
        setError("ส่งรหัส OTP ใหม่เรียบร้อยแล้ว")
      setIsLoading(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setError(""), 3000)
      
    } catch (error: any) {
      console.error("Resend OTP exception:", error)
      setError("เกิดข้อผิดพลาดในการส่ง OTP ใหม่")
      setIsLoading(false)
    }
  }

  return (
    <>
      {isOpen && !showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={onClose} aria-hidden="true"></div>
      )}
      {isVisible && !showSuccessModal && (        <div
          className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-gradient-to-br from-white via-gray-50 to-blue-50 backdrop-blur-sm z-[60] transform transition-all duration-300 ease-in-out shadow-2xl
            ${isOpen && isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
          style={{ marginTop: 0, paddingTop: 0 }}
        >
          <div className="h-full flex flex-col px-10 py-12 overflow-y-auto">
            <div className="flex items-center mb-8">              <button
                onClick={() => {
                  if (step > 1) {
                    changeStep(step - 1);
                  } else {
                    onClose();
                  }
                }}className="p-2 mr-2 rounded-full hover:bg-white/60 backdrop-blur-sm transition-all duration-200"
              >
                <X size={28} className="text-gray-600" />
              </button>
              <span className="text-base text-blue-600 font-medium">ย้อนกลับ</span>
            </div>            <div className="flex-1 flex flex-col items-center w-full relative overflow-hidden">
              <div 
                className={`w-full transition-all duration-400 ease-in-out ${
                  isTransitioning 
                    ? animationDirection === 'forward' 
                      ? 'animate-slide-out-left' 
                      : 'animate-slide-out-right'
                    : animationDirection === 'forward'
                      ? 'animate-slide-in-right'
                      : 'animate-slide-in-left'
                }`}
              >
                {step === 1 && (
                  <div className="w-full">
                    <h2 className="text-2xl font-bold mb-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">รีเซ็ตรหัสผ่าน</h2>
                    <form onSubmit={handleSendEmail} className="w-full">
                      <div className="space-y-6">                        <div className="space-y-2">
                          <Label htmlFor="email">อีเมล</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="Example@email.com" 
                            value={email}
                          onChange={e => setEmail(e.target.value)} 
                          className="h-14 text-lg text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200" 
                          disabled={isLoading}
                        />
                      </div>
                      {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
                      <Button 
                        type="submit" 
                        className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            กำลังส่ง...
                          </div>
                        ) : (
                          "ถัดไป"                        )}
                      </Button>
                    </div>
                  </form>
                </div>
                )}

                {step === 2 && (
                  <div className="w-full">
                    <h2 className="text-2xl font-bold mb-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">รีเซ็ตรหัสผ่านของคุณ</h2>
                  <div className="mb-8 w-full text-left text-gray-600 text-base bg-blue-50 p-4 rounded-lg border border-blue-200">
                    รหัสยืนยันได้ถูกส่งไปยังอีเมล <span className="font-semibold text-blue-700">{email}</span> แล้ว
                  </div>
                  <form onSubmit={handleSendCode} className="w-full flex flex-col items-center">                    <div className="flex justify-center gap-4 mb-10 w-full">
                      {[0,1,2,3,4,5].map(i => (
                        <Input
                          key={i}
                          maxLength={1}
                          className={`w-16 h-16 text-center text-3xl border-2 rounded-2xl font-bold text-blue-600 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 ${typeof window !== 'undefined' && window.document.activeElement === codeRefs.current[i] ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-300'}`}
                          value={code[i] || ''}
                          onChange={e => {
                            let val = e.target.value.replace(/[^0-9]/g, '')
                            let arr = code.split("")
                            arr[i] = val
                            setCode(arr.join("").slice(0,6))
                            if (val && codeRefs.current[i+1]) codeRefs.current[i+1]?.focus()
                          }}
                          ref={el => { codeRefs.current[i] = el }}
                          onKeyDown={e => {
                            if (e.key === 'Backspace' && !code[i] && codeRefs.current[i-1]) codeRefs.current[i-1]?.focus()
                          }}
                          autoFocus={i === 0}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                    {error && <div className={`text-sm mb-2 p-3 rounded-lg border ${error.includes("เรียบร้อย") ? "text-green-600 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>{error}</div>}
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading || code.length !== 6}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          กำลังยืนยัน...
                        </div>
                      ) : (
                        "ยืนยัน"
                      )}
                    </Button>
                    
                    <div className="mt-6 text-center">
                      <p className="text-gray-600">
                        ไม่ได้รับรหัส?{" "}
                        <button
                          type="button"
                          className="text-blue-600 hover:text-purple-600 font-semibold transition-colors duration-200 hover:underline"
                          onClick={handleResendOtp}
                          disabled={isLoading}
                        >
                          ส่งรหัสใหม่อีกครั้ง                        </button>
                      </p>
                    </div>
                  </form>
                </div>              )}

              {step === 3 && (
                <div className="w-full">
                  <h2 className="text-2xl font-bold mb-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ตั้งค่ารหัสผ่านใหม่</h2>
                  <div className="mb-4 w-full text-center text-gray-600 text-sm bg-blue-50 p-4 rounded-lg border border-blue-200">รหัสผ่านเดิมของคุณได้รับการรีเซ็ตเเล้ว กรุณาตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ</div>
                  <form onSubmit={handleResetPassword} className="w-full">
                    <div className="space-y-6">                      <div className="space-y-2">
                        <Label htmlFor="newPassword">รหัสผ่าน</Label>
                        <div className="relative">
                          <Input 
                            id="newPassword" 
                            type={showNewPassword ? "text" : "password"} 
                            placeholder="อย่างน้อย 8 ตัวอักษร" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            className="h-14 text-lg pr-12 text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200" 
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                            disabled={isLoading}
                          >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                        <div className="relative">
                          <Input 
                            id="confirmPassword" 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="อย่างน้อย 8 ตัวอักษร" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                            className="h-14 text-lg pr-12 text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                            disabled={isLoading}
                          />                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div><div className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <span>📝</span>
                          <div>
                            <div>• ตัวอักษรขั้นต่ำ 1 ตัว</div>
                            <div>• ตัวเลขขั้นต่ำ 1 ตัว</div>
                          </div>
                        </div>
                      </div>
                      {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
                      <Button 
                        type="submit" 
                        className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            กำลังบันทึก...
                          </div>
                        ) : (
                          "ยืนยัน"
                        )}
                      </Button>                    </div>
                  </form>                </div>
              )}

              {step === 4 && null}
              </div>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 transition-all duration-300 ease-in-out animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center max-w-md w-full mx-4 transition-all duration-300 ease-in-out scale-100 opacity-100">
            <div className="rounded-full bg-blue-100 p-4 mb-4">
              <svg width="64" height="64" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="12" fill="#3B82F6"/>
                <path d="M8 12.5l2.5 2.5L16 9.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-blue-700 mb-2 text-center">ตั้งค่ารหัสผ่านใหม่ สำเร็จ!</div>            <div className="text-gray-600 mb-6 text-center">
              ยินดีด้วยคุณตั้งค่ารหัสผ่านใหม่แล้ว<br />
              คลิกปุ่มยืนยันเพื่อกลับหน้าแรกและเข้าสู่ระบบ
            </div><Button
              className="w-full h-14 text-lg bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => {
                setShowSuccessModal(false);
                onClose();
                // รีเฟรชหน้าเพื่อให้กลับไปหน้าแรกที่มีปุ่ม login
                window.location.reload();
              }}
            >
              ยืนยัน
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
