# GlenKeos Implementation Checklist

**The definitive handoff document for backend implementation**  
Everything is staged. This is the spine. Execute this exactly as written.

---

## 🎯 Purpose

This checklist defines:
1. **Canonical JSON contracts** (source of truth)
2. **Endpoint mappings** (REST conventions)
3. **Component ↔ JSON mappings** (UI contracts)
4. **Event shapes** (event-driven architecture)
5. **Implementation tasks** (what to build)

Frontend is complete. Backend contracts are defined. This document connects them.

---

## 1. Core JSON Contracts (Source of Truth)

### 1.1 Order

```json
{
  "id": "string (ord_*)",
  "storeId": "string (store_*)",
  "status": "PENDING | ACCEPTED | IN_PREP | READY | ASSIGNED | PICKED_UP | OUT_FOR_DELIVERY | DELIVERED | CANCELLED | FAILED",
  "items": [
    {
      "id": "string",
      "menuItemId": "string",
      "name": "string",
      "quantity": 1,
      "price": 12.99,
      "modifiers": []
    }
  ],
  "customer": {
    "id": "string (cust_*)",
    "name": "string",
    "phone": "string"
  },
  "driverId": "string (drv_*) | null",
  "pricing": {
    "subtotal": 0,
    "tax": 0,
    "fees": 0,
    "total": 0
  },
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "slaAt": "ISO8601"
}
```

**Frontend Consumers:**
- `OrderCard` component
- `KDSTile` component
- `useOrders` hook
- `useOrder` hook
- Operations Dashboard

---

### 1.2 InventoryItem

```json
{
  "id": "string (inv_*)",
  "storeId": "string (store_*)",
  "sku": "string",
  "name": "string",
  "quantity": 42,
  "threshold": 10,
  "thresholdCritical": 5,
  "status": "OK | LOW | CRITICAL | OUT",
  "updatedAt": "ISO8601"
}
```

**Frontend Consumers:**
- `InventoryBlock` component
- `useInventory` hook
- Operations Dashboard (Column C)

---

### 1.3 Driver

```json
{
  "id": "string (drv_*)",
  "name": "string",
  "type": "HUMAN | ROBOT",
  "phone": "string",
  "email": "string",
  "status": "OFFLINE | ONLINE | ASSIGNED | EN_ROUTE | AT_PICKUP | AT_DROPOFF",
  "rating": 4.8,
  "riskScore": 12,
  "location": {
    "lat": 0,
    "lng": 0,
    "updatedAt": "ISO8601"
  },
  "vehicle": {
    "type": "CAR | BIKE | ROBOT_GEN1 | ROBOT_GEN2",
    "plate": "string"
  },
  "performance": {
    "onTimeRate": 0.97,
    "completionRate": 0.99
  },
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Frontend Consumers:**
- `AssignDriverModal` component
- `ListItem` component
- `useDrivers` hook

---

### 1.4 Staff

```json
{
  "id": "string (usr_*)",
  "name": "string",
  "email": "string",
  "role": "SUPER_ADMIN | GRC_EXECUTIVE | COC_COMMAND_LEAD | COC_AUDITOR | COMPLIANCE_ANALYST | RISK_ANALYST | OPS_DIRECTOR | STORE_MANAGER | KITCHEN_MANAGER | LINE_COOK | INVENTORY_MANAGER | LOGISTICS_COORDINATOR | DRIVER_SUPPORT",
  "storeId": "string | null",
  "permissions": ["string"],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Frontend Consumers:**
- `AuthContext`
- `InternalLayout` (role-based navigation)
- Settings Module

---

### 1.5 Policy

```json
{
  "id": "string (pol_*)",
  "title": "string",
  "jurisdiction": "US | EU | STATE | REGION",
  "scope": ["MENU", "ORDERS", "DRIVERS", "DATA"],
  "status": "DRAFT | APPROVED | DEPRECATED",
  "currentVersionId": "string",
  "versions": [
    {
      "versionId": "string (polv_*)",
      "version": 1,
      "content": {
        "summary": "string",
        "details": "string",
        "references": ["string"]
      },
      "rules": [
        {
          "ruleId": "string",
          "description": "string",
          "condition": "string",
          "requirement": "string"
        }
      ],
      "approvedBy": "string (usr_*) | null",
      "approvedAt": "ISO8601 | null"
    }
  ],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Frontend Consumers:**
- Compliance Module
- `ComplianceBlock` component

---

### 1.6 ComplianceEvent

```json
{
  "id": "string (ce_*)",
  "type": "ORDER_CREATED | ORDER_STATUS_CHANGED | DRIVER_ASSIGNED | INVENTORY_CHANGED | ROLE_CHANGED | POLICY_UPDATED | RISK_EVENT_CREATED",
  "actorId": "string (usr_* | system)",
  "actorType": "staff | driver | system | customer",
  "entityType": "ORDER | DRIVER | INVENTORY | STAFF | POLICY | RISK",
  "entityId": "string",
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "status": "OPEN | IN_REVIEW | RESOLVED",
  "timestamp": "ISO8601",
  "metadata": {
    "previous": "any",
    "next": "any",
    "note": "string | null"
  }
}
```

**Frontend Consumers:**
- Compliance Module
- `Table` component
- `ComplianceBlock` component

---

### 1.7 RiskEvent

```json
{
  "id": "string (re_*)",
  "type": "ORDER_RISK | DRIVER_RISK | INVENTORY_RISK | SYSTEM_RISK",
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "status": "OPEN | IN_REVIEW | RESOLVED | ESCALATED",
  "entityType": "ORDER | DRIVER | STORE | CUSTOMER",
  "entityId": "string",
  "score": 0,
  "description": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Frontend Consumers:**
- Analytics Module
- GRC Dashboard

---

### 1.8 OpsMetrics

```json
{
  "activeOrders": 47,
  "avgPrepTimeMinutes": 12,
  "outForDelivery": 8,
  "stockouts": 2,
  "timestamp": "ISO8601"
}
```

**Frontend Consumers:**
- Operations Dashboard (Top KPI Bar)
- `KPITile` components
- `useOpsMetrics` hook

---

## 2. Endpoint Mappings (REST Conventions)

### 2.1 Orders Service

| Method | Endpoint | Request Body | Response | Frontend Hook |
|--------|----------|--------------|----------|---------------|
| GET | `/internal/api/v1/orders` | Query: `status`, `storeId`, `limit`, `offset` | `{ orders: Order[], total: number }` | `useOrders()` |
| GET | `/internal/api/v1/orders/:id` | — | `Order` | `useOrder(id)` |
| POST | `/internal/api/v1/orders` | `{ storeId, items[], customer, ... }` | `Order` | — |
| PATCH | `/internal/api/v1/orders/:id/status` | `{ status, reasonCode, metadata? }` | `Order` | `useUpdateOrderStatus()` |
| POST | `/internal/api/v1/orders/:id/assign-driver` | `{ driverId, assignmentReason, override? }` | `Order` | `useAssignDriver()` |

**Side Effects:**
- `PATCH /status` → Emit `ORDER_STATUS_CHANGED` event → Write `ComplianceEvent`
- `POST /assign-driver` → Emit `DRIVER_ASSIGNED` event → Notify driver → Write `ComplianceEvent`
- Status `COMPLETED` → Trigger `InventoryService.decrementStock()`

---

### 2.2 Inventory Service

| Method | Endpoint | Request Body | Response | Frontend Hook |
|--------|----------|--------------|----------|---------------|
| GET | `/internal/api/v1/inventory` | Query: `storeId`, `status`, `limit`, `offset` | `{ items: InventoryItem[], total: number }` | `useInventory()` |
| GET | `/internal/api/v1/inventory/:id` | — | `InventoryItem` | `useInventoryItem(id)` |
| PATCH | `/internal/api/v1/inventory/:id` | `{ quantity?, threshold?, thresholdCritical? }` | `InventoryItem` | `useAdjustInventory()` |

**Side Effects:**
- `PATCH /inventory/:id` → Recalculate `status` → Emit `INVENTORY_CHANGED` event → Write `ComplianceEvent`
- Threshold crossed → Emit `INVENTORY_THRESHOLD_REACHED` event

---

### 2.3 Drivers Service

| Method | Endpoint | Request Body | Response | Frontend Hook |
|--------|----------|--------------|----------|---------------|
| GET | `/internal/api/v1/drivers` | Query: `status`, `storeId`, `limit`, `offset` | `{ drivers: Driver[], total: number }` | `useDrivers()` |
| GET | `/internal/api/v1/drivers/:id` | — | `Driver` | `useDriver(id)` |
| PATCH | `/internal/api/v1/drivers/:id/status` | `{ status }` | `Driver` | — |

**Side Effects:**
- `PATCH /status` → Emit `DRIVER_STATUS_CHANGED` event

---

### 2.4 Compliance Service

| Method | Endpoint | Request Body | Response | Frontend Hook |
|--------|----------|--------------|----------|---------------|
| GET | `/internal/api/v1/compliance/events` | Query: `type`, `actorId`, `entityType`, `entityId`, `since`, `limit`, `offset` | `{ events: ComplianceEvent[], total: number }` | — |
| GET | `/internal/api/v1/compliance/events/:id` | — | `ComplianceEvent` | — |

**Note:** ComplianceService is **append-only**. Events are written by other services, not via HTTP POST.

---

### 2.5 Staff/Auth Service

| Method | Endpoint | Request Body | Response | Frontend Hook |
|--------|----------|--------------|----------|---------------|
| POST | `/internal/api/v1/auth/login` | `{ email, password }` | `{ token: string, user: Staff }` | — |
| POST | `/internal/api/v1/auth/logout` | — | `{ success: true }` | — |
| GET | `/internal/api/v1/staff` | Query: `role`, `limit`, `offset` | `{ staff: Staff[], total: number }` | — |
| POST | `/internal/api/v1/staff` | `{ name, email, role, storeId?, permissions }` | `Staff` | — |
| PATCH | `/internal/api/v1/staff/:id` | `{ role?, permissions?, status? }` | `Staff` | — |

**Side Effects:**
- `POST /staff` → Emit `STAFF_CREATED` event → Write `ComplianceEvent`
- `PATCH /staff/:id` (role change) → Emit `ROLE_CHANGED` event → Write `ComplianceEvent`

---

### 2.6 Policies Service

| Method | Endpoint | Request Body | Response | Frontend Hook |
|--------|----------|--------------|----------|---------------|
| GET | `/internal/api/v1/policies` | Query: `jurisdiction`, `status`, `limit`, `offset` | `{ policies: Policy[], total: number }` | — |
| GET | `/internal/api/v1/policies/:id` | — | `Policy` | — |
| POST | `/internal/api/v1/policies` | `{ title, jurisdiction, scope, content, rules }` | `Policy` | — |
| POST | `/internal/api/v1/policies/:id/approve` | `{ versionId, approvalNote, effectiveFrom }` | `Policy` | — |

**Side Effects:**
- `POST /policies/:id/approve` → Emit `POLICY_UPDATED` event → Write `ComplianceEvent`

---

### 2.7 Metrics Service

| Method | Endpoint | Request Body | Response | Frontend Hook |
|--------|----------|--------------|----------|---------------|
| GET | `/internal/api/v1/ops/metrics` | Query: `storeId?` | `OpsMetrics` | `useOpsMetrics()` |

**Calculation Logic:**
- `activeOrders` = Count of orders where `status != DELIVERED && status != CANCELLED && status != FAILED`
- `avgPrepTimeMinutes` = Average time between `ACCEPTED` → `READY` (last 100 orders)
- `outForDelivery` = Count of orders where `status == OUT_FOR_DELIVERY`
- `stockouts` = Count of inventory items where `status == OUT`

---

## 3. Component ↔ JSON Mappings (UI Contracts)

### Frontend Component Library Location
All components are in `/src/app/components/`

| Component | Props Source (JSON Shape) | Data Hook | Used In |
|-----------|---------------------------|-----------|---------|
| `OrderCard` | `Order` | `useOrders()`, `useOrder(id)` | Operations Dashboard (Column A) |
| `KDSTile` | `Order` (subset: `id`, `items`, `status`, `createdAt`) | `useOrders()` | Operations Dashboard (Column B) |
| `InventoryBlock` | `InventoryItem` | `useInventory()` | Operations Dashboard (Column C) |
| `ComplianceBlock` | `ComplianceEvent` | — | Compliance Module |
| `KPITile` | `OpsMetrics` fields | `useOpsMetrics()` | Operations Dashboard (Top Bar) |
| `Table` | Any `[]` array + columns config | `useOrders()`, `useInventory()`, etc. | Multiple modules |
| `StatusIndicator` | `.status`, `.severity` fields | — | All status displays |
| `Badge` | `.status`, `.severity`, `.type` fields | — | All badge displays |
| `List` + `ListItem` | `Driver[]` | `useDrivers()` | AssignDriverModal |
| `AssignDriverModal` | `Driver[]` | `useDrivers()` | Operations Dashboard |

### Mapping Examples

**OrderCard → Order:**
```tsx
<OrderCard
  orderId={order.id}
  customerName={order.customer.name}
  itemsCount={order.items.length}
  status={order.status}
  prepTime={calculatePrepTime(order.createdAt)}
  store={order.storeId}
/>
```

**KDSTile → Order:**
```tsx
<KDSTile
  itemName={order.items[0].name}
  quantity={order.items.reduce((sum, item) => sum + item.quantity, 0)}
  orderId={order.id}
  status={mapOrderStatusToKDSStatus(order.status)}
  timer={calculateTimer(order.updatedAt)}
/>
```

**InventoryBlock → InventoryItem:**
```tsx
<InventoryBlock
  itemName={item.name}
  sku={item.sku}
  currentStock={item.quantity}
  threshold={item.threshold}
  status={item.status}
/>
```

---

## 4. Event Shapes (Event-Driven Architecture)

### 4.1 Generic Event Envelope

**All events follow this structure:**

```json
{
  "eventId": "string (evt_*)",
  "eventType": "string (see below)",
  "occurredAt": "ISO8601",
  "entity": {
    "entityType": "ORDER | DRIVER | INVENTORY | STAFF | POLICY",
    "entityId": "string"
  },
  "actor": {
    "actorId": "string (usr_* | drv_* | system)",
    "actorType": "staff | driver | system | customer",
    "role": "string | null"
  },
  "payload": {
    "previous": "any | null",
    "current": "any",
    "metadata": {}
  }
}
```

---

### 4.2 Domain Events

| Event Type | Emitted By | Consumed By | Purpose |
|------------|------------|-------------|---------|
| `ORDER_CREATED` | OrdersService | ComplianceService, AnalyticsService | Audit trail, metrics |
| `ORDER_STATUS_CHANGED` | OrdersService | ComplianceService, InventoryService, NotificationService | Audit, inventory depletion, customer updates |
| `DRIVER_ASSIGNED` | OrdersService | ComplianceService, NotificationService, DriversService | Audit, driver notification |
| `INVENTORY_CHANGED` | InventoryService | ComplianceService, AnalyticsService, NotificationService | Audit, low stock alerts |
| `INVENTORY_THRESHOLD_REACHED` | InventoryService | NotificationService, OpsMetricsService | Alert ops team |
| `DRIVER_STATUS_CHANGED` | DriversService | ComplianceService, AnalyticsService | Audit, availability tracking |
| `STAFF_CREATED` | StaffService | ComplianceService | Audit |
| `ROLE_CHANGED` | StaffService | ComplianceService, AuthService | Audit, permission updates |
| `POLICY_UPDATED` | PolicyService | ComplianceService | Audit, governance tracking |
| `RISK_EVENT_CREATED` | RiskService | ComplianceService, NotificationService | Audit, escalation alerts |

---

### 4.3 Event Flow Example

**Order Status Change:**

```
1. User clicks "Mark Ready" in KDS
   ↓
2. Frontend: useUpdateOrderStatus() → PATCH /orders/:id/status { status: "READY" }
   ↓
3. Backend: OrdersService.updateOrderStatus()
   ↓
4. DB: Update order.status = "READY", order.updatedAt = now()
   ↓
5. Event Bus: Emit ORDER_STATUS_CHANGED event
   ↓
6. ComplianceService: Write ComplianceEvent (audit log)
   ↓
7. NotificationService: Send push to customer app
   ↓
8. Frontend: Refetch orders → UI updates
```

---

## 5. Implementation Tasks (What to Build)

### Phase 1: Core Infrastructure

- [ ] **Database Schema**
  - Create tables for: `orders`, `order_items`, `inventory`, `drivers`, `staff`, `policies`, `compliance_events`, `risk_events`
  - Add indexes on: `storeId`, `status`, `createdAt`, `entityId`, `entityType`
  - Add foreign key constraints

- [ ] **API Gateway**
  - Setup Express/Fastify server
  - Configure CORS for frontend origin
  - Add request logging middleware
  - Add error handling middleware
  - Add rate limiting

- [ ] **Authentication Middleware**
  - JWT verification
  - Role extraction from token
  - Permission checking
  - Auto-redirect on 401 (frontend already handles this)

- [ ] **Event Bus**
  - Setup Kafka/EventBridge/SNS
  - Create topics: `orders.events`, `drivers.events`, `inventory.events`, `compliance.events`, `risk.events`
  - Event emitter utility functions
  - Event handler registration

---

### Phase 2: Domain Services

- [ ] **OrdersService**
  - Implement: `createOrder()`, `getOrders()`, `getOrder()`, `updateOrderStatus()`, `assignDriver()`
  - Emit events: `ORDER_CREATED`, `ORDER_STATUS_CHANGED`, `DRIVER_ASSIGNED`
  - SLA calculation logic
  - Status transition validation (prevent invalid transitions)

- [ ] **InventoryService**
  - Implement: `getInventoryItems()`, `getInventoryItem()`, `adjustInventory()`, `decrementStock()`
  - Status calculation: `OK | LOW | CRITICAL | OUT` based on `quantity` vs `threshold`
  - Emit events: `INVENTORY_CHANGED`, `INVENTORY_THRESHOLD_REACHED`

- [ ] **DriversService**
  - Implement: `getDrivers()`, `getDriver()`, `updateDriverStatus()`
  - Filter logic for available drivers
  - Emit events: `DRIVER_STATUS_CHANGED`

- [ ] **ComplianceService**
  - Implement: `getComplianceEvents()`, `getComplianceEvent()`
  - Event handlers for all domain events
  - Append-only write logic
  - Query filtering by `type`, `actorId`, `entityType`, `entityId`, `since`

- [ ] **StaffService**
  - Implement: `createStaff()`, `getStaff()`, `updateStaff()`
  - Role validation (ensure role is one of 13 valid roles)
  - Permission calculation per role
  - Emit events: `STAFF_CREATED`, `ROLE_CHANGED`

- [ ] **AuthService**
  - Implement: `login()`, `logout()`, `refreshToken()`
  - JWT generation with role claims
  - Password hashing (bcrypt)
  - Token blacklist for logout

- [ ] **PolicyService**
  - Implement: `getPolicies()`, `getPolicy()`, `createPolicy()`, `approvePolicy()`
  - Version tracking
  - Emit events: `POLICY_UPDATED`

- [ ] **RiskService**
  - Implement: `getRiskEvents()`, `createRiskEvent()`, `updateRiskEvent()`
  - Risk scoring logic (placeholder for ML integration)

- [ ] **OpsMetricsService**
  - Implement: `getOpsMetrics()`
  - Aggregate queries:
    - Active orders count
    - Avg prep time (last 100 orders)
    - Out for delivery count
    - Stockouts count

---

### Phase 3: API Routes

- [ ] **Orders Routes** (`/internal/api/v1/orders`)
  - Wire all 5 endpoints to OrdersService
  - Add RBAC middleware (require OPS_DIRECTOR, STORE_MANAGER, KITCHEN_MANAGER, or higher)
  - Request validation (validate status transitions, driver IDs, etc.)

- [ ] **Inventory Routes** (`/internal/api/v1/inventory`)
  - Wire all 3 endpoints to InventoryService
  - Add RBAC middleware (require INVENTORY_MANAGER or higher)

- [ ] **Drivers Routes** (`/internal/api/v1/drivers`)
  - Wire all 3 endpoints to DriversService
  - Add RBAC middleware (require OPS_DIRECTOR, LOGISTICS_COORDINATOR, or higher)

- [ ] **Compliance Routes** (`/internal/api/v1/compliance`)
  - Wire 2 GET endpoints to ComplianceService
  - Add RBAC middleware (require GRC_EXECUTIVE, COC_COMMAND_LEAD, COC_AUDITOR, or higher)

- [ ] **Staff Routes** (`/internal/api/v1/staff`)
  - Wire all endpoints to StaffService
  - Add RBAC middleware (require SUPER_ADMIN only)

- [ ] **Auth Routes** (`/internal/api/v1/auth`)
  - Wire login/logout to AuthService
  - No RBAC on login endpoint

- [ ] **Policies Routes** (`/internal/api/v1/policies`)
  - Wire all endpoints to PolicyService
  - Add RBAC middleware (require GRC_EXECUTIVE, COC_COMMAND_LEAD, or higher)

- [ ] **Metrics Routes** (`/internal/api/v1/ops/metrics`)
  - Wire to OpsMetricsService
  - Add RBAC middleware (require OPS_DIRECTOR or higher)

---

### Phase 4: Event Handlers

- [ ] **ComplianceService Event Handlers**
  - Subscribe to ALL event types
  - Transform each event into ComplianceEvent schema
  - Write to `compliance_events` table

- [ ] **InventoryService Event Handlers**
  - Subscribe to `ORDER_STATUS_CHANGED`
  - On `status == COMPLETED`: call `decrementStock()` for each order item

- [ ] **NotificationService Event Handlers**
  - Subscribe to: `ORDER_STATUS_CHANGED`, `DRIVER_ASSIGNED`, `INVENTORY_THRESHOLD_REACHED`
  - Send push notifications, emails, SMS based on event type

- [ ] **AnalyticsService Event Handlers**
  - Subscribe to ALL event types
  - Aggregate data for reporting/dashboards

---

### Phase 5: Testing & Validation

- [ ] **Unit Tests**
  - Test all service methods
  - Test event emission
  - Test status transition validation
  - Test RBAC permission logic

- [ ] **Integration Tests**
  - Test full API request → service → DB → event flow
  - Test authentication/authorization
  - Test error handling

- [ ] **Frontend Integration**
  - Point frontend `VITE_API_URL` and `VITE_INTERNAL_API_URL` to deployed backend
  - Verify all hooks return correct data
  - Verify all mutations trigger backend changes
  - Verify error states display correctly

- [ ] **Load Testing**
  - Test order creation throughput
  - Test KDS real-time polling (3-5s intervals from multiple clients)
  - Test event bus throughput

---

### Phase 6: Deployment

- [ ] **Infrastructure as Code**
  - Terraform/CloudFormation for AWS resources
  - RDS Postgres setup
  - Lambda/ECS service deployment
  - EventBridge/Kafka setup
  - S3 + CloudFront for frontend

- [ ] **CI/CD Pipeline**
  - Lint → Test → Build → Deploy
  - Separate pipelines for frontend and backend
  - Environment-specific deployments (dev, staging, prod)

- [ ] **Environment Configuration**
  - `dev`: Local development
  - `staging`: Pre-production testing
  - `prod`: Production

- [ ] **Monitoring & Logging**
  - CloudWatch logs for all services
  - Error tracking (Sentry/Rollbar)
  - Metrics dashboards (Grafana/CloudWatch)

---

## 6. RBAC Permission Matrix

| Role | Orders | Inventory | Drivers | Compliance | Staff | Policies | Metrics |
|------|--------|-----------|---------|------------|-------|----------|---------|
| SUPER_ADMIN | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| GRC_EXECUTIVE | ✅ Read | ❌ | ❌ | ✅ All | ❌ | ✅ All | ✅ Read |
| COC_COMMAND_LEAD | ✅ Read | ❌ | ❌ | ✅ All | ❌ | ✅ Read | ✅ Read |
| COC_AUDITOR | ✅ Read | ❌ | ❌ | ✅ Read | ❌ | ✅ Read | ❌ |
| COMPLIANCE_ANALYST | ❌ | ❌ | ❌ | ✅ Read | ❌ | ✅ Read | ❌ |
| RISK_ANALYST | ✅ Read | ❌ | ❌ | ✅ Read | ❌ | ❌ | ❌ |
| OPS_DIRECTOR | ✅ All | ✅ All | ✅ All | ❌ | ❌ | ❌ | ✅ All |
| STORE_MANAGER | ✅ Store only | ✅ Store only | ✅ Read | ❌ | ❌ | ❌ | ✅ Store only |
| KITCHEN_MANAGER | ✅ Read | ✅ Store only | ❌ | ❌ | ❌ | ❌ | ❌ |
| LINE_COOK | ✅ Read (KDS) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| INVENTORY_MANAGER | ❌ | ✅ All | ❌ | ❌ | ❌ | ❌ | ❌ |
| LOGISTICS_COORDINATOR | ✅ Delivery only | ❌ | ✅ All | ❌ | ❌ | ❌ | ❌ |
| DRIVER_SUPPORT | ✅ Read | ❌ | ✅ Read | ❌ | ❌ | ❌ | ❌ |

---

## 7. Success Criteria

### Backend is complete when:

- ✅ All 8 services are deployed and accessible
- ✅ All 30+ endpoints return correct JSON shapes
- ✅ Authentication works (JWT tokens are issued and verified)
- ✅ RBAC middleware enforces permissions correctly
- ✅ All domain events are emitted to event bus
- ✅ ComplianceService captures all events
- ✅ Frontend can fetch data from all hooks
- ✅ Frontend mutations trigger backend state changes
- ✅ Frontend displays loading/error states correctly
- ✅ Database has indexes on all queried fields
- ✅ Load testing shows acceptable performance
- ✅ Monitoring and logging are operational

---

## 8. Handoff Instructions

**To the next AI or engineering team:**

1. **Use this document as the source of truth**
   - JSON contracts define exact shapes
   - Endpoints define exact REST conventions
   - Component mappings define UI contracts

2. **Generate code from contracts**
   - TypeScript types → Already done in `/src/app/types/backend.ts`
   - OpenAPI schema → Generate from section 2
   - DB schemas → Generate from section 1
   - Event schemas → Generate from section 4

3. **Wire services to endpoints**
   - Follow exact endpoint mappings in section 2
   - Implement side effects as specified
   - Emit events as specified

4. **Test against frontend**
   - Frontend already exists and is production-ready
   - All hooks expect exact JSON shapes from section 1
   - All components expect exact props from section 3

5. **Deploy incrementally**
   - Start with OrdersService + InventoryService (powers Ops Dashboard)
   - Then DriversService (powers AssignDriverModal)
   - Then ComplianceService (audit logging)
   - Then remaining services

6. **Frontend is already wired**
   - All hooks are ready: `useOrders()`, `useInventory()`, `useDrivers()`, `useOpsMetrics()`
   - All components are ready: `OrderCard`, `KDSTile`, `InventoryBlock`, `AssignDriverModal`
   - All pages are ready: Operations Dashboard, Compliance Module, Analytics, etc.
   - Just point `VITE_API_URL` to your deployed backend

---

## 9. No-Code Zone

**This checklist does NOT include:**
- ❌ Actual service implementation code
- ❌ Database migration files
- ❌ Infrastructure terraform files
- ❌ CI/CD pipeline configs
- ❌ OpenAPI schema files

**Why?** Because the original user cannot implement those. This is the **specification** that enables implementation.

**What IS included:**
- ✅ Exact JSON contracts (source of truth)
- ✅ Exact endpoint mappings (REST conventions)
- ✅ Exact component mappings (UI contracts)
- ✅ Exact event shapes (event-driven architecture)
- ✅ Exact RBAC matrix (authorization rules)
- ✅ Clear task breakdown (what to build)

---

**Version:** 1.0.0  
**Status:** ✅ Ready for Implementation  
**Frontend Status:** ✅ Complete and Production-Ready  
**Backend Status:** 📋 Specified, Awaiting Implementation

**Execute this checklist line by line. The spine is locked. Go build.**
