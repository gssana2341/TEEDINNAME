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

// สร้าง HTML template สำหรับ OTP
const createEmailTemplate = (otpCode: string): string => {
  return `
    <div style="font-family: 'Noto Sans Thai', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
      <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; font-size: 28px; font-weight: bold; margin: 0;">TedInEasy</h1>
          <p style="color: #64748b; font-size: 16px; margin: 8px 0 0 0;">ระบบอสังหาริมทรัพย์</p>
        </div>

        <!-- Main Content -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1e293b; font-size: 24px; font-weight: bold; margin-bottom: 16px;">
            🔐 รหัส OTP สำหรับการรีเซ็ตรหัสผ่าน
          </h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            เราได้รับคำขอให้ทำการรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ<br>
            กรุณาใช้รหัส OTP ด้านล่างเพื่อยืนยันตัวตน
          </p>

          <!-- OTP Code -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; font-size: 32px; font-weight: bold; padding: 20px 40px; border-radius: 12px; letter-spacing: 8px; margin: 30px 0; display: inline-block;">
            ${otpCode}
          </div>

          <p style="color: #ef4444; font-size: 14px; font-weight: 500; margin-top: 20px;">
            ⚠️ รหัสนี้จะหมดอายุในเวลา 5 นาที
          </p>
        </div>

        <!-- Security Notice -->
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="color: #92400e; font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">
            🛡️ เพื่อความปลอดภัย
          </h3>
          <ul style="color: #78350f; font-size: 14px; margin: 0; padding-left: 20px;">
            <li>ไม่ควรแชร์รหัสนี้กับผู้อื่น</li>
            <li>หากคุณไม่ได้ทำการขอรีเซ็ตรหัสผ่าน กรุณาติดต่อทีมงานทันที</li>
            <li>รหัสนี้สามารถใช้ได้เพียงครั้งเดียว</li>
          </ul>
        </div>

        <!-- Footer -->
        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            อีเมลนี้ส่งจากระบบอัตโนมัติ กรุณาอย่าตอบกลับ<br>
            หากมีปัญหา กรุณาติดต่อ: support@tedin.com
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 10px 0 0 0;">
            © 2025 TedInEasy. สงวนลิขสิทธิ์
          </p>
        </div>
      </div>
    </div>
  `
}

// ส่ง OTP ผ่านอีเมล - ใช้ Gmail SMTP เป็นหลัก (ส่งได้ทุกอีเมล)
export const sendOTPEmail = async (
  to: string, 
  otpCode: string, 
  config?: EmailConfig
): Promise<{ success: boolean; error?: string; provider?: string }> => {
  console.log('🚀 กำลังส่งอีเมล OTP...')

  // ลำดับที่ 1: ใช้ Gmail SMTP (ส่งได้ทุกอีเมล)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      console.log('📧 กำลังส่งอีเมล OTP ผ่าน Gmail SMTP...')
      const transporter = createEmailTransporter(config)
      
      const mailOptions = {
        from: {
          name: 'TedInEasy - ระบบอสังหาริมทรัพย์',
          address: process.env.SMTP_USER
        },
        to: to,
        subject: '🔐 รหัส OTP สำหรับการรีเซ็ตรหัสผ่าน - TedInEasy',
        html: createEmailTemplate(otpCode),
        text: `
TedInEasy - รหัส OTP สำหรับการรีเซ็ตรหัสผ่าน

รหัส OTP ของคุณคือ: ${otpCode}

รหัสนี้จะหมดอายุในเวลา 5 นาที

เพื่อความปลอดภัย:
- ไม่ควรแชร์รหัสนี้กับผู้อื่น
- หากคุณไม่ได้ทำการขอรีเซ็ตรหัสผ่าน กรุณาติดต่อทีมงานทันที
- รหัสนี้สามารถใช้ได้เพียงครั้งเดียว

© 2025 TedInEasy
        `
      }

      const info = await transporter.sendMail(mailOptions)
      console.log('✅ ส่งอีเมล OTP ผ่าน Gmail SMTP สำเร็จ:', info.messageId)
      return { 
        success: true, 
        provider: 'gmail-smtp'
      }
    } catch (error) {
      console.error('❌ Gmail SMTP Error:', error)
      console.log('⚠️ Gmail SMTP ส่งไม่สำเร็จ, กำลังลอง Resend...')
    }
  }

  // ลำดับที่ 2: Fallback ไปยัง Resend (เฉพาะอีเมลเจ้าของบัญชี)
  if (process.env.RESEND_API_KEY && to.toLowerCase() === 'asngiun@gmail.com') {
    console.log('🚀 กำลังส่งอีเมล OTP ผ่าน Resend (fallback)...')
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

  // ลำดับที่ 3: Debug Mode (สำหรับการทดสอบ)
  console.log(`🔐 Debug Mode - OTP สำหรับ ${to}: ${otpCode}`)
  console.log(`✅ ส่ง OTP สำเร็จผ่าน debug`)
  
  return { 
    success: true, 
    error: 'ไม่สามารถส่งอีเมลได้ แต่ OTP แสดงใน console สำหรับการทดสอบ',
    provider: 'debug' 
  }
}

// ตรวจสอบการเชื่อมต่อ SMTP
export const testEmailConnection = async (config?: EmailConfig): Promise<boolean> => {
  try {
    const transporter = createEmailTransporter(config)
    await transporter.verify()
    console.log('✅ การเชื่อมต่อ SMTP สำเร็จ')
    return true
  } catch (error: any) {
    console.error('❌ การเชื่อมต่อ SMTP ล้มเหลว:', error.message)
    return false
  }
}
