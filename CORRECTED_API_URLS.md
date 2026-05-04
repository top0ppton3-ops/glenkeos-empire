# ✅ Corrected GlenKeos API URLs

## Important: Correct URL Structure

In the Figma Make environment with Supabase, the function is located at:
- **Directory**: `/supabase/functions/server/`
- **Function Name**: `server` (from directory)
- **Route Prefix**: `/make-server-89a553ba` (per Figma Make requirements)

---

## 🔗 Correct Base URL

```
https://beswluhdxaphtitaovly.supabase.co/functions/v1/server/make-server-89a553ba
```

**Breakdown:**
- `https://beswluhdxaphtitaovly.supabase.co` - Your Supabase project
- `/functions/v1` - Supabase Edge Functions endpoint
- `/server` - Function name (from directory `/supabase/functions/server/`)
- `/make-server-89a553ba` - Route prefix in Hono app

---

## ✅ Test Commands (CORRECTED)

### 1. Health Check

```bash
curl https://beswluhdxaphtitaovly.supabase.co/functions/v1/server/make-server-89a553ba/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-21T12:34:56.789Z"
}
```

### 2. Create Customer

```bash
curl -X POST https://beswluhdxaphtitaovly.supabase.co/functions/v1/server/make-server-89a553ba/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDY2MzgsImV4cCI6MjA5MjM4MjYzOH0.XMxin_yjhgp3si6G_PFAWdrsaBzdJgfJcgyc-NQEXhw" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "phone": "+1234567890"
  }'
```

### 3. Get Analytics Dashboard

```bash
curl https://beswluhdxaphtitaovly.supabase.co/functions/v1/server/make-server-89a553ba/analytics/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDY2MzgsImV4cCI6MjA5MjM4MjYzOH0.XMxin_yjhgp3si6G_PFAWdrsaBzdJgfJcgyc-NQEXhw"
```

---

## 📋 Complete Endpoint List

All endpoints use the base URL: `https://beswluhdxaphtitaovly.supabase.co/functions/v1/server/make-server-89a553ba`

### Health & System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Get customer by ID |
| GET | `/customers/email/:email` | Get customer by email |
| GET | `/customers` | List all customers |

### Stores

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stores` | Create store |
| GET | `/stores/:id` | Get store by ID |
| GET | `/stores?brand=BRAND` | List stores (filterable) |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order |
| GET | `/orders/:id` | Get order by ID |
| PUT | `/orders/:id/status` | Update order status |
| GET | `/orders?status=&customer_id=&brand=` | List orders (filterable) |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/inventory` | Create inventory item |
| GET | `/inventory/:id` | Get inventory item |
| PUT | `/inventory/:id/quantity` | Update quantity |
| GET | `/inventory?store_id=&category=` | List inventory (filterable) |

### Drivers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/drivers` | Register driver |
| GET | `/drivers/:id` | Get driver by ID |
| POST | `/drivers/:driverId/assign/:orderId` | Assign driver to order |
| GET | `/drivers?status=STATUS` | List drivers (filterable) |

### Staff

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/staff` | Create staff member |
| GET | `/staff?store_id=&role=` | List staff (filterable) |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments` | Process payment |
| GET | `/payments/:id` | Get payment by ID |

### Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/metrics` | Log metric |
| GET | `/metrics?name=NAME` | Get metrics (filterable) |

### Compliance

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/compliance` | Log compliance event |
| GET | `/compliance?event_type=TYPE` | Get compliance events (filterable) |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/notifications` | Send notification |
| GET | `/notifications/user/:userId` | Get user notifications |

### GRC (Governance, Risk, Compliance)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/grc/policies` | Create policy |
| POST | `/grc/risks` | Log risk event |
| GET | `/grc/policies` | Get all policies |
| GET | `/grc/risks` | Get all risks |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/dashboard` | Get dashboard metrics |

---

## 🧪 Quick Verification Script

Save this as `test-backend.sh`:

```bash
#!/bin/bash

BASE_URL="https://beswluhdxaphtitaovly.supabase.co/functions/v1/server/make-server-89a553ba"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDY2MzgsImV4cCI6MjA5MjM4MjYzOH0.XMxin_yjhgp3si6G_PFAWdrsaBzdJgfJcgyc-NQEXhw"

echo "🚀 Testing GlenKeos Backend"
echo "=============================="

echo -e "\n✅ Testing health endpoint..."
curl -i "${BASE_URL}/health"

echo -e "\n\n📊 Testing analytics endpoint..."
curl "${BASE_URL}/analytics/dashboard" \
  -H "Authorization: Bearer ${TOKEN}" | jq

echo -e "\n\n✅ Backend test complete!"
```

Run it:
```bash
chmod +x test-backend.sh
./test-backend.sh
```

---

## 🔍 Troubleshooting

### If you get 404 errors:

**Check 1: Verify function deployment**
```bash
# The function should be in /supabase/functions/server/index.tsx
# Function name is "server" from the directory
```

**Check 2: Verify full URL structure**
```bash
# Correct:
https://beswluhdxaphtitaovly.supabase.co/functions/v1/server/make-server-89a553ba/health

# Wrong (missing "server"):
https://beswluhdxaphtitaovly.supabase.co/functions/v1/make-server-89a553ba/health
```

**Check 3: Test with verbose output**
```bash
curl -v https://beswluhdxaphtitaovly.supabase.co/functions/v1/server/make-server-89a553ba/health
```

### If you get 426 Upgrade Required:

This means the endpoint exists but there's a protocol mismatch. Try:
```bash
curl --http1.1 https://beswluhdxaphtitaovly.supabase.co/functions/v1/server/make-server-89a553ba/health
```

---

## ✅ Frontend Configuration

The frontend API client has been updated to use the correct URL:

**File**: `/src/app/services/api/client.ts`

```typescript
const BACKEND_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-89a553ba`;
```

No changes needed in frontend code - it's already configured correctly!

---

## 📝 Summary

**Correct Base URL:**
```
https://beswluhdxaphtitaovly.supabase.co/functions/v1/server/make-server-89a553ba
```

**URL Components:**
1. `beswluhdxaphtitaovly.supabase.co` - Supabase project
2. `/functions/v1` - Edge Functions API
3. `/server` - Function name (directory name)
4. `/make-server-89a553ba` - Route prefix (Hono routes)
5. `/health` (or any other endpoint) - Specific route

**Test it now:**
```bash
curl https://beswluhdxaphtitaovly.supabase.co/functions/v1/server/make-server-89a553ba/health
```

✅ **All documentation has been updated with the correct URLs!**
