#!/bin/bash

# GlenKeos - Push to GitHub (Branch 12)
# Repository: Glenkeos/Finalizefigmafilestructure

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PUSHING GLENKEOS TO GITHUB (BRANCH 12)                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Repository info
REPO="https://github.com/Glenkeos/Finalizefigmafilestructure.git"
BRANCH="12"

echo "📊 Repository: $REPO"
echo "🌿 Branch: $BRANCH"
echo "📁 Files: 75,157 files, 3.7M+ lines"
echo "💾 Commit: e44a2dd - GlenKeos Platform (Complete)"
echo ""

# Check git status
echo "Current branch:"
git branch
echo ""

# Push to GitHub
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PUSHING TO GITHUB (BRANCH $BRANCH)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You will be prompted for GitHub credentials:"
echo "  Username: Your GitHub username"
echo "  Password: Personal Access Token"
echo ""
echo "Generate token at: https://github.com/settings/tokens/new"
echo "Required scopes: repo"
echo ""

git push -u origin $BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  ✅ SUCCESSFULLY PUSHED TO GITHUB!                         ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🔗 Repository: https://github.com/Glenkeos/Finalizefigmafilestructure"
    echo "🌿 Branch: $BRANCH"
    echo ""
    echo "📋 What's Included:"
    echo "  ✅ Complete hybrid backend (CloudFormation + Lambda)"
    echo "  ✅ Frontend (139 TypeScript files, 75 components)"
    echo "  ✅ Database schema (14 tables)"
    echo "  ✅ Documentation (deployment guides)"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Visit repository and verify files"
    echo "  2. Share with team"
    echo "  3. Follow QUICK_START.md to deploy"
    echo ""
else
    echo ""
    echo "❌ Push failed. Solutions:"
    echo ""
    echo "1. Use Personal Access Token (not password)"
    echo "2. Generate at: https://github.com/settings/tokens/new"
    echo "3. Or try SSH:"
    echo "   git remote set-url origin git@github.com:Glenkeos/Finalizefigmafilestructure.git"
    echo "   git push -u origin $BRANCH"
    echo ""
fi
