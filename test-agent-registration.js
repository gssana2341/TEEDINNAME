const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Read environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local file not found");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const envVars = {};

  envContent.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join("=").trim();
      }
    }
  });

  return envVars;
}

// Load environment variables
const envVars = loadEnvFile();
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testAgentRegistrationProcess() {
  console.log("🧪 Testing Agent Registration Process...\n");

  try {
    // 1. ตรวจสอบโครงสร้างตาราง agens
    console.log("1. ตรวจสอบโครงสร้างตาราง agens...");
    const { data: agensStructure, error: structureError } = await supabase
      .from("agens")
      .select("*")
      .limit(1);

    if (
      structureError &&
      structureError.message.includes('relation "agens" does not exist')
    ) {
      console.log("❌ ตาราง agens ยังไม่ถูกสร้าง - ต้องสร้างก่อน");
      return;
    } else if (structureError) {
      console.log("⚠️ ข้อมูลตาราง agens:", structureError.message);
    } else {
      console.log("✅ ตาราง agens พร้อมใช้งาน");
    }

    // 2. ตรวจสอบตาราง customers
    console.log("\n2. ตรวจสอบตาราง customers...");
    const { data: customersStructure, error: customersError } = await supabase
      .from("customers")
      .select("*")
      .limit(1);

    if (
      customersError &&
      customersError.message.includes('relation "customers" does not exist')
    ) {
      console.log("⚠️ ตาราง customers ไม่มี - จะข้ามขั้นตอนการลบ");
    } else if (customersError) {
      console.log("⚠️ ข้อมูลตาราง customers:", customersError.message);
    } else {
      console.log("✅ ตาราง customers พร้อมใช้งาน");
    }

    // 3. ตรวจสอบตาราง users
    console.log("\n3. ตรวจสอบตาราง users...");
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, email, role, first_name, last_name")
      .eq("role", "customer")
      .limit(3);

    if (usersError) {
      console.log("❌ ข้อผิดพลาดในการเข้าถึงตาราง users:", usersError.message);
      return;
    }

    console.log("✅ พบผู้ใช้ที่เป็น customer:", usersData.length, "คน");
    if (usersData.length > 0) {
      console.log("ตัวอย่างผู้ใช้:");
      usersData.forEach((user) => {
        console.log(
          `- ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role}`
        );
      });
    }

    // 4. จำลองกระบวนการสมัคร Agent
    if (usersData.length > 0) {
      const testUser = usersData[0];
      console.log(
        `\n4. จำลองกระบวนการสมัครเป็น Agent สำหรับ: ${testUser.email}`
      );

      // ข้อมูลจำลองสำหรับ Agent
      const mockAgentData = {
        user_id: testUser.id,
        company_name: "บริษัท ทดสอบ จำกัด",
        license_number: "AG001234",
        business_license_id: "1234567890123",
        address: "ที่อยู่ทดสอบ กรุงเทพฯ 10110",
        national_id: "1234567890123",
        property_types: JSON.stringify(["sell", "rent"]),
        service_areas: JSON.stringify(["กรุงเทพฯ", "นนทบุรี"]),
        verification_documents: JSON.stringify([]),
        status: "pending",
      };

      console.log("📝 ข้อมูลที่จะเพิ่มลงตาราง agens:");
      console.log(JSON.stringify(mockAgentData, null, 2));

      // *** ข้อควรระวัง: ไม่ทำจริงในการทดสอบ ***
      console.log(
        "\n⚠️  หมายเหตุ: การทดสอบนี้ไม่ได้ทำการเปลี่ยนแปลงฐานข้อมูลจริง"
      );
      console.log("   เพื่อป้องกันการทำลายข้อมูล");
    }

    // 5. ตรวจสอบว่าระบบพร้อมใช้งานหรือไม่
    console.log("\n5. สรุปความพร้อมของระบบ:");

    const systemStatus = {
      agensTable: !structureError,
      customersTable: !customersError,
      usersTable: !usersError,
      testUsers: usersData.length > 0,
    };

    console.log("📊 สถานะระบบ:");
    Object.entries(systemStatus).forEach(([key, status]) => {
      console.log(
        `${status ? "✅" : "❌"} ${key}: ${status ? "พร้อม" : "ไม่พร้อม"}`
      );
    });

    const allReady = Object.values(systemStatus).every((status) => status);
    console.log(
      `\n${allReady ? "🎉" : "⚠️"} ระบบ Agent Registration ${
        allReady ? "พร้อมใช้งาน" : "ยังไม่พร้อม"
      }`
    );
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการทดสอบ:", error.message);
  }
}

// ฟังก์ชันสำหรับสร้างตาราง agens หากยังไม่มี
async function createAgensTableIfNotExists() {
  console.log("🔧 กำลังสร้างตาราง agens...");

  const createTableSQL = `
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
  `;

  try {
    const { error } = await supabase.rpc("execute_sql", {
      sql: createTableSQL,
    });
    if (error) {
      console.log("⚠️ ไม่สามารถสร้างตารางได้:", error.message);
      console.log("💡 กรุณาสร้างตารางด้วยตนเองใน Supabase Dashboard");
    } else {
      console.log("✅ สร้างตาราง agens สำเร็จ");
    }
  } catch (error) {
    console.log(
      "💡 กรุณาสร้างตาราง agens ใน Supabase Dashboard ด้วย SQL ดังนี้:"
    );
    console.log(createTableSQL);
  }
}

// เรียกใช้การทดสอบ
async function main() {
  await testAgentRegistrationProcess();

  console.log("\n" + "=".repeat(60));
  console.log("หากต้องการสร้างตาราง agens ให้เรียกใช้:");
  console.log("node test-agent-registration.js create-table");
}

// ตรวจสอบ argument
if (process.argv.includes("create-table")) {
  createAgensTableIfNotExists();
} else {
  main();
}
