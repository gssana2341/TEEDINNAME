# 🎯 EXACT STEPS: Get Your Service Role Key

## 🔍 What You're Looking For:

In your Supabase Dashboard **Settings → API** page, you should see:

```
Project API keys
├── anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...anon...  ← YOU ALREADY HAVE THIS
└── service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...service_role...  ← YOU NEED THIS ONE
```

## 🔑 How to Identify the Correct Key:

### ❌ WRONG (What you currently have):
```
"role": "anon"
```

### ✅ CORRECT (What you need):
```
"role": "service_role" 
```

## 📱 Step-by-Step:

1. **In Supabase Dashboard**:
   - Project: `kxkryylxfkkjgbgtxfog.supabase.co`
   - Settings → API

2. **Look for TWO different keys**:
   - The anon key (you have this)
   - The service_role key (copy this one)

3. **Replace in .env.local**:
   ```
   SUPABASE_SERVICE_ROLE_KEY=PUT_THE_SERVICE_ROLE_KEY_HERE
   ```

## 🚨 If You Can't Find It:
Some Supabase projects might not show the service role key by default. In that case:
- Look for "Show service role key" toggle
- Or contact Supabase support
- Or check project settings for "Generate new service role key"

## ⚡ After You Get It:
1. Replace `PUT_YOUR_REAL_SERVICE_ROLE_KEY_HERE` in `.env.local`
2. Restart your server: `npm run dev`
3. Test the OTP system - it should work!
