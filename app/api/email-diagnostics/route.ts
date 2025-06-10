import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  
  // ตรวจสอบ Environment Variables
  const envCheck = {
    resend: {
      apiKey: process.env.RESEND_API_KEY ? '✅ มี API Key' : '❌ ไม่มี RESEND_API_KEY',
      keyFormat: process.env.RESEND_API_KEY?.startsWith('re_') ? '✅ รูปแบบถูกต้อง' : '❌ ต้องขึ้นต้นด้วย re_',
      keyLength: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.length} ตัวอักษร` : 'N/A'
    },
    gmail: {
      user: process.env.SMTP_USER ? '✅ มี SMTP_USER' : '❌ ไม่มี SMTP_USER',
      pass: process.env.SMTP_PASS ? '✅ มี SMTP_PASS' : '❌ ไม่มี SMTP_PASS',
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || '587'
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ มี Supabase URL' : '❌ ไม่มี SUPABASE_URL',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ มี Service Role Key' : '❌ ไม่มี SERVICE_ROLE_KEY'
    }
  }

  // ตรวจสอบการติดตั้ง Dependencies
  let dependencies = {
    resend: '❓ ไม่ทราบสถานะ',
    nodemailer: '❓ ไม่ทราบสถานะ'
  }

  try {
    require('resend')
    dependencies.resend = '✅ ติดตั้งแล้ว'
  } catch {
    dependencies.resend = '❌ ไม่ได้ติดตั้ง'
  }

  try {
    require('nodemailer')
    dependencies.nodemailer = '✅ ติดตั้งแล้ว'
  } catch {
    dependencies.nodemailer = '❌ ไม่ได้ติดตั้ง'
  }

  // คำแนะนำแก้ไขปัญหา
  const troubleshooting = []

  if (!process.env.RESEND_API_KEY) {
    troubleshooting.push({
      issue: '❌ ไม่มี RESEND_API_KEY',
      solution: 'สร้าง API Key ใหม่ที่ https://resend.com/api-keys และเพิ่มใน .env.local'
    })
  } else if (!process.env.RESEND_API_KEY.startsWith('re_')) {
    troubleshooting.push({
      issue: '❌ RESEND_API_KEY รูปแบบไม่ถูกต้อง',
      solution: 'API Key ต้องขึ้นต้นด้วย "re_" กรุณาตรวจสอบ API Key'
    })
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    troubleshooting.push({
      issue: '⚠️ ไม่มีการตั้งค่า Gmail SMTP (Fallback)',
      solution: 'ตั้งค่า SMTP_USER และ SMTP_PASS ใน .env.local เพื่อใช้เป็น fallback'
    })
  }

  if (dependencies.resend !== '✅ ติดตั้งแล้ว') {
    troubleshooting.push({
      issue: '❌ ไม่ได้ติดตั้ง Resend',
      solution: 'รันคำสั่ง: pnpm add resend หรือ npm install resend'
    })
  }

  // สถานะการทำงานของระบบ
  const systemStatus = {
    primaryEmailService: process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_') ? 'Resend (พร้อม)' : 'Resend (ไม่พร้อม)',
    fallbackEmailService: process.env.SMTP_USER && process.env.SMTP_PASS ? 'Gmail SMTP (พร้อม)' : 'Gmail SMTP (ไม่พร้อม)',
    debugMode: !process.env.RESEND_API_KEY && !process.env.SMTP_USER ? 'เปิดใช้งาน (จะแสดง OTP ใน Console)' : 'ปิดใช้งาน'
  }

  return NextResponse.json({
    title: '🔍 Email System Diagnostic',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    
    systemStatus,
    environmentVariables: envCheck,
    dependencies,
    troubleshooting,
    
    nextSteps: troubleshooting.length > 0 ? [
      'แก้ไขปัญหาตาม troubleshooting ข้างต้น',
      'Restart development server หลังแก้ไข .env.local',
      'ทดสอบการส่งอีเมลอีกครั้ง'
    ] : [
      '✅ ระบบพร้อมใช้งาน!',
      'ทดสอบการส่งอีเมลได้ที่ /api/test-resend',
      'หรือใช้ระบบ forgot password ในเว็บไซต์'
    ],

    testingEndpoints: {
      resendTest: 'POST /api/test-resend',
      smtpTest: 'POST /api/test-smtp',
      sendOtp: 'POST /api/send-otp',
      diagnostics: 'GET /api/email-diagnostics (หน้านี้)'
    }
  }, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}
