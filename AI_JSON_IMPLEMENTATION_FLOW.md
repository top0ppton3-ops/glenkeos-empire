# AI_JSON_IMPLEMENTATION_FLOW.md

The single conceptual blueprint for a JSON-driven, AI-ready implementation pipeline

## 1. MASTER JSON CONTRACT INDEX

Every domain object in the system follows this universal shape:

```json
{
  "id": "string",
  "type": "string",
  "attributes": {},
  "relationships": {},
  "meta": {}
}
```

This is the root pattern.

Every resource extends it.

### 1.1 Orders

```json
{
  "id": "string",
  "type": "order",
  "attributes": {
    "storeId": "string",
    "status": "string",
    "items": [],
    "customer": {},
    "driverId": "string?",
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  },
  "relationships": {},
  "meta": {}
}
```

### 1.2 InventoryItem

```json
{
  "id": "string",
  "type": "inventoryItem",
  "attributes": {
    "storeId": "string",
    "sku": "string",
    "name": "string",
    "quantity": 0,
    "threshold": 0,
    "status": "string",
    "updatedAt": "ISO-8601"
  }
}
```

### 1.3 Driver

```json
{
  "id": "string",
  "type": "driver",
  "attributes": {
    "storeId": "string",
    "name": "string",
    "phone": "string",
    "status": "string",
    "vehicleType": "string",
    "createdAt": "ISO-8601"
  }
}
```

### 1.4 Staff

```json
{
  "id": "string",
  "type": "staff",
  "attributes": {
    "name": "string",
    "email": "string",
    "roles": [],
    "createdAt": "ISO-8601"
  }
}
```

### 1.5 Policy

```json
{
  "id": "string",
  "type": "policy",
  "attributes": {
    "name": "string",
    "version": "string",
    "category": "string",
    "content": "string",
    "updatedAt": "ISO-8601"
  }
}
```

### 1.6 RiskEvent

```json
{
  "id": "string",
  "type": "riskEvent",
  "attributes": {
    "severity": "string",
    "status": "string",
    "entityType": "string",
    "entityId": "string",
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  }
}
```

### 1.7 ComplianceEvent

```json
{
  "id": "string",
  "type": "complianceEvent",
  "attributes": {
    "actorId": "string",
    "entityType": "string",
    "entityId": "string",
    "timestamp": "ISO-8601",
    "metadata": {}
  }
}
```

## 2. ENDPOINT FLOW (JSON-FIRST)

Every resource follows the same conceptual pattern:

```
GET    /resource          → returns JSON[]
GET    /resource/:id      → returns JSON
POST   /resource          → accepts JSON, returns JSON
PATCH  /resource/:id      → accepts JSON, returns JSON
```

This applies to:

- orders
- inventory
- drivers
- staff
- policies
- risk/events
- compliance/events
- ops/metrics

This is the contract → endpoint → response flow.

## 3. FRONTEND FLOW (JSON → HOOKS → COMPONENTS)

### 3.1 Hooks generated from endpoints

Conceptual pattern:

```ts
useList()        → GET /resource
useDetail(id)    → GET /resource/:id
useCreate()      → POST /resource
useUpdate()      → PATCH /resource/:id
```

### 3.2 Components consume JSON directly

- OrderCard(order)
- KDSTile(order)
- InventoryBlock(item)
- ComplianceBlock(event)
- KPITile(metric)

Everything is JSON in → UI out.

## 4. EVENT FLOW (JSON → BUS → UI)

### 4.1 Universal event envelope

```json
{
  "id": "uuid",
  "type": "EVENT_TYPE",
  "entityType": "string",
  "entityId": "string",
  "timestamp": "ISO-8601",
  "actorId": "string?",
  "metadata": {}
}
```

### 4.2 Domain event types

- ORDER_CREATED
- ORDER_STATUS_CHANGED
- INVENTORY_CHANGED
- POLICY_UPDATED
- RISK_EVENT_CREATED
- RISK_EVENT_UPDATED
- ROLE_CHANGED

### 4.3 Event consumers

- UI (via WebSocket)
- Metrics
- Analytics

Everything flows through JSON events.

## 5. IMPLEMENTATION PIPELINE (JSON-DRIVEN)

**Step 1** — Define JSON contracts  
This is the root.

**Step 2** — Generate TS types  
From JSON.

**Step 3** — Generate OpenAPI  
From types.

**Step 4** — Generate backend handlers  
From OpenAPI.

**Step 5** — Generate event producers/consumers  
From event envelope.

**Step 6** — Generate frontend hooks  
From endpoints.

**Step 7** — Generate components  
From JSON shapes.

**Step 8** — Generate pages  
From components.

**Step 9** — Generate CI/CD + infra  
From service definitions.

**Step 10** — Connect events → UI  
From event bus.

This is the AI-ready flow.

## 6. BRAND TIER ALIGNMENT (JSON-FIRST)

**Operational JSON → B1**  
Orders, Inventory, KDS, Delivery, Staff.

**Marketing JSON → B2**  
Restaurant hero, promos, storytelling.

**Corporate JSON → B3**  
Policies, Compliance, Risk, Staff roles, Internal Portal shell.

This keeps the visual + data layers aligned.

## 7. WHAT THIS ENABLES

With this structure:

- Any AI can generate backend code
- Any AI can generate frontend hooks
- Any AI can generate components
- Any AI can generate pages
- Any AI can generate event pipelines
- Any AI can generate infra

Because everything flows from JSON.

## 8. AI GENERATION SEQUENCE

### 1. Read JSON Contracts

AI loads everything in `/contracts/*.json`.

These define:

- fields
- types
- relationships
- metadata

This is the root of truth.

### 2. Generate TypeScript Types

For each JSON contract:

```
order.json → Order.ts
inventoryItem.json → InventoryItem.ts
driver.json → Driver.ts
...
```

These types become:

- validators
- serializers
- event payload types
- frontend props

### 3. Generate OpenAPI

From the types:

- orders
- inventory
- drivers
- staff
- policies
- risk/events
- compliance/events
- ops/metrics

Each gets:

- GET list
- GET detail
- POST create
- PATCH update

### 4. Generate Backend Services

AI creates:

- controllers
- services
- repositories
- event producers
- tests

All shaped by JSON → types → OpenAPI.

### 5. Generate Event System

AI uses:

- envelope.json
- domain event JSON files

To generate:

- producers
- consumers
- WebSocket broadcaster

### 6. Generate Frontend Hooks

From OpenAPI:

```
useOrders()
useOrder(id)
useCreateOrder()
useUpdateOrder()
```

Same for all domains.

### 7. Generate Components

From JSON shapes:

- OrderCard(order)
- KDSTile(order)
- InventoryBlock(item)
- ComplianceBlock(event)
- KPITile(metric)

### 8. Generate Pages

From hooks + components:

- Ops Dashboard
- KDS
- Inventory
- Compliance
- Analytics

### 9. Generate CI/CD

From service definitions:

- build
- test
- deploy

### 10. Generate Infra

From conceptual infra folder:

- environments
- pipeline
- AWS resources

This is the full-ready conceptual spine.
