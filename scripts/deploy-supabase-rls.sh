#!/bin/bash

# ================================================================
# Deploy GlenKeos RLS Policies to Supabase
# ================================================================

set -e

PROJECT_ID="beswluhdxaphtitaovly"
MIGRATION_FILE="supabase/migrations/20260422180000_hierarchical_tenant_rls.sql"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  GlenKeos - Supabase RLS Deployment                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Project ID: $PROJECT_ID"
echo "Migration: $MIGRATION_FILE"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install with:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "✓ Supabase CLI found"
echo ""

# Link to project
echo "📡 Linking to Supabase project..."
supabase link --project-ref $PROJECT_ID

# Apply migrations
echo ""
echo "🔐 Deploying RLS policies..."
supabase db push

echo ""
echo "✅ RLS policies deployed successfully!"
echo ""
echo "Next steps:"
echo "  1. Verify RLS policies in Supabase Dashboard > Database > Policies"
echo "  2. Test with different user roles (customer, staff, corporate)"
echo "  3. Monitor real-time subscriptions in Dashboard > Realtime"
echo ""
