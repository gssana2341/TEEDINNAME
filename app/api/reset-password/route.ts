import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import bcrypt from 'bcrypt'

// 🚨 TESTING MODE: เก็บ plain text password ใน custom users table
// ⚠️ ในการใช้งานจริง ควรเปลี่ยนกลับไปใช้ hash เพื่อความปลอดภัย

export async function POST(request: NextRequest) {
  try {
    const { email, resetToken, newPassword } = await request.json()

    if (!email || !resetToken || !newPassword) {
      return NextResponse.json(
        { error: 'กรุณาระบุข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }    // ตรวจสอบ reset token
    const supabaseAdmin = createSupabaseAdmin()
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email)
      .eq('reset_token', resetToken)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว' },
        { status: 400 }
      )
    }    // ตรวจสอบรหัสผ่านใหม่
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่ามีตัวอักษรและตัวเลขอย่างน้อย 1 ตัวแต่ละอย่าง
    const letterCount = (newPassword.match(/[A-Za-z]/g) || []).length
    const digitCount = (newPassword.match(/[0-9]/g) || []).length
    
    if (letterCount < 1) {
      return NextResponse.json(
        { error: 'รหัสผ่านต้องมีตัวอักษรอย่างน้อย 1 ตัว' },
        { status: 400 }
      )
    }
    
    if (digitCount < 1) {
      return NextResponse.json(
        { error: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' },
        { status: 400 }
      )
    }    // หา user ID จากอีเมลใน Supabase Auth
    console.log(`🔍 กำลังค้นหาผู้ใช้สำหรับอีเมล: ${email}`)
    
    // ค้นหาผู้ใช้จาก Supabase Auth
    const { data: authUsers, error: authUserError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authUserError) {
      console.error('Error fetching auth users:', authUserError)
      return NextResponse.json(
        { error: 'เกิดข้อผิดพลาดในการค้นหาผู้ใช้' },
        { status: 500 }
      )
    }
    
    // หาผู้ใช้ที่มีอีเมลตรงกัน
    const authUser = authUsers.users.find(user => user.email === email)
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้ในระบบ' },
        { status: 404 }
      )
    }
    
    const userId = authUser.id
    console.log(`✅ พบผู้ใช้: ${userId}`)
    
    // ตรวจสอบว่ามีข้อมูลใน custom users table หรือไม่
    const { data: customUserData, error: customUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (customUserError && customUserError.code !== 'PGRST116') {
      console.error('Error checking custom users table:', customUserError)
    }    // อัปเดตรหัสผ่านในระบบ Supabase Auth (หลัก)
    console.log(`🔧 กำลังอัปเดตรหัสผ่านใน Supabase Auth สำหรับผู้ใช้: ${userId}`)
    
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )
    
    if (authUpdateError) {
      console.error('Error updating Supabase Auth password:', authUpdateError)
      return NextResponse.json(
        { error: 'เกิดข้อผิดพลาดในการอัปเดตรหัสผ่าน' },
        { status: 500 }
      )
    }
    
    console.log(`✅ อัปเดตรหัสผ่านใน Supabase Auth สำเร็จ`)    // อัปเดตรหัสผ่านใน custom users table (ถ้ามี) เพื่อความสอดคล้อง
    if (customUserData) {
      // 🚨 TESTING MODE: เก็บ plain text password เพื่อการทดสอบ
      // ใช้ plain text แทน hash เพื่อให้ดูได้ง่ายในฐานข้อมูล
      const plainTextPassword = newPassword
      
      console.log(`🔧 กำลังอัปเดตรหัสผ่านใน custom users table สำหรับอีเมล: ${email}`)
      console.log(`🔐 รหัสผ่านใหม่ (plain text): ${plainTextPassword}`)
      
      const { error: customUpdateError } = await supabaseAdmin
        .from('users')
        .update({ 
          password: plainTextPassword,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)

      if (customUpdateError) {
        console.error('Error updating custom users table:', customUpdateError)
        // ไม่ return error เพราะ Supabase Auth update สำเร็จแล้ว
        console.log('⚠️ การอัปเดต custom users table ล้มเหลว แต่ Supabase Auth อัปเดตสำเร็จแล้ว')
      } else {
        console.log(`✅ อัปเดตรหัสผ่านใน custom users table สำเร็จ`)
        
        // ตรวจสอบการอัปเดตสำเร็จหรือไม่
        const { data: verifyUpdate, error: verifyError } = await supabaseAdmin
          .from('users')
          .select('password, updated_at')
          .eq('email', email)
          .single()
            if (verifyUpdate) {
          console.log(`🔍 ตรวจสอบการอัปเดต - updated_at: ${verifyUpdate.updated_at}`)
          console.log(`🔍 รหัสผ่านใหม่ในฐานข้อมูล (plain text): ${verifyUpdate.password}`)
        }
      }
    } else {
      console.log('📝 ไม่พบข้อมูลใน custom users table - ข้ามการอัปเดต')
    }// ทำเครื่องหมายว่า token ถูกใช้แล้ว
    const { error: markTokenUsedError } = await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenData.id)

    if (markTokenUsedError) {
      console.error('Error marking token as used:', markTokenUsedError)
    }

    // ลบ OTP และ token ที่หมดอายุ (cleanup)
    await supabaseAdmin
      .from('password_reset_otps')
      .delete()
      .lt('expires_at', new Date().toISOString())
    
    await supabaseAdmin
      .from('password_reset_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString())

    return NextResponse.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    })

  } catch (error) {
    console.error('Reset password API error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' },
      { status: 500 }
    )
  }
}
