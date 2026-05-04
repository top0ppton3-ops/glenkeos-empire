#!/bin/bash

# ================================================================
# Enable Supabase Realtime for GlenKeos Tables
# ================================================================

set -e

PROJECT_ID="beswluhdxaphtitaovly"
PROJECT_URL="https://beswluhdxaphtitaovly.supabase.co"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  GlenKeos - Enable Supabase Realtime                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Project: $PROJECT_URL"
echo ""

# Tables to enable realtime for
TABLES=(
  "orders"
  "order_items"
  "drivers"
  "inventory_items"
  "menu_items"
  "notifications"
)

echo "Enabling Realtime for tables:"
for table in "${TABLES[@]}"; do
  echo "  - $table"
done
echo ""

# SQL to enable realtime
SQL_FILE="/tmp/enable_realtime.sql"

cat > $SQL_FILE <<EOF
-- Enable Realtime for GlenKeos Tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Verify realtime is enabled
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
EOF

echo "📝 SQL script created at $SQL_FILE"
echo ""
echo "⚡ To enable realtime, run this SQL in Supabase SQL Editor:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat $SQL_FILE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Or apply via Supabase CLI:"
echo "  supabase db execute -f $SQL_FILE --project-ref $PROJECT_ID"
echo ""
