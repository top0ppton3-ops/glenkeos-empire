# Git Configuration Setup Guide

## Critical: Fix Git Email for Vercel Deployment

Your deployment is currently blocked because the commit email `engineering@glenkeos.com` cannot be matched to a GitHub account.

### Immediate Fix Required

Run these commands in your terminal to configure Git with the correct email:

```bash
# Set your git email to match your GitHub/Vercel account
git config user.email "Ahogue912@gmail.com"
git config user.name "Your Name"

# Verify the configuration
git config user.email
git config user.name
```

### For Global Configuration (Recommended)

If you want this email to be used for all Git repositories on your system:

```bash
# Set global git configuration
git config --global user.email "Ahogue912@gmail.com"
git config --global user.name "Your Name"

# Verify global configuration
git config --global user.email
git config --global user.name
```

### Fix Existing Commits (If Needed)

If you need to update the email on recent commits:

```bash
# Amend the last commit with correct email
git commit --amend --reset-author --no-edit

# Force push to update remote
git push --force-with-lease
```

### Verify Deployment Configuration

1. **GitHub Account Email**: Ensure `Ahogue912@gmail.com` is verified in your GitHub account settings
2. **Vercel Account**: Verify you're logged into Vercel with `Ahogue912@gmail.com`
3. **Repository Access**: Confirm the GitHub repository is linked to your Vercel project

### Next Steps After Email Configuration

Once you've configured the correct email, commit and push your changes:

```bash
# Stage all changes
git add .

# Commit with proper email
git commit -m "fix: CI/CD configuration and deployment setup"

# Push to trigger deployment
git push origin main
```

## Additional Git Best Practices

### Branch Protection

Consider setting up branch protection rules on GitHub:
- Require pull request reviews before merging to `main`
- Require status checks to pass before merging
- Require branches to be up to date before merging

### SSH Keys (Optional but Recommended)

For more secure Git operations, consider using SSH keys:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "Ahogue912@gmail.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key to clipboard and add to GitHub
cat ~/.ssh/id_ed25519.pub
```

Then add the public key to your GitHub account at: https://github.com/settings/keys

## Troubleshooting

### If commits still show wrong email:

```bash
# Check current configuration
git config --list

# Check repository-specific config
cat .git/config

# Remove any conflicting configuration
git config --unset user.email
git config --unset user.name

# Then set correct values
git config user.email "Ahogue912@gmail.com"
git config user.name "Your Name"
```

### If deployment still fails:

1. Check Vercel dashboard for detailed error messages
2. Verify all GitHub Actions secrets are set correctly
3. Ensure the repository has proper access permissions in Vercel
4. Check that the Vercel project is linked to the correct GitHub repository

## Required GitHub Secrets for CI/CD

After fixing the Git email, ensure these secrets are configured in your GitHub repository:

### Vercel Secrets
- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

### Supabase Secrets
- `SUPABASE_ACCESS_TOKEN` - Supabase personal access token
- `SUPABASE_PROJECT_ID` - Supabase project ID (beswluhdxaphtitaovly)
- `SUPABASE_DB_PASSWORD` - Database password

### How to Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its name and value
5. Click **Add secret**

## Contact

If you continue to experience issues, verify:
- Email `Ahogue912@gmail.com` is the primary email on both GitHub and Vercel
- You have push access to the repository
- Vercel project is correctly linked to the GitHub repository
