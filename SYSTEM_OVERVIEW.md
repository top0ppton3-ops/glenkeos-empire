# GlenKeos System Overview

**Enterprise-grade multi-entity restaurant and delivery ecosystem**  
Complete architectural blueprint for developers and engineers

---

## Table of Contents

1. [Domain Architecture](#1-domain-architecture)
2. [Backend Services](#2-backend-services)
3. [API Endpoints](#3-api-endpoints)
4. [Frontend Applications](#4-frontend-applications)
5. [Internal Portal Modules](#5-internal-portal-modules)
6. [Data Flow](#6-data-flow)
7. [Event System](#7-event-system)
8. [Component Mapping](#8-component-mapping)
9. [Technology Stack](#9-technology-stack)

---

## 1. Domain Architecture

The GlenKeos ecosystem consists of **seven primary domains**:

### 1.1 Orders Domain

**Responsibility:** Full order lifecycle management from creation through delivery

**Key Functions:**
- Order creation and validation
- Status transitions (PENDING → ACCEPTED → IN_PREP → READY → OUT_FOR_DELIVERY → COMPLETED)
- Driver assignment
- SLA monitoring
- Event emission

**Consumers:**
- Customer App (Ghetto Eats)
- Ops Dashboard
- KDS View
- Compliance Module
- Analytics Module

---

### 1.2 Inventory Domain

**Responsibility:** Stock level tracking, thresholds, and availability management

**Key Functions:**
- Real-time stock tracking
- Threshold monitoring (low stock, stockouts)
- Automatic depletion on order completion
- Manual adjustments
- Status calculation

**Consumers:**
- Ops Dashboard (Inventory Panel)
- Menu availability system
- Compliance Module
- Analytics (stockout metrics)

---

### 1.3 Drivers Domain

**Responsibility:** Driver profile and availability management

**Key Functions:**
- Driver status tracking (OFFLINE, ONLINE, ASSIGNED, EN_ROUTE)
- Location updates
- Performance metrics
- Assignment eligibility

**Consumers:**
- Ops Dashboard (Assign Driver modal)
- Orders Domain (driver assignment)
- Analytics (driver utilization)
- Rusty Link Driver App

---

### 1.4 Compliance Domain

**Responsibility:** Immutable event log for operational and governance-relevant actions

**Key Functions:**
- Append-only event storage
- Event querying and filtering
- Audit trail maintenance
- Policy violation tracking

**Event Sources:**
- Orders (OrderCreated, OrderStatusChanged, DriverAssigned)
- Inventory (InventoryChanged)
- Staff/Auth (StaffCreated, RoleChanged)
- Policies (PolicyUpdated)
- Risk (RiskEventCreated/Updated)

**Consumers:**
- Compliance Module in Internal Portal
- GRC reporting
- Audit reviews
- Risk analysis

---

### 1.5 Staff/Auth Domain

**Responsibility:** Authentication, authorization, and staff lifecycle management

**Key Functions:**
- JWT authentication
- RBAC enforcement (13 role types)
- Staff account management
- Role assignment and updates
- Session management

**Consumers:**
- Internal Portal (AuthContext, role-aware navigation)
- All protected APIs (via JWT middleware)
- Compliance (role change events)

**Roles:**
- SUPER_ADMIN
- GRC_EXECUTIVE
- COC_COMMAND_LEAD
- COC_AUDITOR
- COMPLIANCE_ANALYST
- RISK_ANALYST
- OPS_DIRECTOR
- STORE_MANAGER
- KITCHEN_MANAGER
- LINE_COOK
- INVENTORY_MANAGER
- LOGISTICS_COORDINATOR
- DRIVER_SUPPORT

---

### 1.6 Policies Domain

**Responsibility:** Operational and compliance policy storage and versioning

**Key Functions:**
- Policy creation and versioning
- Approval workflows
- Jurisdiction mapping
- Policy retrieval

**Consumers:**
- Compliance Module
- GRC reviews
- COC Command Dashboard

---

### 1.7 Risk Domain

**Responsibility:** Risk event tracking and lifecycle management

**Key Functions:**
- Risk event creation
- Severity assessment
- Status transitions
- Risk score calculation

**Consumers:**
- Risk/Compliance dashboards
- GRC analysis
- Reporting modules

---

## 2. Backend Services

### Service Architecture

```
backend/
├── services/
│   ├── orders/          # OrdersService
│   ├── inventory/       # InventoryService
│   ├── drivers/         # DriversService
│   ├── compliance/      # ComplianceService
│   ├── staff/           # StaffService
│   ├── auth/            # AuthService
│   ├── policies/        # PolicyService
│   ├── risk/            # RiskService
│   └── metrics/         # OpsMetricsService
├── api/
│   ├── routes/          # Express/Fastify routes
│   └── middleware/      # Auth, RBAC, logging
├── events/
│   ├── emitters/        # Event emission logic
│   └── handlers/        # Event handlers
└── db/
    ├── models/          # Database models
    └── migrations/      # Schema migrations
```

### Service Responsibilities

| Service | Endpoints | Events Emitted | Events Consumed |
|---------|-----------|----------------|-----------------|
| **OrdersService** | `/orders`, `/orders/:id`, `/orders/:id/status`, `/orders/:id/assign-driver` | `OrderCreated`, `OrderStatusChanged`, `DriverAssigned` | `InventoryChanged` |
| **InventoryService** | `/inventory`, `/inventory/:id` | `InventoryChanged`, `ThresholdReached` | `OrderCompleted` |
| **DriversService** | `/drivers`, `/drivers/:id`, `/drivers/:id/status` | `DriverStatusChanged`, `DriverLocationUpdated` | `OrderAssigned` |
| **ComplianceService** | `/compliance/events`, `/compliance/events/:id` | — | All domain events |
| **StaffService** | `/staff`, `/staff/:id` | `StaffCreated`, `RoleChanged` | — |
| **AuthService** | `/auth/login`, `/auth/logout` | `UserLoggedIn` | — |
| **PolicyService** | `/policies`, `/policies/:id` | `PolicyUpdated` | — |
| **RiskService** | `/risk/events`, `/risk/events/:id` | `RiskEventCreated`, `RiskEventUpdated` | Compliance events |
| **OpsMetricsService** | `/ops/metrics` | — | Order and inventory data |

---

## 3. API Endpoints

### Public API (`/api/v1`)

| Method | Endpoint | Purpose | Used By |
|--------|----------|---------|---------|
| POST | `/api/v1/orders` | Create customer order | Customer App |
| GET | `/api/v1/orders/:id` | Get order details | Customer App (tracking) |
| GET | `/api/v1/menu` | Get menu items | Customer App |
| GET | `/api/v1/stores` | Get store locations | Customer App |
| POST | `/api/v1/auth/login` | Customer login | Customer App |

### Internal API (`/internal/api/v1`)

| Method | Endpoint | Purpose | Used By |
|--------|----------|---------|---------|
| GET | `/internal/api/v1/orders` | List orders with filters | Ops Dashboard, KDS |
| GET | `/internal/api/v1/orders/:id` | Get order details | Ops Dashboard |
| PATCH | `/internal/api/v1/orders/:id/status` | Update order status | KDS, Ops Dashboard |
| POST | `/internal/api/v1/orders/:id/assign-driver` | Assign driver | Ops Dashboard |
| GET | `/internal/api/v1/inventory` | List inventory items | Ops Dashboard |
| PATCH | `/internal/api/v1/inventory/:id` | Adjust inventory | Ops Dashboard |
| GET | `/internal/api/v1/drivers` | List drivers | Ops Dashboard |
| PATCH | `/internal/api/v1/drivers/:id/status` | Update driver status | Ops Dashboard |
| GET | `/internal/api/v1/compliance/events` | List compliance events | Compliance Module |
| GET | `/internal/api/v1/ops/metrics` | Get ops metrics | Ops Dashboard |
| POST | `/internal/api/v1/staff` | Create staff member | Admin Module |
| GET | `/internal/api/v1/policies` | List policies | Compliance Module |
| POST | `/internal/api/v1/auth/login` | Staff login | Internal Portal |

---

## 4. Frontend Applications

### 4.1 Customer App (Ghetto Eats)

**Platform:** Web (React) + Mobile (React Native)  
**Brand Tier:** B2 (Greek Royal visual accents)  
**Routes:**
- `/` - Home
- `/menu` - Menu browsing
- `/menu/:itemId` - Item details
- `/cart` - Shopping cart
- `/checkout` - Order checkout
- `/orders/:orderId` - Order tracking
- `/account` - Customer account

**Key Features:**
- Menu browsing with availability
- Order placement and payment
- Real-time order tracking
- Account management

---

### 4.2 Internal Portal

**Platform:** Web (React)  
**Brand Tier:** B3 (Ultra-Modern Royal)  
**Base Route:** `/internal`

**Modules:**
1. **Dashboard** (`/internal`) - Overview metrics
2. **Operations** (`/internal/operations`) - Order queue, KDS, inventory
3. **Compliance** (`/internal/compliance`) - Audit logs, policy management
4. **Analytics** (`/internal/analytics`) - KPIs and reports
5. **Settings** (`/internal/settings`) - User preferences, system config

**Authentication:** Required for all routes except `/internal/login`

---

### 4.3 Driver App (Rusty Link)

**Platform:** Mobile (React Native)  
**Brand Tier:** B1 (Corporate Luxury baseline)

**Key Features:**
- Driver availability toggle
- Order acceptance/rejection
- Navigation to pickup/dropoff
- Proof of delivery
- Performance metrics

---

### 4.4 Corporate Site

**Platform:** Web (React)  
**Brand Tier:** B1 (Corporate Luxury)  
**Base Route:** `/corporate`

**Pages:**
- `/corporate` - GlenKeos Holdings overview
- `/corporate/divisions` - Division structure
- `/corporate/compliance` - Compliance overview
- `/corporate/risk-governance` - Risk management
- `/corporate/technology` - Technology stack
- `/corporate/vault` - Governance vault

---

## 5. Internal Portal Modules

### 5.1 Operations Dashboard

**Route:** `/internal/operations`

**Layout:** 3-column design

#### Top KPI Bar (4 metrics)

| Metric | Data Source | Update Frequency |
|--------|-------------|------------------|
| Active Orders | `GET /ops/metrics` | 30s |
| Avg Prep Time | `GET /ops/metrics` | 30s |
| Out for Delivery | `GET /ops/metrics` | 30s |
| Stockouts | `GET /ops/metrics` | 30s |

#### Column A: Live Order Queue

**Components:** `Tabs`, `OrderCard[]`, `Badge`, `StatusIndicator`, `Modal`

**Data Hook:** `useOrders({ status, storeId })`

**Tabs:**
- All
- Pending
- Accepted
- In Progress
- Ready
- Out for Delivery

**Actions:**
- Accept order → `PATCH /orders/:id/status`
- Start prep → `PATCH /orders/:id/status`
- Mark ready → `PATCH /orders/:id/status`
- Assign driver → `POST /orders/:id/assign-driver`

#### Column B: KDS View

**Components:** `Tabs`, `KDSTile[]`, `Loader`, `Toast`

**Data Hook:** `useOrders({ status: ["ACCEPTED", "IN_PREP", "READY"], storeId })`

**Tabs:**
- Accepted
- In Progress
- Ready

**Actions:**
- Start prep → `PATCH /orders/:id/status`
- Mark ready → `PATCH /orders/:id/status`

#### Column C: Inventory & Alerts

**Components:** `InventoryBlock[]`, `Alert[]`, `MetricBlock`, `StatusIndicator`

**Data Hook:** `useInventory({ storeId })`

**Sections:**
- Low stock alerts (top)
- Stockout metrics
- Inventory list

**Actions:**
- Adjust inventory → `PATCH /inventory/:id`

---

### 5.2 Compliance Module

**Route:** `/internal/compliance`

**Components:** `Table`, `Tabs`, `StatusIndicator`, `EmptyState`

**Data Hooks:**
- `useComplianceEvents({ filters })`
- `useComplianceEvent(id)`

**Features:**
- Event list with filters
- Event detail view
- Policy cross-reference
- Export functionality

---

### 5.3 Analytics Module

**Route:** `/internal/analytics`

**Components:** `KPITile[]`, `MetricBlock[]`, `Table`, `Chart`

**Data Sources:**
- Operational KPIs
- Compliance metrics
- Risk scores
- Store performance

---

### 5.4 Settings Module

**Route:** `/internal/settings`

**Tabs:**
- Profile
- Notifications
- Security
- System (admin only)

---

## 6. Data Flow

### Order Creation Flow

```
Customer App (POST /api/v1/orders)
    ↓
OrdersService.createOrder()
    ↓
Validate order → Persist to DB → Emit OrderCreated event
    ↓
ComplianceService.handleOrderCreated()
    ↓
Ops Dashboard (useOrders hook polls GET /orders)
    ↓
KDS View displays order
```

### Order Status Update Flow

```
KDS View (PATCH /orders/:id/status)
    ↓
OrdersService.updateOrderStatus()
    ↓
Update DB → Emit OrderStatusChanged event
    ↓
ComplianceService.handleOrderStatusChanged()
    ↓
If status === COMPLETED → InventoryService.decrementStock()
    ↓
Emit InventoryChanged event
    ↓
Ops Dashboard refetches orders
```

### Driver Assignment Flow

```
Ops Dashboard (POST /orders/:id/assign-driver)
    ↓
OrdersService.assignDriver()
    ↓
Validate driver → Update order → Emit DriverAssigned event
    ↓
NotificationService.notifyDriver()
    ↓
Driver App receives push notification
    ↓
Ops Dashboard refetches order
```

---

## 7. Event System

### Event Bus

**Technology:** Kafka / EventBridge / SNS

**Topics:**
- `orders.events`
- `drivers.events`
- `inventory.events`
- `compliance.events`
- `risk.events`
- `auth.events`

### Event Schemas

All events follow this structure:

```typescript
{
  event_type: string;
  event_id: string;
  occurred_at: ISO8601;
  entity: { ... };
  actor: { actor_id, actor_type, role };
  metadata: { ... };
}
```

### Event Consumers

| Service | Subscribed Events | Purpose |
|---------|-------------------|---------|
| ComplianceService | All events | Audit logging |
| RiskService | Order, Driver, Compliance events | Risk scoring |
| AnalyticsService | All events | Metrics aggregation |
| NotificationService | Order, Driver, Inventory events | Push notifications |

---

## 8. Component Mapping

### Ops Dashboard → Services/Endpoints

| Widget | Components | Service | Endpoints |
|--------|------------|---------|-----------|
| Top KPI bar | `KPITile`, `MetricBlock` | OpsMetricsService | `GET /ops/metrics` |
| Live Order Queue | `OrderCard`, `Tabs`, `Badge`, `Modal` | OrdersService | `GET /orders`, `PATCH /orders/:id/status`, `POST /orders/:id/assign-driver` |
| KDS View | `KDSTile`, `Tabs`, `Loader` | OrdersService | `GET /orders`, `PATCH /orders/:id/status` |
| Assign Driver Modal | `Modal`, `List`, `Button` | DriversService | `GET /drivers`, `POST /orders/:id/assign-driver` |
| Inventory Panel | `InventoryBlock`, `Table`, `Alert` | InventoryService | `GET /inventory`, `PATCH /inventory/:id` |

---

## 9. Technology Stack

### Frontend

**Framework:** React 18 + TypeScript  
**Routing:** React Router  
**Styling:** Tailwind CSS v4  
**Animation:** Motion/React (Framer Motion)  
**State:** React Context + Custom Hooks  
**HTTP Client:** Custom API client with retry logic  
**Forms:** React Hook Form (v7.55.0)  
**Icons:** Lucide React

### Backend

**Runtime:** Node.js  
**Framework:** Express / Fastify  
**Language:** TypeScript  
**Database:** PostgreSQL (RDS)  
**Caching:** Redis  
**Event Bus:** Kafka / AWS EventBridge  
**Auth:** JWT + OAuth2  
**API Docs:** OpenAPI 3.0

### Infrastructure

**Cloud:** AWS  
**Compute:** Lambda / ECS  
**Database:** RDS Postgres  
**Storage:** S3  
**CDN:** CloudFront  
**Event Bus:** EventBridge  
**Monitoring:** CloudWatch  
**Secrets:** AWS Secrets Manager / KMS

### Design System

**Tokens:** CSS Custom Properties  
**Component Library:** Custom React components  
**Brand Tiers:**
- B1: Corporate Luxury (baseline)
- B2: Greek Royal (visual accents)
- B3: Ultra-Modern Royal (premium)

**Accessibility:** WCAG 2.1 Level AA  
**Internationalization:** i18n support, RTL layouts

---

## Quick Reference

### Service Ports (Local Development)

- API Gateway: `3000`
- OrdersService: `3001`
- InventoryService: `3002`
- DriversService: `3003`
- ComplianceService: `3004`
- AuthService: `3005`

### Environment Variables

```env
# API URLs
VITE_API_URL=http://localhost:3000
VITE_INTERNAL_API_URL=http://localhost:3000

# Auth
JWT_SECRET=<secret>
JWT_EXPIRATION=24h

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/glenkeos

# Event Bus
KAFKA_BROKERS=localhost:9092
EVENTBRIDGE_BUS_NAME=glenkeos-events

# Feature Flags
ENABLE_REAL_TIME_UPDATES=true
ENABLE_WEBSOCKETS=true
```

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-15  
**Status:** ✅ Production Ready  
**Compliance:** ISO 31000, NIST CSF, WCAG 2.1 AA
