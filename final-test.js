// Final verification test for bkknm121@gmail.com
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
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

async function finalVerification() {
  console.log('🎯 การทดสอบครั้งสุดท้าย...\n');

  const envVars = loadEnvFile();
  const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const credentials = {
    email: 'bkknm121@gmail.com',
    password: 'awdawdasd1'  // รหัสผ่านที่ถูกต้อง (2 ตัว w)
  };

  console.log('🔑 ทดสอบการล็อกอิน...');
  console.log(`📧 อีเมล: ${credentials.email}`);
  console.log(`🔐 รหัสผ่าน: ${credentials.password}`);

  try {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      console.log('❌ ล้มเหลว:', error.message);
    } else {
      console.log('\n🎉 สำเร็จ! สามารถเข้าสู่ระบบได้แล้ว');
      console.log(`👤 ชื่อ: ${data.user?.user_metadata?.first_name || 'papon'} ${data.user?.user_metadata?.last_name || 'moonkonburee'}`);
      console.log(`📧 อีเมล: ${data.user?.email}`);
      console.log(`🆔 User ID: ${data.user?.id}`);
      
      await supabase.auth.signOut();
      console.log('✅ ออกจากระบบสำเร็จ');
    }
  } catch (err) {
    console.log('❌ ข้อผิดพลาด:', err.message);
  }
}

finalVerification().catch(console.error);
