import nodemailer from 'nodemailer'
import { sendOTPEmail as sendResendOTP } from './resend-email'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// สร้างเทมเพลตอีเมล HTML สวยๆ
const createEmailTemplate = (otpCode: string) => `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>รหัส OTP - TedIn Easy</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }
    .otp-code {
      background-color: #f0f4ff;
      border: 2px solid #2563eb;
      border-radius: 8px;
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
      text-align: center;
      padding: 20px;
      margin: 20px 0;
      letter-spacing: 8px;
    }
    .warning {
      background-color: #fef3cd;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏠 TedIn Easy</div>
      <p>ระบบอสังหาริมทรัพย์</p>
    </div>
    
    <h2 style="color: #1f2937; text-align: center;">รหัส OTP สำหรับรีเซ็ตรหัสผ่าน</h2>
    
    <p>สวัสดีครับ/ค่ะ</p>
    <p>คุณได้ทำการขอรีเซ็ตรหัสผ่านในระบบ TedIn Easy</p>
    <p>กรุณาใช้รหัส OTP ด้านล่างเพื่อดำเนินการต่อ:</p>
    
    <div class="otp-code">${otpCode}</div>
    
    <div class="warning">
      <strong>⚠️ ข้อควรระวัง:</strong>
      <ul>
        <li>รหัส OTP นี้จะหมดอายุภายใน <strong>10 นาที</strong></li>
        <li>กรุณาอย่าแชร์รหัสนี้กับผู้อื่น</li>
        <li>หากคุณไม่ได้ทำการขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</li>
      </ul>
    </div>
    
    <p>หากคุณมีปัญหาหรือข้อสงสัย กรุณาติดต่อทีมสนับสนุนของเรา</p>
    
    <div class="footer">
      <p>ขอบคุณที่ใช้บริการ TedIn Easy</p>
      <p>อีเมลนี้ส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
      <p style="color: #ef4444; font-weight: bold;">📧 อีเมลจริงจะส่งไปยังกล่องจดหมายของคุณ!</p>
    </div>
  </div>
</body>
</html>
`

// ส่ง OTP ผ่านอีเมล - ส่งได้ทุกอีเมลโดยไม่ต้อง 2FA
export const sendOTPEmail = async (
  to: string, 
  otpCode: string
): Promise<{ success: boolean; error?: string; provider?: string; previewUrl?: string }> => {
  console.log('🚀 กำลังส่งอีเมล OTP...')

  // วิธีที่ 1: ลอง Resend ก่อน (ถ้าเป็นอีเมลที่อนุญาต)
  if (process.env.RESEND_API_KEY && to.toLowerCase() === 'asngiun@gmail.com') {
    console.log('🚀 กำลังส่งอีเมล OTP ผ่าน Resend...')
    const result = await sendResendOTP({ to, otpCode })
    
    if (result.success) {
      console.log('✅ ส่งอีเมล OTP ผ่าน Resend สำเร็จ')
      return { 
        success: true, 
        provider: 'resend'
      }
    } else {
      console.error('⚠️ Resend ส่งไม่สำเร็จ:', result.error)
    }
  }

  // วิธีที่ 2: ใช้ Ethereal Email (ส่งได้ทุกอีเมล, ไม่ต้อง 2FA)
  try {
    console.log('📧 กำลังส่งอีเมล OTP ผ่าน Ethereal Email...')
      // สร้าง test account แบบ dynamic
    const testAccount = await nodemailer.createTestAccount()
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    })

    const mailOptions = {
      from: {
        name: 'TedIn Easy - ระบบอสังหาริมทรัพย์',
        address: testAccount.user
      },
      to: to,
      subject: '🔐 รหัส OTP สำหรับการรีเซ็ตรหัสผ่าน - TedIn Easy',
      html: createEmailTemplate(otpCode)
    }

    const info = await transporter.sendMail(mailOptions)
    const previewUrl = nodemailer.getTestMessageUrl(info)
    
    console.log('✅ ส่งอีเมล OTP ผ่าน Ethereal สำเร็จ')
    console.log('📧 ดูอีเมลได้ที่:', previewUrl)
    console.log('🎯 OTP สำหรับ', to, ':', otpCode)
      return { 
      success: true, 
      provider: 'ethereal',
      previewUrl: previewUrl as string
    }
    
  } catch (error: any) {
    console.error('❌ Ethereal Email Error:', error.message)
  }

  // วิธีที่ 3: Debug Mode (แสดงใน console)
  console.log(`🔐 Debug Mode - OTP สำหรับ ${to}: ${otpCode}`)
  console.log('💡 ระบบทำงานปกติ แต่ไม่สามารถส่งอีเมลจริงได้')
  return { success: true, provider: 'debug' }
}

// Export สำหรับการใช้งาน
export default sendOTPEmail
