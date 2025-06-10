# Quick SendGrid Setup for Real Gmail Delivery

## IMMEDIATE ACTION NEEDED

Your OTP system is currently in DEBUG MODE, showing codes in console instead of sending real emails to Gmail inboxes like `bkknm121@gmail.com`.

**Current OTP for bkknm121@gmail.com: `649117`** (from console log)

## Option 1: Free SendGrid Setup (RECOMMENDED)

### Step 1: Get SendGrid Account (2 minutes)
1. Go to https://sendgrid.com/
2. Click "Start for Free"
3. Sign up with your email
4. Verify your email

### Step 2: Create API Key (1 minute)
1. In SendGrid dashboard, go to **Settings** > **API Keys**
2. Click **"Create API Key"**
3. Choose **"Restricted Access"**
4. Set **Mail Send** to **"Full Access"**
5. Click **"Create & View"**
6. **COPY THE KEY** (starts with `SG.`) - you won't see it again!

### Step 3: Verify Sender (2 minutes)
1. Go to **Settings** > **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill form:
   - **From Name**: `TedIn Easy`
   - **From Email**: `your-email@gmail.com` (your real Gmail)
   - **Reply To**: Same as From Email
   - **Company**: `TedIn Easy`
   - **Address/City**: Any valid address
4. Click **"Create"**
5. Check your email and click verification link

### Step 4: Update Environment
Replace in your `.env.local` file:

```bash
# SendGrid Configuration (Primary email service)
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=your-verified-email@gmail.com
```

### Step 5: Restart Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Option 2: Gmail SMTP Setup (Alternative)

If you prefer using Gmail directly:

1. Enable 2FA on your Gmail account
2. Go to Google Account > Security > 2-Step Verification > App passwords
3. Generate app password for "Mail"
4. Update `.env.local`:

```bash
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-digit-app-password
```

## Result After Setup

✅ **Before**: `Debug Mode - OTP: 649117` (console only)
✅ **After**: Real email delivered to `bkknm121@gmail.com` inbox

## Free Limits
- **SendGrid**: 100 emails/day forever
- **Gmail SMTP**: No specific limit

## Test After Setup
```bash
# Test API call
$headers = @{"Content-Type" = "application/json"}
$body = '{"email": "bkknm121@gmail.com"}'
Invoke-WebRequest -Uri "http://localhost:3001/api/send-otp" -Method POST -Headers $headers -Body $body
```

## Current Status
- ✅ OTP system working
- ⚠️ Only console output, no real emails
- 🎯 Need real email service setup
