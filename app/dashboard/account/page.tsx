"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"

interface UserData {
  id: string
  email: string
  role: string
  first_name: string
  last_name: string
  phone: string
  password: string
  created_at: string
  updated_at: string
}

export default function AccountPage() {
  const { user: authUser, session } = useAuth()
  const [user, setUser] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // ดึงข้อมูลผู้ใช้เมื่อ component load
  useEffect(() => {
    if (authUser && session?.access_token) {
      fetchUserData()
    }
  }, [authUser, session])
  // ฟังก์ชันดึงข้อมูลผู้ใช้จาก API
  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // ป้องกันการแคช
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'ไม่สามารถดึงข้อมูลได้')
      }

      setUser(result.user)
      setFormData({
        first_name: result.user.first_name || "",
        last_name: result.user.last_name || "",
        email: result.user.email || "",
        phone: result.user.phone || "",
        password: result.user.password || "",
      })

    } catch (err) {
      console.error('Error fetching user data:', err)
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.access_token) {
      setError('ไม่พบ session กรุณาเข้าสู่ระบบใหม่')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'ไม่สามารถบันทึกข้อมูลได้')
      }

      // รีเฟรชข้อมูลผู้ใช้
      await fetchUserData()
      alert("ข้อมูลถูกบันทึกเรียบร้อยแล้ว")

    } catch (err) {
      console.error('Error saving user data:', err)
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">บัญชีของฉัน</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-8">
              <p className="mb-4">รูปโปรไฟล์</p>
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
                  <Image src="/placeholder-avatar.png" alt="Profile" width={128} height={128} className="object-cover" />
                </div>
                <label
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="sr-only">Upload profile picture</span>
                </label>
                <input id="profile-upload" type="file" className="hidden" accept="image/*" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="first_name">ชื่อ</Label>
                <Input
                  id="first_name"
                  placeholder="กรอกชื่อ"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="h-12 text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-blue-500"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="last_name">นามสกุล</Label>
                <Input
                  id="last_name"
                  placeholder="กรอกนามสกุล"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="h-12 text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="Example@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-blue-500"
                disabled // อีเมลไม่ควรแก้ไขได้
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทร</Label>
              <Input
                id="phone"
                placeholder="081-111-1111"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-12 text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-blue-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 pr-12 text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {user && (
                <p className="text-sm text-gray-600">
                  บทบาท: <span className="font-medium">{user.role}</span> | 
                  สร้างเมื่อ: <span className="font-medium">{new Date(user.created_at).toLocaleDateString('th-TH')}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  "แก้ไขข้อมูล"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
