# 🚀 Production Setup Guide - ระบบรีเซ็ตรหัสผ่าน OTP

## ขั้นตอนการเปิดใช้งานระบบจริง

### 1. ✅ สร้างตารางในฐานข้อมูล Supabase

1. เปิด [Supabase Dashboard](https://app.supabase.com)
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ **SQL Editor**
4. รันคำสั่ง SQL จากไฟล์ `password-reset-tables.sql`

### 2. 📧 ตั้งค่าการส่งอีเมล

#### ตัวเลือก 1: Gmail SMTP (แนะนำ)
1. เปิด [Google Account Security](https://myaccount.google.com/security)
2. เปิดใช้งาน "2-Step Verification"
3. สร้าง "App Password":
   - ไปที่ Security > App passwords
   - เลือก Mail และอุปกรณ์ของคุณ
   - คัดลอก App Password ที่ได้

#### ตัวเลือก 2: SendGrid (สำหรับ Production ขนาดใหญ่)
1. สมัครสมาชิก [SendGrid](https://sendgrid.com)
2. สร้าง API Key
3. ยืนยันโดเมนของคุณ

### 3. 🔧 ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` และใส่ค่าดังนี้:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Service (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Company Info
COMPANY_NAME=TEEDIN EASY
COMPANY_WEBSITE=https://your-domain.com
SUPPORT_EMAIL=support@your-domain.com

# Production Mode
NODE_ENV=production
```

### 4. 🧪 ทดสอบระบบ

1. **ลงทะเบียนผู้ใช้ใหม่ในระบบก่อน** (ผ่านหน้าลงทะเบียนปกติ)
2. **ทดสอบ Forgot Password**:
   - ไปที่หน้าหลัก
   - คลิก "เข้าสู่ระบบ"
   - คลิก "ลืมรหัสผ่าน?"
   - ใส่อีเมลที่ลงทะเบียนไว้
   - ตรวจสอบอีเมล OTP
   - กรอก OTP และรหัสผ่านใหม่

### 5. 📊 การตรวจสอบการทำงาน

#### ตรวจสอบในฐานข้อมูล:
```sql
-- ดู OTP ที่ส่งล่าสุด
SELECT * FROM password_reset_otps 
ORDER BY created_at DESC 
LIMIT 10;

-- ดู Reset Token ที่สร้าง
SELECT * FROM password_reset_tokens 
ORDER BY created_at DESC 
LIMIT 10;
```

#### ตรวจสอบ Logs:
- ดู Console Logs สำหรับข้อผิดพลาด
- ตรวจสอบ Network Tab ใน Developer Tools
- ตรวจสอบ Email Delivery Status

### 6. 🔒 ความปลอดภัยเพิ่มเติม

#### Rate Limiting (ปัจจุบัน):
- 5 OTP ต่อ 15 นาที ต่ออีเมล/IP
- ปรับแต่งได้ในไฟล์ `lib/rate-limiter.ts`

#### ข้อแนะนำเพิ่มเติม:
- ใช้ HTTPS สำหรับ Production
- ตั้งค่า CORS ที่เหมาะสม
- Monitor อีเมล delivery rate
- สำรองข้อมูล OTP logs เป็นประจำ

### 7. 🛠️ การปรับแต่ง

#### เปลี่ยนระยะเวลาหมดอายุ OTP:
ในไฟล์ `app/api/send-otp/route.ts`:
```typescript
// เปลี่ยนจาก 5 นาที เป็นเวลาที่ต้องการ
const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 นาที
```

#### เปลี่ยน Rate Limiting:
ในไฟล์ `lib/rate-limiter.ts`:
```typescript
export const OTP_RATE_LIMIT = {
  maxRequests: 3,        // เปลี่ยนจาก 5 เป็น 3
  windowMs: 10 * 60 * 1000, // เปลี่ยนจาก 15 นาที เป็น 10 นาที
}
```

### 8. 📞 การแก้ไขปัญหา

#### ปัญหาที่พบบ่อย:
1. **อีเมลไม่ถูกส่ง**: ตรวจสอบ SMTP credentials
2. **OTP ไม่ถูกต้อง**: ตรวจสอบเวลาหมดอายุ
3. **Rate limit**: รอหรือเคลียร์ cache
4. **ไม่พบผู้ใช้**: ตรวจสอบว่าลงทะเบียนแล้วหรือยัง

#### ตรวจสอบ Logs:
- เปิด Developer Console
- ดู Network requests
- ตรวจสอบ Response messages

---

## 🎯 สรุป Features ที่พร้อมใช้งาน

✅ **ความปลอดภัย**:
- bcrypt password hashing
- Rate limiting
- OTP หมดอายุ 5 นาที
- Reset token หมดอายุ 15 นาที
- RLS policies ใน Supabase

✅ **User Experience**:
- UI ภาษาไทยสมบูรณ์
- Email templates สวยงาม
- Error handling ครบถ้วน
- Mobile responsive

✅ **ระบบจริง**:
- ตรวจสอบผู้ใช้จริงในระบบ
- ไม่มี debug mode
- Email delivery ผ่าน SMTP
- Production ready

**Ready for Production! 🚀**
