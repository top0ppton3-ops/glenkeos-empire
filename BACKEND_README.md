# GlenKeos Backend Specification

Complete JSON-first backend specification for GlenKeos multi-entity restaurant and delivery ecosystem.

---

## Quick Start

### For AI Implementation

**Start here:** Read `SINGLE_FILE_MASTER_SPEC.md`

This master document references all other documentation and provides the complete implementation flow.

### For Human Developers

1. **Understand the system:** Read `SYSTEM_WIRING_OVERVIEW.md`
2. **Review contracts:** Read `CONTRACT_INDEX.md`
3. **Check implementation status:** Read `BACKEND_IMPLEMENTATION_STATUS.md`
4. **Follow the checklist:** Execute `IMPLEMENTATION_CHECKLIST.md`

---

## Repository Structure

```
/
├── contracts/                    # JSON Schema contracts (source of truth)
│   ├── store.json
│   ├── order.json
│   ├── inventoryItem.json
│   ├── driver.json
│   ├── staff.json
│   ├── policy.json
│   ├── riskEvent.json
│   ├── complianceEvent.json
│   └── metric.json
│
├── events/                       # Event schemas
│   ├── envelope.json            # Universal event envelope
│   ├── order-events.json
│   ├── inventory-events.json
│   ├── driver-events.json
│   ├── policy-events.json
│   ├── risk-events.json
│   ├── staff-events.json
│   └── compliance-events.json
│
├── openapi/                      # OpenAPI specification
│   └── glenkeos-api-v1.yaml    # Complete REST API spec
│
├── backend/                      # Backend implementation (to be generated)
│   ├── orders/
│   ├── inventory/
│   ├── drivers/
│   ├── staff/
│   ├── policies/
│   ├── risk/
│   ├── compliance/
│   └── ops-metrics/
│
└── [documentation files]         # 15+ comprehensive docs
```

---

## What's Included

### ✅ JSON Contracts (9)

Complete JSON Schema definitions for all domain models:

- **Store** - Physical locations with operating hours
- **Order** - Full lifecycle with 10 statuses, pricing, delivery, risk
- **InventoryItem** - Stock tracking with threshold alerts
- **Driver** - Real-time tracking, metrics, assignments
- **Staff** - RBAC with 13 roles, multi-store access
- **Policy** - Versioned governance policies
- **RiskEvent** - Risk monitoring and mitigation
- **ComplianceEvent** - Immutable audit trail
- **Metric** - Operational metrics and analytics

**See:** `CONTRACT_INDEX.md` for full catalog

---

### ✅ Event Schemas (29 events)

Universal event envelope + domain events:

- **Order Events** (5): Created, Status Changed, Assigned, Cancelled, Delivered
- **Inventory Events** (4): Changed, Low Stock, Out of Stock, Restocked
- **Driver Events** (4): Status Changed, Location Updated, Assigned, Completed
- **Policy Events** (4): Created, Updated, Approved, Archived
- **Risk Events** (4): Created, Updated, Assigned, Resolved
- **Staff Events** (5): Created, Updated, Role Changed, Access Granted/Revoked
- **Compliance Events** (3): Data Exported, Config Changed, Audit Accessed

**See:** `EVENT_SCHEMA_LIBRARY.md` for event reference

---

### ✅ OpenAPI Specification

Complete REST API (OpenAPI 3.0.3):

- **30+ endpoints** across 9 resources
- Full request/response schemas
- JWT authentication
- Pagination support
- Error handling
- Query/path parameters

**See:** `openapi/glenkeos-api-v1.yaml`

---

### ✅ Documentation (15 files)

Comprehensive implementation guides:

1. **SINGLE_FILE_MASTER_SPEC.md** - Master index (start here)
2. **CONTRACT_INDEX.md** - Complete contract catalog
3. **BACKEND_IMPLEMENTATION_STATUS.md** - Current status
4. **IMPLEMENTATION_CHECKLIST.md** - Step-by-step tasks
5. **AI_JSON_IMPLEMENTATION_FLOW.md** - JSON-driven blueprint
6. **AI_CODEGEN_HANDOFF_GUIDE.md** - AI generation rules
7. **SYSTEM_WIRING_OVERVIEW.md** - Architecture
8. **DOMAIN_MODEL_ATLAS.md** - Entity relationships
9. **REPO_STRUCTURE.md** - Folder layout
10. **SERVICE_GENERATION_SEQUENCE.md** - Backend gen order
11. **FRONTEND_BOOTSTRAP_PLAN.md** - Frontend gen order
12. **EVENT_SCHEMA_LIBRARY.md** - Event reference
13. **FULL_SYSTEM_JSON_MAP.md** - JSON relationships
14. **COMPONENT_DATA_FLOW_MAP.md** - Data flow
15. **EVENT_TO_UI_PIPELINE.md** - Event pipeline

---

## Implementation Flow

### Step 1: Generate Types

From `/contracts/*.json`:

```
order.json → Order.ts
inventoryItem.json → InventoryItem.ts
driver.json → Driver.ts
...
```

### Step 2: Generate OpenAPI Handlers

From `/openapi/glenkeos-api-v1.yaml`:

```
GET /orders → ordersController.list()
POST /orders → ordersController.create()
PATCH /orders/{id} → ordersController.update()
...
```

### Step 3: Implement Event System

From `/events/*.json`:

```
OrderService emits → ORDER_CREATED
EventBus routes to → [ComplianceService, MetricsService, WebSocketBroadcaster]
```

### Step 4: Wire Services

For each domain:

```
controllers/ → handle HTTP
services/ → business logic + emit events
repositories/ → data access
```

### Step 5: Connect Frontend

Frontend already has:

- TypeScript types (`/src/app/types/backend.ts`)
- API hooks (`/src/app/hooks/`)
- Components (`/src/app/components/`)
- Pages (`/src/app/pages/`)

Just point to deployed backend!

---

## API Endpoint Summary

### Stores
- `GET /stores` - List stores
- `POST /stores` - Create store
- `GET /stores/{id}` - Get store
- `PATCH /stores/{id}` - Update store

### Orders
- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /orders/{id}` - Get order
- `PATCH /orders/{id}` - Update order
- `PATCH /orders/{id}/status` - Update status
- `PATCH /orders/{id}/assign-driver` - Assign driver

### Inventory
- `GET /inventory` - List inventory
- `POST /inventory` - Create item
- `GET /inventory/{id}` - Get item
- `PATCH /inventory/{id}` - Update item

### Drivers
- `GET /drivers` - List drivers
- `POST /drivers` - Create driver
- `GET /drivers/{id}` - Get driver
- `PATCH /drivers/{id}` - Update driver
- `PATCH /drivers/{id}/status` - Update status

### Staff
- `GET /staff` - List staff
- `POST /staff` - Create staff
- `GET /staff/{id}` - Get staff
- `PATCH /staff/{id}` - Update staff

### Policies
- `GET /policies` - List policies
- `POST /policies` - Create policy
- `GET /policies/{id}` - Get policy
- `PATCH /policies/{id}` - Update policy

### Risk Events
- `GET /risk/events` - List risk events
- `POST /risk/events` - Create risk event
- `GET /risk/events/{id}` - Get risk event
- `PATCH /risk/events/{id}` - Update risk event

### Compliance Events
- `GET /compliance/events` - List compliance events
- `POST /compliance/events` - Log event
- `GET /compliance/events/{id}` - Get event

### Metrics
- `GET /metrics` - Get operational metrics

**Total:** 37 endpoints

---

## Event Flow

```
Backend Service
    ↓
  Emits Event (using envelope from /events/envelope.json)
    ↓
  Event Bus
    ↓
  ┌─────────────┬──────────────┬─────────────────────┐
  ↓             ↓              ↓                     ↓
Compliance   Metrics    WebSocket         Analytics
Service      Service    Broadcaster        Service
  ↓             ↓              ↓                     ↓
Audit Log   KPI Tiles      Frontend UI         Charts
```

---

## Data Flow

```
Frontend Component
    ↓
  React Hook (useOrders, useInventory, etc.)
    ↓
  API Service (api.orders.list(), etc.)
    ↓
  HTTP Request to Backend
    ↓
  Controller → Service → Repository
    ↓
  JSON Response (matches contract schema)
    ↓
  Component Renders
```

---

## Key Principles

### 1. JSON-First

Everything flows from JSON contracts. Contracts are **source of truth**.

### 2. Event-Driven

All state changes emit events. Events are **immutable**.

### 3. Type-Safe

Full TypeScript types generated from contracts. No `any` types.

### 4. RBAC

13 granular roles. All endpoints check permissions.

### 5. Audit Trail

All actions logged to ComplianceEvent. Immutable, queryable.

### 6. Zero Drift

No hardcoded values. All configs in contracts.

---

## Technology Stack (Recommended)

- **Language:** TypeScript / Node.js
- **Framework:** Express / Fastify / NestJS
- **Database:** PostgreSQL
- **Event Bus:** Redis / RabbitMQ / AWS SNS/SQS
- **WebSocket:** Socket.io / ws
- **Validation:** Ajv (JSON Schema validator)
- **API Client:** Generated from OpenAPI (openapi-generator)
- **Testing:** Jest / Vitest
- **CI/CD:** GitHub Actions / GitLab CI
- **Deployment:** Docker / Kubernetes / AWS ECS

---

## Getting Started

### 1. Clone Repository

```bash
git clone <repo>
cd glenkeos
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Generate Types

```bash
# Use json-schema-to-typescript or similar
npx json-schema-to-typescript contracts/*.json > types/generated.ts
```

### 4. Generate API Client

```bash
# Use openapi-generator
npx @openapitools/openapi-generator-cli generate \
  -i openapi/glenkeos-api-v1.yaml \
  -g typescript-axios \
  -o src/api/generated
```

### 5. Implement Services

Follow `SERVICE_GENERATION_SEQUENCE.md` to implement backend services.

### 6. Run Tests

```bash
pnpm test
```

### 7. Start Backend

```bash
pnpm dev
```

---

## Testing

### Contract Testing

Validate all API responses against JSON schemas:

```typescript
import Ajv from "ajv";
import orderSchema from "../contracts/order.json";

const ajv = new Ajv();
const validate = ajv.compile(orderSchema);

const response = await api.orders.get("ord_123");
const valid = validate(response.data);
if (!valid) throw new Error(validate.errors);
```

### Event Testing

Validate all events against event schemas:

```typescript
import envelopeSchema from "../events/envelope.json";

const event = {
  id: uuid(),
  type: "ORDER_CREATED",
  entityType: "order",
  entityId: "ord_123",
  timestamp: new Date().toISOString(),
  actorType: "STAFF",
  metadata: { storeId: "store_001", total: 45.99 },
  version: "1.0.0"
};

const valid = validateEvent(event, envelopeSchema);
```

---

## Support

### Questions?

- **Architecture:** Read `SYSTEM_WIRING_OVERVIEW.md`
- **Contracts:** Read `CONTRACT_INDEX.md`
- **Events:** Read `EVENT_SCHEMA_LIBRARY.md`
- **API:** See `openapi/glenkeos-api-v1.yaml`
- **Implementation:** Follow `IMPLEMENTATION_CHECKLIST.md`

### AI Implementation?

- **Start:** `SINGLE_FILE_MASTER_SPEC.md`
- **Rules:** `AI_CODEGEN_HANDOFF_GUIDE.md`
- **Sequence:** `SERVICE_GENERATION_SEQUENCE.md`

---

## Current Status

**Specification:** ✅ 100% Complete

- ✅ 9 JSON contracts
- ✅ 29 event schemas
- ✅ 1 OpenAPI spec (37 endpoints)
- ✅ 15 documentation files

**Implementation:** ⏳ Ready to Start

- ⏳ Type generation
- ⏳ Service scaffolding
- ⏳ Event system
- ⏳ Database layer
- ⏳ API implementation
- ⏳ Testing
- ⏳ Deployment

**Frontend:** ✅ 100% Complete

- ✅ 25+ components
- ✅ Complete type system
- ✅ API hooks
- ✅ 5 internal portal modules
- ✅ Operations Dashboard

---

## License

Proprietary - GlenKeos

---

**The battlefield is staged. The spine is locked. Go build.**
