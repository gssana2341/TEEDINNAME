# 🧪 Testing Instructions for Plain Text Password

## ⚠️ สถานะปัจจุบัน: TESTING MODE
- **Supabase Auth**: ใช้ hash password (ปลอดภัย) ✅
- **Custom users table**: ใช้ plain text password (เพื่อการทดสอบ) ⚠️

## 🔧 ขั้นตอนการทดสอบ

### 1. เพิ่ม updated_at column ใน Supabase
```sql
-- รัน SQL นี้ใน Supabase Dashboard → SQL Editor
ALTER TABLE public.users 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE public.users 
SET updated_at = NOW() 
WHERE updated_at IS NULL;
```

### 2. ทดสอบ Password Reset
```bash
# 1. ส่ง OTP
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "bkknm121@gmail.com"}'

# 2. ตรวจสอบอีเมลหรือดู console log เพื่อรับ OTP

# 3. Reset password
curl -X POST http://localhost:3000/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "bkknm121@gmail.com", "resetToken": "ใส่ OTP ที่ได้รับ", "newPassword": "newpass123"}'
```

### 3. ตรวจสอบผลลัพธ์ใน Supabase Dashboard

**ใน Table Editor → users table:**
- column `password` จะแสดง: `newpass123` (plain text) 👁️
- column `updated_at` จะแสดงเวลาล่าสุด

**ใน Auth → Users:**
- Password ยังคงเป็น hash (ปลอดภัย)
- User สามารถ login ด้วย `newpass123` ได้

## 🔐 ขั้นตอนเปลี่ยนเป็น Production Mode

เมื่อทดสอบเสร็จแล้ว แก้ไขกลับเป็น hash password:

```typescript
// ใน app/api/reset-password/route.ts
// เปลี่ยนจาก:
const plainTextPassword = newPassword

// เป็น:
const saltRounds = 12
const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

// และเปลี่ยน:
password: plainTextPassword,

// เป็น:
password: hashedPassword,
```

## 📧 Current Email System Status
✅ **Primary**: Resend API - ทำงานได้
✅ **Fallback**: Gmail SMTP - App Password พร้อม
✅ **OTP Delivery**: ส่งไปยัง Gmail จริงได้แล้ว

## 🎯 Next Steps
1. รัน SQL script เพิ่ม `updated_at` column
2. ทดสอบ password reset แบบเต็ม  
3. ตรวจสอบ plain text password ใน table
4. Deploy ไปยัง Vercel
5. เปลี่ยนกลับเป็น hash password สำหรับ production
