# SYSTEM_WIRING_OVERVIEW.md

## 1. High-level wiring

- **Contracts → Types → OpenAPI → Backend**
- **Backend → Events → Bus → Consumers**
- **OpenAPI → SDK → Hooks → Components → Pages**
- **Events → Metrics → Analytics → UI**

## 2. Vertical slice example (Orders)

1. `contracts/order.json`
2. `Order.ts`
3. `/orders` OpenAPI paths
4. `backend/orders/*`
5. `ORDER_CREATED`, `ORDER_STATUS_CHANGED` events
6. `api.orders.*` client
7. `useOrders()`, `useOrder(id)` hooks
8. `OrderCard`, `KDSTile` components
9. Ops Dashboard page wiring those components

## 3. Cross-cutting

- Auth/roles applied at backend + frontend route guards
- Events consumed by metrics + analytics + WebSocket broadcaster
- Brand tiers applied at page/layout level (B1/B2/B3)
