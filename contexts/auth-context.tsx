"use client"

import React, { createContext, useState, useContext, useEffect } from "react"
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

// User types
export type UserRole = 'customer' | 'agent' | 'admin'

interface AuthContextType {
  isLoggedIn: boolean
  userRole: UserRole | null
  setIsLoggedIn: (value: boolean) => void
  setUserRole: (role: UserRole | null) => void
  login: (email: string, password: string) => Promise<{ error: any | null }>
  loginWithOtp: (phone: string) => Promise<{ error: any | null }>
  verifyOtp: (phone: string, otp: string) => Promise<{ error: any | null }>
  sendPasswordResetOtp: (email: string) => Promise<{ error: any | null }>
  verifyPasswordResetOtp: (email: string, otp: string) => Promise<{ error: any | null, resetToken?: string }>
  resetPassword: (email: string, resetToken: string, newPassword: string) => Promise<{ error: any | null }>
  logout: () => Promise<void>
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userRole: null,
  setIsLoggedIn: () => { },
  setUserRole: () => { },
  login: async () => ({ error: null }),
  loginWithOtp: async () => ({ error: null }),
  verifyOtp: async () => ({ error: null }),
  sendPasswordResetOtp: async () => ({ error: null }),
  verifyPasswordResetOtp: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  logout: async () => { },
  user: null,
  session: null,
  loading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Check Supabase session and localStorage on client side only
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        // Check if we have a session
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
        setUser(data.session?.user ?? null)

        if (data.session?.user) {
          // Get user role from metadata or profile
          const storedUserRole = localStorage.getItem("userRole") as UserRole | null
          setUserRole(storedUserRole)
          setIsLoggedIn(true)
        } else {
          // No session, check localStorage as backup
          const userLoggedIn = localStorage.getItem("isLoggedIn") === "true"
          const storedUserRole = localStorage.getItem("userRole") as UserRole | null

          setIsLoggedIn(userLoggedIn)
          setUserRole(storedUserRole)
        }
      } catch (error) {
        console.error("Error getting auth status:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          // Get user role from metadata or profile
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
          setUserRole(null)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])  // Auto-sync user data between Supabase Auth and custom tables
  const ensureUserSync = async (authUser: any) => {
    try {
      console.log("🔄 Starting user sync for:", authUser.email)
      
      // Check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single()

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist in users table, create them
        console.log("🔄 Creating user in users table...")
        const userRole = authUser.user_metadata?.role || 'customer'
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            role: userRole,
            first_name: authUser.user_metadata?.first_name || '',
            last_name: authUser.user_metadata?.last_name || '',
            phone: authUser.user_metadata?.phone || '',
            password: 'supabase_managed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error("❌ Failed to create user in users table:", insertError)
        } else {
          console.log("✅ User created in users table")
          
          // Create role-specific record
          await createRoleSpecificRecord(authUser.id, userRole, authUser.user_metadata)
        }
      } else if (!userError && userData) {
        // User exists, update auth ID if needed
        if (userData.id !== authUser.id) {
          console.log("🔄 Updating user auth ID...")
          await supabase
            .from('users')
            .update({ 
              id: authUser.id,
              updated_at: new Date().toISOString()
            })
            .eq('email', authUser.email)
        }
        console.log("✅ User already exists, synced")
        
        // Ensure role-specific record exists
        await ensureRoleSpecificRecord(authUser.id, userData.role, authUser.user_metadata)
      }

      const finalRole = userData?.role || authUser.user_metadata?.role || 'customer'
      console.log("✅ User sync completed, role:", finalRole)
      return finalRole
    } catch (error) {
      console.error("❌ User sync error:", error)
      return 'customer'
    }
  }

  // Create role-specific record in appropriate table
  const createRoleSpecificRecord = async (userId: string, role: string, metadata: any) => {
    try {
      if (role === 'customer') {
        const { error } = await supabase
          .from('customers')
          .insert({
            user_id: userId,
            full_name: `${metadata?.first_name || ''} ${metadata?.last_name || ''}`.trim(),
            created_at: new Date().toISOString()
          })
        
        if (error && !error.message.includes('duplicate')) {
          console.error("❌ Failed to create customer record:", error)
        } else {
          console.log("✅ Customer record created")
        }
      } else if (role === 'agent') {
        const { error } = await supabase
          .from('agens')
          .insert({
            user_id: userId,
            company_name: '',
            business_license_id: '',
            address: ''
          })
        
        if (error && !error.message.includes('duplicate')) {
          console.error("❌ Failed to create agent record:", error)
        } else {
          console.log("✅ Agent record created")
        }
      } else if (role === 'admin') {
        const { error } = await supabase
          .from('admins')
          .insert({
            user_id: userId,
            username: metadata?.email || '',
            admin_password: 'change_me_' + Math.random().toString(36).substring(7)
          })
        
        if (error && !error.message.includes('duplicate')) {
          console.error("❌ Failed to create admin record:", error)
        } else {
          console.log("✅ Admin record created")
        }
      }
    } catch (error) {
      console.error("❌ Role-specific record creation error:", error)
    }
  }

  // Ensure role-specific record exists
  const ensureRoleSpecificRecord = async (userId: string, role: string, metadata: any) => {
    try {
      let recordExists = false
      
      if (role === 'customer') {
        const { data, error } = await supabase
          .from('customers')
          .select('user_id')
          .eq('user_id', userId)
          .single()
        
        recordExists = !error && data
      } else if (role === 'agent') {
        const { data, error } = await supabase
          .from('agens')
          .select('user_id')
          .eq('user_id', userId)
          .single()
        
        recordExists = !error && data
      } else if (role === 'admin') {
        const { data, error } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', userId)
          .single()
        
        recordExists = !error && data
      }

      if (!recordExists) {
        console.log(`🔄 Creating missing ${role} record...`)
        await createRoleSpecificRecord(userId, role, metadata)
      }
    } catch (error) {
      console.error("❌ Role-specific record check error:", error)
    }
  }

  // Login function using Supabase with auto-sync
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (!error && data.user) {
        console.log("🔐 Supabase Auth successful for:", data.user.email)
        
        // Auto-sync user data and get role
        const role = await ensureUserSync(data.user)
        
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userRole", role)
        setIsLoggedIn(true)
        setUserRole(role as UserRole)
        
        console.log("✅ Login successful with auto-sync:", {
          email: data.user.email,
          role: role,
          userId: data.user.id
        })
      }

      return { error }
    } catch (error) {
      console.error("❌ Login error:", error)
      return { error }
    }
  }

  // Login with OTP function
  const loginWithOtp = async (phone: string) => {
    try {
      // ในกรณีจริงควรใช้ Supabase Auth ส่ง OTP
      // แต่ในตัวอย่างนี้เราจะจำลองการส่ง OTP

      // สำหรับ Supabase จริงๆ จะใช้ signInWithOtp
      // const { data, error } = await supabase.auth.signInWithOtp({
      //   phone: phone,
      // })

      // จำลองการส่ง OTP สำเร็จ
      console.log(`Sending OTP to phone: ${phone}`)

      return { error: null }
    } catch (error) {
      console.error("OTP request error:", error)
      return { error }
    }
  }

  // Verify OTP function
  const verifyOtp = async (phone: string, otp: string) => {
    try {
      // ในกรณีจริงควรใช้ Supabase Auth ยืนยัน OTP
      // แต่ในตัวอย่างนี้เราจะจำลองการยืนยัน OTP

      // สำหรับ Supabase จริงๆ จะใช้ verifyOtp
      // const { data, error } = await supabase.auth.verifyOtp({
      //   phone: phone,
      //   token: otp,
      //   type: 'sms'
      // })

      // จำลองการยืนยัน OTP สำเร็จ
      console.log(`Verifying OTP for phone: ${phone} with code: ${otp}`)

      // จำลองการล็อกอินสำเร็จ
      const role = 'customer' as UserRole
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userRole", role)
      setIsLoggedIn(true)
      setUserRole(role)

      return { error: null }
    } catch (error) {
      console.error("OTP verification error:", error)
      return { error }
    }
  }
  // Logout function using Supabase
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("userRole")
      setIsLoggedIn(false)
      setUserRole(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Send password reset OTP
  const sendPasswordResetOtp = async (email: string) => {
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
        return { error: data.error || "เกิดข้อผิดพลาดในการส่งอีเมล" }
      }
        return { 
        error: null
      }
    } catch (error) {
      console.error("Send password reset OTP error:", error)
      return { error: "เกิดข้อผิดพลาดในการส่งอีเมล" }
    }
  }

  // Verify password reset OTP
  const verifyPasswordResetOtp = async (email: string, otp: string) => {
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otpCode: otp }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { error: data.error || "รหัส OTP ไม่ถูกต้อง" }
      }
      
      return { 
        error: null, 
        resetToken: data.resetToken 
      }
    } catch (error) {
      console.error("Verify password reset OTP error:", error)
      return { error: "เกิดข้อผิดพลาดในการยืนยัน OTP" }
    }
  }

  // Reset password
  const resetPassword = async (email: string, resetToken: string, newPassword: string) => {
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, resetToken, newPassword }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { error: data.error || "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" }
      }
      
      return { error: null }
    } catch (error) {
      console.error("Reset password error:", error)
      return { error: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" }
    }
  }
  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userRole,
      setIsLoggedIn,
      setUserRole,
      login,
      loginWithOtp,
      verifyOtp,
      sendPasswordResetOtp,
      verifyPasswordResetOtp,
      resetPassword,
      logout,
      user,
      session,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
