#!/bin/bash
# ================================================================
# GLENKEOS RLS DEPLOYMENT SCRIPT
# Renames migrations to proper timestamp format and deploys to Supabase
# ================================================================

set -e  # Exit on error

echo "🚀 GlenKeos - Deploying Hierarchical Tenant RLS Policies"
echo "=========================================================="
echo ""

# Check if in correct directory
if [ ! -d "supabase/migrations" ]; then
    echo "❌ Error: Must run from project root (where supabase/ folder exists)"
    exit 1
fi

echo "📋 Step 1: Cleaning up old migration files..."
echo ""

# Delete old incorrectly named files
rm -f supabase/migrations/0001_complete_schema.sql
rm -f supabase/migrations/0002_payments_loyalty_tracking.sql
rm -f supabase/migrations/0003_hierarchical_tenant_rls.sql
rm -f supabase/migrations/20260422150000_complete_schema.sql

echo "✅ Old files removed"
echo ""

echo "📋 Step 2: Verifying timestamped migration files exist..."
echo ""

# Check if files were already renamed
if [ ! -f "supabase/migrations/20260422180000_hierarchical_tenant_rls.sql" ]; then
    echo "❌ Error: RLS migration file not found!"
    echo "Expected: supabase/migrations/20260422180000_hierarchical_tenant_rls.sql"
    exit 1
fi

echo "✅ Migration files ready:"
ls -lh supabase/migrations/*.sql
echo ""

echo "📋 Step 3: Checking Supabase CLI..."
echo ""

if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Install it:"
    echo "  macOS/Linux: brew install supabase/tap/supabase"
    echo "  Windows:     scoop install supabase"
    echo "  npm:         npm install -g supabase"
    exit 1
fi

SUPABASE_VERSION=$(supabase --version)
echo "✅ Supabase CLI installed: $SUPABASE_VERSION"
echo ""

echo "📋 Step 4: Checking project link..."
echo ""

if [ ! -f ".git/config" ] || ! grep -q "supabase" supabase/config.toml 2>/dev/null; then
    echo "⚠️  Project not linked yet. Linking now..."
    echo ""
    echo "This will:"
    echo "  1. Authenticate you with Supabase"
    echo "  2. Link to project: beswluhdxaphtitaovly"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
    
    echo "Running: supabase login"
    supabase login
    
    echo "Running: supabase link --project-ref beswluhdxaphtitaovly"
    supabase link --project-ref beswluhdxaphtitaovly
else
    echo "✅ Project already linked"
fi
echo ""

echo "📋 Step 5: Checking migration status..."
echo ""

echo "Pending migrations:"
supabase migration list --linked || true
echo ""

echo "📋 Step 6: DEPLOYING RLS POLICIES..."
echo ""
echo "⚠️  WARNING: This will modify your live database!"
echo "This migration will:"
echo "  • Drop old basic RLS policies"
echo "  • Create 3 helper functions in auth schema"
echo "  • Create ~60+ hierarchical tenant RLS policies"
echo "  • Enable RLS on all core tables"
echo ""
read -p "Deploy to production? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "🚀 Pushing migrations to Supabase..."
supabase db push

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "📊 Verification Steps:"
echo ""
echo "1. Check helper functions were created:"
echo "   SELECT routine_name FROM information_schema.routines"
echo "   WHERE routine_schema = 'auth'"
echo "   AND routine_name IN ('user_tenant_id', 'has_corporate_access', 'customer_id');"
echo ""
echo "2. Check RLS policies exist:"
echo "   SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';"
echo "   -- Should return 60+ policies"
echo ""
echo "3. Test corporate access function:"
echo "   SELECT auth.user_tenant_id();"
echo "   SELECT auth.has_corporate_access();"
echo ""
echo "🎯 Next Steps:"
echo "   1. Configure JWT metadata for users (see /TENANT_JWT_SETUP_GUIDE.md)"
echo "   2. Deploy PayPal secrets (3 environment variables)"
echo "   3. Run final 2 SQL scripts"
echo "   4. GO LIVE! 🎉"
echo ""
