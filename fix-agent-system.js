// สคริปต์สำหรับแก้ไขปัญหาระบบ Agent Registration
// ใช้รันผ่าน Node.js เพื่อตรวจสอบการทำงาน

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

// Read environment variables from .env.local
function loadEnvFile() {
  try {
    const envFile = fs.readFileSync(".env.local", "utf8");
    const envVars = {};
    envFile.split("\n").forEach(line => {
      if (line.trim() && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");
        envVars[key.trim()] = valueParts.join("=").trim();
      }
    });
    return envVars;
  } catch (error) {
    console.error("Error reading .env.local:", error.message);
    return {};
  }
}

async function testAgentSystemFixes() {
  console.log("🔧 Testing Agent System Fixes...\n");

  // Load environment variables
  const envVars = loadEnvFile();
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing environment variables");
    console.log("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    return;
  }

  // Create admin client
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log("1. 🔍 ตรวจสอบ Storage Bucket 'agent-documents'");
    
    // ตรวจสอบ bucket ที่มีอยู่
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("❌ Error listing buckets:", bucketsError.message);
      return;
    }
    
    const agentDocsBucket = buckets.find(bucket => bucket.id === 'agent-documents');
    
    if (!agentDocsBucket) {
      console.log("⚠️ Bucket 'agent-documents' ไม่พบ - ต้องสร้างใหม่");
      console.log("📝 กรุณารัน SQL script: setup-storage.sql ใน Supabase Dashboard");
    } else {
      console.log("✅ Bucket 'agent-documents' พร้อมใช้งาน");
    }

    console.log("\n2. 🔍 ตรวจสอบ table 'agens'");
    
    // ตรวจสอบ table agens
    const { data: agensData, error: agensError } = await supabase
      .from('agens')
      .select('*')
      .limit(1);
    
    if (agensError) {
      console.error("❌ Table 'agens' ไม่พบ:", agensError.message);
      console.log("📝 กรุณารัน SQL script: create-agent-system.sql ใน Supabase Dashboard");
    } else {
      console.log("✅ Table 'agens' พร้อมใช้งาน");
    }

    console.log("\n3. 🔍 ตรวจสอบผู้ใช้ที่เป็น agent");
    
    const { data: agentUsers, error: agentUsersError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'agent');
    
    if (agentUsersError) {
      console.error("❌ Error querying users:", agentUsersError.message);
    } else {
      console.log(`✅ พบผู้ใช้ที่เป็น agent จำนวน: ${agentUsers.length} คน`);
      
      if (agentUsers.length > 0) {
        console.log("📋 รายชื่อ agents:");
        agentUsers.forEach(user => {
          console.log(`   - ${user.email} (ID: ${user.id})`);
        });
      }
    }

    console.log("\n4. ✅ สรุปการตรวจสอบ:");
    console.log("   - การอัปโหลดไฟล์ PDF: ต้องมี bucket 'agent-documents'");
    console.log("   - การอัปเดต role: ระบบจะเปลี่ยน role จาก 'customer' เป็น 'agent'");
    console.log("   - ปุ่ม Agent: จะหายไปเมื่อ userRole === 'agent'");
    console.log("   - ระบบจะรีเฟรชหน้าเพื่ออัปเดต context หลังสมัครสำเร็จ");

  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการทดสอบ:", error.message);
  }
}

// รันการทดสอบ
testAgentSystemFixes();
