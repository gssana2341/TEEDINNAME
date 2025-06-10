# 🚨 URGENT: Get Your Supabase Service Role Key

## Current Status: 
✅ **FIXED**: All API routes now use admin client
✅ **FIXED**: RLS policies are properly configured  
❌ **MISSING**: Service Role Key in environment variables

## 🔑 GET SERVICE ROLE KEY NOW:

### Step 1: In Your Supabase Dashboard
You're already logged in to Supabase. Now:

1. **Click on your project** (the one with users: aengiun@gmail.com, methas2448@gmail.com, etc.)
2. **Go to Settings** (gear icon in left sidebar)
3. **Click "API"** in the settings menu
4. **Scroll down to "Project API keys"**
5. **Copy the `service_role` key** (NOT the anon key)

### Step 2: Update .env.local
Replace this line in your `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

With your actual service role key:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4a3J5eWx4ZmtramdiZ3R4Zm9nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgwMDU4MywiZXhwIjoyMDYyMzc2NTgzfQ.YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE
```

### Step 3: Restart Development Server
After updating .env.local, restart your server:
```
Ctrl+C (to stop current server)
npm run dev (to restart)
```

## 🧪 Test After Setup:
The OTP system should work perfectly once you add the service role key!

## ⚠️ Security Warning:
- NEVER commit the service role key to git
- NEVER use it in client-side code
- It has admin privileges - handle with care!
