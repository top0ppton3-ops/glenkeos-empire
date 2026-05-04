#!/bin/bash

# GlenKeos - Push to GitHub Script
# Repository: Glenkeos/Finalizefigmafilestructure

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PUSHING GLENKEOS TO GITHUB                                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Repository info
REPO="https://github.com/Glenkeos/Finalizefigmafilestructure.git"

echo "📊 Repository: $REPO"
echo "📁 Files ready: 344 files, 79,872 lines"
echo "💾 Commit: 0ea0689 - GlenKeos Hybrid Backend Platform"
echo ""

# Check if remote exists
if git remote | grep -q origin; then
    echo "✓ Remote 'origin' already configured"
else
    echo "Adding remote..."
    git remote add origin "$REPO"
    echo "✓ Remote added"
fi

# Ensure on main branch
echo ""
echo "Setting branch to 'main'..."
git branch -M main
echo "✓ Branch set to main"

# Push to GitHub
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PUSHING TO GITHUB..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You will be prompted for GitHub credentials:"
echo "  Username: Your GitHub username"
echo "  Password: Personal Access Token (NOT your GitHub password)"
echo ""
echo "Generate token at: https://github.com/settings/tokens/new"
echo "Required scopes: repo (full control of private repositories)"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  ✅ SUCCESSFULLY PUSHED TO GITHUB!                         ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🔗 View at: https://github.com/Glenkeos/Finalizefigmafilestructure"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. Visit repository and verify all files are present"
    echo "  2. Follow QUICK_START.md to deploy in 30 minutes"
    echo "  3. Share repository with your team"
    echo ""
else
    echo ""
    echo "❌ Push failed. Common solutions:"
    echo ""
    echo "1. AUTHENTICATION:"
    echo "   - Use Personal Access Token, not password"
    echo "   - Generate at: https://github.com/settings/tokens/new"
    echo "   - Select 'repo' scope"
    echo ""
    echo "2. PERMISSIONS:"
    echo "   - Verify you have write access to Glenkeos/Finalizefigmafilestructure"
    echo "   - Repository must exist and you must be a collaborator"
    echo ""
    echo "3. SSH ALTERNATIVE:"
    echo "   git remote set-url origin git@github.com:Glenkeos/Finalizefigmafilestructure.git"
    echo "   git push -u origin main"
    echo ""
fi
