# SendGrid Setup Guide for Real Email Delivery

## Step 1: Create SendGrid Account
1. Go to https://sendgrid.com/
2. Sign up for a free account (allows 100 emails/day forever)
3. Verify your email address

## Step 2: Create API Key
1. Log into SendGrid console
2. Go to Settings > API Keys
3. Click "Create API Key"
4. Choose "Restricted Access"
5. Give permissions:
   - Mail Send: Full Access
   - Template Engine: Read Access (optional)
6. Copy the API key (starts with `SG.`)

## Step 3: Verify Sender Identity
**Option A: Single Sender Verification (Easiest)**
1. Go to Settings > Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in your details:
   - From Name: `TedIn Easy`
   - From Email: `your-email@gmail.com` (use your real email)
   - Reply To: Same as From Email
   - Address, City, etc.
4. Check your email and click verification link

**Option B: Domain Authentication (Professional)**
1. Go to Settings > Sender Authentication
2. Click "Authenticate Your Domain"
3. Follow DNS setup instructions

## Step 4: Update Environment Variables
Replace in `.env.local`:

```bash
# SendGrid Configuration (Primary email service)
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=your-verified-email@gmail.com
```

## Step 5: Test Email Delivery
After setting up, restart your server and test with any Gmail address.

## Free Tier Limits
- 100 emails per day forever
- No credit card required
- Perfect for small applications

## Alternative: Gmail App Password
If you prefer using Gmail SMTP directly:

1. Go to Google Account settings
2. Enable 2FA
3. Generate App Password for "Mail"
4. Update `.env.local`:

```bash
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-digit-app-password
```

## Current Email Priority
1. **SendGrid** (Best for production)
2. **Resend** (Limited to verified domains)
3. **Gmail SMTP** (Personal use)
4. **Debug Mode** (Development only)
