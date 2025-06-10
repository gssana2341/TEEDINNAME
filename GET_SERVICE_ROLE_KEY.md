# 🔑 Get Your Supabase Service Role Key

## Steps to get the Service Role Key:

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project: `tedin-easy` 

2. **Navigate to API Settings**
   - Click on "Settings" in the left sidebar
   - Click on "API" 

3. **Copy the Service Role Key**
   - Scroll down to "Project API keys"
   - Find the **`service_role`** key (NOT the anon key)
   - Copy the long JWT token

4. **Update .env.local**
   - Replace `your-service-role-key-here` in `.env.local` with the actual service role key

## ⚠️ Important Security Notes:

- **NEVER** commit the service role key to version control
- **NEVER** use the service role key in client-side code
- Only use it in server-side API routes
- This key has admin privileges and can bypass RLS policies

## Example .env.local format:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

After updating the service role key, restart your development server!
