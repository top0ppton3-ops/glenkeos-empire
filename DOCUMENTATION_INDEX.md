# 📚 GlenKeos Documentation Index

**Last Updated:** April 23, 2026  
**Architecture:** 100% Vercel + Supabase (ZERO AWS)

---

## 🚀 START HERE

If you're new or need a quick overview:

1. **[START_HERE.md](./START_HERE.md)** - Your first stop, quick start guide
2. **[CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md)** - **READ THIS FIRST** - Official architecture truth
3. **[README.md](./README.md)** - Main project documentation

---

## 📖 CORE DOCUMENTATION

### Architecture & Design
| Document | Purpose | Priority |
|----------|---------|----------|
| **[CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md)** | **OFFICIAL** architecture (Vercel + Supabase) | ⭐⭐⭐ CRITICAL |
| **[ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md)** | Complete architecture overview with diagrams | ⭐⭐⭐ CRITICAL |
| **[VERCEL_SUPABASE_ARCHITECTURE.md](./VERCEL_SUPABASE_ARCHITECTURE.md)** | Detailed architecture deep-dive | ⭐⭐⭐ CRITICAL |
| **[AWS_CLEANUP_COMPLETE.md](./AWS_CLEANUP_COMPLETE.md)** | AWS removal & migration details | ⭐⭐ Important |

### Deployment & Configuration
| Document | Purpose | Priority |
|----------|---------|----------|
| **[VERCEL_DEPLOYMENT_CONFIG.md](./VERCEL_DEPLOYMENT_CONFIG.md)** | Complete deployment configuration | ⭐⭐⭐ CRITICAL |
| **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)** | Quick command reference (print this!) | ⭐⭐⭐ CRITICAL |
| **[README.md](./README.md)** | Quick start and overview | ⭐⭐ Important |
| **[START_HERE.md](./START_HERE.md)** | Getting started guide | ⭐⭐ Important |

---

## 🗂️ DOCUMENTATION BY TOPIC

### 🏗️ Architecture
- **[CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md)** - Official architecture (READ THIS!)
- **[ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md)** - Complete overview
- **[VERCEL_SUPABASE_ARCHITECTURE.md](./VERCEL_SUPABASE_ARCHITECTURE.md)** - Detailed architecture
- **[SYSTEM_ARCHITECTURE_FINAL.md](./SYSTEM_ARCHITECTURE_FINAL.md)** - Legacy system architecture

### 🚀 Deployment
- **[VERCEL_DEPLOYMENT_CONFIG.md](./VERCEL_DEPLOYMENT_CONFIG.md)** - Deployment guide
- **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)** - Quick commands
- **[AWS_CLEANUP_COMPLETE.md](./AWS_CLEANUP_COMPLETE.md)** - AWS migration details

### 🗄️ Database
- **[/database/complete-schema.sql](./database/complete-schema.sql)** - Full database schema
- **[/database/DATABASE_SCHEMA.md](./database/DATABASE_SCHEMA.md)** - Schema documentation
- **[/supabase/migrations/](./supabase/migrations/)** - Migration files

### 🔐 Security & RLS
- **[VERCEL_SUPABASE_ARCHITECTURE.md](./VERCEL_SUPABASE_ARCHITECTURE.md)** - See "Security Model" section
- **[/supabase/migrations/20260422180000_hierarchical_tenant_rls.sql](./supabase/migrations/20260422180000_hierarchical_tenant_rls.sql)** - RLS policies

### 📡 API & Backend
- **[/src/app/services/api/supabaseAPI.ts](./src/app/services/api/supabaseAPI.ts)** - Complete API service layer
- **[/supabase/functions/](./supabase/functions/)** - All Edge Functions

---

## ⚠️ LEGACY DOCUMENTATION (IGNORE FOR PRODUCTION)

The following documents reference **AWS infrastructure that is NOT used**. They exist for historical reference only:

### AWS Legacy Files (DO NOT USE)
- ❌ `/EXECUTION_ROADMAP.md` - Contains AWS deployment steps (OUTDATED)
- ❌ `/QUICK_START.md` - References AWS deployment (OUTDATED)
- ❌ `/DEPLOYMENT_GUIDE.md` - AWS deployment guide (OUTDATED)
- ❌ `/BACKEND_IMPLEMENTATION_STATUS.md` - AWS backend status (OUTDATED)
- ❌ `/cloudformation/` - AWS CloudFormation templates (NOT DEPLOYED)
- ❌ `/terraform/` - AWS Terraform configs (NOT DEPLOYED)
- ❌ `/services/` - AWS Lambda code (NOT DEPLOYED)

### Documentation Files with AWS References
These files have **historical AWS references** but are **not accurate** for production:
- `/EXECUTION_COMPLETE.md` - References AWS discovery
- `/MASTER_INDEX.md` - Lists AWS CloudFormation files
- `/generated/execution/LIVE_INFRASTRUCTURE_DISCOVERY.md` - AWS discovery report
- `/src/imports/pasted_text/*` - Various imported specs with AWS mentions

**If you see AWS mentioned anywhere, ignore it. Use [CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md) instead.**

---

## 📋 QUICK LINKS BY USE CASE

### "I need to deploy changes"
1. Read: **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)**
2. Run: `git push origin main` (auto-deploys to Vercel)

### "I need to understand the architecture"
1. Read: **[CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md)**
2. Read: **[ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md)**
3. Reference: **[VERCEL_SUPABASE_ARCHITECTURE.md](./VERCEL_SUPABASE_ARCHITECTURE.md)**

### "I need to configure Vercel/Supabase"
1. Read: **[VERCEL_DEPLOYMENT_CONFIG.md](./VERCEL_DEPLOYMENT_CONFIG.md)**
2. Quick ref: **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)**

### "I need to work with the database"
1. Schema: **[/database/complete-schema.sql](./database/complete-schema.sql)**
2. Migrations: **[/supabase/migrations/](./supabase/migrations/)**
3. API: **[/src/app/services/api/supabaseAPI.ts](./src/app/services/api/supabaseAPI.ts)**

### "I need to deploy Edge Functions"
1. Code: **[/supabase/functions/](./supabase/functions/)**
2. Commands: **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)**

### "Someone mentioned AWS"
1. Show them: **[CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md)**
2. Explain: **[AWS_CLEANUP_COMPLETE.md](./AWS_CLEANUP_COMPLETE.md)**
3. Emphasize: **AWS provides ZERO services**

---

## 🎯 PRIORITY READING ORDER

### For New Team Members
1. ⭐⭐⭐ **[START_HERE.md](./START_HERE.md)** - Start here!
2. ⭐⭐⭐ **[CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md)** - Understand the stack
3. ⭐⭐⭐ **[README.md](./README.md)** - Project overview
4. ⭐⭐ **[ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md)** - Deep dive
5. ⭐⭐ **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)** - Common commands

### For Deployment Engineers
1. ⭐⭐⭐ **[VERCEL_DEPLOYMENT_CONFIG.md](./VERCEL_DEPLOYMENT_CONFIG.md)**
2. ⭐⭐⭐ **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)**
3. ⭐⭐ **[CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md)**
4. ⭐ **[AWS_CLEANUP_COMPLETE.md](./AWS_CLEANUP_COMPLETE.md)**

### For Frontend Developers
1. ⭐⭐⭐ **[README.md](./README.md)**
2. ⭐⭐ **[/src/app/routes.tsx](./src/app/routes.tsx)** - Routing
3. ⭐⭐ **[/src/app/services/api/supabaseAPI.ts](./src/app/services/api/supabaseAPI.ts)** - API layer
4. ⭐ **[CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md)** - Architecture

### For Backend Developers
1. ⭐⭐⭐ **[VERCEL_SUPABASE_ARCHITECTURE.md](./VERCEL_SUPABASE_ARCHITECTURE.md)**
2. ⭐⭐⭐ **[/database/complete-schema.sql](./database/complete-schema.sql)**
3. ⭐⭐ **[/supabase/functions/](./supabase/functions/)** - Edge Functions
4. ⭐⭐ **[/src/app/services/api/supabaseAPI.ts](./src/app/services/api/supabaseAPI.ts)**

### For DevOps/Infrastructure
1. ⭐⭐⭐ **[CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md)**
2. ⭐⭐⭐ **[VERCEL_DEPLOYMENT_CONFIG.md](./VERCEL_DEPLOYMENT_CONFIG.md)**
3. ⭐⭐⭐ **[AWS_CLEANUP_COMPLETE.md](./AWS_CLEANUP_COMPLETE.md)**
4. ⭐⭐ **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)**

---

## 🔍 SEARCH BY KEYWORD

### Architecture
- Main: **[CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md)**
- Detailed: **[VERCEL_SUPABASE_ARCHITECTURE.md](./VERCEL_SUPABASE_ARCHITECTURE.md)**
- Summary: **[ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md)**

### Deployment
- Guide: **[VERCEL_DEPLOYMENT_CONFIG.md](./VERCEL_DEPLOYMENT_CONFIG.md)**
- Quick Ref: **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)**

### Vercel
- **[VERCEL_DEPLOYMENT_CONFIG.md](./VERCEL_DEPLOYMENT_CONFIG.md)**
- **[VERCEL_SUPABASE_ARCHITECTURE.md](./VERCEL_SUPABASE_ARCHITECTURE.md)**
- **[vercel.json](./vercel.json)**

### Supabase
- Architecture: **[VERCEL_SUPABASE_ARCHITECTURE.md](./VERCEL_SUPABASE_ARCHITECTURE.md)**
- Client: **[/src/app/services/supabase.ts](./src/app/services/supabase.ts)**
- API: **[/src/app/services/api/supabaseAPI.ts](./src/app/services/api/supabaseAPI.ts)**
- Functions: **[/supabase/functions/](./supabase/functions/)**

### Database
- Schema: **[/database/complete-schema.sql](./database/complete-schema.sql)**
- Migrations: **[/supabase/migrations/](./supabase/migrations/)**

### Authentication
- Context: **[/src/app/contexts/AuthContext.tsx](./src/app/contexts/AuthContext.tsx)**
- RLS: **[/supabase/migrations/20260422180000_hierarchical_tenant_rls.sql](./supabase/migrations/20260422180000_hierarchical_tenant_rls.sql)**

### AWS (Legacy)
- Cleanup: **[AWS_CLEANUP_COMPLETE.md](./AWS_CLEANUP_COMPLETE.md)**
- ⚠️ All AWS code is legacy and NOT deployed

---

## 📞 DOCUMENTATION SOURCES

### Official GlenKeos Docs (USE THESE)
- ✅ All files listed in "CORE DOCUMENTATION" section above
- ✅ All files in `/supabase/` directory
- ✅ All files in `/src/app/` directory
- ✅ `/vercel.json`, `/vite.config.ts`, `/package.json`

### Legacy/Outdated Docs (DON'T USE)
- ❌ Files in `/services/` (AWS Lambda)
- ❌ Files in `/cloudformation/` (AWS infrastructure)
- ❌ Files in `/terraform/` (AWS infrastructure)
- ❌ Files in `/scripts/` with "aws" in name

---

## 🎓 LEARNING PATH

### Week 1: Understanding the Stack
1. Day 1: Read **[START_HERE.md](./START_HERE.md)** and **[README.md](./README.md)**
2. Day 2: Read **[CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md)**
3. Day 3: Read **[ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md)**
4. Day 4: Explore codebase: `/src/app/`
5. Day 5: Review database: `/database/complete-schema.sql`

### Week 2: Deployment & Operations
1. Day 1: Read **[VERCEL_DEPLOYMENT_CONFIG.md](./VERCEL_DEPLOYMENT_CONFIG.md)**
2. Day 2: Practice with **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)**
3. Day 3: Deploy changes to staging
4. Day 4: Work with Edge Functions: `/supabase/functions/`
5. Day 5: Monitor production deployments

### Week 3: Advanced Topics
1. Day 1: Study RLS policies
2. Day 2: Review API layer: `supabaseAPI.ts`
3. Day 3: Real-time subscriptions
4. Day 4: Payment integration (PayPal)
5. Day 5: Multi-tenant architecture

---

## 🆘 TROUBLESHOOTING DOCS

### Build Issues
- **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)** - "Quick Troubleshooting" section
- **[VERCEL_DEPLOYMENT_CONFIG.md](./VERCEL_DEPLOYMENT_CONFIG.md)** - "Common Issues" section

### Database Issues
- **[VERCEL_SUPABASE_ARCHITECTURE.md](./VERCEL_SUPABASE_ARCHITECTURE.md)** - "Security Model" section
- Check RLS policies in `/supabase/migrations/`

### Auth Issues
- **[/src/app/contexts/AuthContext.tsx](./src/app/contexts/AuthContext.tsx)** - Implementation
- **[VERCEL_DEPLOYMENT_CONFIG.md](./VERCEL_DEPLOYMENT_CONFIG.md)** - Auth flow explanation

---

## ✅ DOCUMENTATION CHECKLIST

Before deploying or making changes:

- [ ] Read **[CORRECT_ARCHITECTURE.md](./CORRECT_ARCHITECTURE.md)**
- [ ] Understand we use ZERO AWS services
- [ ] Know Vercel hosts frontend only
- [ ] Know Supabase hosts all backend
- [ ] Have **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)** handy
- [ ] Ignore all AWS references in legacy files

---

## 📧 DOCUMENTATION FEEDBACK

If you find:
- Incorrect information (especially AWS references)
- Missing documentation
- Unclear explanations
- Broken links

**Action:** Update this index or create an issue.

---

**Index Version:** 1.0  
**Last Updated:** April 23, 2026  
**Maintained by:** GlenKeos Platform Team

---

# USE THIS INDEX TO NAVIGATE THE DOCS! 📚
