# Vercel Environment Variables Setup

## Method 1: Via Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link to project
vercel link

# Add environment variables
vercel env add VITE_SUPABASE_URL production
# Paste: https://beswluhdxaphtitaovly.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic

vercel env add PAYPAL_CLIENT_ID production
# Paste: EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9QQyj6Pg8q2BDvKwtD9uzhQDIfgPqC

# Trigger redeployment
vercel --prod
```

## Method 2: Via Web Dashboard

1. Go to: https://vercel.com/dashboard
2. Select project: **codebuild-default-webhook-source-lo**
3. Click **Settings** → **Environment Variables**
4. Add each variable:

### Variable 1: VITE_SUPABASE_URL
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://beswluhdxaphtitaovly.supabase.co`
- **Environment**: Production, Preview, Development
- Click **Save**

### Variable 2: VITE_SUPABASE_ANON_KEY
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic`
- **Environment**: Production, Preview, Development
- Click **Save**

### Variable 3: PAYPAL_CLIENT_ID
- **Key**: `PAYPAL_CLIENT_ID`
- **Value**: `EE2_h5fo90x16U5D-K_JYFwlthDxo5tA7PcV2TpeESLkUaMc3v9QQyj6Pg8q2BDvKwtD9uzhQDIfgPqC`
- **Environment**: Production, Preview, Development
- Click **Save**

5. Go to **Deployments** tab
6. Click **...** menu on latest deployment
7. Click **Redeploy**
8. Select **Use existing build cache** (optional, faster)
9. Click **Redeploy**

## Verification

After redeployment completes:
- Visit: https://codebuild-default-webhook-source-lo.vercel.app
- Check browser console for errors
- Verify Supabase connection works
- Test placing an order

## Troubleshooting

If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set correctly
3. Ensure no typos in variable names (they're case-sensitive)
4. Make sure values don't have extra quotes or spaces
