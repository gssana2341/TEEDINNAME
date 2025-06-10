import nodemailer from 'nodemailer'

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
      padding: 20px;
      text-align: center;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #2563eb;
      margin: 30px 0;
      font-family: 'Courier New', monospace;
    }
    .info {
      background-color: #f8fafc;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning {
      background-color: #fef3e2;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏢 TedIn Easy</div>
      <h1>รหัส OTP สำหรับการรีเซ็ตรหัสผ่าน</h1>
    </div>
    
    <p>สวัสดีครับ/ค่ะ</p>
    
    <p>คุณได้ร้องขอการรีเซ็ตรหัสผ่านสำหรับบัญชี TedIn Easy ของคุณ กรุณาใช้รหัส OTP ด้านล่างเพื่อดำเนินการต่อ:</p>
    
    <div class="otp-code">${otpCode}</div>
    
    <div class="info">
      <strong>📋 วิธีการใช้งาน:</strong>
      <ul>
        <li>คัดลอกรหัส OTP ข้างต้น</li>
        <li>กลับไปที่หน้าเว็บไซต์ TedIn Easy</li>
        <li>กรอกรหัส OTP ในช่องที่กำหนด</li>
        <li>ตั้งรหัสผ่านใหม่ตามต้องการ</li>
      </ul>
    </div>
    
    <div class="warning">
      <strong>⚠️ ข้อควรระวัง:</strong>
      <ul>
        <li>รหัส OTP นี้จะหมดอายุใน <strong>5 นาที</strong></li>
        <li>ใช้งานได้เพียง <strong>1 ครั้งเท่านั้น</strong></li>
        <li>หากไม่ได้ร้องขอ กรุณาเพิกเฉยต่ออีเมลนี้</li>
        <li>ห้ามแชร์รหัส OTP ให้กับผู้อื่น</li>
      </ul>
    </div>
    
    <p>หากคุณประสบปัญหาในการใช้งาน กรุณาติดต่อทีมสนับสนุนของเรา</p>
    
    <div class="footer">
      <p>ขอบคุณที่ใช้บริการ TedIn Easy</p>
      <p>อีเมลนี้ส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
      <p>© 2025 TedIn Easy - ระบบจัดการอสังหาริมทรัพย์</p>
    </div>
  </div>
</body>
</html>
`

// ส่ง OTP ผ่าน SMTP2GO (ฟรี 1000 อีเมล/เดือน)
export const sendOTPEmail = async (
  to: string, 
  otpCode: string
): Promise<{ success: boolean; error?: string; provider?: string }> => {
  
  try {
    console.log(`📧 กำลังส่งอีเมล OTP ผ่าน SMTP2GO ไปยัง: ${to}`)
      // ใช้ SMTP2GO ที่ไม่ต้องยืนยันโดเมน
    const transporter = nodemailer.createTransport({
      host: 'mail.smtp2go.com',
      port: 587,
      secure: false,
      auth: {
        user: 'tedin-easy',
        pass: 'demo123'  // จะต้องสมัครจริงเพื่อใช้งาน
      }
    })

    const mailOptions = {
      from: {
        name: 'TedIn Easy - ระบบอสังหาริมทรัพย์',
        address: 'noreply@tedin-easy.com'
      },
      to: to,
      subject: '🔐 รหัส OTP สำหรับการรีเซ็ตรหัสผ่าน - TedIn Easy',
      html: createEmailTemplate(otpCode),
      text: `
รหัส OTP สำหรับการรีเซ็ตรหัสผ่าน TedIn Easy

รหัส OTP ของคุณคือ: ${otpCode}

รหัสนี้จะหมดอายุใน 5 นาที และใช้งานได้เพียง 1 ครั้งเท่านั้น

หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้

ขอบคุณที่ใช้บริการ TedIn Easy
      `.trim()
    }

    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ ส่งอีเมล OTP ผ่าน SMTP2GO สำเร็จ')
    console.log('📧 Message ID:', info.messageId)
    console.log(`📬 อีเมลถูกส่งไปยัง ${to} แล้ว`)
    
    return { 
      success: true, 
      provider: 'smtp2go' 
    }
    
  } catch (error: any) {
    console.error('❌ SMTP2GO Error:', error.message)
    return {
      success: false,
      error: error.message || 'Failed to send email via SMTP2GO'
    }
  }
}

export default sendOTPEmail
