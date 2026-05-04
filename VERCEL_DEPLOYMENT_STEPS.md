# Deploy to Correct Vercel Project

**Target Project**: codebuild-default-webhook-source-location  
**Team**: top0ppton3-ops-projects  
**Issue**: Token lacks scope access for automated deployment

---

## OPTION 1: Deploy via Vercel Dashboard (Fastest)

### Step 1: Go to Project Settings
https://vercel.com/top0ppton3-ops-projects/codebuild-default-webhook-source-location/settings

### Step 2: Connect GitHub Repository

1. Click **Git** tab
2. Click **Connect Git Repository**
3. Select: `top0ppton3-ops/glenkeos-empire`
4. Branch: `master`
5. Click **Connect**

### Step 3: Configure Build Settings

**Build Command**: `pnpm run build`  
**Output Directory**: `dist`  
**Install Command**: `pnpm install`  
**Framework Preset**: Vite

### Step 4: Add Environment Variables

Go to: Settings → Environment Variables

Add these:
```
VITE_SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

(Get anon key from Supabase dashboard)

### Step 5: Deploy

Click **Deployments** → **Redeploy** (or wait for auto-deploy from GitHub push)

---

## OPTION 2: Deploy via CLI (Requires New Token)

### Step 1: Generate New Token with Correct Scopes

1. Go to: https://vercel.com/account/tokens
2. Click **Create Token**
3. Name: `GlenKeos Deployment`
4. Scope: `top0ppton3-ops-projects` team
5. Expiration: Never (or custom)
6. Click **Create**
7. Copy the new token

### Step 2: Deploy with New Token

```bash
cd /path/to/glenkeos-empire
vercel --token YOUR_NEW_TOKEN --prod --scope top0ppton3-ops-projects
```

---

## OPTION 3: Manual File Upload

### Step 1: Build Locally

```bash
pnpm run build
```

### Step 2: Upload to Vercel

1. Go to: https://vercel.com/top0ppton3-ops-projects/codebuild-default-webhook-source-location
2. Click **New Deployment**
3. Drag and drop the `dist` folder
4. Click **Deploy**

---

## CURRENT STATUS

**What's Deployed**: 
- ✅ GitHub: https://github.com/top0ppton3-ops/glenkeos-empire
- ⚠️ Vercel: Deployed to wrong project (`code` instead of `codebuild-default-webhook-source-location`)

**What You Need**:
- Deploy to: https://vercel.com/top0ppton3-ops-projects/codebuild-default-webhook-source-location
- Either via Dashboard (Option 1) or new token (Option 2)

**Custom Domain**:
- After correct deployment, add `www.glenkeos.com` in project settings

---

## RECOMMENDED: Option 1 (Dashboard)

**Time**: 5 minutes  
**Complexity**: Low  
**Best for**: Quick deployment without token issues

1. Connect GitHub repo in Vercel dashboard
2. Push to `master` branch triggers auto-deploy
3. Add custom domain
4. Done

**URL**: https://vercel.com/top0ppton3-ops-projects/codebuild-default-webhook-source-location/settings/git
