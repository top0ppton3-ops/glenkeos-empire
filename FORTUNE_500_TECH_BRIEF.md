# FORTUNE 500 TECH BRIEF

**Enterprise Implementation Directive — GlenKeos / GRC Platform**

---

## 1. What You're Receiving

GlenKeos is already **fully specified** as a JSON-first platform. You are not being asked to design a system—you are being asked to **implement an existing one**.

### Authoritative Assets

**Contracts** — JSON contracts for all core domains:
- store, order, inventoryItem, driver, staff, policy, riskEvent, complianceEvent, metric

**Events** — Universal event envelope + domain event sets

**OpenAPI** — `glenkeos-api-v1.yaml` (complete REST API surface)

**Database** — Complete PostgreSQL schema with migrations

**Documentation** — Architecture, wiring, governance, security, observability

> **Rule 1:** If it's not in `/contracts`, `/events`, or `/openapi`, it does not exist yet.

---

## 2. Your Mandate

### A. Implement This Spec Exactly

You must generate and implement the backend directly from the provided specifications:

- Generate **backend types/models** from `/contracts/*.json`
- Generate **REST controllers/handlers** from `/openapi/glenkeos-api-v1.yaml`
- Generate **database migrations** from `/database/migrations/*.sql`
- Generate **event producers/consumers** from `/events/*.json`
- Generate **client SDKs** from the OpenAPI spec
- Generate **frontend hooks** from the SDK
- Generate **base components** from the hook map

There is **no redesign phase**.  
There is **no architecture phase**.  
The architecture is **already complete**.

Your job is **implementation**, not invention.

---

### B. Harden Security to Enterprise Standards

You are responsible for delivering:

- Role-based access control (RBAC) using `staff.roles[]`
- MFA enforcement for privileged roles
- JWT validation at the gateway
- Private networking for all services and databases
- Immutable audit logging via `complianceEvent`
- Event-driven monitoring for:
  - Policy changes
  - Staff role changes
  - Risk escalations
  - Data exports
  - Configuration changes

Security is not optional.  
Security is not "phase two."  
Security is **part of implementation**.

---

### C. Optimize Performance for High-Volume Operations

You must:

- Apply all indexes defined in database migrations
- Ensure low-latency reads for:
  - Orders
  - Inventory
  - Drivers
  - Metrics
- Ensure event consumers are horizontally scalable
- Ensure WebSocket broadcasting is efficient and fault-tolerant

This system must perform at **restaurant scale**, **delivery scale**, and **corporate scale** simultaneously.

---

### D. Integrate With Our Infrastructure

You must integrate with:

- Our API gateway
- Our event bus
- Our observability stack
- Our secret management
- Our environment configuration patterns

You do **not** create your own patterns.  
You adopt **ours**.

---

### E. Keep the Spec and Implementation in Sync

This is the most important rule in the entire brief:

> **If you change behavior, you must change the spec first.**

This means:

- Update `/contracts` if data shape changes
- Update `/events` if event shape changes
- Update `/openapi` if API shape changes
- Only then update code

This ensures:

- Regeneration is always possible
- No drift occurs
- No undocumented behavior exists
- No vendor lock-in emerges

This is how GlenKeos maintains **control** over its own platform.

---

## 3. Required Execution Guides

You must follow these documents exactly:

### `IMPLEMENTATION_CHECKLIST.md`
Defines the **step-by-step backend implementation sequence**.

### `BACKEND_IMPLEMENTATION_STATUS.md`
Tracks what is:
- Generated
- Implemented
- Tested
- Deployed

This is your **source of truth for progress**.

### `FRONTEND_BOOTSTRAP_PLAN.md`
Defines:
- How hooks are generated
- How components are generated
- How pages are assembled
- How events update UI

This ensures the frontend stays **JSON-aligned** with the backend.

---

## 4. AI + Codegen Expectations

You are expected to use AI/codegen to:

- Generate models
- Generate controllers
- Generate migrations
- Generate event producers
- Generate event consumers
- Generate client SDKs
- Generate React Query hooks
- Generate base components

Your responsibility is to:

- Validate generated code
- Ensure it matches the spec
- Ensure it is secure
- Ensure it is performant
- Ensure it is maintainable

You are **not** allowed to:

- Modify generated code without updating the spec
- Introduce undocumented behavior
- Create new endpoints or fields outside the spec

---

## 5. Success Criteria

You are successful when:

- The running system matches `/contracts`, `/events`, and `/openapi` exactly
- All services are secure, stable, and performant
- All events flow correctly through the event bus
- All metrics are computed accurately
- All frontend hooks and components function as defined
- Regeneration from the spec produces the same system
- No drift exists between spec and implementation

This is the standard expected of a Fortune 500 partner.

---

**This is the maximum, enterprise-grade, explicit brief.**

**Execute exactly as written.**
