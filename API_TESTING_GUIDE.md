# 🧪 GlenKeos API Testing Guide

Complete curl examples for testing all 11 microservices.

## Base Configuration

```bash
# Set these variables
export BASE_URL="https://beswluhdxaphtitaovly.supabase.co/functions/v1/make-server-89a553ba"
export AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDY2MzgsImV4cCI6MjA5MjM4MjYzOH0.XMxin_yjhgp3si6G_PFAWdrsaBzdJgfJcgyc-NQEXhw"
```

---

## 1. Health Check

```bash
curl -X GET "${BASE_URL}/health"
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-21T12:00:00.000Z"
}
```

---

## 2. Authentication Service

### Sign Up New User

```bash
curl -X POST "${BASE_URL}/auth/signup" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "email": "alex.student@harvard.edu",
    "password": "SecurePassword123!",
    "name": "Alex Student",
    "role": "customer"
  }'
```

---

## 3. Customer Service

### Create Customer

```bash
curl -X POST "${BASE_URL}/customers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "email": "customer1@harvard.edu",
    "name": "John Harvard",
    "phone": "+16175551234"
  }'
```

**Save the customer ID from response:**
```bash
export CUSTOMER_ID="<uuid-from-response>"
```

### Get Customer by ID

```bash
curl -X GET "${BASE_URL}/customers/${CUSTOMER_ID}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Get Customer by Email

```bash
curl -X GET "${BASE_URL}/customers/email/customer1@harvard.edu" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### List All Customers

```bash
curl -X GET "${BASE_URL}/customers" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

---

## 4. Store Service

### Create Chic-on-Chain Store

```bash
curl -X POST "${BASE_URL}/stores" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "brand": "CHIC_ON_CHAIN",
    "name": "Harvard Square - Chic on Chain",
    "campus_id": "HARVARD",
    "location": "1 Harvard Square, Cambridge, MA 02138"
  }'
```

**Save store ID:**
```bash
export STORE_ID="<uuid-from-response>"
```

### Create Ghetto Eats Store

```bash
curl -X POST "${BASE_URL}/stores" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "brand": "GHETTO_EATS",
    "name": "MIT Campus - Ghetto Eats",
    "campus_id": "MIT",
    "location": "77 Massachusetts Ave, Cambridge, MA 02139"
  }'
```

### Get Store

```bash
curl -X GET "${BASE_URL}/stores/${STORE_ID}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### List Stores (Filter by Brand)

```bash
curl -X GET "${BASE_URL}/stores?brand=CHIC_ON_CHAIN" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

---

## 5. Inventory Service

### Create Inventory Item

```bash
curl -X POST "${BASE_URL}/inventory" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "store_id": "'${STORE_ID}'",
    "name": "Greek Salad",
    "description": "Fresh Mediterranean salad with feta cheese",
    "category": "APPETIZERS",
    "price": 12.99,
    "quantity": 50,
    "low_stock_threshold": 10
  }'
```

**Save inventory ID:**
```bash
export ITEM_ID="<uuid-from-response>"
```

### Create More Items

```bash
curl -X POST "${BASE_URL}/inventory" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "store_id": "'${STORE_ID}'",
    "name": "Gyro Plate",
    "description": "Traditional Greek gyro with tzatziki",
    "category": "ENTREES",
    "price": 15.99,
    "quantity": 35,
    "low_stock_threshold": 8
  }'
```

### Update Inventory Quantity

```bash
curl -X PUT "${BASE_URL}/inventory/${ITEM_ID}/quantity" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "quantity": 5
  }'
```

**Note:** This will trigger a low-stock alert since 5 < 10 (threshold)

### Get Inventory Item

```bash
curl -X GET "${BASE_URL}/inventory/${ITEM_ID}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### List Inventory (Filter by Store)

```bash
curl -X GET "${BASE_URL}/inventory?store_id=${STORE_ID}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

---

## 6. Order Service

### Create Order

```bash
curl -X POST "${BASE_URL}/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "customer_id": "'${CUSTOMER_ID}'",
    "store_id": "'${STORE_ID}'",
    "brand": "CHIC_ON_CHAIN",
    "campus_id": "HARVARD",
    "dorm_id": "WINTHROP",
    "room_number": "301",
    "items": [
      {
        "name": "Greek Salad",
        "price": 12.99,
        "quantity": 1
      },
      {
        "name": "Gyro Plate",
        "price": 15.99,
        "quantity": 2
      }
    ],
    "total_amount": 44.97
  }'
```

**Save order ID:**
```bash
export ORDER_ID="<uuid-from-response>"
```

### Get Order

```bash
curl -X GET "${BASE_URL}/orders/${ORDER_ID}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Update Order Status

```bash
curl -X PUT "${BASE_URL}/orders/${ORDER_ID}/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

### List Orders (Filter by Status)

```bash
curl -X GET "${BASE_URL}/orders?status=PENDING" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### List Customer Orders

```bash
curl -X GET "${BASE_URL}/orders?customer_id=${CUSTOMER_ID}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

---

## 7. Driver Service

### Register Driver

```bash
curl -X POST "${BASE_URL}/drivers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "name": "Maria Rodriguez",
    "phone": "+16175559876",
    "email": "maria.driver@glenkeos.com",
    "vehicle_type": "Bike",
    "license_plate": "DRV123"
  }'
```

**Save driver ID:**
```bash
export DRIVER_ID="<uuid-from-response>"
```

### Get Driver

```bash
curl -X GET "${BASE_URL}/drivers/${DRIVER_ID}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Assign Driver to Order

```bash
curl -X POST "${BASE_URL}/drivers/${DRIVER_ID}/assign/${ORDER_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

**This will:**
- Update driver status to "ASSIGNED"
- Update order status to "ASSIGNED"
- Link driver to order
- Log a metric event

### List Available Drivers

```bash
curl -X GET "${BASE_URL}/drivers?status=AVAILABLE" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### List All Drivers

```bash
curl -X GET "${BASE_URL}/drivers" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

---

## 8. Staff Service

### Create Staff Member

```bash
curl -X POST "${BASE_URL}/staff" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "name": "Chef Michael",
    "email": "chef.michael@chiconchain.com",
    "role": "CHEF",
    "store_id": "'${STORE_ID}'",
    "phone": "+16175558888"
  }'
```

### Create Manager

```bash
curl -X POST "${BASE_URL}/staff" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "name": "Sarah Manager",
    "email": "sarah.manager@chiconchain.com",
    "role": "MANAGER",
    "store_id": "'${STORE_ID}'",
    "phone": "+16175557777"
  }'
```

### List Staff by Store

```bash
curl -X GET "${BASE_URL}/staff?store_id=${STORE_ID}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### List Staff by Role

```bash
curl -X GET "${BASE_URL}/staff?role=CHEF" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

---

## 9. Payments Service

### Process Payment

```bash
curl -X POST "${BASE_URL}/payments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "order_id": "'${ORDER_ID}'",
    "customer_id": "'${CUSTOMER_ID}'",
    "amount": 44.97,
    "payment_method": "CREDIT_CARD"
  }'
```

**Save payment ID:**
```bash
export PAYMENT_ID="<uuid-from-response>"
```

### Get Payment

```bash
curl -X GET "${BASE_URL}/payments/${PAYMENT_ID}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

---

## 10. Metrics Service

### Log Metric

```bash
curl -X POST "${BASE_URL}/metrics" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "name": "order_fulfillment_time",
    "value": 18.5,
    "unit": "minutes",
    "tags": {
      "brand": "CHIC_ON_CHAIN",
      "campus": "HARVARD",
      "order_id": "'${ORDER_ID}'"
    }
  }'
```

### Log Revenue Metric

```bash
curl -X POST "${BASE_URL}/metrics" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "name": "daily_revenue",
    "value": 44.97,
    "unit": "USD",
    "tags": {
      "date": "2026-04-21",
      "brand": "CHIC_ON_CHAIN"
    }
  }'
```

### Get Metrics by Name

```bash
curl -X GET "${BASE_URL}/metrics?name=order_fulfillment_time" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Get All Metrics

```bash
curl -X GET "${BASE_URL}/metrics" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

---

## 11. Compliance Service

### Log Compliance Event

```bash
curl -X POST "${BASE_URL}/compliance" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "event_type": "DATA_ACCESS",
    "details": {
      "user_id": "admin-123",
      "resource": "customer_pii",
      "action": "READ",
      "customer_id": "'${CUSTOMER_ID}'"
    },
    "severity": "INFO"
  }'
```

### Log Security Event

```bash
curl -X POST "${BASE_URL}/compliance" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "event_type": "SECURITY_INCIDENT",
    "details": {
      "description": "Failed login attempt",
      "ip_address": "192.168.1.1",
      "attempted_user": "admin@example.com"
    },
    "severity": "WARNING"
  }'
```

### Get Compliance Events

```bash
curl -X GET "${BASE_URL}/compliance" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Get Compliance Events by Type

```bash
curl -X GET "${BASE_URL}/compliance?event_type=DATA_ACCESS" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

---

## 12. GRC Service

### Create Policy

```bash
curl -X POST "${BASE_URL}/grc/policies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "name": "Data Retention Policy",
    "description": "Customer data must be retained for 7 years per regulatory requirements",
    "category": "DATA_GOVERNANCE"
  }'
```

### Log Risk Event

```bash
curl -X POST "${BASE_URL}/grc/risks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "category": "OPERATIONAL",
    "description": "Inventory shortage could impact service delivery",
    "severity": "MEDIUM"
  }'
```

### Log Critical Risk

```bash
curl -X POST "${BASE_URL}/grc/risks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "category": "SECURITY",
    "description": "Potential data breach detected in payment system",
    "severity": "CRITICAL"
  }'
```

### Get All Policies

```bash
curl -X GET "${BASE_URL}/grc/policies" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Get All Risks

```bash
curl -X GET "${BASE_URL}/grc/risks" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

---

## 13. Analytics Service

### Get Dashboard Analytics

```bash
curl -X GET "${BASE_URL}/analytics/dashboard" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

**Expected Response:**
```json
{
  "data": {
    "totalOrders": 15,
    "totalRevenue": 673.45,
    "activeDrivers": 5,
    "pendingOrders": 3,
    "totalCustomers": 42,
    "timestamp": "2026-04-21T12:00:00.000Z"
  }
}
```

---

## Complete End-to-End Test Script

```bash
#!/bin/bash

# Set base configuration
export BASE_URL="https://beswluhdxaphtitaovly.supabase.co/functions/v1/make-server-89a553ba"
export AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3dsdWhkeGFwaHRpdGFvdmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDY2MzgsImV4cCI6MjA5MjM4MjYzOH0.XMxin_yjhgp3si6G_PFAWdrsaBzdJgfJcgyc-NQEXhw"

echo "🚀 GlenKeos Platform E2E Test"
echo "=============================="

# 1. Health check
echo -e "\n✅ Testing health endpoint..."
curl -s "${BASE_URL}/health" | jq

# 2. Create customer
echo -e "\n👤 Creating customer..."
CUSTOMER_RESPONSE=$(curl -s -X POST "${BASE_URL}/customers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "email": "test@harvard.edu",
    "name": "Test User",
    "phone": "+16175551234"
  }')
echo $CUSTOMER_RESPONSE | jq
CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | jq -r '.data.id')

# 3. Create store
echo -e "\n🏪 Creating store..."
STORE_RESPONSE=$(curl -s -X POST "${BASE_URL}/stores" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "brand": "CHIC_ON_CHAIN",
    "name": "Harvard Square",
    "campus_id": "HARVARD",
    "location": "1 Harvard Square"
  }')
echo $STORE_RESPONSE | jq
STORE_ID=$(echo $STORE_RESPONSE | jq -r '.data.id')

# 4. Create order
echo -e "\n📦 Creating order..."
ORDER_RESPONSE=$(curl -s -X POST "${BASE_URL}/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "customer_id": "'${CUSTOMER_ID}'",
    "store_id": "'${STORE_ID}'",
    "brand": "CHIC_ON_CHAIN",
    "campus_id": "HARVARD",
    "dorm_id": "WINTHROP",
    "room_number": "301",
    "items": [{"name": "Greek Salad", "price": 12.99, "quantity": 1}],
    "total_amount": 12.99
  }')
echo $ORDER_RESPONSE | jq
ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.data.id')

# 5. Create driver
echo -e "\n🚗 Creating driver..."
DRIVER_RESPONSE=$(curl -s -X POST "${BASE_URL}/drivers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "name": "Test Driver",
    "phone": "+16175559999",
    "email": "driver@test.com",
    "vehicle_type": "Bike",
    "license_plate": "TEST123"
  }')
echo $DRIVER_RESPONSE | jq
DRIVER_ID=$(echo $DRIVER_RESPONSE | jq -r '.data.id')

# 6. Assign driver
echo -e "\n🔗 Assigning driver to order..."
curl -s -X POST "${BASE_URL}/drivers/${DRIVER_ID}/assign/${ORDER_ID}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" | jq

# 7. Process payment
echo -e "\n💳 Processing payment..."
curl -s -X POST "${BASE_URL}/payments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "order_id": "'${ORDER_ID}'",
    "customer_id": "'${CUSTOMER_ID}'",
    "amount": 12.99,
    "payment_method": "CREDIT_CARD"
  }' | jq

# 8. Get analytics
echo -e "\n📊 Getting dashboard analytics..."
curl -s "${BASE_URL}/analytics/dashboard" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" | jq

echo -e "\n✅ E2E Test Complete!"
```

Save this as `test-glenkeos.sh`, make it executable (`chmod +x test-glenkeos.sh`), and run it!

---

## Testing Tips

1. **Install jq** for JSON formatting:
   ```bash
   brew install jq  # macOS
   sudo apt-get install jq  # Linux
   ```

2. **Save responses** to files for inspection:
   ```bash
   curl ... > response.json
   ```

3. **Check HTTP status codes**:
   ```bash
   curl -w "\nHTTP Status: %{http_code}\n" ...
   ```

4. **Debug with verbose output**:
   ```bash
   curl -v ...
   ```

---

All endpoints are live and ready for testing! 🚀
