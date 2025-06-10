# OTP Password Reset System Setup Guide

## การตั้งค่าระบบ OTP สำหรับการรีเซ็ตรหัสผ่าน

### 1. สร้างตารางในฐานข้อมูล Supabase

#### วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ)
1. เปิด [Supabase Dashboard](https://app.supabase.com)
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ **SQL Editor** ในเมนูด้านซ้าย
4. คัดลอกและรันคำสั่ง SQL ด้านล่าง:

```sql
-- สร้างตาราง password_reset_otps
CREATE TABLE IF NOT EXISTS password_reset_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตาราง password_reset_tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง indexes เพื่อประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON password_reset_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_expires_at ON password_reset_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(reset_token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- เปิด RLS (Row Level Security)
ALTER TABLE password_reset_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- สร้าง policies สำหรับ service role
CREATE POLICY "Service role can access all OTPs" ON password_reset_otps
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all tokens" ON password_reset_tokens
    FOR ALL USING (auth.role() = 'service_role');

-- policies สำหรับผู้ใช้ (optional)
CREATE POLICY "Users can access their own OTPs" ON password_reset_otps
    FOR SELECT USING (email = auth.email());

CREATE POLICY "Users can access their own tokens" ON password_reset_tokens
    FOR SELECT USING (email = auth.email());
```

#### วิธีที่ 2: ใช้ไฟล์ SQL ที่มีอยู่
รันไฟล์ `password-reset-tables.sql` ที่อยู่ในโฟลเดอร์รูทของโปรเจกต์

### 2. ตั้งค่า Email Service (ทางเลือก)

#### การใช้งานในโหมด Development
- ระบบจะทำงานในโหมด debug โดยอัตโนมัติ
- รหัส OTP จะแสดงใน console และ response API
- ไม่ต้องตั้งค่า email provider

#### การตั้งค่า Gmail SMTP (สำหรับ Production)
1. สร้างไฟล์ `.env.local` ในโฟลเดอร์รูท:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

2. ขั้นตอนการตั้งค่า Gmail App Password:
   - ไปที่ [Google Account Security](https://myaccount.google.com/security)
   - เปิด "2-Step Verification"
   - สร้าง "App Password" สำหรับแอปพลิเคชัน
   - ใช้ App Password แทน password ปกติ

#### Email Providers อื่นๆ
```env
# Outlook/Hotmail
SMTP_HOST=smtp.live.com
SMTP_PORT=587
SMTP_SECURE=false

# Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false

# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### 3. การทดสอบระบบ

#### ทดสอบผ่าน Test Page
1. ไปที่ `http://localhost:3001/test-otp`
2. กดปุ่ม "สร้างตารางในฐานข้อมูล" เพื่อตรวจสอบตาราง
3. ทดสอบการส่ง OTP
4. ทดสอบการยืนยัน OTP
5. ทดสอบการรีเซ็ตรหัสผ่าน

#### ทดสอบผ่าน API โดยตรง
```bash
# ส่ง OTP
curl -X POST http://localhost:3001/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# ยืนยัน OTP
curl -X POST http://localhost:3001/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otpCode":"123456"}'

# รีเซ็ตรหัสผ่าน
curl -X POST http://localhost:3001/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","resetToken":"token","newPassword":"newpass1234"}'
```

### 4. Features และความปลอดภัย

#### Features ที่รองรับ
- ✅ ส่ง OTP 6 หลักผ่านอีเมล
- ✅ ยืนยัน OTP พร้อม token สำหรับรีเซ็ต
- ✅ รีเซ็ตรหัสผ่านด้วย bcrypt hashing
- ✅ Rate limiting (5 ครั้งใน 15 นาที)
- ✅ OTP หมดอายุใน 5 นาที
- ✅ Reset token หมดอายุใน 15 นาที
- ✅ การตรวจสอบความแข็งแกร่งของรหัสผ่าน
- ✅ UI ภาษาไทยใน Forgot Password Drawer
- ✅ การทำความสะอาด OTP/Token ที่หมดอายุ

#### ความปลอดภัย
- 🔒 Password hashing ด้วย bcrypt (salt rounds: 12)
- 🔒 Rate limiting ป้องกันการ spam OTP
- 🔒 OTP และ Token มีการหมดอายุ
- 🔒 OTP สามารถใช้ได้เพียงครั้งเดียว
- 🔒 การตรวจสอบความแข็งแกร่งของรหัสผ่าน
- 🔒 RLS policies ใน Supabase

### 5. การใช้งานจริง

#### การปรับแต่งสำหรับ Production
1. ลบ `debug_otp` ออกจาก response
2. ตั้งค่า email service ที่เหมาะสม
3. ปรับ rate limiting ตามความต้องการ
4. เพิ่ม logging และ monitoring
5. ตั้งค่า CORS ที่เหมาะสม

#### การบำรุงรักษา
- ระบบจะทำความสะอาด OTP/Token ที่หมดอายุอัตโนมัติ
- ตรวจสอบ email delivery rate
- Monitor rate limiting statistics
- ตรวจสอบ error logs เป็นประจำ

### 6. Troubleshooting

#### ปัญหาที่อาจพบ
1. **ตารางไม่ถูกสร้าง**: รันคำสั่ง SQL ใน Supabase Dashboard
2. **อีเมลไม่ถูกส่ง**: ตรวจสอบการตั้งค่า SMTP
3. **Rate limit error**: รอให้หมดเวลา หรือรีเซ็ตใน test mode
4. **OTP หมดอายุ**: ส่ง OTP ใหม่
5. **Password validation error**: ตรวจสอบความยาวและองค์ประกอบของรหัสผ่าน

สำหรับปัญหาอื่นๆ ให้ตรวจสอบ console logs และ network requests
