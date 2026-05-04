# 🚀 Deployment Checklist

## ✅ Completed

- [x] Supabase project connected (`beswluhdxaphtitaovly`)
- [x] Environment variables configured (`.env` created)
- [x] Speed Insights installed and integrated
- [x] Analytics installed and integrated
- [x] Mock backend enabled for development
- [x] PayPal webhook bug fixed (column name issue)
- [x] .gitignore created to protect credentials

## 📋 Next Steps

### Step 1: Update Vercel Environment Variables (5 min)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your GlenKeos project
3. Click **Settings** → **Environment Variables**
4. Add these variables:

```
VITE_SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDY2MzgsImV4cCI6MjA5MjM4MjYzOH0.XMxin_yjhgp3si6G_PFAWdrsaBzdJgfJcgyc-NQEXhw
```

5. Click **Save**

### Step 2: Deploy to Vercel (2 min)

```bash
# Commit changes
git add .
git commit -m "feat: connect Supabase and add Speed Insights"

# Push to deploy
git push
```

Vercel will automatically deploy your changes.

### Step 3: Verify Speed Insights (1 min)

1. Wait for deployment to complete
2. Visit your live site
3. Navigate between pages (Brand selector → Chic-on-Chain → Back)
4. Wait 30 seconds
5. Check Vercel Dashboard → **Speed Insights** tab
6. You should see Core Web Vitals data

### Step 4: Deploy Edge Functions (Optional - 10 min)

**Only needed for real backend functionality. Skip if using mock data.**

```bash
# Login to Supabase
pnpm dlx supabase login

# Deploy PayPal webhook (bug already fixed!)
pnpm dlx supabase functions deploy paypal-webhook --project-ref beswluhdxaphtitaovly

# Deploy other functions as needed
pnpm dlx supabase functions deploy create-paypal-order --project-ref beswluhdxaphtitaovly
pnpm dlx supabase functions deploy capture-paypal-order --project-ref beswluhdxaphtitaovly
```

Then set secrets in Supabase Dashboard → Edge Functions → Secrets:
```
PAYPAL_CLIENT_ID=Aak4lnZ2VoSGGGtyby06OBU4dZ0mtprftwZs43fLICH7G22G0se3c2Q5eDmZStMIwmjRkfDkHK_Kk_6F
PAYPAL_CLIENT_SECRET=EKkFDzC-hX_TxE0c45vp_4Tp_PGvwrHQZRhOCHWvqyJqH1YBSL4dDcNKGKlU3v-SdYxTILjhpxJzWOZj
PAYPAL_ENVIRONMENT=sandbox
```

### Step 5: Switch to Real Backend (Optional)

After Edge Functions are deployed:

1. Open `src/app/services/api/client.ts`
2. Change: `const USE_MOCK = true;` → `const USE_MOCK = false;`
3. Open `src/app/services/api/index.ts`
4. Change: `const USE_MOCK = true;` → `const USE_MOCK = false;`
5. Commit and push

## 🎯 What You Get Right Now

### With Current Setup (Mock Mode)
- ✅ Full UI working with mock data
- ✅ All 3 brand pages functional
- ✅ Corporate pages and internal dashboards
- ✅ Speed Insights tracking performance
- ✅ Analytics tracking user behavior
- ✅ Supabase credentials configured (ready to use)

### After Edge Functions Deployed
- ✅ Real database integration
- ✅ PayPal payment processing
- ✅ Order management
- ✅ Driver tracking
- ✅ Inventory management
- ✅ Loyalty points system

## 📊 Monitoring Your Site

### Speed Insights Dashboard
- **Location:** Vercel Dashboard → Speed Insights
- **Metrics:** LCP, FID, CLS, TTFB
- **Data:** Updates every 30 seconds after page visits

### Analytics Dashboard
- **Location:** Vercel Dashboard → Analytics
- **Metrics:** Page views, unique visitors, top pages
- **Data:** Real-time updates

### Supabase Dashboard
- **URL:** https://app.supabase.com/project/beswluhdxaphtitaovly
- **Check:** Table Editor, SQL Editor, Logs
- **Monitor:** Database queries, API usage

## 🔍 Testing Locally

```bash
# Start dev server
pnpm dev

# Visit in browser
http://localhost:5173
```

**Expected behavior:**
- Brand selector loads
- 3 brand cards visible (Chic-on-Chain, Ghetto Eats, GoldKey)
- Clicking brands shows empty states (mock mode)
- Console shows: "✅ Supabase configured from environment: beswluhdxaphtitaovly"
- Console shows: "✅ Supabase using fallback credentials" (if .env not loaded)

## ⚠️ Troubleshooting

### Speed Insights not showing data
- Wait at least 30 seconds after page visit
- Disable ad blockers
- Check browser console for errors
- Navigate between pages to generate events

### Supabase not connecting
- Verify `.env` file exists
- Check environment variables in Vercel
- Restart dev server: `pnpm dev`
- Check browser console for Supabase errors

### Mock data not loading
- Check browser console for JavaScript errors
- Verify `USE_MOCK = true` in both API files
- Clear browser cache and reload

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Speed Insights:** https://vercel.com/docs/speed-insights
- **PayPal Sandbox:** https://developer.paypal.com/dashboard

---

**Current Status:** ✅ Ready to deploy to Vercel
**Last Updated:** 2026-04-22
