import { NextRequest, NextResponse } from 'next/server'
import { testEmailConnection } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 ทดสอบการเชื่อมต่อ SMTP...')
    
    // ตรวจสอบ environment variables
    const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
    const missingVars = requiredVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: `ขาด environment variables: ${missingVars.join(', ')}`,
        instructions: 'กรุณาตั้งค่า SMTP credentials ในไฟล์ .env.local ตาม GMAIL_SMTP_SETUP.md'
      }, { status: 400 })
    }
    
    console.log('📧 SMTP Configuration:')
    console.log(`- Host: ${process.env.SMTP_HOST}`)
    console.log(`- Port: ${process.env.SMTP_PORT}`)
    console.log(`- User: ${process.env.SMTP_USER}`)
    console.log(`- Pass: ${process.env.SMTP_PASS ? '***มีการตั้งค่าแล้ว***' : 'ไม่ได้ตั้งค่า'}`)
    
    // ทดสอบการเชื่อมต่อ
    const isConnected = await testEmailConnection()
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'การเชื่อมต่อ SMTP สำเร็จ! สามารถส่งอีเมลได้แล้ว',
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          secure: process.env.SMTP_SECURE
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'การเชื่อมต่อ SMTP ล้มเหลว',
        instructions: 'กรุณาตรวจสอบ SMTP credentials และทำตาม GMAIL_SMTP_SETUP.md'
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ SMTP:', error)
    return NextResponse.json({
      success: false,
      error: `เกิดข้อผิดพลาด: ${error.message}`,
      instructions: 'กรุณาตรวจสอบ SMTP configuration'
    }, { status: 500 })
  }
}
