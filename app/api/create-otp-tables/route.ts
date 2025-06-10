import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // สร้างตารางโดยใช้ raw SQL query
    // เนื่องจาก Supabase client ไม่รองรับ DDL operations โดยตรง
    // เราจะใช้ข้อมูลในตาราง แทนการสร้างตาราง
    
    // ตรวจสอบว่ามีตาราง password_reset_otps อยู่แล้วหรือไม่
    const { data: otpData, error: otpError } = await supabase
      .from('password_reset_otps')
      .select('*')
      .limit(1)

    // ตรวจสอบว่ามีตาราง password_reset_tokens อยู่แล้วหรือไม่
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .limit(1)

    const tableStatus = {
      password_reset_otps: !otpError,
      password_reset_tokens: !tokenError
    }

    if (!tableStatus.password_reset_otps || !tableStatus.password_reset_tokens) {
      return NextResponse.json({
        success: false,
        message: 'ตารางยังไม่ถูกสร้าง กรุณาสร้างตารางใน Supabase Dashboard',
        tableStatus,
        instructions: [
          '1. เปิด Supabase Dashboard',
          '2. ไปที่ SQL Editor',
          '3. รันคำสั่ง SQL จากไฟล์ password-reset-tables.sql',
          '4. หรือสร้างตารางตามโครงสร้างที่กำหนด'
        ],
        sql_file: 'password-reset-tables.sql'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'ตารางสำหรับระบบ OTP พร้อมใช้งานแล้ว',
      tables: [
        'password_reset_otps',
        'password_reset_tokens'
      ],
      tableStatus
    })

  } catch (error) {
    console.error('Check tables API error:', error)
    return NextResponse.json(
      { 
        error: 'เกิดข้อผิดพลาดในการตรวจสอบตาราง',
        message: 'กรุณาสร้างตารางใน Supabase Dashboard ด้วยตนเอง'
      },
      { status: 500 }
    )
  }
}
