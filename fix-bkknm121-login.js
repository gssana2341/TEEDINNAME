// สคริปต์แก้ไขปัญหาการล็อกอินสำหรับ bkknm121@gmail.com
// สาเหตุ: มีข้อมูลในตาราง users แต่ไม่มีในระบบ Supabase Auth

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Read environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  const envExists = fs.existsSync(envPath);
  
  if (!envExists) {
    console.error('❌ ไม่พบไฟล์ .env.local');
    return {};
  }

  const envFile = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  
  return envVars;
}

async function fixBkknm121Login() {
  console.log('🔧 กำลังแก้ไขปัญหาการล็อกอินสำหรับ bkknm121@gmail.com...\n');

  // Load environment variables
  const envVars = loadEnvFile();
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ ขาด environment variables สำคัญ');
    console.log('ต้องการ: NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  // Create admin client
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // ผู้ใช้ที่มีปัญหา
  const problemUser = {
    email: 'bkknm121@gmail.com',
    password: 'awdasdasd1' // รหัสผ่านจากภาพที่แนบมา
  };

  try {
    console.log(`🔍 ตรวจสอบผู้ใช้ ${problemUser.email}...`);

    // ตรวจสอบในตาราง users
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', problemUser.email)
      .single();

    if (userError) {
      console.error('❌ ไม่พบข้อมูลใน users table:', userError.message);
      console.log('💡 แนะนำ: ผู้ใช้อาจต้องลงทะเบียนใหม่ผ่านหน้าเว็บ');
      return;
    }

    console.log('✅ พบข้อมูลใน users table:', {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone
    });

    // ตรวจสอบในระบบ Supabase Auth
    console.log('🔍 ตรวจสอบในระบบ Supabase Auth...');
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ เกิดข้อผิดพลาดในการดึงข้อมูล auth users:', authError);
      return;
    }

    const existingAuthUser = authUsers.users.find(user => user.email === problemUser.email);
    
    if (existingAuthUser) {
      console.log('✅ พบผู้ใช้ในระบบ Supabase Auth แล้ว');
      console.log(`📋 User ID: ${existingAuthUser.id}`);
      console.log(`📧 Email confirmed: ${existingAuthUser.email_confirmed_at ? 'ใช่' : 'ไม่'}`);
      
      // ตรวจสอบว่า email ได้รับการยืนยันแล้วหรือไม่
      if (!existingAuthUser.email_confirmed_at) {
        console.log('🔧 กำลังยืนยันอีเมล...');
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          existingAuthUser.id,
          { email_confirm: true }
        );
        
        if (confirmError) {
          console.error('❌ ไม่สามารถยืนยันอีเมลได้:', confirmError.message);
        } else {
          console.log('✅ ยืนยันอีเมลสำเร็จ');
        }
      }
      
      // อัปเดตรหัสผ่าน
      console.log('🔧 กำลังอัปเดตรหัสผ่าน...');
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingAuthUser.id,
        { password: problemUser.password }
      );
      
      if (updateError) {
        console.error('❌ ไม่สามารถอัปเดตรหัสผ่านได้:', updateError.message);
      } else {
        console.log('✅ อัปเดตรหัสผ่านสำเร็จ');
      }
      
      // ตรวจสอบ profiles table
      console.log('🔍 ตรวจสอบ profiles table...');
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', problemUser.email)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ เกิดข้อผิดพลาดในการตรวจสอบ profiles:', profileError.message);
      } else if (!profileData) {
        console.log('⚠️ ไม่พบข้อมูลใน profiles table กำลังสร้าง...');
        const { error: createProfileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: existingAuthUser.id,
            user_id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            phone: userData.phone,
            user_role: userData.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (createProfileError) {
          console.error('❌ ไม่สามารถสร้าง profile ได้:', createProfileError.message);
        } else {
          console.log('✅ สร้าง profile สำเร็จ');
        }
      } else {
        console.log('✅ พบข้อมูลใน profiles table แล้ว');
      }
      
      console.log('\n🎉 แก้ไขเสร็จสิ้น!');
      console.log(`ตอนนี้ ${problemUser.email} ควรสามารถเข้าสู่ระบบได้แล้ว`);
      return;
    }

    console.log('⚠️ ไม่พบผู้ใช้ในระบบ Supabase Auth กำลังสร้างใหม่...');

    // สร้างผู้ใช้ในระบบ Supabase Auth
    const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: problemUser.email,
      password: problemUser.password,
      email_confirm: true, // ข้ามการยืนยันอีเมล
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        phone: userData.phone
      }
    });

    if (createError) {
      console.error('❌ ไม่สามารถสร้างผู้ใช้ในระบบ Auth ได้:', createError.message);
      return;
    }

    console.log('✅ สร้างผู้ใช้ในระบบ Supabase Auth สำเร็จ:', {
      id: newAuthUser.user.id,
      email: newAuthUser.user.email
    });

    // สร้างข้อมูลใน profiles table
    console.log('🔧 กำลังสร้างข้อมูลใน profiles table...');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newAuthUser.user.id,
        user_id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        user_role: userData.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('⚠️ ไม่สามารถสร้าง profile ได้:', profileError.message);
    } else {
      console.log('✅ สร้าง profile สำเร็จ');
    }

    console.log('\n🎉 แก้ไขปัญหาเสร็จสิ้น!');
    console.log(`ตอนนี้ ${problemUser.email} ควรสามารถเข้าสู่ระบบได้แล้ว`);
    console.log('\n📋 สรุปการดำเนินการ:');
    console.log('1. ✅ สร้างผู้ใช้ในระบบ Supabase Auth');
    console.log('2. ✅ ยืนยันอีเมลโดยอัตโนมัติ');
    console.log('3. ✅ เชื่อมโยงข้อมูลใน profiles table');
    console.log('\n💡 ทดสอบการล็อกอินทันทีได้เลย!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    console.log('\n🔧 ข้อแนะนำการแก้ไข:');
    console.log('1. ตรวจสอบ environment variables ใน .env.local');
    console.log('2. ตรวจสอบ SUPABASE_SERVICE_ROLE_KEY ว่าถูกต้อง');
    console.log('3. ตรวจสอบการเชื่อมต่อ internet');
  }
}

// รันสคริปต์
fixBkknm121Login().catch(console.error);
