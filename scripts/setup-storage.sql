-- สร้าง Storage Bucket สำหรับเก็บเอกสาร Agent
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agent-documents',
  'agent-documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
);

-- ลบ Policies เก่าก่อน (ถ้ามี)
DROP POLICY IF EXISTS "Authenticated users can upload agent documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own agent documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own agent documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own agent documents" ON storage.objects;

-- สร้าง Policy สำหรับ authenticated users
CREATE POLICY "Authenticated users can upload agent documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'agent-documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view their own agent documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'agent-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own agent documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'agent-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- เพิ่ม Policy สำหรับ update ไฟล์
DROP POLICY IF EXISTS "Users can update their own agent documents" ON storage.objects;
CREATE POLICY "Users can update their own agent documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'agent-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
