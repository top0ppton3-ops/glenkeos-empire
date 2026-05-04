# FULL_IMPLEMENTATION_STARTER_KIT.md

## 1. Core idea

Everything starts from **JSON contracts** and flows outward:

1. JSON contracts
2. Types
3. OpenAPI
4. Backend services
5. Events
6. Frontend hooks
7. Components
8. Pages
9. CI/CD
10. Infra

## 2. Minimal required folders

- `contracts/` — JSON for all domain models
- `events/` — event envelope + domain event definitions
- `openapi/` — generated specs
- `backend/` — generated services
- `frontend/` — hooks, components, pages
- `infra/` — environments + pipelines
- `docs/` — all conceptual docs

## 3. Minimal required contracts

At least:

- `order.json`
- `inventoryItem.json`
- `driver.json`
- `staff.json`
- `policy.json`
- `riskEvent.json`
- `complianceEvent.json`

These are the **seed** for full codegen.
