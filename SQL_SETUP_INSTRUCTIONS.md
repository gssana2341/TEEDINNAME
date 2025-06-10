## วิธีการใช้งาน SQL สำหรับ View Tracking

### ขั้นตอนที่ 1: เข้าสู่ Supabase Dashboard

1. เข้าไปที่ https://supabase.com/dashboard
2. เลือกโปรเจ็กต์ของคุณ
3. ไปที่ SQL Editor (ในเมนูซ้าย)

### ขั้นตอนที่ 2: รัน SQL Commands

คัดลอกและรัน SQL commands ต่อไปนี้ใน SQL Editor:

```sql
-- เพิ่มคอลัมน์ view_count ใน property_details table (ถ้ายังไม่มี)
ALTER TABLE property_details
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- สร้าง function สำหรับเพิ่มจำนวนการเข้าดู
-- ใช้ property_id แทน id เพราะ property_details table ใช้ property_id เป็น foreign key
CREATE OR REPLACE FUNCTION increment_view_count(property_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    -- อัปเดตจำนวนการเข้าดูและคืนค่าใหม่
    UPDATE property_details
    SET view_count = view_count + 1
    WHERE property_details.property_id = increment_view_count.property_id
    RETURNING view_count INTO new_count;

    -- ถ้าไม่พบ property_id ให้คืนค่า 0
    IF new_count IS NULL THEN
        RETURN 0;
    END IF;

    RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- สร้าง index เพื่อเพิ่มประสิทธิภาพในการ query
CREATE INDEX IF NOT EXISTS idx_property_details_view_count
ON property_details(view_count DESC);

-- เพิ่มข้อมูล view_count เริ่มต้นแบบสุ่มสำหรับ property ที่มีอยู่แล้ว (เพื่อทดสอบ)
UPDATE property_details
SET view_count = FLOOR(RANDOM() * 100)::INTEGER
WHERE view_count = 0 OR view_count IS NULL;
```

### ขั้นตอนที่ 3: ตรวจสอบผลลัพธ์

หลังจากรัน SQL แล้ว ให้ตรวจสอบว่า:

1. Column `view_count` ถูกเพิ่มใน table `property_details`
2. Function `increment_view_count` ถูกสร้างแล้ว
3. ข้อมูล view_count เริ่มต้นถูกเพิ่มแล้ว

### ขั้นตอนที่ 4: ทดสอบ Function

ทดสอบ function ด้วยการรัน:

```sql
-- ทดสอบเรียกใช้ function (เปลี่ยน UUID ให้ตรงกับ property_id ที่มีอยู่จริง)
SELECT increment_view_count('your-property-uuid-here');
```

### การทำงาน

- เมื่อผู้ใช้คลิกที่ property card ระบบจะเรียก API `/api/track-view`
- API จะเรียกใช้ `increment_view_count` function
- Function จะเพิ่ม view_count ใน property_details table
- ถ้า view_count >= 50 จะแสดงป้าย "แนะนำ" สีส้ม
- ป้าย "ให้เช่า" จะเป็นสีเขียว
- ป้าย "ขาย" จะเป็นสีน้ำเงิน

### สี Tags

- 🟢 "ให้เช่า" = สีเขียว (from-green-600 to-green-500)
- 🔵 "ขาย" = สีน้ำเงิน (from-blue-600 to-blue-500)
- 🟠 "แนะนำ" = สีส้ม (from-orange-600 to-orange-500)
- 🟡 "Top Pick" = สีเหลือง (from-amber-600 to-amber-500)
