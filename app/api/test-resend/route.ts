import { NextRequest, NextResponse } from 'next/server'
import { sendOTPEmail } from '@/lib/resend-email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'กรุณาระบุอีเมลสำหรับทดสอบ' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่ามี Resend API key หรือไม่
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { 
          error: 'ไม่พบ RESEND_API_KEY ใน environment variables',
          solution: 'กรุณาตั้งค่า RESEND_API_KEY ในไฟล์ .env.local'
        },
        { status: 500 }
      )
    }

    console.log('🧪 กำลังทดสอบการส่งอีเมลผ่าน Resend...')
    console.log(`📧 ส่งไปยัง: ${email}`)

    // ส่งอีเมลทดสอบ
    const testOTP = '123456'
    const result = await sendOTPEmail({
      to: email,
      otpCode: testOTP
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `✅ ส่งอีเมลทดสอบสำเร็จผ่าน Resend!`,
        details: {
          to: email,
          testOTP: testOTP,
          messageId: result.messageId,
          provider: result.provider,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      throw new Error('ส่งอีเมลไม่สำเร็จ')
    }

  } catch (error: any) {
    console.error('❌ การทดสอบ Resend ล้มเหลว:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: `ไม่สามารถส่งอีเมลทดสอบได้: ${error.message}`,
        troubleshooting: {
          apiKey: process.env.RESEND_API_KEY ? '✅ มี API Key' : '❌ ไม่มี API Key',
          suggestions: [
            'ตรวจสอบว่า RESEND_API_KEY ถูกต้อง',
            'ตรวจสอบว่าอีเมลเป็นรูปแบบที่ถูกต้อง',
            'ลองใช้อีเมลที่ยืนยันแล้วใน Resend Dashboard'
          ]
        }
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Resend Email Test API',
    usage: 'POST ไปยัง endpoint นี้พร้อม { "email": "your-email@example.com" }',
    status: {
      resendApiKey: process.env.RESEND_API_KEY ? '✅ พร้อมใช้งาน' : '❌ ไม่พบ API Key',
      environment: process.env.NODE_ENV || 'development'
    }
  })
}
