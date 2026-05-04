# CONTRACT INDEX

Complete reference for all JSON contracts and event schemas in the GlenKeos backend.

## Overview

This document catalogs all JSON Schema contracts (`/contracts`) and domain event schemas (`/events`) that define the backend API structure. These contracts are the **source of truth** for all backend implementation.

---

## JSON Contracts (`/contracts`)

All contracts follow JSON Schema Draft 07 and the universal resource shape:

```json
{
  "id": "string",
  "type": "string",
  "attributes": {},
  "relationships": {},
  "meta": {}
}
```

### 1. Store (`contracts/store.json`)

**Purpose:** Physical store location in GlenKeos ecosystem

**ID Pattern:** `store_*`

**Key Attributes:**
- `name` - Store name
- `address` - Full address object
- `phone` - Contact phone
- `email` - Contact email
- `status` - ACTIVE | INACTIVE | MAINTENANCE
- `operatingHours` - Weekly operating hours

**Relationships:**
- `inventory` - Array of inventory item IDs
- `staff` - Array of staff IDs
- `drivers` - Array of driver IDs

**Use Cases:**
- Store management
- Operating hours tracking
- Multi-location operations

---

### 2. Order (`contracts/order.json`)

**Purpose:** Customer order in GlenKeos system

**ID Pattern:** `ord_*`

**Key Attributes:**
- `storeId` - Associated store
- `customerId` - Customer reference
- `status` - Order lifecycle status (10 states)
- `items` - Array of order items with modifiers
- `pricing` - Complete pricing breakdown
- `delivery` - Delivery address and driver assignment
- `customer` - Customer contact info
- `risk` - Risk scoring data
- `compliance` - Compliance verification
- `timestamps` - Complete order timeline

**Order Status Flow:**
1. PLACED
2. CONFIRMED
3. IN_PREP
4. READY
5. ASSIGNED
6. PICKED_UP
7. OUT_FOR_DELIVERY
8. DELIVERED
9. CANCELLED
10. FAILED

**Relationships:**
- `store` - Store ID
- `driver` - Assigned driver ID (nullable)
- `customer` - Customer ID

**Use Cases:**
- Order management
- Kitchen display system (KDS)
- Delivery tracking
- Risk assessment
- Compliance audit trail

---

### 3. Inventory Item (`contracts/inventoryItem.json`)

**Purpose:** Inventory item tracked per store

**ID Pattern:** `inv_*`

**Key Attributes:**
- `storeId` - Store reference
- `sku` - Stock keeping unit
- `name` - Item name
- `category` - INGREDIENT | PACKAGING | SUPPLY | BEVERAGE | OTHER
- `quantity` - Current stock level
- `unit` - Measurement unit
- `threshold` - Reorder threshold
- `reorderQuantity` - Default reorder amount
- `status` - IN_STOCK | LOW_STOCK | OUT_OF_STOCK | DISCONTINUED
- `supplier` - Supplier information
- `cost` - Unit cost data
- `lastRestocked` - Last restock timestamp

**Relationships:**
- `store` - Store ID

**Use Cases:**
- Inventory management
- Stockout alerts
- Automatic reordering
- Cost tracking

---

### 4. Driver (`contracts/driver.json`)

**Purpose:** Delivery driver in GlenKeos system

**ID Pattern:** `drv_*`

**Key Attributes:**
- `storeId` - Assigned store
- `name` - Driver name
- `phone` - Contact phone
- `email` - Email address
- `status` - ONLINE | OFFLINE | BUSY | ON_BREAK | INACTIVE
- `vehicle` - Vehicle details (type, make, model, etc.)
- `location` - GPS coordinates with timestamp
- `metrics` - Performance metrics (ratings, deliveries, on-time %)
- `currentOrderId` - Active order assignment

**Relationships:**
- `store` - Store ID
- `currentOrder` - Current order ID (nullable)

**Use Cases:**
- Driver management
- Order assignment
- Real-time tracking
- Performance monitoring

---

### 5. Staff (`contracts/staff.json`)

**Purpose:** Staff member with role-based access

**ID Pattern:** `staff_*`

**Key Attributes:**
- `name` - Full name
- `email` - Email (unique identifier)
- `phone` - Contact phone
- `roles` - Array of role enums (13 roles)
- `storeIds` - Accessible stores
- `status` - ACTIVE | INACTIVE | SUSPENDED
- `lastLogin` - Last login timestamp

**Staff Roles (13):**
1. SUPER_ADMIN
2. COMPLIANCE_OFFICER
3. RISK_MANAGER
4. STORE_MANAGER
5. ASSISTANT_MANAGER
6. KITCHEN_MANAGER
7. KITCHEN_STAFF
8. CASHIER
9. DISPATCHER
10. DRIVER_COORDINATOR
11. CUSTOMER_SERVICE
12. INVENTORY_MANAGER
13. VIEWER

**Relationships:**
- `stores` - Array of store IDs

**Use Cases:**
- Authentication
- Authorization (RBAC)
- Access control
- Audit trail (actor tracking)

---

### 6. Policy (`contracts/policy.json`)

**Purpose:** Governance and compliance policy

**ID Pattern:** `pol_*`

**Key Attributes:**
- `name` - Policy name
- `version` - Semantic version (X.Y.Z)
- `category` - Policy category (8 types)
- `content` - Full policy text/markdown
- `summary` - Brief summary
- `status` - DRAFT | ACTIVE | ARCHIVED | DEPRECATED
- `effectiveDate` - When policy takes effect
- `expirationDate` - Expiration (nullable)
- `approvedBy` - Staff ID of approver
- `approvedAt` - Approval timestamp
- `tags` - Searchable tags

**Policy Categories:**
- DATA_PRIVACY
- FOOD_SAFETY
- HEALTH_REGULATIONS
- LABOR_COMPLIANCE
- FINANCIAL_CONTROLS
- OPERATIONAL_STANDARDS
- SECURITY
- OTHER

**Relationships:**
- `previousVersion` - Previous policy version ID
- `approver` - Staff ID who approved

**Use Cases:**
- Policy management
- Compliance tracking
- Version control
- Regulatory adherence

---

### 7. Risk Event (`contracts/riskEvent.json`)

**Purpose:** Risk event requiring monitoring or mitigation

**ID Pattern:** `risk_*`

**Key Attributes:**
- `severity` - LOW | MEDIUM | HIGH | CRITICAL
- `status` - OPEN | IN_REVIEW | MITIGATED | RESOLVED | ESCALATED
- `category` - FRAUD | FOOD_SAFETY | OPERATIONAL | FINANCIAL | REPUTATIONAL | COMPLIANCE | SECURITY | OTHER
- `entityType` - Type of related entity
- `entityId` - Related entity ID
- `title` - Brief title
- `description` - Detailed description
- `indicators` - Risk indicator data points
- `mitigationSteps` - Mitigation action items
- `detectedBy` - System/staff who detected
- `assignedTo` - Staff assigned to resolve
- `resolvedBy` - Staff who resolved
- `resolvedAt` - Resolution timestamp

**Relationships:**
- `entity` - Related entity ID
- `assignee` - Assigned staff ID
- `resolver` - Resolving staff ID

**Use Cases:**
- Risk monitoring
- Fraud detection
- Incident management
- Mitigation tracking

---

### 8. Compliance Event (`contracts/complianceEvent.json`)

**Purpose:** Immutable audit log entry for compliance tracking

**ID Pattern:** `comp_*`

**Key Attributes:**
- `eventType` - Type of compliance event (14 types)
- `actorId` - Who triggered the event
- `actorType` - STAFF | SYSTEM | API | CUSTOMER
- `entityType` - Type of affected entity
- `entityId` - Affected entity ID
- `action` - Human-readable description
- `metadata` - Event-specific immutable data
- `ipAddress` - Request IP
- `userAgent` - Request user agent
- `timestamp` - Immutable event timestamp

**Event Types (14):**
- ORDER_CREATED
- ORDER_STATUS_CHANGED
- INVENTORY_CHANGED
- POLICY_UPDATED
- RISK_EVENT_CREATED
- RISK_EVENT_UPDATED
- ROLE_CHANGED
- STAFF_CREATED
- STAFF_UPDATED
- DRIVER_STATUS_CHANGED
- ACCESS_GRANTED
- ACCESS_REVOKED
- DATA_EXPORTED
- SYSTEM_CONFIG_CHANGED

**Relationships:**
- `actor` - Actor ID
- `entity` - Entity ID

**Meta:**
- `immutable: true` - Compliance events cannot be modified or deleted

**Use Cases:**
- Audit trail
- Compliance reporting
- Security forensics
- Regulatory compliance

---

### 9. Metric (`contracts/metric.json`)

**Purpose:** Operational metrics for dashboards and analytics

**ID Pattern:** `metric_*`

**Key Attributes:**
- `storeId` - Store-specific (nullable for global)
- `metricType` - Type of metric (9 types)
- `value` - Numeric value
- `unit` - COUNT | MINUTES | HOURS | PERCENTAGE | CURRENCY | RATIO
- `dimension` - REALTIME | HOURLY | DAILY | WEEKLY | MONTHLY
- `period` - Time period (start/end)
- `trend` - Trend data (direction, percentage, comparison)

**Metric Types:**
- ACTIVE_ORDERS
- AVG_PREP_TIME
- OUT_FOR_DELIVERY
- STOCKOUTS
- REVENUE
- ORDER_COUNT
- CUSTOMER_SATISFACTION
- DRIVER_UTILIZATION
- DELIVERY_TIME_AVG

**Relationships:**
- `store` - Store ID (nullable)

**Use Cases:**
- KPI tiles (Ops Dashboard)
- Analytics charts
- Performance monitoring
- Trend analysis

---

## Event Schemas (`/events`)

All events follow the universal envelope defined in `events/envelope.json`.

### Event Envelope (`events/envelope.json`)

**Universal shape for all domain events:**

```json
{
  "id": "uuid",
  "type": "EVENT_TYPE",
  "entityType": "order|store|driver|staff|policy|riskEvent|inventoryItem|customer|metric",
  "entityId": "string",
  "timestamp": "ISO-8601",
  "actorId": "string?",
  "actorType": "STAFF|SYSTEM|API|CUSTOMER",
  "metadata": {},
  "version": "1.0.0",
  "correlationId": "uuid?"
}
```

---

### Order Events (`events/order-events.json`)

**5 domain events:**

1. **ORDER_CREATED**
   - When: New order placed
   - Metadata: storeId, customerId, items, total

2. **ORDER_STATUS_CHANGED**
   - When: Order status transitions
   - Metadata: oldStatus, newStatus, reason

3. **ORDER_ASSIGNED**
   - When: Driver assigned to order
   - Metadata: driverId, assignmentReason, estimatedDeliveryTime

4. **ORDER_CANCELLED**
   - When: Order cancelled
   - Metadata: reason, cancelledBy, refundAmount

5. **ORDER_DELIVERED**
   - When: Order delivered successfully
   - Metadata: deliveredAt, driverId, deliveryTime

---

### Inventory Events (`events/inventory-events.json`)

**4 domain events:**

1. **INVENTORY_CHANGED**
   - When: Inventory quantity changes
   - Metadata: storeId, sku, oldQuantity, newQuantity, changeType

2. **INVENTORY_LOW_STOCK**
   - When: Stock falls below threshold
   - Metadata: storeId, sku, currentQuantity, threshold

3. **INVENTORY_OUT_OF_STOCK**
   - When: Item out of stock
   - Metadata: storeId, sku, impactedOrders

4. **INVENTORY_RESTOCKED**
   - When: Item restocked
   - Metadata: storeId, sku, quantityAdded, newTotal, supplierId

---

### Driver Events (`events/driver-events.json`)

**4 domain events:**

1. **DRIVER_STATUS_CHANGED**
   - When: Driver status changes
   - Metadata: oldStatus, newStatus, reason

2. **DRIVER_LOCATION_UPDATED**
   - When: Driver location updates
   - Metadata: latitude, longitude, accuracy, currentOrderId

3. **DRIVER_ASSIGNED_ORDER**
   - When: Driver assigned to order
   - Metadata: orderId, assignmentMethod

4. **DRIVER_COMPLETED_ORDER**
   - When: Driver completes delivery
   - Metadata: orderId, deliveryTime, rating

---

### Policy Events (`events/policy-events.json`)

**4 domain events:**

1. **POLICY_CREATED**
   - When: New policy created
   - Metadata: name, version, category

2. **POLICY_UPDATED**
   - When: Policy updated (new version)
   - Metadata: previousVersion, newVersion, changes

3. **POLICY_APPROVED**
   - When: Policy approved
   - Metadata: approvedBy, effectiveDate

4. **POLICY_ARCHIVED**
   - When: Policy archived
   - Metadata: archivedBy, reason

---

### Risk Events (`events/risk-events.json`)

**4 domain events:**

1. **RISK_EVENT_CREATED**
   - When: New risk event detected
   - Metadata: severity, category, relatedEntityType, relatedEntityId, detectedBy

2. **RISK_EVENT_UPDATED**
   - When: Risk event status/severity changes
   - Metadata: oldStatus, newStatus, oldSeverity, newSeverity

3. **RISK_EVENT_ASSIGNED**
   - When: Risk assigned to staff
   - Metadata: assignedTo, assignedBy

4. **RISK_EVENT_RESOLVED**
   - When: Risk resolved
   - Metadata: resolvedBy, resolutionSummary, mitigationActions

---

### Staff Events (`events/staff-events.json`)

**5 domain events:**

1. **STAFF_CREATED**
   - When: New staff member added
   - Metadata: email, roles, storeIds

2. **STAFF_UPDATED**
   - When: Staff info updated
   - Metadata: changes

3. **ROLE_CHANGED**
   - When: Staff roles modified
   - Metadata: oldRoles, newRoles, changedBy

4. **ACCESS_GRANTED**
   - When: Access granted to resource
   - Metadata: resource, resourceId, grantedBy

5. **ACCESS_REVOKED**
   - When: Access revoked
   - Metadata: resource, resourceId, revokedBy, reason

---

### Compliance Events (`events/compliance-events.json`)

**3 system events:**

1. **DATA_EXPORTED**
   - When: Data exported from system
   - Metadata: dataType, recordCount, exportFormat, exportedBy, reason

2. **SYSTEM_CONFIG_CHANGED**
   - When: System configuration modified
   - Metadata: configKey, oldValue, newValue, changedBy

3. **AUDIT_LOG_ACCESSED**
   - When: Audit logs accessed
   - Metadata: accessedBy, dateRange, recordCount

---

## OpenAPI Specification

### `openapi/glenkeos-api-v1.yaml`

**Complete REST API specification** (OpenAPI 3.0.3)

**Includes:**
- 40+ endpoint paths
- Full request/response schemas
- Authentication (JWT Bearer)
- Error responses
- Pagination
- Query parameters
- Path parameters

**Endpoint Summary:**

| Resource | Endpoints | Operations |
|----------|-----------|------------|
| Stores | `/stores`, `/stores/{id}` | List, Create, Get, Update |
| Orders | `/orders`, `/orders/{id}`, `/orders/{id}/status`, `/orders/{id}/assign-driver` | List, Create, Get, Update, Update Status, Assign Driver |
| Inventory | `/inventory`, `/inventory/{id}` | List, Create, Get, Update |
| Drivers | `/drivers`, `/drivers/{id}`, `/drivers/{id}/status` | List, Create, Get, Update, Update Status |
| Staff | `/staff`, `/staff/{id}` | List, Create, Get, Update |
| Policies | `/policies`, `/policies/{id}` | List, Create, Get, Update |
| Risk Events | `/risk/events`, `/risk/events/{id}` | List, Create, Get, Update |
| Compliance Events | `/compliance/events`, `/compliance/events/{id}` | List, Log, Get |
| Metrics | `/metrics` | Get |

**Total:** 9 resources, 30+ endpoints

---

## Usage

### For Backend Implementation

1. **Read contracts** in `/contracts/*.json`
2. **Generate TypeScript types** from contracts
3. **Reference OpenAPI spec** for endpoint structure
4. **Implement event producers** using schemas in `/events/*.json`
5. **Follow event envelope** for all domain events

### For Frontend Integration

1. **Reference OpenAPI spec** for API client generation
2. **Use TypeScript types** from `/src/app/types/backend.ts`
3. **Subscribe to events** via WebSocket using event envelope shape
4. **Map JSON responses** directly to component props

### For Testing

1. **Validate payloads** against JSON schemas in `/contracts`
2. **Test event shapes** against `/events` schemas
3. **Use OpenAPI spec** for contract testing

---

## Contract Versioning

All contracts use **semantic versioning**:

- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backward-compatible)
- **PATCH**: Bug fixes (backward-compatible)

Current version: **1.0.0**

---

## Next Steps

1. **Backend Implementation**: Use `IMPLEMENTATION_CHECKLIST.md` for step-by-step backend build
2. **API Generation**: Generate REST handlers from OpenAPI spec
3. **Event Bus**: Implement event producers/consumers from event schemas
4. **Frontend Hooks**: Generate React hooks from OpenAPI spec
5. **Testing**: Write contract tests validating against JSON schemas

---

**This is the complete contract layer.** All backend implementation flows from these definitions.
