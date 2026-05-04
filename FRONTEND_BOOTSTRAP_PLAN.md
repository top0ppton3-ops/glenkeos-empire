# FRONTEND_BOOTSTRAP_PLAN.md

How to bootstrap the frontend using JSON → hooks → components

## 1. Generate TypeScript types from JSON

From `/contracts`:

```
Order.ts
InventoryItem.ts
Driver.ts
...
```

## 2. Generate API client from OpenAPI

Produces:

```
api.orders.list()
api.orders.get(id)
api.orders.create()
api.orders.update()
```

Same for all domains.

## 3. Generate React Query hooks

Pattern:

```ts
useOrders()
useOrder(id)
useCreateOrder()
useUpdateOrder()
```

Hooks mirror endpoints.

## 4. Generate components from JSON shapes

Mapping:

- `OrderCard(order)`
- `KDSTile(order)`
- `InventoryBlock(item)`
- `ComplianceBlock(event)`
- `KPITile(metric)`

Each component receives **pure JSON**.

## 5. Generate pages from components

Pages assemble:

- hooks
- components
- layout

Examples:

- Ops Dashboard
- KDS
- Inventory
- Compliance
- Analytics

## 6. Generate WebSocket listeners

Events update UI in real time:

- order queue
- KDS
- inventory
- risk/compliance

## 7. Apply brand tiers

- B1 → operational pages
- B3 → internal portal shell
- B2 → restaurant marketing
