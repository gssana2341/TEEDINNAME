-- ======================================
-- STEP 1: เพิ่มคอลัมน์ view_count
-- ======================================
ALTER TABLE property_details 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- ======================================
-- STEP 2: สร้าง function สำหรับเพิ่มจำนวนการเข้าดู
-- ======================================
CREATE OR REPLACE FUNCTION increment_view_count(input_property_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $function$
DECLARE
    new_count INTEGER;
BEGIN
    -- อัปเดตจำนวนการเข้าดูและคืนค่าใหม่
    UPDATE property_details 
    SET view_count = COALESCE(view_count, 0) + 1 
    WHERE property_id = input_property_id
    RETURNING view_count INTO new_count;
    
    -- ถ้าไม่พบ property_id ให้คืนค่า 0
    IF new_count IS NULL THEN
        RETURN 0;
    END IF;
    
    RETURN new_count;
END;
$function$;

-- ======================================
-- STEP 3: สร้าง index เพื่อเพิ่มประสิทธิภาพ
-- ======================================
CREATE INDEX IF NOT EXISTS idx_property_details_view_count 
ON property_details(view_count DESC);

-- ======================================
-- STEP 4: เพิ่มข้อมูลทดสอบ (เลือกทำหรือไม่ก็ได้)
-- ======================================
UPDATE property_details 
SET view_count = FLOOR(RANDOM() * 100)::INTEGER 
WHERE view_count = 0 OR view_count IS NULL;
