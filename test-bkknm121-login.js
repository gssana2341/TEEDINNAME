// Simple test for bkknm121@gmail.com login
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

async function testBkknm121Login() {
  console.log('🧪 ทดสอบการเข้าสู่ระบบสำหรับ bkknm121@gmail.com...\n');

  // Load environment variables
  const envVars = loadEnvFile();
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ขาด environment variables สำคัญ');
    return;
  }

  // Create client (same as the app uses)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });

  const testUser = {
    email: 'bkknm121@gmail.com',
    password: 'awdasdasd1'
  };

  console.log(`🔑 ทดสอบการล็อกอิน: ${testUser.email}`);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    if (error) {
      console.log(`   ❌ ล้มเหลว: ${error.message}`);
      console.log('   🔧 สาเหตุที่เป็นไปได้:');
      console.log('   1. รหัสผ่านยังไม่ถูกต้อง');
      console.log('   2. Email ยังไม่ได้รับการยืนยัน');
      console.log('   3. บัญชีถูกปิดใช้งาน');
    } else {
      console.log('   ✅ สำเร็จ! ข้อมูลผู้ใช้:');
      console.log(`   📋 User ID: ${data.user?.id}`);
      console.log(`   📧 อีเมล: ${data.user?.email}`);
      console.log(`   📅 สร้างเมื่อ: ${data.user?.created_at}`);
      console.log(`   ✅ ยืนยันอีเมล: ${data.user?.email_confirmed_at ? 'ใช่' : 'ไม่'}`);
      
      // Sign out
      await supabase.auth.signOut();
      console.log('   🚪 ออกจากระบบสำเร็จ');
    }
  } catch (err) {
    console.log(`   ❌ ข้อผิดพลาด: ${err.message}`);
  }

  console.log('\n🏁 การทดสอบเสร็จสิ้น!');
}

// Run the test
testBkknm121Login().catch(console.error);
