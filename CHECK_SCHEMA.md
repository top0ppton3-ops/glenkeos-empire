# Check Your Actual Schema

Run this in Supabase SQL Editor to see what columns you have:

```sql
-- Check orders table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check payments table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

Tell me what you see for these key columns:
- orders: Do you have `paypal_order_id` or is PayPal ID stored in `metadata`?
- payments: Do you have `paypal_order_id` or `external_payment_id`?
