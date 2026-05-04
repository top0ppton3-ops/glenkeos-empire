# 🚀 DEPLOYMENT INSTRUCTIONS

## Database Seeding

### Option 1: Via Supabase Dashboard (Recommended for first-time setup)

1. Go to https://supabase.com/dashboard/project/beswluhdxaphtitaovly
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `/supabase/seed.sql`
5. Click "Run" to execute the seed script

### Option 2: Via Supabase CLI

```bash
# Make sure you're logged in and linked
supabase login
supabase link --project-ref beswluhdxaphtitaovly

# Run the seed script
supabase db push --file ./supabase/seed.sql
```

## Deploy Edge Functions

Deploy all 33 Edge Functions to Supabase:

```bash
# Set your project reference
PROJECT_REF=beswluhdxaphtitaovly

# Deploy all functions
supabase functions deploy --project-ref $PROJECT_REF

# Or deploy individually
supabase functions deploy create-order --project-ref $PROJECT_REF
supabase functions deploy get-orders --project-ref $PROJECT_REF
supabase functions deploy get-order --project-ref $PROJECT_REF
supabase functions deploy update-order-status --project-ref $PROJECT_REF
supabase functions deploy cancel-order --project-ref $PROJECT_REF
supabase functions deploy assign-driver --project-ref $PROJECT_REF
supabase functions deploy get-drivers --project-ref $PROJECT_REF
supabase functions deploy get-driver --project-ref $PROJECT_REF
supabase functions deploy update-driver-status --project-ref $PROJECT_REF
supabase functions deploy update-driver-location --project-ref $PROJECT_REF
supabase functions deploy get-metrics --project-ref $PROJECT_REF
supabase functions deploy get-analytics --project-ref $PROJECT_REF
supabase functions deploy update-loyalty --project-ref $PROJECT_REF
supabase functions deploy get-loyalty-account --project-ref $PROJECT_REF
supabase functions deploy get-loyalty-transactions --project-ref $PROJECT_REF
supabase functions deploy create-goldkey-booking --project-ref $PROJECT_REF
supabase functions deploy get-goldkey-bookings --project-ref $PROJECT_REF
supabase functions deploy get-goldkey-booking --project-ref $PROJECT_REF
supabase functions deploy update-goldkey-booking --project-ref $PROJECT_REF
supabase functions deploy process-payment --project-ref $PROJECT_REF
supabase functions deploy create-paypal-order --project-ref $PROJECT_REF
supabase functions deploy capture-paypal-order --project-ref $PROJECT_REF
supabase functions deploy paypal-webhook --project-ref $PROJECT_REF
supabase functions deploy send-email --project-ref $PROJECT_REF
supabase functions deploy send-sms --project-ref $PROJECT_REF
supabase functions deploy send-notification --project-ref $PROJECT_REF
```

## Deploy Frontend to Vercel

The frontend auto-deploys on every push to `main`:

```bash
git add .
git commit -m "Complete full-scale development"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Run `pnpm install`
3. Run `pnpm run build`
4. Deploy to https://codebuild-default-webhook-source-lo.vercel.app

## Verify Deployment

### Backend Health Check

```bash
# Test an Edge Function
curl https://beswluhdxaphtitaovly.supabase.co/functions/v1/get-metrics

# Check all functions are deployed
supabase functions list --project-ref beswluhdxaphtitaovly
```

### Frontend Health Check

Visit:
- https://codebuild-default-webhook-source-lo.vercel.app
- https://codebuild-default-webhook-source-lo.vercel.app/customer
- https://codebuild-default-webhook-source-lo.vercel.app/employee
- https://codebuild-default-webhook-source-lo.vercel.app/manager
- https://codebuild-default-webhook-source-lo.vercel.app/corporate
- https://codebuild-default-webhook-source-lo.vercel.app/goldkey

## Environment Variables

Verify these are set in Vercel Dashboard:

```env
VITE_SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Verify these are set in Supabase (for Edge Functions):

```bash
supabase secrets list --project-ref beswluhdxaphtitaovly
```

Should show:
- PAYPAL_CLIENT_ID
- PAYPAL_CLIENT_SECRET
- TWILIO_AUTH_TOKEN
- TWILIO_ACCOUNT_SID
- SENDGRID_API_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

## Production Checklist

- [ ] Database seed data executed
- [ ] All 33 Edge Functions deployed
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Test customer flow (Ghetto Eats order)
- [ ] Test GoldKey booking flow
- [ ] Test employee portal (view assignments)
- [ ] Test manager portal (view orders)
- [ ] Test corporate portal (view analytics)
- [ ] PayPal payment integration working
- [ ] Email notifications working
- [ ] SMS notifications working

## Troubleshooting

### Build fails on Vercel
```bash
# Test locally first
pnpm run build
```

### Edge Function fails
```bash
# Check logs in Supabase Dashboard
# Or via CLI:
supabase functions logs <function-name> --project-ref beswluhdxaphtitaovly
```

### Database connection issues
- Check RLS policies are enabled
- Verify user has valid JWT token
- Check network tab for 401/403 errors

---

**Status**: Ready for production deployment  
**Last Updated**: 2026-05-03
