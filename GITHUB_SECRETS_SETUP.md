# 🔐 GitHub Secrets Setup for Auto-Deployment

## **Required for GitHub Actions Workflow**

The `.github/workflows/deploy-supabase.yml` workflow needs these secrets to deploy automatically.

---

## 📋 **Secrets to Add**

### 1. `SUPABASE_PROJECT_REF`
**Value:** `beswluhdxaphtitaovly`

**What it is:** Your Supabase project reference ID

---

### 2. `SUPABASE_ACCESS_TOKEN`
**How to get:**

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate New Token"**
3. Name: `GitHub Actions - GlenKeos`
4. Copy the token (starts with `sbp_...`)
5. **Save it immediately** (you can't view it again!)

**Value example:** `sbp_abc123def456...`

---

### 3. `SUPABASE_DB_PASSWORD`
**How to get:**

1. Go to: https://supabase.com/dashboard/project/beswluhdxaphtitaovly/settings/database
2. Scroll to **"Database Password"**
3. Click **"Reset Database Password"** if you don't have it
4. Copy the password

**Value example:** `your-super-secret-db-password`

---

## 🔧 **How to Add Secrets to GitHub**

### Step 1: Go to Repository Settings
1. Open your GitHub repository
2. Click **Settings** (top right)
3. In left sidebar: **Secrets and variables** → **Actions**

### Step 2: Add Each Secret
For each secret:

1. Click **"New repository secret"**
2. Enter **Name** (e.g., `SUPABASE_PROJECT_REF`)
3. Enter **Value** (e.g., `beswluhdxaphtitaovly`)
4. Click **"Add secret"**

Repeat for all 3 secrets.

---

## ✅ **Verification**

After adding secrets, you should see:

```
Repository secrets (3)

• SUPABASE_PROJECT_REF       Updated 1 minute ago
• SUPABASE_ACCESS_TOKEN      Updated 1 minute ago  
• SUPABASE_DB_PASSWORD       Updated 1 minute ago
```

---

## 🚀 **Test the Workflow**

Once secrets are added:

```bash
# Make a test commit
git add .
git commit -m "test: Verify GitHub Actions deployment"
git push origin main
```

Then watch:
1. Go to: Your repo → **Actions** tab
2. See: "Deploy Supabase Migrations" workflow running
3. Wait: ~30-60 seconds
4. Status: ✅ Green checkmark = success!

---

## 🎯 **Complete Secrets Checklist**

- [ ] SUPABASE_PROJECT_REF added (`beswluhdxaphtitaovly`)
- [ ] SUPABASE_ACCESS_TOKEN added (from account/tokens)
- [ ] SUPABASE_DB_PASSWORD added (from project settings)
- [ ] All 3 secrets show in GitHub repo settings
- [ ] Test workflow triggered successfully

---

## 🔒 **Security Best Practices**

✅ **DO:**
- Keep secrets in GitHub Secrets (encrypted at rest)
- Rotate access tokens periodically
- Use unique passwords for production
- Limit token scopes to minimum required

❌ **DON'T:**
- Commit secrets to code
- Share secrets in plain text
- Use same password across environments
- Store secrets in environment files committed to git

---

## 🚨 **Troubleshooting**

### "Invalid project ref"
→ Double-check: `SUPABASE_PROJECT_REF` = `beswluhdxaphtitaovly`

### "Authentication failed"
→ Regenerate `SUPABASE_ACCESS_TOKEN` from account/tokens

### "Database password incorrect"
→ Reset database password in project settings

### "Workflow not running"
→ Check if secrets are in **Actions secrets** (not Environment secrets)

---

## 📞 **Quick Links**

**Add Secrets:**
https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions

**Get Access Token:**
https://supabase.com/dashboard/account/tokens

**Project Settings:**
https://supabase.com/dashboard/project/beswluhdxaphtitaovly/settings/database

**Monitor Deployments:**
https://github.com/YOUR_USERNAME/YOUR_REPO/actions

---

## ✅ **After Setup**

Once secrets are configured, **every push to main** will:
1. ✅ Trigger GitHub Actions workflow
2. ✅ Connect to Supabase project
3. ✅ Deploy new migrations automatically
4. ✅ Verify deployment success

**No manual CLI commands needed!** 🎉
