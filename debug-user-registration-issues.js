// Script to debug and fix user/agent registration issues
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

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

async function debugUserIssues() {
  console.log("🔍 Debugging user registration issues...\n");

  try {
    // 1. ตรวจสอบ auth.users
    console.log("📋 Checking auth.users...");
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error("❌ Error fetching auth users:", authError);
      return;
    }

    console.log(`✅ Found ${authUsers.users.length} users in auth.users`);
    
    // หาผู้ใช้ที่มีปัญหา
    const problemUser = authUsers.users.find(u => u.email === 'asngiun@gmail.com');
    if (problemUser) {
      console.log("👤 Problem user found in auth.users:", {
        id: problemUser.id,
        email: problemUser.email,
        created_at: problemUser.created_at
      });
    }

    // 2. ตรวจสอบ public.users table
    console.log("\n📋 Checking public.users table...");
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*');

    if (publicError) {
      console.error("❌ Error fetching public users:", publicError);
      console.log("This might be an RLS policy issue");
    } else {
      console.log(`✅ Found ${publicUsers.length} users in public.users`);
      
      const problemPublicUser = publicUsers.find(u => u.email === 'asngiun@gmail.com');
      if (problemPublicUser) {
        console.log("👤 Problem user found in public.users:", problemPublicUser);
      } else {
        console.log("⚠️  Problem user NOT found in public.users");
      }
    }

    // 3. ตรวจสอบ RLS policies
    console.log("\n🔒 Checking RLS policies...");
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
          FROM pg_policies 
          WHERE schemaname = 'public' AND tablename IN ('users', 'agens')
          ORDER BY tablename, policyname;
        `
      });

    if (policiesError) {
      console.error("❌ Error checking policies:", policiesError);
    } else {
      console.log("📋 RLS Policies:");
      policies.forEach(policy => {
        console.log(`  ${policy.tablename}.${policy.policyname}: ${policy.cmd} - ${policy.qual}`);
      });
    }

    // 4. ลองสร้าง user ใน public.users ด้วย service role
    if (problemUser && !publicUsers?.find(u => u.email === 'asngiun@gmail.com')) {
      console.log("\n🔧 Attempting to create user in public.users...");
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: problemUser.id,
          email: problemUser.email,
          role: 'customer',
          first_name: problemUser.user_metadata?.first_name || '',
          last_name: problemUser.user_metadata?.last_name || '',
          phone: problemUser.user_metadata?.phone || '',
          password: 'supabase_managed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (createError) {
        console.error("❌ Error creating user:", createError);
      } else {
        console.log("✅ User created successfully:", newUser);
      }
    }

    // 5. ตรวจสอบตาราง agens
    console.log("\n📋 Checking agens table...");
    const { data: agents, error: agentsError } = await supabase
      .from('agens')
      .select('*');

    if (agentsError) {
      console.error("❌ Error fetching agents:", agentsError);
    } else {
      console.log(`✅ Found ${agents.length} agents in agens table`);
    }

    // 6. ตรวจสอบ foreign key constraints
    console.log("\n🔗 Checking foreign key constraints...");
    const { data: constraints, error: constraintsError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
          FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name IN ('agens', 'users')
            AND tc.table_schema = 'public';
        `
      });

    if (constraintsError) {
      console.error("❌ Error checking constraints:", constraintsError);
    } else {
      console.log("🔗 Foreign key constraints:");
      constraints.forEach(constraint => {
        console.log(`  ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
      });
    }

  } catch (error) {
    console.error("❌ Debug error:", error);
  }
}

// รันการตรวจสอบ
debugUserIssues();
