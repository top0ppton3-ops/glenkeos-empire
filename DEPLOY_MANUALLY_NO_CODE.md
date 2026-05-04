# 🚀 DEPLOY MANUALLY (NO CODE NEEDED)

## ✅ DEPLOY FROM VERCEL DASHBOARD ONLY

**No terminal, no commands, just clicks!**

---

## **METHOD 1: REDEPLOY EXISTING**

### **Step 1: Go to Vercel**
👉 https://vercel.com/dashboard

### **Step 2: Find Project**
- Look for: **codebuild-default-webhook-source**
- Click on it

### **Step 3: Redeploy**
1. Click **Deployments** tab
2. Find the most recent deployment
3. Click the **•••** (three dots) menu
4. Click **Redeploy**
5. Confirm: Click **Redeploy** again

### **Step 4: Wait**
- Status shows: 🟡 PENDING
- Then: 🔵 BUILDING (2-3 min)
- Then: 🟢 READY

---

## **METHOD 2: IMPORT FROM GITHUB**

### **Step 1: Connect GitHub**
👉 https://vercel.com/new

### **Step 2: Import Repository**
1. Click **Import Git Repository**
2. Find your GlenKeos repo
3. Click **Import**

### **Step 3: Configure**
- **Project Name:** codebuild-default-webhook-source
- **Framework Preset:** Vite
- **Build Command:** `pnpm run build`
- **Output Directory:** `dist`

### **Step 4: Add Environment Variables**
```
VITE_SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MDkxNzksImV4cCI6MjA0OTI4NTE3OX0.tNa6CJqPG7LPSNd5G7OaL-w2xb1PbnhXUPfHxbj-kU8
```

### **Step 5: Deploy**
- Click **Deploy**
- Wait for build to complete
- Get live URL

---

## **METHOD 3: DRAG & DROP**

### **Step 1: Build Locally**
If you can run commands on your computer:
```bash
pnpm install
pnpm run build
```

This creates a `dist` folder.

### **Step 2: Upload to Vercel**
1. Go to: https://vercel.com/new
2. Click **Browse** or drag the `dist` folder
3. Drop the folder
4. Vercel deploys it immediately

---

## 🗄️ THEN DEPLOY DATABASE

**After Vercel deployment completes:**

### **Step 1: Open Supabase**
👉 https://supabase.com/dashboard/project/beswluhdxaphtitaovly

### **Step 2: Go to SQL Editor**
- Click **SQL Editor** in sidebar
- Click **New query**

### **Step 3: Paste Migration**
1. Open `/PASTE_INTO_SUPABASE_SQL_EDITOR.sql` from your project files
2. Copy ALL 694 lines
3. Paste into SQL Editor
4. Click **RUN** (bottom right)
5. Wait for "Success" ✅

---

## ✅ VERIFY DEPLOYMENT

### **Frontend (Vercel)**
👉 https://codebuild-default-webhook-source.vercel.app

**Should show:**
- 3 brand logos
- Clean B1 design
- No errors

### **Backend (Supabase)**
👉 https://supabase.com/dashboard/project/beswluhdxaphtitaovly/editor

**Should have:**
- All tables created
- RLS policies active
- Edge Functions ready

---

## 🎯 EASIEST PATH

**If you have:**
- ✅ Git repo connected to Vercel
- ✅ Already deployed before

**Then just:**
1. Go to Vercel dashboard
2. Click **Redeploy**
3. Wait 3 minutes
4. Deploy SQL to Supabase
5. Done! ✅

---

## 📊 NO CODE REQUIRED!

Everything can be done through web dashboards:
- ✅ Vercel Dashboard (deployment)
- ✅ Supabase Dashboard (database)
- ✅ GitHub (code storage)

**Total time: ~10 minutes** ⚡
