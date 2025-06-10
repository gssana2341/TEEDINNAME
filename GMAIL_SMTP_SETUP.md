# การตั้งค่า Gmail SMTP สำหรับส่งอีเมล OTP

## ขั้นตอนการตั้งค่า Gmail SMTP

### 1. เปิดการใช้งาน 2-Factor Authentication (2FA)

1. ไปที่ [Google Account Settings](https://myaccount.google.com/)
2. คลิก "Security" ที่เมนูซ้าย
3. ในส่วน "How you sign in to Google" คลิก "2-Step Verification"
4. ทำตามขั้นตอนเพื่อเปิดใช้งาน 2FA

### 2. สร้าง App Password

1. กลับไปที่ "Security" page
2. ในส่วน "How you sign in to Google" คลิก "App passwords"
3. เลือก "Mail" และ device ที่คุณใช้
4. คลิก "Generate"
5. **คัดลอกรหัสผ่าน 16 หลักที่แสดงขึ้นมา** (จะไม่แสดงอีกครั้ง)

### 3. อัปเดต Environment Variables

แก้ไขไฟล์ `.env.local`:

```bash
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-digit-app-password
```

**แทนที่:**
- `your-gmail@gmail.com` ด้วยอีเมล Gmail ของคุณ
- `your-16-digit-app-password` ด้วยรหัสผ่าน App Password ที่สร้างขึ้น

### 4. รีสตาร์ท Development Server

```bash
# หยุด server ปัจจุบัน (Ctrl+C)
# แล้วรันใหม่
npm run dev
```

## ทดสอบการส่งอีเมล

หลังจากตั้งค่าแล้ว ลองทดสอบระบบ forgot password:

1. เข้าไปที่หน้าเว็บ
2. คลิก "ลืมรหัสผ่าน?"
3. กรอกอีเมลที่ตั้งค่าไว้
4. ตรวจสอบกล่องจดหมายอีเมล (รวมถึง Spam folder)

## หมายเหตุ

- App Password จะมีรูปแบบ: `abcd efgh ijkl mnop`
- ใส่รหัสโดยไม่ต้องมีช่องว่าง: `abcdefghijklmnop`
- ถ้าใช้ Gmail business account อาจต้องติดต่อ admin เพื่อเปิดใช้งาน

## การแก้ปัญหา

### ข้อผิดพลาดที่พบบ่อย:

1. **"Invalid login"** - ตรวจสอบ username/password
2. **"Less secure app access"** - ใช้ App Password แทน
3. **"Authentication failed"** - ตรวจสอบการเปิด 2FA และ App Password

### ตรวจสอบ logs:

เปิด Developer Console (F12) และดู Console tab สำหรับข้อความแสดงผลจากการส่งอีเมล
