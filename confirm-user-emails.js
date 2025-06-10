// Test script to automatically confirm user emails for testing
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

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

async function confirmUserEmails() {
  console.log("🔧 Auto-confirming user emails for testing...\n");

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
    // Get all users
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Failed to fetch users:", error.message);
      return;
    }

    console.log(`📋 Found ${users.users.length} users:`);

    for (const user of users.users) {
      console.log(`\n👤 User: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email Confirmed: ${user.email_confirmed_at ? '✅ Yes' : '❌ No'}`);
      console.log(`   Created: ${user.created_at}`);

      // If email not confirmed, confirm it
      if (!user.email_confirmed_at) {
        console.log(`   🔧 Confirming email...`);
        
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          user.id,
          { email_confirm: true }
        );

        if (confirmError) {
          console.log(`   ❌ Failed to confirm: ${confirmError.message}`);
        } else {
          console.log(`   ✅ Email confirmed successfully!`);
        }
      }
    }

    console.log("\n🏁 Email confirmation process completed!");
    console.log("\n💡 Users should now be able to log in without email confirmation issues.");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the confirmation process
confirmUserEmails().catch(console.error);
