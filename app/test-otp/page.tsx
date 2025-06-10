"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestOTPPage() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [otpCode, setOtpCode] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const createTables = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/create-otp-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setMessage(`❌ Error: ${data.error}`)
        setIsLoading(false)
        return
      }
      
      setMessage(`✅ ${data.message}`)
      setIsLoading(false)
      
    } catch (error: any) {
      console.error('Create tables error:', error)
      setMessage(`❌ Error: ${error.message}`)
      setIsLoading(false)
    }
  }
  const testSendOTP = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: testEmail 
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setMessage(`❌ Send OTP Error: ${data.error}`)
        setIsLoading(false)
        return
      }
      
      setMessage(`✅ Send OTP Success: ${data.message}${data.debug_otp ? ` (Debug OTP: ${data.debug_otp})` : ''}`)
      if (data.debug_otp) {
        setOtpCode(data.debug_otp)
      }
      setIsLoading(false)
      
    } catch (error: any) {
      console.error('Send OTP error:', error)
      setMessage(`❌ Send OTP Error: ${error.message}`)
      setIsLoading(false)
    }
  }

  const testVerifyOTP = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: testEmail,
          otpCode: otpCode
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setMessage(`❌ Verify OTP Error: ${data.error}`)
        setIsLoading(false)
        return
      }
      
      setMessage(`✅ Verify OTP Success: ${data.message}`)
      if (data.resetToken) {
        setResetToken(data.resetToken)
      }
      setIsLoading(false)
      
    } catch (error: any) {
      console.error('Verify OTP error:', error)
      setMessage(`❌ Verify OTP Error: ${error.message}`)
      setIsLoading(false)
    }
  }

  const testResetPassword = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: testEmail,
          resetToken: resetToken,
          newPassword: newPassword
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setMessage(`❌ Reset Password Error: ${data.error}`)
        setIsLoading(false)
        return
      }
      
      setMessage(`✅ Reset Password Success: ${data.message}`)
      setIsLoading(false)
      
    } catch (error: any) {
      console.error('Reset Password error:', error)
      setMessage(`❌ Reset Password Error: ${error.message}`)
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">ทดสอบระบบ OTP - Password Reset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Database Setup */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">1. ตั้งค่าฐานข้อมูล</h3>
              <Button 
                onClick={createTables}
                className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "กำลังสร้างตาราง..." : "สร้างตารางในฐานข้อมูล"}
              </Button>
            </div>

            {/* Test Configuration */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">2. การตั้งค่าทดสอบ</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">อีเมลสำหรับทดสอบ</Label>
                  <Input
                    id="email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Step 1: Send OTP */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">3. ส่ง OTP</h3>
              <Button 
                onClick={testSendOTP}
                className="w-full h-12 text-lg bg-green-500 hover:bg-green-600 text-white"
                disabled={isLoading || !testEmail}
              >
                {isLoading ? "กำลังส่ง OTP..." : "ส่ง OTP"}
              </Button>
            </div>

            {/* Step 2: Verify OTP */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">4. ยืนยัน OTP</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp">รหัส OTP (6 หลัก)</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                  />
                </div>
                <Button 
                  onClick={testVerifyOTP}
                  className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={isLoading || !otpCode || otpCode.length !== 6}
                >
                  {isLoading ? "กำลังยืนยัน..." : "ยืนยัน OTP"}
                </Button>
              </div>
            </div>

            {/* Step 3: Reset Password */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">5. รีเซ็ตรหัสผ่าน</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reset-token">Reset Token</Label>
                  <Input
                    id="reset-token"
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="จะได้รับหลังจากยืนยัน OTP สำเร็จ"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">รหัสผ่านใหม่</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="ต้องมีอักษร 4 ตัว และตัวเลข 4 ตัว (ขั้นต่ำ 8 ตัว)"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    ข้อกำหนด: อย่างน้อย 8 ตัวอักษร, มีตัวอักษร 4 ตัว และตัวเลข 4 ตัว
                  </p>
                </div>
                <Button 
                  onClick={testResetPassword}
                  className="w-full h-12 text-lg bg-red-500 hover:bg-red-600 text-white"
                  disabled={isLoading || !resetToken || !newPassword || newPassword.length < 8}
                >
                  {isLoading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
                </Button>
              </div>
            </div>

            {/* Results */}
            {message && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">ผลลัพธ์</h3>
                <div className="p-4 border rounded-lg bg-white">
                  <p className="text-sm whitespace-pre-wrap font-mono">{message}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold mb-3">วิธีการทดสอบ:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>กดปุ่ม "สร้างตารางในฐานข้อมูล" ก่อน</li>
                <li>ใส่อีเมลที่ต้องการทดสอบ (ใช้ test@example.com สำหรับ demo)</li>
                <li>กดปุ่ม "ส่ง OTP" - รหัส OTP จะแสดงใน debug mode</li>
                <li>นำรหัส OTP มาใส่และกด "ยืนยัน OTP"</li>
                <li>หลังยืนยันสำเร็จ Reset Token จะปรากฏอัตโนมัติ</li>
                <li>ใส่รหัสผ่านใหม่และกด "รีเซ็ตรหัสผ่าน"</li>
                <li>หากต้องการทดสอบระบบจริง ให้ไปที่หน้าหลักและทดสอบ Forgot Password</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
