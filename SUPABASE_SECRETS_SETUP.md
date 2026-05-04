# 🔐 SUPABASE EDGE FUNCTIONS SECRETS SETUP

**CRITICAL**: These secrets must be set in Supabase for Edge Functions to work.

---

## 📍 HOW TO SET SUPABASE SECRETS

### Option 1: Via Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/beswluhdxaphtitaovly
2. Click **Edge Functions** in sidebar
3. Click **Manage Secrets** (or **Settings**)
4. Add each secret below

### Option 2: Via Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref beswluhdxaphtitaovly

# Set secrets one by one
supabase secrets set SUPABASE_URL="https://beswluhdxaphtitaovly.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY1NTM3MiwiZXhwIjoyMDUwMjMxMzcyfQ.BAAkPJbK4bCC9TZRop5lSAgwwdwR97nkTWrSYBs2FpX59LRla5FgyL4UXnKK5usDHZygROl0dmBH7KKgrE"
supabase secrets set PAYPAL_CLIENT_ID="EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9QQyj6Pg8q2BDvKwtD9uzhQDIfgPqC"
supabase secrets set PAYPAL_CLIENT_SECRET="YOUR_PAYPAL_SECRET_HERE"
supabase secrets set TWILIO_ACCOUNT_SID="YOUR_TWILIO_SID_HERE"
supabase secrets set TWILIO_AUTH_TOKEN="YOUR_TWILIO_TOKEN_HERE"
supabase secrets set SENDGRID_API_KEY="YOUR_SENDGRID_KEY_HERE"

# Verify secrets are set
supabase secrets list --project-ref beswluhdxaphtitaovly
```

---

## 🔑 REQUIRED SECRETS FOR EDGE FUNCTIONS

### Core Supabase Secrets

**Secret Name**: `SUPABASE_URL`  
**Value**: `https://beswluhdxaphtitaovly.supabase.co`  
**Used By**: All Edge Functions

**Secret Name**: `SUPABASE_SERVICE_ROLE_KEY`  
**Value**: 
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY1NTM3MiwiZXhwIjoyMDUwMjMxMzcyfQ.BAAkPJbK4bCC9TZRop5lSAgwwdwR97nkTWrSYBs2FpX59LRla5FgyL4UXnKK5usDHZygROl0dmBH7KKgrE
```
**Used By**: All Edge Functions (for database access)

---

### PayPal Integration Secrets

**Secret Name**: `PAYPAL_CLIENT_ID`  
**Value**: 
```
EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9QQyj6Pg8q2BDvKwtD9uzhQDIfgPqC
```
**Used By**: create-paypal-order, capture-paypal-order, paypal-webhook

**Secret Name**: `PAYPAL_CLIENT_SECRET`  
**Value**: `YOUR_PAYPAL_SECRET_HERE`  
**Used By**: PayPal authentication  
**Get From**: https://developer.paypal.com/dashboard/applications

---

### Notification Services (Optional - Add When Ready)

**Secret Name**: `TWILIO_ACCOUNT_SID`  
**Value**: `YOUR_TWILIO_SID_HERE`  
**Used By**: send-sms  
**Get From**: https://console.twilio.com/

**Secret Name**: `TWILIO_AUTH_TOKEN`  
**Value**: `YOUR_TWILIO_TOKEN_HERE`  
**Used By**: send-sms

**Secret Name**: `SENDGRID_API_KEY`  
**Value**: `YOUR_SENDGRID_KEY_HERE`  
**Used By**: send-email  
**Get From**: https://app.sendgrid.com/settings/api_keys

---

## ✅ VERIFICATION

After setting all secrets:

```bash
# List all secrets (values will be hidden)
supabase secrets list --project-ref beswluhdxaphtitaovly

# Expected output:
# SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
# PAYPAL_CLIENT_ID
# PAYPAL_CLIENT_SECRET
# (and optionally TWILIO_*, SENDGRID_API_KEY)
```

---

## 🔄 AFTER SETTING SECRETS

**Redeploy Edge Functions** to pick up new secrets:

```bash
supabase functions deploy --project-ref beswluhdxaphtitaovly
```

Or deploy individual functions:
```bash
supabase functions deploy create-order --project-ref beswluhdxaphtitaovly
supabase functions deploy create-paypal-order --project-ref beswluhdxaphtitaovly
```

---

## 🧪 TEST EDGE FUNCTIONS

```bash
# Test a simple function
curl https://beswluhdxaphtitaovly.supabase.co/functions/v1/get-metrics

# Should return metrics data (not an auth error)
```

---

**Last Updated**: 2026-05-03  
**Project**: beswluhdxaphtitaovly
