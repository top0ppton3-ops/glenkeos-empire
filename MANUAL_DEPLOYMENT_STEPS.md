# 🚀 Manual Deployment Steps

## Current Status
✅ Code pushed to GitHub  
✅ Supabase CLI installed  
✅ 32 Edge Functions ready to deploy  
⏳ Waiting for Supabase authentication

---

## Step 1: Authenticate with Supabase

Run this command in your terminal:

```bash
export PATH="$HOME/.local/bin:$PATH"
supabase login
```

This will open a browser window for authentication. Once complete, you'll get an access token.

---

## Step 2: Deploy Edge Functions

After authentication, run the deployment script:

```bash
./deploy-supabase.sh
```

This will:
1. Link to project `beswluhdxaphtitaovly`
2. Set 3 secrets (SUPABASE_URL, SERVICE_ROLE_KEY, PAYPAL_CLIENT_ID)
3. Deploy all 32 Edge Functions

**Expected time**: 10-15 minutes

---

## Step 3: Configure Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select project: **codebuild-default-webhook-source-lo**
3. Settings → Environment Variables
4. Add these variables:

```env
VITE_SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic
PAYPAL_CLIENT_ID=EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9QQyj6Pg8q2BDvKwtD9uzhQDIfgPqC
```

5. Click **Save** for each
6. Trigger redeploy: Deployments → Redeploy

---

## Step 4: Seed Database

Run the database seed script to populate test data:

```bash
export PATH="$HOME/.local/bin:$PATH"
supabase db push
```

This loads:
- Menu items (100+ products across brands)
- Stores (10 locations)
- Test customers
- Sample orders
- Driver accounts

---

## Step 5: Test All Portals

Visit your deployed app at:
**https://codebuild-default-webhook-source-lo.vercel.app**

Test each portal:
1. **Customer Portal** - Place orders, track delivery, loyalty points
2. **Employee Portal** - View assignments, update earnings
3. **Manager Portal** - Manage inventory, approve requests
4. **Corporate Portal** - Analytics dashboard, compliance reports
5. **GoldKey Portal** - Premium experience bookings

---

## Alternative: Use Access Token Directly

If you have a Supabase access token, export it:

```bash
export SUPABASE_ACCESS_TOKEN="your_token_here"
./deploy-supabase.sh
```

---

## Verification Checklist

After deployment, verify:
- [ ] All 32 Edge Functions show "Active" in Supabase dashboard
- [ ] Secrets are set (check with `supabase secrets list`)
- [ ] Vercel deployment succeeds with no errors
- [ ] Frontend loads without 500 errors
- [ ] Can create test order in Customer Portal
- [ ] Real-time order tracking works
- [ ] All 5 portals are accessible

---

## Support

- **Supabase Dashboard**: https://supabase.com/dashboard/project/beswluhdxaphtitaovly
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/top0ppton3-ops/CODEBUILD_DEFAULT_WEBHOOK_SOURCE_LOCATION

All configuration files and credentials are ready. Just need to complete the authentication and deployment steps above.
