#!/bin/bash
set -e

echo "🚀 Deploying RLS to Supabase..."

supabase link --project-ref beswluhdxaphtitaovly
supabase db push

echo "✅ DONE!"
echo ""
echo "Verify with:"
echo "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';"
