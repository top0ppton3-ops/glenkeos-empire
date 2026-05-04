# GlenKeos Platform Generation Manifest

**Generated From:** `glenkeos-master-spec.json` and `service-definitions.json`  
**Generation Date:** 2026-04-16  
**Generator:** AI-Assisted Code Generation Pipeline

---

## ✅ Generated Artifacts

All artifacts below were automatically generated from the master specification. Any manual modifications will be overwritten on next regeneration.

### 1. Modular JSON Files

**Location:** `/generated/modules/`

- **services.json** — 9 microservices with ports, health checks, event mappings
- **events.json** — 29 domain events with universal envelope schema

### 2. OpenAPI Specification

**Location:** `/generated/openapi/`

- **glenkeos-api-v1.yaml** — OpenAPI 3.1.0 specification
  - 38 REST endpoints
  - JWT authentication
  - Request/response schemas
  - Error handling
  - Pagination
  - Multi-environment servers

### 3. Database Schema

**Location:** `/generated/database/`

- **001_generated_schema.sql** — Complete PostgreSQL schema
  - 14 tables (stores, orders, order_items, inventory, drivers, staff, sessions, roles, store_assignments, policies, policy_acknowledgments, risk_events, compliance_events, metrics)
  - 79 indexes (optimized for query patterns)
  - 16 triggers (immutability enforcement, timestamp updates)
  - Row-Level Security (RLS) for multi-tenancy
  - Tenant isolation policies

### 4. Event Bus Configuration

**Location:** `/generated/eventbus/`

- **topic-map.json** — Event bus topic mapping
  - 29 topics (one per event)
  - Topic naming convention: `glenkeos.{tenantId}.{eventName}`
  - DLQ naming convention: `glenkeos.{tenantId}.{eventName}.dlq`
  - Retention: 7 days
  - Partitions: 3
  - Replication factor: 3

- **consumer-scaffolds.json** — Consumer group scaffolds
  - 8 consumer groups (one per service)
  - 60+ event handlers
  - DLQ retry policies

### 5. RBAC Configuration

**Location:** `/generated/rbac/`

- **role-permissions.json** — Role-based access control
  - 13 roles (SUPER_ADMIN, COMPLIANCE_OFFICER, RISK_MANAGER, STORE_MANAGER, etc.)
  - Granular permissions across 9 resources
  - MFA requirements
  - Session duration and idle timeout policies

---

## 🔄 Regeneration Instructions

To regenerate all artifacts from the master spec:

```bash
# Step 1: Update master spec
vim /src/imports/pasted_text/glenkeos-master-spec.json

# Step 2: Run regeneration pipeline
npm run generate:all

# Step 3: Review generated artifacts
git diff generated/

# Step 4: Deploy changes
npm run deploy
```

---

## 🚨 Critical Rules

1. **NEVER edit generated files manually** — All changes must go through the master spec
2. **ALWAYS regenerate after spec changes** — Ensures zero drift
3. **ALWAYS run tests after regeneration** — Validates generated code
4. **ALWAYS review diffs before deploying** — Catch unintended changes

---

## 📊 Generation Statistics

- **Services:** 9
- **Events:** 29
- **API Endpoints:** 38
- **Database Tables:** 14
- **Database Indexes:** 79
- **Database Triggers:** 16
- **Event Topics:** 29
- **Consumer Handlers:** 60+
- **RBAC Roles:** 13

---

## 🎯 Next Steps

1. **Backend Generation** — Generate service controllers, repositories, event publishers/consumers
2. **Frontend SDK Generation** — Generate TypeScript SDK, React hooks, API client
3. **Infrastructure Generation** — Generate Kubernetes manifests, Terraform configs, CI/CD pipelines
4. **Test Generation** — Generate unit tests, integration tests, contract tests

---

**The master spec is the single source of truth. All code flows from the spec.**
