// Test script to verify Supabase connection
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

async function testSupabaseConnection() {
  console.log("🧪 Testing Supabase Connection...\n");

  // Load environment variables
  const envVars = loadEnvFile();
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

  console.log("Environment Variables:");
  console.log("SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
  console.log("ANON_KEY:", supabaseAnonKey ? "✅ Set" : "❌ Missing");
  console.log("SERVICE_KEY:", serviceRoleKey ? "✅ Set" : "❌ Missing");
  console.log("");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing required environment variables");
    return;
  }

  // Test with anonymous key
  console.log("📡 Testing connection with Anonymous Key...");
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("properties")
      .select("id")
      .limit(1);

    if (error) {
      console.error("❌ Anon Key Test Failed:", error.message);
      console.log("Full error:", error);
    } else {
      console.log("✅ Anon Key Test Passed - Data:", data);
    }
  } catch (err) {
    console.error("❌ Anon Key Connection Error:", err.message);
  }

  console.log("");

  // Test with service role key (if available)
  if (serviceRoleKey) {
    console.log("🔐 Testing connection with Service Role Key...");
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

      const { data, error } = await supabaseAdmin
        .from("properties")
        .select("id")
        .limit(1);

      if (error) {
        console.error("❌ Service Key Test Failed:", error.message);
      } else {
        console.log("✅ Service Key Test Passed - Data:", data);
      }
    } catch (err) {
      console.error("❌ Service Key Connection Error:", err.message);
    }
  }

  console.log("");

  // Test authentication
  console.log("🔑 Testing Authentication...");
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try to sign up a test user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: "test@example.com",
        password: "testpassword123",
      }
    );

    if (signUpError) {
      console.log("ℹ️ Sign Up Test Result:", signUpError.message);
      // This might fail if user already exists, which is expected
    } else {
      console.log("✅ Sign Up Test Passed");
    }

    // Try to sign in with existing credentials
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "testpassword123",
      });

    if (signInError) {
      console.log("❌ Sign In Test Failed:", signInError.message);
    } else {
      console.log("✅ Sign In Test Passed");
    }
  } catch (err) {
    console.error("❌ Auth Test Error:", err.message);
  }

  console.log("\n🏁 Test completed!");
}

testSupabaseConnection().catch(console.error);
