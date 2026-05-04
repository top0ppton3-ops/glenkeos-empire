#!/usr/bin/env bash
set -euo pipefail

echo "🔄 Figma Sync: Starting..."

# 1. Ensure pnpm is installed
if ! command -v pnpm &> /dev/null; then
  echo "⚠️ pnpm not found. Install with: npm install -g pnpm"
  exit 1
fi

# 2. Install dependencies (updates lockfile automatically)
echo "📦 Installing dependencies..."
pnpm install

# 3. Auto-format + lint
echo "✨ Formatting & linting..."
pnpm format || true
pnpm lint:fix || true

# 4. Type check
echo "🔍 Type checking..."
pnpm type-check || true

# 5. Supabase type generation (optional but recommended)
if command -v supabase &> /dev/null; then
  if [ -n "${SUPABASE_PROJECT_ID:-}" ]; then
    echo "🧬 Generating Supabase types..."
    supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > src/types/supabase.ts || true
  else
    echo "⚠️ SUPABASE_PROJECT_ID not set. Skipping typegen."
  fi
else
  echo "⚠️ Supabase CLI not installed. Skipping typegen."
fi

# 6. Build test (ensure it compiles)
echo "🏗️ Testing build..."
pnpm build || {
  echo "❌ Build failed. Please fix errors before committing."
  exit 1
}

# 7. Configure git user if needed
if [ -z "$(git config user.email)" ]; then
  echo "⚙️ Configuring git user..."
  git config user.email "Ahogue912@gmail.com"
  git config user.name "GlenKeos Platform"
fi

# 8. Stage changes
echo "📁 Staging changes..."
git add .

# 9. Commit if there are changes
if ! git diff --cached --quiet; then
  echo "📝 Committing changes..."
  COMMIT_MSG="🔄 Figma Sync: Auto-update from Figma Make [$(date +'%Y-%m-%d %H:%M:%S')]"
  git commit -m "$COMMIT_MSG"
else
  echo "✔️ No changes to commit."
  exit 0
fi

# 10. Push to GitHub (triggers CI/CD)
echo "🚀 Pushing to GitHub..."
git push origin "$(git branch --show-current)"

echo "✅ Figma Sync Complete. CI/CD pipeline triggered."
