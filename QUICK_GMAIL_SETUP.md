# Quick Gmail SMTP Setup for Real Email Delivery

## Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/security
2. Turn on 2-Step Verification if not already enabled

## Step 2: Generate App Password
1. Go to Google Account > Security > 2-Step Verification
2. Scroll down to "App passwords"
3. Click "App passwords"
4. Select "Mail" and your device
5. Copy the 16-character password (like: `abcd efgh ijkl mnop`)

## Step 3: Update Environment Variables
Replace in your `.env.local` file:

```bash
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-app-password
```

## Step 4: Restart Server
After updating `.env.local`, restart your development server.

## Current Status
- ✅ OTP Generation: Working (`649117`)
- ✅ Database Storage: Working  
- ⚠️ Email Delivery: Debug Mode (console only)
- 🎯 Goal: Real Gmail delivery

## After Setup
Emails will be delivered to any Gmail address including `bkknm121@gmail.com`
