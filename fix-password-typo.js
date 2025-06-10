// สคริปต์แก้ไขปัญหาการพิมพ์รหัสผ่านผิด สำหรับ bkknm121@gmail.com
// ปัญหา: การพิมพ์ password ไม่ตรงกัน (awdasdasd1 vs awdawdasd1)

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

async function fixPasswordTypo() {
  console.log('🔧 กำลังแก้ไขปัญหารหัสผ่านไม่ตรงกัน สำหรับ bkknm121@gmail.com...\n');

  // Load environment variables
  const envVars = loadEnvFile();
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ ขาด environment variables สำคัญ');
    console.log('ต้องการ: NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  // Create admin client with service role key
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // ข้อมูลผู้ใช้
  const user = {
    email: 'bkknm121@gmail.com',
    correctPassword: 'awdawdasd1', // รหัสผ่านที่ถูกต้องที่ผู้ใช้กำลังใช้ (มี 2 ตัว w)
    oldPassword: 'awdasdasd1'      // รหัสผ่านเดิมที่ถูกตั้งค่าไว้ในระบบ (มี 1 ตัว w)
  };

  try {
    console.log(`🔍 กำลังตรวจสอบผู้ใช้ ${user.email}...`);

    // ค้นหาข้อมูลในตาราง users
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (userError) {
      console.error('❌ ไม่พบข้อมูลใน users table:', userError.message);
      return;
    }

    console.log('✅ พบข้อมูลใน users table:', {
      id: userData.id,
      email: userData.email,
      role: userData.role
    });

    // ค้นหาข้อมูลในระบบ Supabase Auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ เกิดข้อผิดพลาดในการดึงข้อมูล auth users:', authError);
      return;
    }

    const existingAuthUser = authUsers.users.find(user => user.email === user.email);
    
    if (!existingAuthUser) {
      console.error('❌ ไม่พบผู้ใช้ในระบบ Supabase Auth');
      return;
    }

    console.log('✅ พบผู้ใช้ในระบบ Supabase Auth:', {
      id: existingAuthUser.id,
      email: existingAuthUser.email,
      email_confirmed_at: existingAuthUser.email_confirmed_at
    });

    // อัปเดตรหัสผ่านเป็นค่าที่ถูกต้อง
    console.log(`🔧 กำลังอัปเดตรหัสผ่านเป็น "${user.correctPassword}"...`);
    
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      existingAuthUser.id,
      { password: user.correctPassword }
    );
    
    if (updateError) {
      console.error('❌ ไม่สามารถอัปเดตรหัสผ่านได้:', updateError.message);
      return;
    }
    
    console.log('✅ อัปเดตรหัสผ่านสำเร็จ');

    // ทดสอบการล็อกอินด้วยรหัสผ่านใหม่
    console.log('🔍 กำลังทดสอบการล็อกอินด้วยรหัสผ่านใหม่...');
    
    const publicClient = createClient(supabaseUrl, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { error: loginError } = await publicClient.auth.signInWithPassword({
      email: user.email,
      password: user.correctPassword
    });
    
    if (loginError) {
      console.error('❌ ทดสอบล็อกอินล้มเหลว:', loginError.message);
      return;
    }
    
    console.log('✅ ทดสอบล็อกอินสำเร็จ');
    
    console.log('\n🎉 แก้ไขเสร็จสิ้น!');
    console.log(`ตอนนี้ ${user.email} สามารถเข้าสู่ระบบได้ด้วยรหัสผ่าน "${user.correctPassword}"`);
    console.log('\n📋 สรุปการแก้ไข:');
    console.log(`1. ✅ รหัสผ่านเดิมในระบบ: ${user.oldPassword}`);
    console.log(`2. ✅ รหัสผ่านที่อัปเดต: ${user.correctPassword}`);
    console.log('3. ✅ ทดสอบการล็อกอิน: สำเร็จ');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    console.log('\n🔧 ข้อแนะนำการแก้ไข:');
    console.log('1. ตรวจสอบการเชื่อมต่อ internet');
    console.log('2. ตรวจสอบ environment variables');
  }
}

// รันสคริปต์
fixPasswordTypo().catch(console.error);
