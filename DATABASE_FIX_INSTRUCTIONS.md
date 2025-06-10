# 🚀 Database Schema Fix Instructions

## Issue
The password reset API fails because the `users` table is missing the `updated_at` column:
```
Error: Could not find the 'updated_at' column of 'users' in the schema cache
```

## Solution: Add updated_at column to Supabase users table

### Method 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the SQL Script**
   - Copy the contents from `database/add-updated-at-column.sql`
   - Paste into the SQL Editor
   - Click "RUN" button

4. **Verify Changes**
   - Go to "Table Editor" → "users" table
   - Check that `updated_at` column now exists with type `timestamptz`

### Method 2: Using Supabase CLI (Alternative)

```bash
# If you have Supabase CLI installed
supabase db reset
# or
psql "your-supabase-connection-string" -f database/add-updated-at-column.sql
```

## After Database Fix

1. **Test Password Reset**
   ```bash
   # Test the complete flow
   curl -X POST http://localhost:3000/api/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "bkknm121@gmail.com"}'
   
   # Then test password reset
   curl -X POST http://localhost:3000/api/reset-password \
     -H "Content-Type: application/json" \
     -d '{"email": "bkknm121@gmail.com", "otp": "123456", "newPassword": "newpassword123"}'
   ```

2. **Check Supabase Dashboard**
   - Verify password hash updates in both:
     - Auth → Users (Supabase Auth)
     - Table Editor → users (Custom table)

3. **Deploy to Vercel**
   - Once local testing passes, deploy to production

## Expected Result
After adding the `updated_at` column, the reset-password API should successfully update both:
- ✅ Supabase Auth password (already working)
- ✅ Custom users table password + updated_at timestamp
