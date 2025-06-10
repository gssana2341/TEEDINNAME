// Fix specifically for bkknm121@gmail.com login issue
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

async function fixBkknm121PasswordFinal() {
  console.log('🔧 การแก้ไขครั้งสุดท้ายสำหรับ bkknm121@gmail.com...\n');

  const envVars = loadEnvFile();
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ ขาด environment variables สำคัญ');
    return;
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const targetEmail = 'bkknm121@gmail.com';
  
  try {
    // 1. Find the correct auth user
    console.log('🔍 ค้นหาผู้ใช้ในระบบ Auth...');
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ เกิดข้อผิดพลาด:', authError);
      return;
    }

    const authUser = authUsers.users.find(user => user.email === targetEmail);
    if (!authUser) {
      console.error('❌ ไม่พบผู้ใช้ในระบบ Auth');
      return;
    }

    console.log('✅ พบผู้ใช้ในระบบ Auth:', {
      id: authUser.id,
      email: authUser.email,
      email_confirmed: authUser.email_confirmed_at ? 'ใช่' : 'ไม่'
    });

    // 2. Try both possible passwords
    const passwords = ['awdawdasd1', 'awdasdasd1'];
    
    for (const password of passwords) {
      console.log(`\n🔧 ทดสอบรหัสผ่าน: ${password}`);
      
      // Update password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authUser.id,
        { password: password }
      );
      
      if (updateError) {
        console.log(`❌ ไม่สามารถอัปเดตรหัสผ่านได้: ${updateError.message}`);
        continue;
      }

      console.log('✅ อัปเดตรหัสผ่านสำเร็จ');
      
      // Test login with public client
      const publicClient = createClient(supabaseUrl, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      const { data: loginData, error: loginError } = await publicClient.auth.signInWithPassword({
        email: targetEmail,
        password: password
      });
      
      if (loginError) {
        console.log(`❌ ทดสอบล็อกอินล้มเหลว: ${loginError.message}`);
      } else {
        console.log('🎉 ทดสอบล็อกอินสำเร็จ!');
        console.log(`✅ รหัสผ่านที่ถูกต้อง: ${password}`);
        console.log(`📋 User ID: ${loginData.user?.id}`);
        
        // Sign out
        await publicClient.auth.signOut();
        
        console.log('\n🎯 แก้ไขเสร็จสิ้น!');
        console.log(`ใช้รหัสผ่าน: ${password} สำหรับเข้าสู่ระบบ`);
        return;
      }
    }
    
    console.log('\n❌ ไม่สามารถแก้ไขได้ด้วยรหัสผ่านทั้งสองแบบ');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

fixBkknm121PasswordFinal().catch(console.error);
