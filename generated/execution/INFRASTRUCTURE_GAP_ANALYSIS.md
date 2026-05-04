# **GLENKEOS — INFRASTRUCTURE GAP ANALYSIS**

**Date:** 2026-04-16  
**Discovery:** Complete AWS resource scan  
**Status:** Ready for Option C deployment  

---

## **WHAT YOU ALREADY HAVE IN AWS**

### ✅ **1. Amplify App**
- **Name:** Glenkeos
- **App ID:** d262l1qtvcxnk9
- **Domain:** d262l1qtvcxnk9.amplifyapp.com
- **Purpose:** Frontend hosting

### ✅ **2. AppSync GraphQL API**
- **Name:** Glenkeos-staging
- **API ID:** enfwspvquvb3dotzfurj3gw4kq
- **Type:** GraphQL (NOT REST)
- **Purpose:** Existing backend API
- **Status:** Active

### ✅ **3. Cognito User Pool**
- **Name:** amplify_backend_manager_d262l1qtvcxnk9
- **Pool ID:** us-east-2_7YexJPzib
- **Purpose:** Authentication
- **Custom Auth Flow:** Active (4 Lambda triggers)

### ✅ **4. Lambda Functions (4 total)**
All related to Amplify custom authentication:
1. `amplify-login-define-auth-challenge-b49fe991`
2. `amplify-login-verify-auth-challenge-b49fe991`
3. `amplify-login-custom-message-b49fe991`
4. `amplify-login-create-auth-challenge-b49fe991`

**Runtime:** Node.js 20.x  
**Purpose:** Custom passwordless auth flow

### ✅ **5. DynamoDB Tables (2 total)**
1. `AmplifyDataStore-enfwspvquvb3dotzfurj3gw4kq-staging` — Amplify DataStore
2. `BACKENDCCENT-enfwspvquvb3dotzfurj3gw4kq-staging` — Unknown purpose

### ✅ **6. S3 Buckets (2 relevant)**
1. `amplify-glenkeos-staging-3fe8c-deployment` — Amplify hosting assets
2. `glenkeos-chicken-on-chain-staging-artifacts` — Build artifacts

---

## **WHAT'S MISSING (MUST BUILD)**

### ❌ **1. REST API Gateway**
- **Required:** 38 REST endpoints (from master spec)
- **Current:** 0 REST APIs (only AppSync GraphQL)
- **Action:** Deploy API Gateway OR adapt AppSync to support REST patterns

### ❌ **2. RDS PostgreSQL**
- **Required:** PostgreSQL with RLS, 14 tables, 79 indexes, 16 triggers
- **Current:** 0 RDS databases (only DynamoDB)
- **Action:** Deploy RDS (already generated Terraform config)

### ❌ **3. EventBridge / Event Bus**
- **Required:** Event bus with 29 event types
- **Current:** 0 custom event buses
- **Action:** Deploy EventBridge (already generated Terraform config)

### ❌ **4. Business Logic Lambda Functions**
- **Required:** 9 microservices (stores, orders, inventory, drivers, staff, policies, risk, compliance, metrics)
- **Current:** 4 Lambda functions (all for auth only, no business logic)
- **Action:** Generate and deploy 9 new Lambda functions

### ❌ **5. Observability Stack**
- **Required:** CloudWatch dashboards, custom metrics, alarms
- **Current:** Default CloudWatch only
- **Action:** Deploy custom dashboards and alarms

---

## **CRITICAL ARCHITECTURE DECISION**

### **Option 1: Keep AppSync GraphQL (Hybrid GraphQL + REST)**

**Architecture:**
```
Frontend → AppSync GraphQL (existing) → Lambda functions (existing auth)
        ↓
        → API Gateway REST (new) → Lambda functions (new business logic)
                                 → RDS PostgreSQL (new)
                                 → EventBridge (new)
```

**Pros:**
- Keep existing AppSync infrastructure
- No breaking changes to current frontend
- Add GlenKeos backend alongside

**Cons:**
- Two API layers (GraphQL + REST)
- More complex architecture
- Frontend needs to call both APIs

---

### **Option 2: Migrate AppSync → API Gateway REST (Pure REST)**

**Architecture:**
```
Frontend → API Gateway REST (new) → Lambda functions (auth + business logic)
                                  → RDS PostgreSQL (new)
                                  → EventBridge (new)
                                  → Cognito (existing, reuse)
```

**Pros:**
- Single API layer (REST only)
- Matches GlenKeos spec exactly (38 REST endpoints)
- Simpler architecture
- Full control

**Cons:**
- Requires frontend migration (GraphQL → REST)
- Deprecate existing AppSync API
- More upfront work

---

### **Option 3: Enhance AppSync with Resolvers (Pure GraphQL)**

**Architecture:**
```
Frontend → AppSync GraphQL (existing, enhanced) → Lambda resolvers (new business logic)
                                                → RDS PostgreSQL (new)
                                                → EventBridge (new)
```

**Pros:**
- Keep GraphQL architecture
- No frontend changes
- Modern GraphQL-first approach
- Real-time subscriptions (AppSync feature)

**Cons:**
- Deviates from master spec (spec defines REST)
- GraphQL schema doesn't match OpenAPI spec
- Limited REST compatibility

---

## **RECOMMENDED: OPTION 1 (HYBRID)**

**Why:**
- Preserves existing AppSync infrastructure (no breaking changes)
- Adds GlenKeos REST backend alongside
- Frontend can gradually migrate GraphQL → REST
- Both APIs can coexist during transition

**Migration Path:**
1. **Phase 1:** Deploy API Gateway + Lambda (new business logic)
2. **Phase 2:** Frontend uses both APIs (AppSync for auth, REST for business logic)
3. **Phase 3:** Migrate auth to API Gateway + Cognito
4. **Phase 4:** Deprecate AppSync (optional)

---

## **OPTION C EXECUTION PLAN (REVISED)**

### **Step 1: Deploy Core Infrastructure (Now)**

```bash
# Deploy PostgreSQL
cd terraform/hybrid-deployment/database
terraform init && terraform apply

# Deploy EventBridge
cd ../eventbridge
terraform init && terraform apply
```

**Time:** ~15 minutes  
**Cost:** ~$87/month

---

### **Step 2: Generate First Service (Stores)**

**Service:** stores-service  
**Endpoints:**
- POST /v1/stores
- GET /v1/stores
- GET /v1/stores/:id
- PUT /v1/stores/:id

**Events Produced:**
- STORE_CREATED
- STORE_UPDATED

**Database Table:** stores

**Lambda Function:**
```typescript
// stores-service/handler.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Pool } from 'pg';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const db = new Pool({
  host: process.env.DB_HOST,
  database: 'glenkeos',
  user: 'glenkeos_admin',
  password: process.env.DB_PASSWORD
});

const eventBridge = new EventBridgeClient({ region: 'us-east-2' });

export async function createStore(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // 1. Parse request body
  const { name, address, phone } = JSON.parse(event.body || '{}');
  
  // 2. Insert into PostgreSQL
  const result = await db.query(
    'INSERT INTO stores (name, address, phone, tenant_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, address, phone, event.requestContext.authorizer?.tenantId]
  );
  
  // 3. Publish event to EventBridge
  await eventBridge.send(new PutEventsCommand({
    Entries: [{
      Source: 'glenkeos',
      DetailType: 'STORE_CREATED',
      Detail: JSON.stringify({
        storeId: result.rows[0].id,
        tenantId: event.requestContext.authorizer?.tenantId,
        timestamp: new Date().toISOString()
      }),
      EventBusName: 'glenkeos-staging'
    }]
  }));
  
  return {
    statusCode: 201,
    body: JSON.stringify(result.rows[0])
  };
}
```

---

### **Step 3: Deploy First Service**

**Terraform for Lambda + API Gateway:**
```bash
cd terraform/hybrid-deployment/lambda/stores
terraform init && terraform apply

cd ../../api-gateway
terraform init && terraform apply
```

---

### **Step 4: Test End-to-End**

```bash
# Create a store
curl -X POST https://api.glenkeos.com/v1/stores \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Test Store",
    "address": "123 Main St",
    "phone": "555-0100"
  }'

# Verify in PostgreSQL
psql -h $DB_HOST -U glenkeos_admin -d glenkeos -c "SELECT * FROM stores;"

# Verify event in EventBridge logs
aws logs tail /aws/events/glenkeos-staging --follow
```

---

### **Step 5: Iterate on Remaining Services**

Once stores-service is validated, repeat for:
1. orders-service
2. inventory-service
3. drivers-service
4. staff-service
5. policies-service
6. risk-service
7. compliance-service
8. metrics-service

---

## **CRITICAL QUESTION**

**Which API architecture do you prefer?**

1. **Hybrid (AppSync + REST)** — Keep existing GraphQL, add REST backend
2. **Pure REST** — Migrate AppSync → API Gateway REST
3. **Pure GraphQL** — Enhance AppSync, no REST

**Please confirm before I generate the first service.**

---

## **EXISTING RESOURCES TO REUSE**

✅ **Cognito User Pool** — Will integrate with API Gateway JWT authorizer  
✅ **Amplify Hosting** — Keep for frontend  
✅ **S3 Buckets** — Keep for artifacts  
✅ **DynamoDB** — May use for caching (optional)  
✅ **AppSync** — Keep during transition (Option 1 only)

---

**Awaiting architecture decision to proceed with Option C deployment.**
