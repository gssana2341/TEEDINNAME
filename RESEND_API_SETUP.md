# วิธีตั้งค่า Resend API Key สำหรับระบบส่งอีเมล OTP

## ขั้นตอนที่ 1: สร้าง API Key ใหม่

1. เข้าไปที่ [Resend Dashboard](https://resend.com/api-keys)
2. ล็อกอินเข้าบัญชีของคุณ
3. คลิก "Create API Key"
4. ตั้งชื่อ API Key เช่น "TedIn-Easy-OTP"
5. เลือกสิทธิ์ "Send emails"
6. คลิก "Create"
7. **สำคัญ**: คัดลอก API Key ทันที (จะแสดงเพียงครั้งเดียว)

## ขั้นตอนที่ 2: อัปเดต Environment Variables

เปิดไฟล์ `.env.local` และแก้ไข:

```bash
# แทนที่ API Key เก่าด้วย API Key ใหม่
RESEND_API_KEY=re_YOUR_NEW_API_KEY_HERE
```

## ขั้นตอนที่ 3: Restart Development Server

```bash
# หยุดเซิร์ฟเวอร์ด้วย Ctrl+C
# แล้วเริ่มใหม่
npm run dev
```

## ขั้นตอนที่ 4: ทดสอบการส่งอีเมล

### ทดสอบผ่าน API:
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/test-resend" -Method POST -ContentType "application/json" -Body '{"email": "your-email@example.com"}'
```

### ทดสอบผ่านเว็บไซต์:
1. เปิด http://localhost:3000
2. คลิก "เข้าสู่ระบบ"
3. คลิก "ลืมรหัสผ่าน?"
4. กรอกอีเมลและส่ง OTP

## ปัญหาที่พบบ่อยและวิธีแก้ไข

### 1. "API key is invalid"
- ✅ **แก้ไข**: สร้าง API Key ใหม่ตามขั้นตอนข้างต้น
- ✅ **ตรวจสอบ**: API Key ต้องขึ้นต้นด้วย `re_`

### 2. "Domain not verified"
- ✅ **แก้ไข**: ในโหมดทดสอบ Resend ใช้ domain `onboarding@resend.dev`
- ✅ **Production**: ต้องเพิ่มและยืนยัน domain ของคุณเอง

### 3. "Rate limit exceeded"
- ✅ **แก้ไข**: รอสักครู่แล้วลองใหม่ (Resend มี rate limit)

### 4. อีเมลไม่เข้า
- ✅ **ตรวจสอบ**: โฟลเดอร์ Spam/Junk
- ✅ **ตรวจสอบ**: ที่อยู่อีเมลถูกต้อง
- ✅ **ทดสอบ**: ส่งไปยังอีเมลอื่น

## สถานะปัจจุบันของระบบ

### ✅ พร้อมใช้งาน:
- การติดตั้ง Resend library
- API endpoints สำหรับส่ง OTP
- ระบบ fallback ไปยัง Gmail SMTP
- การออกแบบ email template

### ⏳ ต้องทำต่อ:
- สร้าง API Key ใหม่ที่ถูกต้อง
- ทดสอบการส่งอีเมลจริง
- ตั้งค่า custom domain (สำหรับ production)

## การทดสอบ

หลังจากตั้งค่า API Key แล้ว ระบบจะ:

1. **ลำดับการส่งอีเมล**:
   - พยายามส่งผ่าน Resend ก่อน
   - ถ้าล้มเหลว จะใช้ Gmail SMTP
   - ถ้าทั้งสองล้มเหลว จะแสดง debug mode

2. **การแจ้งเตือน**:
   - แสดงผลผ่าน console logs
   - ส่งกลับข้อมูล provider ที่ใช้
   - แสดงข้อความข้อผิดพลาดที่เข้าใจง่าย

## ข้อมูลติดต่อ

หากมีปัญหา:
- ตรวจสอบ Console logs ในเบราว์เซอร์ (F12)
- ตรวจสอบ Terminal logs ของ Next.js server
- ตรวจสอบ Resend Dashboard สำหรับสถิติการส่ง
