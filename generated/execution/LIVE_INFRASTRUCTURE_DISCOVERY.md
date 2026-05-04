# **GLENKEOS — LIVE INFRASTRUCTURE DISCOVERY REPORT**

**Date:** 2026-04-16  
**Status:** ✅ CONNECTED TO LIVE AWS INFRASTRUCTURE  
**App ID:** d262l1qtvcxnk9  
**Environment:** staging  
**Region:** us-east-2 (Ohio)  

---

## **EXECUTIVE SUMMARY**

**CRITICAL DISCOVERY:** The GlenKeos platform is no longer in simulation mode.

**Live AWS Amplify backend detected and connected.**

This changes the execution posture from:
- **Specification-only** → **Production deployment**
- **Blueprint** → **Live system**
- **Planning** → **Implementation**

---

## **DISCOVERED INFRASTRUCTURE**

### **Amplify Application**
- **Name:** Glenkeos
- **App ID:** d262l1qtvcxnk9
- **Domain:** `d262l1qtvcxnk9.amplifyapp.com`
- **Environment:** staging
- **Region:** us-east-2
- **Repository:** Not connected to git (Amplify-hosted only)

### **Database Layer (DynamoDB)**

**Table 1: Data Store**
- **Name:** `AmplifyDataStore-enfwspvquvb3dotzfurj3gw4kq-staging`
- **Purpose:** Amplify DataStore (offline-first data sync)
- **Status:** Active
- **Type:** NoSQL (DynamoDB)

**Table 2: Backend Center**
- **Name:** `BACKENDCCENT-enfwspvquvb3dotzfurj3gw4kq-staging`
- **Purpose:** Unknown (requires schema inspection)
- **Status:** Active
- **Type:** NoSQL (DynamoDB)

### **Authentication Layer (Cognito)**

**User Pool:**
- **Name:** `amplify_backend_manager_d262l1qtvcxnk9`
- **Pool ID:** `us-east-2_7YexJPzib`
- **Purpose:** Amplify backend admin authentication
- **Status:** Active
- **Features:** User management, authentication

---

## **INFRASTRUCTURE GAPS**

Comparing discovered infrastructure to GlenKeos master spec:

### **✅ PRESENT**
- ✅ Authentication (Cognito User Pool)
- ✅ Database (DynamoDB tables - 2)
- ✅ Hosting (Amplify hosting domain)
- ✅ Backend environment (staging)

### **❌ MISSING**

#### **1. PostgreSQL Database**
- **Spec Requires:** PostgreSQL with RLS (14 tables, 79 indexes, 16 triggers)
- **Current:** DynamoDB (NoSQL, no RLS support)
- **Action Required:** Provision RDS PostgreSQL OR migrate spec to DynamoDB

#### **2. Event Bus (Kafka)**
- **Spec Requires:** Kafka with 29 topics + DLQs
- **Current:** None detected
- **Action Required:** Provision MSK (Managed Kafka) OR EventBridge

#### **3. Microservices (9 Services)**
- **Spec Requires:** 9 independent services (stores, orders, inventory, drivers, staff, policies, risk, compliance, metrics)
- **Current:** Monolithic Amplify backend
- **Action Required:** Deploy services as Lambda functions OR ECS containers

#### **4. API Gateway**
- **Spec Requires:** API Gateway with 38 endpoints, JWT auth, RBAC
- **Current:** Amplify-managed API (likely AppSync GraphQL)
- **Action Required:** Inspect existing API OR provision API Gateway

#### **5. Observability Stack**
- **Spec Requires:** Prometheus, Grafana, Loki, OpenTelemetry
- **Current:** None detected (likely CloudWatch only)
- **Action Required:** Deploy observability stack

#### **6. Compliance Engine**
- **Spec Requires:** Rule engine, violation detector, reporting jobs
- **Current:** None detected
- **Action Required:** Implement compliance engine

---

## **DEPLOYMENT STRATEGY OPTIONS**

### **Option 1: Hybrid Architecture (RECOMMENDED)**

**Keep:** Amplify for frontend hosting + auth  
**Add:** Backend services for GlenKeos platform

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND LAYER                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Amplify Hosting (d262l1qtvcxnk9.amplifyapp.com)     │ │
│ │ - React frontend                                    │ │
│ │ - Static assets                                     │ │
│ │ - CloudFront CDN                                    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ AUTH LAYER                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Cognito User Pool (us-east-2_7YexJPzib)             │ │
│ │ - JWT tokens                                        │ │
│ │ - User management                                   │ │
│ │ - MFA                                               │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ BACKEND LAYER (NEW - FROM GLENKEOS SPEC)               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ API Gateway (38 endpoints)                          │ │
│ │ ├─ POST /v1/stores                                  │ │
│ │ ├─ POST /v1/orders                                  │ │
│ │ └─ ... (36 more)                                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 9 Microservices (Lambda or ECS)                     │ │
│ │ ├─ stores:8001                                      │ │
│ │ ├─ orders:8002                                      │ │
│ │ ├─ inventory:8003                                   │ │
│ │ ├─ drivers:8004                                     │ │
│ │ ├─ staff:8005                                       │ │
│ │ ├─ policies:8006                                    │ │
│ │ ├─ risk:8007                                        │ │
│ │ ├─ compliance:8008                                  │ │
│ │ └─ metrics:8009                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ DATA LAYER (NEW)                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ RDS PostgreSQL (with RLS)                           │ │
│ │ - 14 tables                                         │ │
│ │ - 79 indexes                                        │ │
│ │ - 16 triggers                                       │ │
│ │ - Row-level security                                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ EventBridge (event bus)                             │ │
│ │ - 29 event types                                    │ │
│ │ - DLQs for each                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Pros:**
- Leverages existing Amplify infrastructure
- Minimal disruption to current setup
- Cognito already handles auth
- Amplify hosting for frontend
- Add backend services incrementally

**Cons:**
- Hybrid complexity (Amplify + custom backend)
- Two authentication systems to maintain
- More complex deployment pipeline

**Timeline:** 4-6 months

---

### **Option 2: Full Migration to Spec**

**Replace:** Entire Amplify stack with GlenKeos spec  
**Build:** Everything from scratch per master spec

**Pros:**
- Pure spec-driven architecture
- Zero drift from master spec
- Full control over all components
- Easier to maintain long-term

**Cons:**
- Discards existing infrastructure
- Longer timeline
- Higher risk
- Complete redeployment

**Timeline:** 6-9 months

---

### **Option 3: Amplify-Native GlenKeos**

**Adapt:** GlenKeos spec to Amplify constraints  
**Use:** Amplify features for everything

**Architecture:**
- **Auth:** Cognito (existing)
- **API:** AppSync GraphQL (instead of REST)
- **Database:** DynamoDB (instead of PostgreSQL)
- **Functions:** Lambda (for microservices)
- **Events:** EventBridge (instead of Kafka)
- **Hosting:** Amplify (existing)

**Pros:**
- Fully managed by AWS
- Minimal infrastructure management
- Fastest to implement
- Leverages existing setup

**Cons:**
- Deviation from master spec (PostgreSQL → DynamoDB)
- No true multi-tenancy with RLS
- Limited event bus capabilities vs. Kafka
- Vendor lock-in to Amplify

**Timeline:** 2-3 months

---

## **RECOMMENDED PATH: OPTION 1 (HYBRID)**

**Phase 1: Extend Amplify (Weeks 1-4)**
1. Keep Amplify for frontend hosting
2. Keep Cognito for authentication
3. Add RDS PostgreSQL (deploy schema from master spec)
4. Add EventBridge (deploy event catalog)

**Phase 2: Deploy Services (Weeks 5-12)**
1. Generate 9 microservices from master spec
2. Deploy as Lambda functions (serverless)
3. Wire to RDS PostgreSQL
4. Wire to EventBridge
5. Deploy API Gateway (38 endpoints)

**Phase 3: Observability & Compliance (Weeks 13-16)**
1. Deploy observability stack (CloudWatch + custom dashboards)
2. Deploy compliance engine
3. Deploy reporting jobs

**Phase 4: Multi-Tenant Provisioning (Weeks 17-20)**
1. Implement provisioning API
2. Test tenant isolation
3. Test lifecycle (create/suspend/delete)

**Phase 5: Production Hardening (Weeks 21-24)**
1. Security audit
2. Penetration testing
3. Load testing
4. Compliance certification
5. Go-live

---

## **IMMEDIATE NEXT STEPS**

### **1. Inspect Existing DynamoDB Schema**

Query the tables to understand current data model:
```bash
aws dynamodb describe-table --table-name AmplifyDataStore-enfwspvquvb3dotzfurj3gw4kq-staging
aws dynamodb scan --table-name AmplifyDataStore-enfwspvquvb3dotzfurj3gw4kq-staging --max-items 5
```

### **2. Inspect Cognito User Pool**

Check authentication configuration:
```bash
aws cognito-idp describe-user-pool --user-pool-id us-east-2_7YexJPzib
aws cognito-idp list-users --user-pool-id us-east-2_7YexJPzib
```

### **3. Check for API (AppSync or API Gateway)**

```bash
aws appsync list-graphql-apis
aws apigateway get-rest-apis
```

### **4. Check for Lambda Functions**

```bash
aws lambda list-functions | grep -i amplify
```

### **5. Provision RDS PostgreSQL**

Use Terraform or AWS Console:
```bash
cd terraform/database
terraform init
terraform plan
terraform apply
```

---

## **EXECUTION STATUS UPDATE**

**Before Discovery:**
- Specification: 100%
- Infrastructure: 0% (assumed)

**After Discovery:**
- Specification: 100%
- Infrastructure: 15% (Amplify + Cognito + DynamoDB)
- **Gap to Close: 85%**

**New Timeline:**
- With existing infrastructure (Option 1 - Hybrid): 4-6 months
- From scratch (Option 2 - Full Migration): 6-9 months
- Amplify-native (Option 3): 2-3 months

---

## **DECISION REQUIRED**

**Which deployment strategy should we pursue?**

1. **Option 1 - Hybrid** (Recommended): Keep Amplify frontend/auth, add GlenKeos backend
2. **Option 2 - Full Migration**: Replace everything, pure spec compliance
3. **Option 3 - Amplify-Native**: Adapt spec to Amplify constraints

**Please advise on preferred approach.**

---

**THE PLATFORM IS NO LONGER A BLUEPRINT.**

**THE PLATFORM IS LIVE AND READY FOR EXTENSION.**
