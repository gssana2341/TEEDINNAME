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

// กำหนดค่าเริ่มต้นสำหรับ Gmail
const defaultConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
}

// สร้าง transporter สำหรับส่งอีเมล
export const createEmailTransporter = (config: EmailConfig = defaultConfig) => {
  return nodemailer.createTransport(config)
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
    </div>
  </div>
</body>
</html>
`

// ส่ง OTP ผ่านอีเมล - ใช้ Gmail SMTP เป็นหลัก (ส่งได้ทุกอีเมล)
export const sendOTPEmail = async (
  to: string, 
  otpCode: string, 
  config?: EmailConfig
): Promise<{ success: boolean; error?: string; provider?: string }> => {
  console.log('🚀 กำลังส่งอีเมล OTP...')

  // วิธีที่ 1: ใช้ Gmail SMTP (ส่งได้ทุกอีเมล)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      console.log('📧 กำลังส่งอีเมล OTP ผ่าน Gmail SMTP...')
      const transporter = createEmailTransporter(config)
      
      const mailOptions = {
        from: {
          name: 'TedIn Easy - ระบบอสังหาริมทรัพย์',
          address: process.env.SMTP_USER || 'noreply@tedin.com'
        },
        to: to,
        subject: '🔐 รหัส OTP สำหรับการรีเซ็ตรหัสผ่าน - TedIn Easy',
        html: createEmailTemplate(otpCode)
      }

      await transporter.sendMail(mailOptions)
      console.log('✅ ส่งอีเมล OTP ผ่าน Gmail SMTP สำเร็จ')
      return { success: true, provider: 'gmail' }
      
    } catch (error: any) {
      console.error('❌ Gmail SMTP Error:', error.message)
      console.log('⚠️ Gmail SMTP ส่งไม่สำเร็จ, กำลังลอง Resend...')
      // หาก Gmail ล้มเหลว ไปลอง Resend
    }
  } else {
    console.log('⚠️ Gmail SMTP ไม่ได้ตั้งค่า, กำลังลอง Resend...')
  }

  // วิธีที่ 2: Fallback ด้วย Resend (อีเมลที่อนุญาตเท่านั้น)
  if (process.env.RESEND_API_KEY) {
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

  // วิธีที่ 3: Debug Mode (แสดงใน console)
  console.log(`🔐 Debug Mode - OTP สำหรับ ${to}: ${otpCode}`)
  console.log('💡 เพื่อส่งอีเมลจริง กรุณาตั้งค่า Gmail SMTP ใน .env.local')
  return { success: true, provider: 'debug' }
}

// Export สำหรับการใช้งาน
export default sendOTPEmail
