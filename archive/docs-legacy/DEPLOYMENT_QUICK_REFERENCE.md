# GlenKeos - Deployment Quick Reference Card

**Last Updated:** April 23, 2026  
**Print this page for quick access during deployment**

---

## 🎯 STACK SUMMARY

| Component | Technology | Location |
|-----------|-----------|----------|
| **Frontend** | React 18.3.1 + Vite 6.3.5 | Vercel |
| **Backend** | Supabase (PostgreSQL + Edge Functions) | Supabase Cloud |
| **Database** | PostgreSQL 15+ with RLS | Supabase |
| **Auth** | Supabase Auth (JWT) | Supabase |
| **API** | PostgREST + Edge Functions | Supabase |
| **CI/CD** | GitHub → Vercel (auto-deploy) | GitHub + Vercel |
| **AWS Services** | **ZERO** | N/A |

---

## 🔑 CREDENTIALS & URLS

### Production URLs
```
Frontend:  https://codebuild-default-webhook-source-lo.vercel.app
Database:  https://beswluhdxaphtitaovly.supabase.co
GitHub:    https://github.com/top0ppton3-ops/CODEBUILD_DEFAULT_WEBHOOK_SOURCE_LOCATION
```

### Supabase Project
```
Project ID:  beswluhdxaphtitaovly
Region:      US East (N. Virginia)
```

### Environment Variables (PUBLIC - Safe to expose)
```env
VITE_SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTUzNzIsImV4cCI6MjA1MDIzMTM3Mn0.qLcKz_g7pVHl8mz4G3wP6EJZwC-Sz8_JYu_sH3h_Uic
```

---

## 🚀 DEPLOYMENT COMMANDS

### Frontend (Automatic)
```bash
git add .
git commit -m "Your commit message"
git push origin main
# Vercel auto-deploys in 2-3 minutes
```

### Supabase Edge Functions (Manual)
```bash
# Login
supabase login

# Link project
supabase link --project-ref beswluhdxaphtitaovly

# Deploy specific function
supabase functions deploy create-paypal-order

# Deploy all functions
for func in supabase/functions/*/; do
  supabase functions deploy $(basename $func)
done
```

### Database Migrations
```bash
# Via CLI
supabase db push

# Or via Supabase Dashboard:
# SQL Editor → Paste SQL → Run
```

---

## 📋 EDGE FUNCTIONS LIST

| Function Name | Purpose |
|---------------|---------|
| `create-paypal-order` | Initialize PayPal payment |
| `capture-paypal-order` | Complete PayPal payment |
| `paypal-webhook` | Handle PayPal callbacks |
| `send-email` | Email notifications (SendGrid) |
| `send-sms` | SMS notifications (Twilio) |
| `update-loyalty` | Loyalty points management |
| `get-driver-location` | Fetch driver GPS |
| `update-driver-location` | Update driver GPS |
| `compliance-report` | Generate compliance reports |
| `mfa-verify` | Multi-factor authentication |
| `sso-auth` | Single sign-on |
| `server` | Main API handler |

**Total:** 12 functions

---

## 🔐 SUPABASE SECRETS (For Edge Functions)

Set via: `supabase secrets set KEY=VALUE`

```bash
# PayPal
supabase secrets set PAYPAL_CLIENT_ID=YOUR_CLIENT_ID
supabase secrets set PAYPAL_CLIENT_SECRET=YOUR_SECRET
supabase secrets set PAYPAL_MODE=sandbox  # or 'live'

# Twilio (SMS)
supabase secrets set TWILIO_ACCOUNT_SID=YOUR_SID
supabase secrets set TWILIO_AUTH_TOKEN=YOUR_TOKEN
supabase secrets set TWILIO_PHONE_NUMBER=YOUR_NUMBER

# SendGrid (Email)
supabase secrets set SENDGRID_API_KEY=YOUR_KEY
supabase secrets set SENDGRID_FROM_EMAIL=noreply@glenkeos.com
```

**List secrets:**
```bash
supabase secrets list
```

---

## 🗄️ DATABASE TABLES

| Table | Purpose | RLS Enabled |
|-------|---------|-------------|
| `stores` | Store locations | ✅ |
| `menu_items` | Products/menu | ✅ |
| `orders` | Customer orders | ✅ |
| `customers` | Customer accounts | ✅ |
| `drivers` | Driver fleet | ✅ |
| `inventory` | Stock management | ✅ |
| `payments` | Payment records | ✅ |
| `loyalty_points` | Loyalty program | ✅ |
| `compliance_logs` | Audit logs | ✅ |

**All tables have:**
- `tenant_id` column for multi-tenant isolation
- Row Level Security (RLS) policies
- `created_at` and `updated_at` timestamps

---

## 🔍 MONITORING DASHBOARDS

### Vercel
```
URL: https://vercel.com/dashboard
Check: Deployments, Build Logs, Analytics
```

### Supabase
```
URL: https://supabase.com/dashboard/project/beswluhdxaphtitaovly
Check: Database, Auth, Edge Functions, Logs
```

### GitHub
```
URL: https://github.com/top0ppton3-ops/CODEBUILD_DEFAULT_WEBHOOK_SOURCE_LOCATION
Check: Commits, Actions, Webhooks
```

---

## 🐛 QUICK TROUBLESHOOTING

### Issue: Build fails on Vercel
```bash
# Test locally first
pnpm run build

# Check Vercel logs
vercel logs <deployment-url>
```

### Issue: Database queries return empty
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Temporarily disable RLS for testing (NOT in production!)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

### Issue: Edge Function errors
```bash
# Check function logs
supabase functions logs create-paypal-order

# Test function locally
supabase functions serve create-paypal-order
```

### Issue: Auth not working
```typescript
// Check session in browser console
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User:', session?.user);
console.log('Token:', session?.access_token);
```

---

## 📦 BUILD CONFIGURATION

### vercel.json
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install"
}
```

### package.json scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

---

## 🎯 DEPLOYMENT CHECKLIST

### One-Time Setup
- [x] Create Vercel project
- [x] Connect GitHub repository
- [x] Set Vercel environment variables
- [x] Create Supabase project
- [x] Deploy database schema
- [x] Enable RLS on all tables
- [x] Deploy Edge Functions
- [x] Configure Supabase secrets

### Every Deploy
- [ ] Test locally: `pnpm run dev`
- [ ] Build locally: `pnpm run build`
- [ ] Commit changes: `git commit`
- [ ] Push to main: `git push origin main`
- [ ] Verify Vercel deployment
- [ ] Test production URL

### After Database Changes
- [ ] Create migration file
- [ ] Test migration locally
- [ ] Push migration: `supabase db push`
- [ ] Verify in Supabase Dashboard

### After Edge Function Changes
- [ ] Test function locally
- [ ] Deploy function: `supabase functions deploy <name>`
- [ ] Check logs: `supabase functions logs <name>`
- [ ] Test in production

---

## 💡 COMMON COMMANDS

### Local Development
```bash
pnpm install          # Install dependencies
pnpm run dev          # Start dev server (localhost:5173)
pnpm run build        # Test production build
pnpm run preview      # Preview production build
```

### Supabase CLI
```bash
supabase init                    # Initialize project
supabase login                   # Authenticate
supabase link                    # Link to remote project
supabase db push                 # Push migrations
supabase db pull                 # Pull remote schema
supabase functions deploy <name> # Deploy function
supabase functions logs <name>   # View function logs
supabase secrets set KEY=VALUE   # Set secret
supabase secrets list            # List secrets
```

### Vercel CLI (optional)
```bash
vercel                 # Deploy manually
vercel logs            # View logs
vercel env ls          # List environment variables
vercel env add         # Add environment variable
```

---

## 🚫 WHAT NOT TO DO

❌ **DO NOT** create AWS resources  
❌ **DO NOT** use `/services/*` AWS Lambda code  
❌ **DO NOT** deploy CloudFormation templates  
❌ **DO NOT** manually edit production database via SQL (use migrations)  
❌ **DO NOT** commit `.env` files to Git  
❌ **DO NOT** disable RLS in production  
❌ **DO NOT** expose `service_role` key in frontend  

✅ **DO** use Supabase Edge Functions  
✅ **DO** use Vercel for frontend  
✅ **DO** use RLS for security  
✅ **DO** use migrations for schema changes  
✅ **DO** test locally before deploying  
✅ **DO** monitor logs after deployment  

---

## 📞 SUPPORT RESOURCES

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **React Router:** https://reactrouter.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **Vite:** https://vitejs.dev/

---

## 📄 KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `/src/app/services/supabase.ts` | Supabase client init |
| `/src/app/services/api/supabaseAPI.ts` | API service layer |
| `/src/app/routes.tsx` | React Router config |
| `/vercel.json` | Vercel config |
| `/vite.config.ts` | Vite config |
| `/package.json` | Dependencies |
| `/database/complete-schema.sql` | Full DB schema |
| `/supabase/migrations/*.sql` | DB migrations |

---

**Print Date:** April 23, 2026  
**Version:** 2.0  
**Keep this reference handy for quick deployment tasks!**
