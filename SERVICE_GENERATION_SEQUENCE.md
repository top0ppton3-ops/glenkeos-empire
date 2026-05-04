# SERVICE_GENERATION_SEQUENCE.md

The conceptual order for generating backend services from JSON

## 1. Start with JSON contracts

Located in `/contracts`.

These define:

- fields
- types
- relationships
- metadata

## 2. Generate TypeScript types

From each JSON file:

```
order.json → Order.ts
inventoryItem.json → InventoryItem.ts
...
```

These types become:

- validators
- serializers
- event payload types

## 3. Generate OpenAPI

From the types:

- `/orders`
- `/inventory`
- `/drivers`
- `/staff`
- `/policies`
- `/risk/events`
- `/compliance/events`
- `/ops/metrics`

Each gets:

- GET list
- GET detail
- POST create
- PATCH update

## 4. Generate service scaffolds

For each domain:

```
orders/
  controller.ts
  service.ts
  repository.ts
  events.ts
```

## 5. Generate event producers

From event envelope:

- ORDER_CREATED
- ORDER_STATUS_CHANGED
- INVENTORY_CHANGED
- POLICY_UPDATED
- RISK_EVENT_CREATED
- COMPLIANCE_EVENT

## 6. Generate consumers

- Compliance
- Metrics
- Analytics
- WebSocket broadcaster

## 7. Generate tests

From OpenAPI + JSON contracts.
