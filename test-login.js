// ทดสอบการเข้าสู่ระบบหลังแก้ไขปัญหา
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

async function testLogin() {
  console.log('🧪 ทดสอบการเข้าสู่ระบบหลังแก้ไขปัญหา...\n');

  // Load environment variables
  const envVars = loadEnvFile();
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ขาด environment variables สำคัญ');
    return;
  }

  // Create client (เหมือนที่ app ใช้)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });

  // ทดสอบผู้ใช้หลายคน
  const testUsers = [
    { email: 'zoomgamer807@gmail.com', password: 'zoomgik2341', note: 'ผู้ใช้ที่มีปัญหา' },
    { email: 'test@example.com', password: 'password12345', note: 'ผู้ใช้ทดสอบ' },
    { email: 'premium@example.com', password: 'password54321', note: 'Premium Agent' }
  ];

  for (const user of testUsers) {
    console.log(`🔑 ทดสอบ: ${user.email} (${user.note})`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (error) {
        console.log(`   ❌ ล้มเหลว: ${error.message}`);
      } else {
        console.log(`   ✅ สำเร็จ: User ID = ${data.user?.id}`);
        console.log(`   📧 อีเมล: ${data.user?.email}`);
        console.log(`   📅 สร้างเมื่อ: ${data.user?.created_at}`);
        
        // ออกจากระบบ
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.log(`   ❌ ข้อผิดพลาด: ${err.message}`);
    }
    
    console.log(''); // เว้นบรรทัด
  }

  console.log('🏁 การทดสอบเสร็จสิ้น!');
}

// รันการทดสอบ
testLogin().catch(console.error);
