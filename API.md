# GlenKeos API Documentation

**Version**: 1.0.0  
**Base URL**: https://beswluhdxaphtitaovly.supabase.co/rest/v1  
**Authentication**: JWT Bearer Token

---

## Quick Start

### Authentication

All API requests require a JWT token:

```bash
curl https://beswluhdxaphtitaovly.supabase.co/rest/v1/orders \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get JWT Token

```typescript
import { supabase } from './lib/supabase';

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

const token = data.session.access_token; // Use this in API calls
```

---

## Core Endpoints

### Orders

#### List Orders
```http
GET /orders?status=eq.PENDING&limit=25
```

**Query Parameters**:
- `status`: Filter by order status
- `store_id`: Filter by store
- `limit`: Max results (default: 25, max: 100)
- `offset`: Pagination offset
- `order`: Sort order (e.g., `created_at.desc`)

**Response**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "order_number": "GE-2026-00001",
    "status": "PENDING",
    "total_amount": 45.99,
    "created_at": "2026-04-24T07:30:00Z"
  }
]
```

#### Create Order
```http
POST /orders
Content-Type: application/json

{
  "tenant_id": "chic-on-chain-001",
  "customer_id": "customer-uuid",
  "store_id": "store-uuid",
  "items": [
    {
      "menu_item_id": "item-uuid",
      "quantity": 2,
      "customizations": {"no_onions": true}
    }
  ],
  "delivery_address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip_code": "94105"
  }
}
```

#### Update Order Status
```http
PATCH /orders?id=eq.550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "status": "PREPARING"
}
```

---

### Customers

#### Get Customer
```http
GET /customers?user_id=eq.USER_UUID
```

#### Create Customer
```http
POST /customers
Content-Type: application/json

{
  "tenant_id": "chic-on-chain-001",
  "email": "customer@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+14155551234"
}
```

---

### Menu Items

#### List Menu Items
```http
GET /menu_items?store_id=eq.STORE_UUID&is_available=eq.true
```

---

### Drivers

#### List Online Drivers
```http
GET /drivers?is_online=eq.true
```

#### Update Driver Location
```http
PATCH /drivers?id=eq.DRIVER_UUID
Content-Type: application/json

{
  "current_location": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]
  }
}
```

---

## Edge Functions

### Create PayPal Order

```http
POST https://beswluhdxaphtitaovly.supabase.co/functions/v1/create-paypal-order
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "order_id": "order-uuid",
  "amount": 45.99,
  "currency": "USD"
}
```

**Response**:
```json
{
  "id": "paypal-order-id",
  "status": "CREATED",
  "links": [
    {"rel": "approve", "href": "https://paypal.com/checkoutnow?token=..."}
  ]
}
```

---

## Realtime Subscriptions

### Subscribe to Order Updates

```typescript
const subscription = supabase
  .channel('orders-channel')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('Order updated:', payload.new);
    }
  )
  .subscribe();
```

### Subscribe to Driver Location

```typescript
const subscription = supabase
  .channel('drivers-channel')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'drivers' },
    (payload) => {
      console.log('Driver location:', payload.new.current_location);
    }
  )
  .subscribe();
```

---

## Error Handling

### Error Response Format
```json
{
  "code": "23505",
  "details": "Key (email)=(user@example.com) already exists.",
  "hint": null,
  "message": "duplicate key value violates unique constraint"
}
```

### Common Error Codes
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (RLS policy violation)
- `404`: Not Found
- `409`: Conflict (duplicate key)
- `500`: Internal Server Error

---

## Rate Limiting

**Limit**: 100 requests per 10 seconds per IP  
**Enforcement**: Vercel edge middleware

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1735689600
```

---

## Complete API Specification

**OpenAPI 3.1 Spec**: `/docs/api/OPENAPI_SPECIFICATION.yaml`

**Interactive Docs**: https://supabase.com/dashboard/project/beswluhdxaphtitaovly/api
