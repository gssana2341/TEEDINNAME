-- Auto-sync triggers สำหรับการลบ users
-- ทำให้การลบจาก auth.users หรือ users table sync กันอัตโนมัติ

-- 1. Function สำหรับลบ user อย่างสมบูรณ์
CREATE OR REPLACE FUNCTION public.delete_user_completely(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
    auth_user_id UUID;
BEGIN
    -- หา user_id จาก email
    SELECT id INTO target_user_id 
    FROM public.users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User not found in users table: %', user_email;
        -- ลองหาใน auth.users
        SELECT id INTO auth_user_id 
        FROM auth.users 
        WHERE email = user_email;
        
        IF auth_user_id IS NOT NULL THEN
            -- ลบจาก auth.users เท่านั้น
            DELETE FROM auth.users WHERE id = auth_user_id;
            RAISE NOTICE 'Deleted user from auth.users only: %', user_email;
            RETURN TRUE;
        END IF;
        
        RETURN FALSE;
    END IF;
    
    -- ลบข้อมูลที่เกี่ยวข้องทั้งหมดตามลำดับ
    -- ลบจาก properties ก่อน (เพื่อหลีกเลี่ยง foreign key constraint)
    DELETE FROM public.properties WHERE agent_id = target_user_id;
    
    -- ลบจาก role-specific tables
    DELETE FROM public.customers WHERE user_id = target_user_id;
    DELETE FROM public.agents WHERE user_id = target_user_id;
    DELETE FROM public.admins WHERE user_id = target_user_id;
    
    -- ลบจาก profiles
    DELETE FROM public.profiles WHERE user_id = target_user_id;
    
    -- ลบจาก users table
    DELETE FROM public.users WHERE id = target_user_id;
    
    -- ลบจาก auth.users
    DELETE FROM auth.users WHERE email = user_email;
    
    RAISE NOTICE 'User % deleted completely from all tables', user_email;
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting user %: %', user_email, SQLERRM;
        RETURN FALSE;
END;
$$;

-- 2. Trigger function สำหรับ auto-delete เมื่อลบจาก auth.users
CREATE OR REPLACE FUNCTION public.auto_delete_from_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- เมื่อลบจาก auth.users ให้ลบจาก users table และ related tables ด้วย
    PERFORM public.delete_user_completely(OLD.email);
    RETURN OLD;
END;
$$;

-- 3. Trigger function สำหรับ auto-delete เมื่อลบจาก users table
CREATE OR REPLACE FUNCTION public.auto_delete_from_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- เมื่อลบจาก users table ให้ลบจาก auth.users ด้วย
    DELETE FROM auth.users WHERE email = OLD.email;
    
    -- ลบข้อมูลที่เกี่ยวข้อง
    DELETE FROM public.properties WHERE agent_id = OLD.id;
    DELETE FROM public.customers WHERE user_id = OLD.id;
    DELETE FROM public.agents WHERE user_id = OLD.id;
    DELETE FROM public.admins WHERE user_id = OLD.id;
    DELETE FROM public.profiles WHERE user_id = OLD.id;
    
    RETURN OLD;
END;
$$;

-- 4. สร้าง triggers
DROP TRIGGER IF EXISTS trigger_auto_delete_from_users ON auth.users;
CREATE TRIGGER trigger_auto_delete_from_users
    BEFORE DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.auto_delete_from_users();

DROP TRIGGER IF EXISTS trigger_auto_delete_from_auth ON public.users;
CREATE TRIGGER trigger_auto_delete_from_auth
    BEFORE DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.auto_delete_from_auth();

-- 5. Function สำหรับ sync password (เก็บเป็น placeholder)
CREATE OR REPLACE FUNCTION public.sync_password_placeholder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- เมื่อมีการเปลี่ยน password ใน auth.users
    -- อัปเดต users table ให้เป็น placeholder เพื่อความปลอดภัย
    UPDATE public.users 
    SET 
        password = 'supabase_managed',
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- 6. Trigger สำหรับ password sync
DROP TRIGGER IF EXISTS trigger_sync_password ON auth.users;
CREATE TRIGGER trigger_sync_password
    AFTER UPDATE OF encrypted_password ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_password_placeholder();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.delete_user_completely TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auto_delete_from_users TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.auto_delete_from_auth TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.sync_password_placeholder TO postgres, service_role;

-- Test the function
SELECT public.delete_user_completely('test@example.com');

RAISE NOTICE 'Auto-sync system installed successfully!';
RAISE NOTICE 'Now deleting from either auth.users or users table will automatically sync!';
RAISE NOTICE 'Passwords will be managed as placeholders for security.';
