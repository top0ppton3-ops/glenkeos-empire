# GlenKeos Supabase Deployment Guide

## Project Information
- **Project ID**: `beswluhdxaphtitaovly`
- **Project URL**: https://beswluhdxaphtitaovly.supabase.co
- **Production URL**: https://codebuild-default-webhook-source.vercel.app

## Deployment Checklist

### ✅ 1. Database Schema
The complete schema is in `PASTE_INTO_SUPABASE_SQL_EDITOR.sql` or `database/COMPLETE_SCHEMA.sql`.

**Apply schema:**
```bash
# Option 1: Via Supabase Dashboard
# Copy contents of PASTE_INTO_SUPABASE_SQL_EDITOR.sql
# Paste into Supabase Dashboard > SQL Editor > New Query > Execute

# Option 2: Via Supabase CLI
supabase db push
```

### ✅ 2. Row Level Security (RLS) Policies
Multi-tenant RLS policies with hierarchical access control are in `supabase/migrations/20260422180000_hierarchical_tenant_rls.sql`.

**Deploy RLS:**
```bash
./scripts/deploy-supabase-rls.sh
```

**Key Features:**
- Corporate access (glenkeos) sees all brands
- Brand staff (chic-on-chain, ghetto-eats, goldkey) see only their tenant
- Customers see only their own data
- JWT-based authentication with app_metadata

### ✅ 3. Enable Realtime Subscriptions
Enable real-time updates for live order tracking, driver locations, and inventory.

**Enable realtime:**
```bash
./scripts/enable-realtime.sh
```

Or run this SQL in Supabase SQL Editor:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### ✅ 4. Edge Functions
17 Edge Functions are deployed in `supabase/functions/`:

**Core Functions:**
- `create-order` - Order creation with validation
- `assign-driver` - Driver assignment logic
- `process-payment` - Payment processing
- `create-paypal-order` - PayPal order creation
- `capture-paypal-order` - PayPal payment capture
- `paypal-webhook` - PayPal webhook handler

**Notification Functions:**
- `send-email` - Email notifications
- `send-sms` - SMS notifications via Twilio
- `send-notification` - Push notifications

**Tracking Functions:**
- `track-driver` - Driver location tracking
- `update-driver-location` - Location updates
- `get-driver-location` - Retrieve driver position

**Security Functions:**
- `sso-auth` - SSO authentication
- `mfa-verify` - Multi-factor authentication
- `compliance-report` - Compliance reporting

**Deploy Edge Functions:**
```bash
supabase functions deploy --project-ref beswluhdxaphtitaovly
```

### ✅ 5. Environment Variables

**Set in Supabase Dashboard > Settings > Edge Functions:**
```bash
PAYPAL_CLIENT_ID=<your-paypal-client-id>
PAYPAL_CLIENT_SECRET=<your-paypal-client-secret>
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
SENDGRID_API_KEY=<your-sendgrid-key>
```

**Set in Vercel > Settings > Environment Variables:**
```bash
VITE_SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### ✅ 6. Authentication Configuration

**Supabase Dashboard > Authentication > Settings:**
- ✅ Enable email signup
- ✅ Site URL: `https://codebuild-default-webhook-source.vercel.app`
- ✅ Redirect URLs: `http://localhost:5173`, `https://codebuild-default-webhook-source.vercel.app`
- ✅ JWT expiry: 3600 seconds (1 hour)

**Configure user metadata:**
```sql
-- Example: Set tenant_id for a user
UPDATE auth.users
SET raw_app_metadata = raw_app_metadata || 
  '{"tenant_id": "chic-on-chain", "tenant_access": "chic-on-chain"}'::jsonb
WHERE email = 'user@example.com';
```

### ✅ 7. Database Triggers (Auto-applied with schema)

**Order Status Trigger:**
- Automatically creates notifications when order status changes
- Updates estimated delivery times

**Inventory Trigger:**
- Alerts when inventory falls below threshold
- Auto-reorders for critical stockouts

**Driver Assignment Trigger:**
- Updates order status when driver is assigned
- Sends notification to driver

### ✅ 8. Testing Realtime Connections

**Test in browser console:**
```javascript
import { supabase } from './utils/supabase/client';

// Subscribe to order changes
const channel = supabase
  .channel('test-orders')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders'
  }, (payload) => {
    console.log('Order changed:', payload);
  })
  .subscribe();

// Unsubscribe when done
channel.unsubscribe();
```

### ✅ 9. Monitor & Verify

**Check in Supabase Dashboard:**
1. **Database > Tables** - Verify all tables created
2. **Database > Policies** - Verify RLS policies active
3. **Database > Publications** - Verify realtime enabled
4. **Edge Functions** - Verify all functions deployed
5. **Logs** - Monitor real-time activity

**Verify locally:**
```bash
# Check Supabase connection
curl https://beswluhdxaphtitaovly.supabase.co/rest/v1/ \
  -H "apikey: <your-anon-key>"

# Test Edge Function
curl -X POST https://beswluhdxaphtitaovly.supabase.co/functions/v1/create-order \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## Production Readiness

### Security ✅
- [x] RLS policies enabled on all tables
- [x] JWT-based authentication
- [x] Multi-tenant isolation
- [x] Secure Edge Functions with auth checks

### Performance ✅
- [x] Database indexes on frequently queried fields
- [x] Real-time subscriptions for live updates
- [x] Edge Functions for serverless scaling
- [x] Connection pooling enabled

### Monitoring ✅
- [x] Supabase Dashboard metrics
- [x] Edge Function logs
- [x] Database query performance
- [x] Real-time connection monitoring

## Support

**Supabase Documentation:**
- RLS: https://supabase.com/docs/guides/auth/row-level-security
- Realtime: https://supabase.com/docs/guides/realtime
- Edge Functions: https://supabase.com/docs/guides/functions

**GlenKeos Internal:**
- Backend API: `/src/app/services/api/supabaseAPI.ts`
- Realtime Hooks: `/src/app/hooks/useRealtime*.ts`
- Auth Context: `/src/app/contexts/AuthContext.tsx`

---

**Last Updated**: April 24, 2026  
**Version**: 1.0.0
