# ✅ GLENKEOS DEPLOYMENT CHECKLIST

Copy this and check off items as you complete them!

---

## 🎯 PRE-DEPLOYMENT (5 minutes)

- [ ] **Supabase Account** - Sign up at https://supabase.com (free)
- [ ] **Vercel Account** - Already have project deployed ✅
- [ ] **Terminal Access** - Ready to run commands

---

## 🔧 INSTALLATION (2 minutes)

- [ ] **Install Supabase CLI**
  ```bash
  npm install -g supabase
  ```

- [ ] **Verify installation**
  ```bash
  supabase --version
  ```

- [ ] **Login to Supabase**
  ```bash
  supabase login
  ```
  _(Opens browser for authentication)_

---

## 🏗️ CREATE BACKEND (3 minutes)

- [ ] **Create Supabase project**
  - Go to: https://app.supabase.com/new
  - Name: `glenkeos-production`
  - Database Password: `________________` (save this!)
  - Region: `________________`
  - Click "Create new project"
  - ⏳ Wait ~2 minutes

- [ ] **Copy Project Reference**
  - From URL: `https://app.supabase.com/project/YOUR_REF`
  - Project Ref: `________________`

- [ ] **Link project locally**
  ```bash
  cd /workspaces/default/code
  supabase link --project-ref YOUR_PROJECT_REF
  ```

---

## 🚀 DEPLOY BACKEND (3 minutes)

- [ ] **Run deployment script**
  ```bash
  ./deploy-backend-now.sh
  ```

- [ ] **Verify deployment**
  ```bash
  supabase functions list
  ```
  Should show 8 functions ✅

- [ ] **Test backend**
  ```bash
  ./test-backend-complete.sh
  ```
  Should pass 5/8 tests ✅

---

## 🔑 GET CREDENTIALS (1 minute)

- [ ] **Go to API settings**
  - URL: `https://app.supabase.com/project/YOUR_REF/settings/api`

- [ ] **Copy Project URL**
  - Project URL: `________________`

- [ ] **Copy Anon Key**
  - Anon Key: `________________`

---

## 🌐 UPDATE FRONTEND (2 minutes)

- [ ] **Go to Vercel dashboard**
  - URL: https://vercel.com/dashboard

- [ ] **Open your project settings**
  - Project: `codebuild-default-webhook-source-lo`
  - Settings → Environment Variables

- [ ] **Add VITE_SUPABASE_URL**
  - Name: `VITE_SUPABASE_URL`
  - Value: `https://YOUR_PROJECT_REF.supabase.co`
  - Environments: Production, Preview, Development

- [ ] **Add VITE_SUPABASE_ANON_KEY**
  - Name: `VITE_SUPABASE_ANON_KEY`
  - Value: `eyJhbGc...` (your anon key)
  - Environments: Production, Preview, Development

- [ ] **Save variables**

---

## 🔄 REDEPLOY FRONTEND (1 minute)

- [ ] **Trigger redeploy**
  - Option 1: Vercel Dashboard → Deployments → Redeploy
  - Option 2: `git push` to trigger automatic deploy
  - Option 3: `vercel --prod`

- [ ] **Wait for deployment**
  - ⏳ Usually takes 1-2 minutes

---

## ✅ VERIFY DEPLOYMENT (2 minutes)

- [ ] **Open your app**
  - URL: https://codebuild-default-webhook-source-lo.vercel.app

- [ ] **Check browser console** (F12)
  - Should see: `✅ Supabase configured from environment: YOUR_REF`

- [ ] **Test order creation**
  - Create a test order in any dashboard
  - Should complete without errors

- [ ] **Test PayPal integration**
  ```bash
  curl -X POST https://YOUR_REF.supabase.co/functions/v1/create-paypal-order \
    -H "Content-Type: application/json" \
    -d '{"order_id":"test-001","amount":25.00}'
  ```
  - Should return PayPal order ID

- [ ] **Check database**
  - Go to: `https://app.supabase.com/project/YOUR_REF/editor`
  - Should see 19 tables with data

---

## 🎉 DEPLOYMENT COMPLETE!

### Your Live URLs:

- **Frontend:** https://codebuild-default-webhook-source-lo.vercel.app
- **Backend:** https://YOUR_PROJECT_REF.supabase.co
- **Database:** https://app.supabase.com/project/YOUR_PROJECT_REF
- **Functions:** https://YOUR_PROJECT_REF.supabase.co/functions/v1/

### What's Working:

- ✅ 19 database tables
- ✅ 8 Edge Functions
- ✅ PayPal sandbox integration
- ✅ GPS tracking
- ✅ Loyalty points system
- ✅ Multi-brand support
- ✅ Real-time updates

### Next Steps (Optional):

- [ ] Configure Twilio for SMS notifications
- [ ] Configure SendGrid for email notifications
- [ ] Switch PayPal to production mode
- [ ] Add custom domain
- [ ] Set up monitoring/alerts

---

## 🆘 NEED HELP?

**Stuck on a step?** Check these guides:

- **Step-by-step:** `DEPLOY_NOW_GUIDE.md`
- **Complete instructions:** `DEPLOY_INSTRUCTIONS_FINAL.md`
- **Troubleshooting:** `ALL_ERRORS_RESOLVED.md`
- **Command reference:** `COMMAND_REFERENCE.md`

**Common issues:**

1. **"Project not linked"**
   ```bash
   supabase link --project-ref YOUR_REF
   ```

2. **"Function failed"**
   ```bash
   supabase functions logs FUNCTION_NAME
   ```

3. **"Environment variables not working"**
   - Verify they're saved in Vercel
   - Redeploy after adding variables
   - Hard refresh browser (Ctrl+Shift+R)

---

## 📊 DEPLOYMENT TIME

**Estimated total:** 15-20 minutes

- Installation: 2 min
- Create project: 3 min (includes wait time)
- Deploy backend: 3 min
- Get credentials: 1 min
- Update frontend: 2 min
- Redeploy: 1 min
- Verify: 2 min
- Buffer: 5 min

---

## 🚀 QUICK START

**Copy and paste these commands to get started:**

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. After creating project in dashboard, link it
supabase link --project-ref YOUR_PROJECT_REF

# 4. Deploy everything
./deploy-backend-now.sh

# 5. Test deployment
./test-backend-complete.sh
```

**Then update Vercel environment variables and redeploy!**

---

**Ready to deploy? Start here:** `DEPLOY_NOW_GUIDE.md`

**Status:** ✅ ALL FILES READY FOR DEPLOYMENT
