-- Auto-sync system between Supabase Auth and custom users table
-- This SQL script creates triggers to keep auth.users and users table in sync
-- Updated for tedin-easy schema with customers, agens, and admins tables

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS sync_user_on_auth_change ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.sync_auth_with_users();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    user_role TEXT;
    existing_user_id UUID;
    user_first_name TEXT;
    user_last_name TEXT;
    user_phone TEXT;
BEGIN
    -- Get user data from the new auth user
    user_email := NEW.email;
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
    user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
    
    -- Check if user already exists in our users table
    SELECT id INTO existing_user_id 
    FROM public.users 
    WHERE email = user_email;
    
    -- If user doesn't exist in users table, create them
    IF existing_user_id IS NULL THEN
        INSERT INTO public.users (
            id,
            email, 
            role, 
            first_name, 
            last_name,
            phone,
            password,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            user_email,
            user_role,
            user_first_name,
            user_last_name,
            user_phone,
            'supabase_managed', -- placeholder since Supabase manages actual password
            NOW(),
            NOW()
        );
        
        -- Create role-specific record
        IF user_role = 'customer' THEN
            INSERT INTO public.customers (
                user_id,
                full_name,
                created_at
            ) VALUES (
                NEW.id,
                CONCAT(user_first_name, ' ', user_last_name),
                NOW()
            );
        ELSIF user_role = 'agent' THEN
            INSERT INTO public.agens (
                user_id,
                company_name,
                business_license_id,
                address
            ) VALUES (
                NEW.id,
                '', -- Default empty, will be filled later
                '', -- Default empty, will be filled later
                '' -- Default empty, will be filled later
            );
        ELSIF user_role = 'admin' THEN
            INSERT INTO public.admins (
                user_id,
                username,
                admin_password
            ) VALUES (
                NEW.id,
                user_email, -- Use email as default username
                'change_me_' || substr(md5(random()::text), 1, 8) -- Generate temp password
            );
        END IF;
        
        RAISE LOG 'Created new user in users table: % with role: %', user_email, user_role;
    ELSE
        -- Update existing user with Supabase auth ID
        UPDATE public.users 
        SET id = NEW.id, updated_at = NOW()
        WHERE email = user_email;        
        RAISE LOG 'Updated existing user with auth ID: %', user_email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync auth changes with users table
CREATE OR REPLACE FUNCTION public.sync_auth_with_users()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Update email if changed
    IF OLD.email IS DISTINCT FROM NEW.email THEN
        UPDATE public.users 
        SET email = NEW.email,
            updated_at = NOW()
        WHERE id = NEW.id;
        
        -- Update role-specific tables
        UPDATE public.customers SET user_id = NEW.id WHERE user_id = OLD.id;
        UPDATE public.agens SET user_id = NEW.id WHERE user_id = OLD.id;
        UPDATE public.admins SET user_id = NEW.id WHERE user_id = OLD.id;
    END IF;
    
    -- Update metadata if changed
    IF OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data THEN
        -- Get current role
        SELECT role INTO user_role FROM public.users WHERE id = NEW.id;
        
        UPDATE public.users 
        SET 
            first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', first_name),
            last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', last_name),
            phone = COALESCE(NEW.raw_user_meta_data->>'phone', phone),
            updated_at = NOW()
        WHERE id = NEW.id;
        
        -- Update role-specific tables
        IF user_role = 'customer' THEN
            UPDATE public.customers 
            SET full_name = CONCAT(
                COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
                ' ',
                COALESCE(NEW.raw_user_meta_data->>'last_name', '')
            )
            WHERE user_id = NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER sync_user_on_auth_change
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_auth_with_users();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT ALL ON public.customers TO postgres, service_role;
GRANT ALL ON public.agens TO postgres, service_role;
GRANT ALL ON public.admins TO postgres, service_role;
GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT, UPDATE ON public.customers TO authenticated;
GRANT SELECT, UPDATE ON public.agens TO authenticated;

-- Insert default admin user if not exists
DO $$
BEGIN
    -- Check if admin user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@teedin.com') THEN
        -- This would typically be done through Supabase Auth API
        RAISE NOTICE 'Admin user should be created through Supabase Auth dashboard or API';
    END IF;
END
$$;

RAISE NOTICE 'Auto-sync system installed successfully!';
RAISE NOTICE 'New users will automatically be synced between auth.users and users/customers/agens/admins tables';
