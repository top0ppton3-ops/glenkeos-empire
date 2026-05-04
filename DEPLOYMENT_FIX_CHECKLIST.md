# GlenKeos Deployment Fix Checklist

## Current Issues Resolved ✅

### 1. Supabase Config Issues ✅
- **Problem**: Invalid keys `[project]`, `project_id`, `name`, and `[edge_functions]` in `supabase/config.toml`
- **Solution**: Removed invalid `[project]` section and changed `[edge_functions]` to `[functions]`
- **Status**: ✅ FIXED

### 2. Git Email Configuration ❌ ACTION REQUIRED
- **Problem**: Commit email `engineering@glenkeos.com` doesn't match GitHub account
- **Solution**: Configure Git to use `Ahogue912@gmail.com`
- **Status**: ⚠️ **YOU MUST RUN THESE COMMANDS:**

```bash
git config user.email "Ahogue912@gmail.com"
git config user.name "Your Name"
```

See `GIT_SETUP_GUIDE.md` for detailed instructions.

### 3. CI/CD Pipeline Configuration ✅
- **Problem**: No GitHub Actions workflows configured (leading to 149+ failed runs)
- **Solution**: Created comprehensive CI/CD workflows
- **Status**: ✅ CREATED
  - `.github/workflows/ci.yml` - Main CI/CD pipeline with lint, test, build, E2E, and deploy
  - `.github/workflows/supabase-deploy.yml` - Supabase migrations and Edge Functions deployment

### 4. Node.js Version Compatibility ✅
- **Problem**: No Node.js version specification
- **Solution**: Created `.nvmrc` file specifying Node.js 20.18.0
- **Status**: ✅ FIXED

### 5. pnpm Lockfile Management ✅
- **Problem**: Missing `.gitignore` causing lockfile tracking issues
- **Solution**: Created `.gitignore` with proper exclusions (but NOT excluding pnpm-lock.yaml)
- **Status**: ✅ FIXED

## Required Actions Before Deployment

### Step 1: Fix Git Configuration (CRITICAL)

```bash
# In your terminal, run:
git config user.email "Ahogue912@gmail.com"
git config user.name "Your Name"

# Verify it worked:
git config user.email  # Should output: Ahogue912@gmail.com
```

### Step 2: Generate pnpm Lockfile

```bash
# Generate/update the lockfile
pnpm install

# This will create pnpm-lock.yaml
```

### Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

#### Vercel Secrets
```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-vercel-org-id>
VERCEL_PROJECT_ID=<your-vercel-project-id>
```

To get these values:
1. Go to https://vercel.com/account/tokens - Create a new token
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel link` in your project directory
4. Copy values from `.vercel/project.json`

#### Supabase Secrets
```
SUPABASE_ACCESS_TOKEN=<your-supabase-access-token>
SUPABASE_PROJECT_ID=beswluhdxaphtitaovly
SUPABASE_DB_PASSWORD=<your-database-password>
```

To get Supabase access token:
1. Go to https://supabase.com/dashboard/account/tokens
2. Generate a new access token
3. Copy and save it (you won't see it again)

### Step 4: Commit and Push

```bash
# Stage all changes
git add .

# Commit with proper email (after Step 1)
git commit -m "fix: CI/CD configuration, Supabase config, and deployment setup"

# Push to trigger deployment
git push origin main
```

## CI/CD Workflow Overview

### On Push to `main` branch:
1. **Lint & Type Check** - ESLint, TypeScript, Prettier
2. **Unit Tests** - Vitest unit tests
3. **Build** - Vite production build
4. **E2E Tests** - Playwright tests (after build)
5. **Deploy to Vercel Production** - Automatic deployment

### On Pull Request:
1. **Lint & Type Check**
2. **Unit Tests**
3. **Build**
4. **Deploy to Vercel Preview** - Preview deployment

### On Supabase Changes:
1. **Deploy Database Migrations** - Via `supabase db push`
2. **Deploy Edge Functions** - All functions in `supabase/functions/`

## Verification Steps After Deployment

### 1. Check GitHub Actions
- Go to your repository → Actions tab
- Verify all workflows complete successfully
- No more failed runs

### 2. Check Vercel Deployment
- Go to https://vercel.com/dashboard
- Find your GlenKeos project
- Verify deployment succeeded
- Check deployment logs

### 3. Test the Application
```bash
# Visit your production URL
https://<your-project>.vercel.app

# Test key functionality:
# - Brand storefronts load correctly
# - Orders can be placed
# - Admin dashboards accessible
# - Real-time updates working
```

### 4. Verify Supabase Integration
```bash
# Check Edge Functions are deployed
# Go to: https://supabase.com/dashboard/project/beswluhdxaphtitaovly/functions

# Verify database migrations applied
# Go to: https://supabase.com/dashboard/project/beswluhdxaphtitaovly/editor
```

## Troubleshooting

### If GitHub Actions still fail:

1. **Check secrets are set correctly**
   ```bash
   # In GitHub repository → Settings → Secrets and variables → Actions
   # Verify all required secrets are present
   ```

2. **Check Node.js version**
   ```bash
   # Workflow should use Node 20.18.0 from .nvmrc
   # Check workflow logs for version mismatch
   ```

3. **Check pnpm lockfile**
   ```bash
   # Ensure pnpm-lock.yaml is committed
   git status
   git add pnpm-lock.yaml
   git commit -m "chore: add pnpm lockfile"
   git push
   ```

### If Vercel deployment fails:

1. **Check Vercel project is linked to correct repository**
2. **Verify environment variables are set in Vercel dashboard**
3. **Check build logs in Vercel dashboard**
4. **Ensure `vercel.json` configuration is correct**

### If Supabase deployment fails:

1. **Verify project ID is correct** (beswluhdxaphtitaovly)
2. **Check access token is valid**
3. **Ensure database password is correct**
4. **Review migration files for SQL errors**

## Architecture Confirmation

✅ **Verified Architecture: Vercel + Supabase (NO AWS)**

- **Frontend**: React + Vite SPA on Vercel
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime

All AWS services have been removed. The platform is 100% Vercel + Supabase.

## Expected Outcome

After completing all steps:

✅ No more CI/CD failures
✅ Automatic deployments on push to `main`
✅ Preview deployments for pull requests
✅ Supabase functions and migrations auto-deployed
✅ Email matches GitHub account (Ahogue912@gmail.com)
✅ Node.js version locked to 20.18.0
✅ pnpm lockfile tracked and frozen in CI

## Support

If issues persist after following this checklist:

1. Check GitHub Actions logs for specific errors
2. Review Vercel deployment logs
3. Verify all secrets are correctly set
4. Ensure Git email is configured correctly
5. Confirm repository permissions and access

**Critical First Step**: Run the Git email configuration command before anything else!
