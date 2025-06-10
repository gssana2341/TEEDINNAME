-- สคริปต์สำหรับสร้างตาราง agens และปรับปรุงฐานข้อมูลสำหรับ Agent Registration System
-- วันที่: 10 มิถุนายน 2025

-- 1. สร้างตาราง agens
CREATE TABLE IF NOT EXISTS public.agens (
  user_id uuid NOT NULL,
  company_name character varying NULL,
  license_number character varying NULL,
  business_license_id character varying NULL,
  address text NULL,
  property_types jsonb NOT NULL,
  service_areas jsonb NOT NULL,
  verification_documents jsonb NULL DEFAULT '[]'::jsonb,
  status character varying NULL DEFAULT 'pending'::character varying,
  created_at timestamp without time zone NULL DEFAULT now(),
  updated_at timestamp without time zone NULL DEFAULT now(),
  national_id character varying(13) NULL,
  CONSTRAINT agens_pkey PRIMARY KEY (user_id),
  CONSTRAINT agens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT agens_business_license_id_check CHECK (
    (business_license_id IS NULL) OR (length(business_license_id::text) >= 3)
  ),
  CONSTRAINT agens_status_check CHECK (
    status::text = ANY (ARRAY[
      'pending'::character varying::text,
      'approved'::character varying::text,
      'rejected'::character varying::text
    ])
  )
);

-- 2. เพิ่ม comment สำหรับตาราง
COMMENT ON TABLE public.agens IS 'ตารางเก็บข้อมูล Agent ที่สมัครแล้ว';
COMMENT ON COLUMN public.agens.user_id IS 'ID ของผู้ใช้ที่เป็น Agent';
COMMENT ON COLUMN public.agens.company_name IS 'ชื่อบริษัท (ถ้ามี)';
COMMENT ON COLUMN public.agens.license_number IS 'เลขที่ใบอนุญาตนายหน้า (ถ้ามี)';
COMMENT ON COLUMN public.agens.business_license_id IS 'เลขที่บัตรประชาชน';
COMMENT ON COLUMN public.agens.address IS 'ที่อยู่สำนักงาน';
COMMENT ON COLUMN public.agens.property_types IS 'ประเภทอสังหาริมทรัพย์ที่ดูแล (JSON Array)';
COMMENT ON COLUMN public.agens.service_areas IS 'พื้นที่ให้บริการ (JSON Array)';
COMMENT ON COLUMN public.agens.verification_documents IS 'เอกสารยืนยันตัวตน (JSON Array)';
COMMENT ON COLUMN public.agens.status IS 'สถานะการอนุมัติ: pending, approved, rejected';
COMMENT ON COLUMN public.agens.national_id IS 'เลขที่บัตรประชาชน (13 หลัก)';

-- 3. สร้าง index สำหรับประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_agens_status ON public.agens(status);
CREATE INDEX IF NOT EXISTS idx_agens_created_at ON public.agens(created_at);
CREATE INDEX IF NOT EXISTS idx_agens_property_types ON public.agens USING gin(property_types);
CREATE INDEX IF NOT EXISTS idx_agens_service_areas ON public.agens USING gin(service_areas);

-- 4. สร้าง function สำหรับ trigger อัปเดต updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. สร้าง trigger สำหรับอัปเดต updated_at อัตโนมัติ
DROP TRIGGER IF EXISTS update_agens_updated_at ON public.agens;
CREATE TRIGGER update_agens_updated_at
    BEFORE UPDATE ON public.agens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. ตรวจสอบว่าตาราง customers มีอยู่หรือไม่ ถ้าไม่มีก็สร้าง
CREATE TABLE IF NOT EXISTS public.customers (
  user_id uuid NOT NULL,
  preferences jsonb DEFAULT '{}',
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (user_id),
  CONSTRAINT customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 7. เพิ่ม index สำหรับตาราง customers
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at);

-- 8. สร้าง trigger สำหรับตาราง customers
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. สร้าง view สำหรับดูข้อมูล Agent พร้อมข้อมูลผู้ใช้
CREATE OR REPLACE VIEW agent_details AS
SELECT 
    a.user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    a.company_name,
    a.license_number,
    a.business_license_id,
    a.national_id,
    a.address,
    a.property_types,
    a.service_areas,
    a.verification_documents,
    a.status,
    a.created_at,
    a.updated_at
FROM public.agens a
JOIN public.users u ON a.user_id = u.id;

-- 10. สร้าง function สำหรับการสมัครเป็น Agent
CREATE OR REPLACE FUNCTION register_as_agent(
    p_user_id uuid,
    p_company_name varchar DEFAULT NULL,
    p_license_number varchar DEFAULT NULL,
    p_business_license_id varchar,
    p_national_id varchar,
    p_address text,
    p_property_types jsonb,
    p_service_areas jsonb,
    p_verification_documents jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    -- ตรวจสอบว่าผู้ใช้มีอยู่และเป็น customer
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND role = 'customer') THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'ผู้ใช้ไม่พบหรือไม่ใช่ customer'
        );
    END IF;
    
    -- ตรวจสอบว่าไม่ได้เป็น agent อยู่แล้ว
    IF EXISTS (SELECT 1 FROM agens WHERE user_id = p_user_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'ผู้ใช้เป็น agent อยู่แล้ว'
        );
    END IF;
    
    BEGIN
        -- เริ่ม transaction
        
        -- 1. ลบข้อมูลจากตาราง customers (ถ้ามี)
        DELETE FROM customers WHERE user_id = p_user_id;
        
        -- 2. เพิ่มข้อมูลลงตาราง agens
        INSERT INTO agens (
            user_id,
            company_name,
            license_number,
            business_license_id,
            national_id,
            address,
            property_types,
            service_areas,
            verification_documents,
            status
        ) VALUES (
            p_user_id,
            p_company_name,
            p_license_number,
            p_business_license_id,
            p_national_id,
            p_address,
            p_property_types,
            p_service_areas,
            p_verification_documents,
            'pending'
        );
        
        -- 3. อัปเดต role ในตาราง users
        UPDATE users 
        SET role = 'agent', updated_at = now()
        WHERE id = p_user_id;
        
        RETURN jsonb_build_object(
            'success', true,
            'message', 'สมัครเป็น agent สำเร็จ',
            'user_id', p_user_id,
            'status', 'pending'
        );
        
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'เกิดข้อผิดพลาด: ' || SQLERRM
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. สร้าง function สำหรับอนุมัติ/ปฏิเสธ Agent
CREATE OR REPLACE FUNCTION update_agent_status(
    p_user_id uuid,
    p_status varchar,
    p_admin_notes text DEFAULT NULL
)
RETURNS jsonb AS $$
BEGIN
    -- ตรวจสอบ status ที่ถูกต้อง
    IF p_status NOT IN ('approved', 'rejected', 'pending') THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'สถานะไม่ถูกต้อง'
        );
    END IF;
    
    -- อัปเดตสถานะ
    UPDATE agens 
    SET status = p_status, updated_at = now()
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'ไม่พบข้อมูล agent'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'อัปเดตสถานะสำเร็จ',
        'user_id', p_user_id,
        'status', p_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. สร้าง RLS policies สำหรับความปลอดภัย
ALTER TABLE public.agens ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับ agens table
CREATE POLICY "Users can view their own agent data" ON public.agens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent data" ON public.agens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent data" ON public.agens
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin policy (สำหรับผู้ดูแลระบบ)
CREATE POLICY "Admins can manage all agent data" ON public.agens
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 13. Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.agens TO authenticated;
GRANT SELECT ON agent_details TO authenticated;
GRANT EXECUTE ON FUNCTION register_as_agent TO authenticated;
GRANT EXECUTE ON FUNCTION update_agent_status TO authenticated;

-- 14. สร้าง sample data สำหรับการทดสอบ (comment ออกในโปรดัคชัน)
/*
-- ตัวอย่างการใช้งาน function
SELECT register_as_agent(
    'user-id-here'::uuid,
    'บริษัท ทดสอบ จำกัด',
    'AG001234',
    '1234567890123',
    '1234567890123',
    'ที่อยู่ทดสอบ กรุงเทพฯ 10110',
    '["sell", "rent"]'::jsonb,
    '["กรุงเทพฯ", "นนทบุรี"]'::jsonb,
    '[]'::jsonb
);
*/

-- สิ้นสุดสคริปต์
