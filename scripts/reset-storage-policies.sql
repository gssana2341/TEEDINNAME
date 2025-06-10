-- ไฟล์นี้ใช้สำหรับรีเซ็ต Storage Policies ทั้งหมดของ agent-documents
-- รัน script นี้ใน Supabase SQL Editor

-- 1. ตรวจสอบและสร้าง bucket ถ้ายังไม่มี
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agent-documents',
  'agent-documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. ลบ Policies เก่าทั้งหมด (ถ้ามี)
DO $$
BEGIN
    -- ลบ policies ที่เกี่ยวข้องกับ agent-documents
    DROP POLICY IF EXISTS "Authenticated users can upload agent documents" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view their own agent documents" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own agent documents" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own agent documents" ON storage.objects;
    
    -- แสดงข้อความว่าลบเสร็จ
    RAISE NOTICE 'Old policies dropped successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies may not exist, continuing...';
END
$$;

-- 3. สร้าง Policies ใหม่ทั้งหมด
-- Policy สำหรับการอัปโหลด (INSERT)
CREATE POLICY "Authenticated users can upload agent documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'agent-documents' AND
  auth.role() = 'authenticated'
);

-- Policy สำหรับการดู (SELECT)
CREATE POLICY "Users can view their own agent documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'agent-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy สำหรับการลบ (DELETE)
CREATE POLICY "Users can delete their own agent documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'agent-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy สำหรับการอัปเดต (UPDATE)
CREATE POLICY "Users can update their own agent documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'agent-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. แสดงผลลัพธ์
DO $$
BEGIN
    RAISE NOTICE 'Storage policies for agent-documents have been reset successfully!';
    RAISE NOTICE 'Policies created:';
    RAISE NOTICE '  1. Upload (INSERT) - For authenticated users';
    RAISE NOTICE '  2. View (SELECT) - Users can view their own files';
    RAISE NOTICE '  3. Delete (DELETE) - Users can delete their own files';
    RAISE NOTICE '  4. Update (UPDATE) - Users can update their own files';
END
$$;
