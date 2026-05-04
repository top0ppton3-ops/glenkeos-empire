# GLENKEOS — SERVICE DEPENDENCY GRAPH

**Version:** 1.0.0  
**Owner:** GlenKeos Architecture Office  
**Status:** COMPLETE

This document visualizes the **event-driven, domain-driven dependency structure** of all 9 GlenKeos microservices.

---

## 1. HIGH-LEVEL SERVICE DEPENDENCY GRAPH

```
                         ┌────────────┐
                         │   STORES   │
                         └─────┬──────┘
                               │ emits events
                               ▼
                         ┌────────────┐
                         │ INVENTORY  │
                         └─────┬──────┘
                               │ emits events
                               ▼
                         ┌────────────┐
                         │   ORDERS   │
                         └─────┬──────┘
                               │ emits events
                               ▼
                         ┌────────────┐
                         │  DRIVERS   │
                         └─────┬──────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
         ┌────────────┐              ┌────────────┐
         │ COMPLIANCE │              │  METRICS   │
         └────────────┘              └────────────┘
                ▲
                │
         ┌──────┴──────┐
         │             │
         ▼             ▼
  ┌────────────┐  ┌────────────┐
  │    RISK    │  │  POLICIES  │
  └────────────┘  └────────────┘
         ▲
         │
  ┌────────────┐
  │   STAFF    │
  └────────────┘
```

---

## 2. DETAILED SERVICE-TO-SERVICE DEPENDENCY TABLE

| Service | Produces Events | Consumes Events From | Direct API Calls | Database Tables Owned |
|---------|----------------|---------------------|------------------|-----------------------|
| **STORES** | STORE_CREATED, STORE_UPDATED | none | none | stores |
| **ORDERS** | ORDER_CREATED, ORDER_STATUS_CHANGED, ORDER_ASSIGNED, ORDER_CANCELLED, ORDER_DELIVERED | DRIVER_ASSIGNED, INVENTORY_UPDATED, INVENTORY_LOW_STOCK | none | orders, order_items |
| **INVENTORY** | INVENTORY_UPDATED, INVENTORY_LOW_STOCK, INVENTORY_REORDER_TRIGGERED, INVENTORY_RECEIVED | ORDER_CREATED | none | inventory |
| **DRIVERS** | DRIVER_ASSIGNED, DRIVER_STATUS_CHANGED, DRIVER_LOCATION_UPDATED, DRIVER_RATING_UPDATED | ORDER_ASSIGNED | none | drivers |
| **STAFF** | STAFF_CREATED, STAFF_ROLE_CHANGED, STAFF_SESSION_STARTED, STAFF_SESSION_ENDED, STAFF_DELETED | POLICY_UPDATED | none | staff, sessions, roles, store_assignments |
| **POLICIES** | POLICY_CREATED, POLICY_UPDATED, POLICY_ACKNOWLEDGED | STAFF_ROLE_CHANGED | none | policies, policy_acknowledgments |
| **RISK** | RISK_EVENT_CREATED, RISK_EVENT_ESCALATED, RISK_EVENT_MITIGATED, RISK_EVENT_CLOSED | ORDER_CREATED, STAFF_ROLE_CHANGED, COMPLIANCE_VIOLATION_DETECTED | none | risk_events |
| **COMPLIANCE** | COMPLIANCE_VIOLATION_DETECTED, COMPLIANCE_REPORT_GENERATED, DATA_EXPORT_REQUESTED, ACCESS_DENIED | ORDER_CREATED, STAFF_ROLE_CHANGED, POLICY_ACKNOWLEDGED, RISK_EVENT_CREATED, and 15+ more | none | compliance_events |
| **METRICS** | none | ALL EVENTS (29 total) | none | metrics |

---

## 3. EVENT-DRIVEN DEPENDENCY GRAPH (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│                       EVENT BUS (29 TOPICS)                      │
└─────────────────────────────────────────────────────────────────┘
         │                  │                  │
         │ publishes        │ publishes        │ publishes
         │                  │                  │
    ┌────▼────┐        ┌────▼────┐       ┌────▼────┐
    │ STORES  │        │ ORDERS  │       │INVENTORY│
    └────┬────┘        └────┬────┘       └────┬────┘
         │                  │                  │
         │ subscribes to    │ subscribes to    │ subscribes to
         │ inventory events │ driver events    │ order events
         │                  │                  │
         └──────────────────┴──────────────────┘
                            │
                    ┌───────▼────────┐
                    │   EVENT BUS    │
                    └───────┬────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────┐        ┌────▼────┐       ┌────▼────┐
    │ DRIVERS │        │  STAFF  │       │ POLICIES│
    └────┬────┘        └────┬────┘       └────┬────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                    ┌───────▼────────┐
                    │   EVENT BUS    │
                    └───────┬────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────┐        ┌────▼────┐       ┌────▼────┐
    │  RISK   │        │COMPLIANCE│      │ METRICS │
    └─────────┘        └──────────┘       └─────────┘
         ▲                  ▲                  ▲
         │                  │                  │
         └─────────all events flow here────────┘
```

**Key Insight:** All events eventually flow to COMPLIANCE and METRICS. They are the universal observers.

---

## 4. DOMAIN FLOW DIAGRAMS

### 4.1 Order Lifecycle Flow

```
USER → API GATEWAY → ORDERS SERVICE
                        │
                        │ publishes ORDER_CREATED
                        ▼
                   EVENT BUS
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   INVENTORY       COMPLIANCE       METRICS
        │
        │ validates stock
        │ publishes INVENTORY_UPDATED
        ▼
   EVENT BUS
        │
        ▼
   ORDERS SERVICE
        │
        │ publishes ORDER_ASSIGNED
        ▼
   EVENT BUS
        │
        ▼
   DRIVERS SERVICE
        │
        │ publishes DRIVER_ASSIGNED
        ▼
   EVENT BUS
        │
        ▼
   ORDERS SERVICE
        │
        │ publishes ORDER_DELIVERED
        ▼
   EVENT BUS
        │
        ├───→ COMPLIANCE (logs completion)
        └───→ METRICS (records KPIs)
```

---

### 4.2 Staff & Policy Governance Flow

```
ADMIN → API GATEWAY → POLICIES SERVICE
                           │
                           │ publishes POLICY_UPDATED
                           ▼
                      EVENT BUS
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
     STAFF            COMPLIANCE          METRICS
        │
        │ role recalculation
        │ publishes STAFF_ROLE_CHANGED
        ▼
   EVENT BUS
        │
        ├───→ POLICIES (updates requirements)
        ├───→ RISK (evaluates risk)
        └───→ COMPLIANCE (logs change)
             │
             ▼
        EVENT BUS
             │
             └───→ METRICS (records governance KPIs)
```

---

### 4.3 Inventory & Reorder Flow

```
SYSTEM → INVENTORY SERVICE
              │
              │ stock check detects low stock
              │ publishes INVENTORY_LOW_STOCK
              ▼
         EVENT BUS
              │
        ┌─────┼─────┐
        │     │     │
        ▼     ▼     ▼
     STORES COMPLIANCE METRICS
        │
        │ triggers reorder workflow
        │ (internal logic, no event)
        │
        │ when shipment arrives
        │ publishes INVENTORY_RECEIVED
        ▼
    EVENT BUS
        │
        └───→ METRICS (records reorder KPIs)
```

---

## 5. SERVICE ISOLATION GUARANTEES

### Database Isolation
```
┌─────────────┐
│   STORES    │ owns stores table
└─────────────┘
       │
       │ NO DIRECT DB ACCESS
       │
       ▼
┌─────────────┐
│   ORDERS    │ owns orders, order_items tables
└─────────────┘
```

**Rule:** Services communicate ONLY via:
1. Events (async, via event bus)
2. API calls (sync, via API gateway)

**Never:** Direct database access across services

---

### Event Isolation
```
Tenant A Events → Topic: glenkeos.tenant_a.order-created
Tenant B Events → Topic: glenkeos.tenant_b.order-created
```

**Rule:** Events are tenant-scoped. Cross-tenant consumption is prohibited.

---

## 6. CRITICAL DEPENDENCY INSIGHTS

### ✅ ORDERS is the Central Orchestrator
**Depends on:**
- INVENTORY (for stock validation)
- DRIVERS (for delivery assignment)

**Depended on by:**
- COMPLIANCE (for audit logging)
- METRICS (for business KPIs)
- RISK (for fraud detection)

**Why it matters:** Orders is the most connected service. Changes here have wide impact.

---

### ✅ COMPLIANCE is the Universal Observer
**Consumes events from:**
- ORDERS, STAFF, POLICIES, RISK, INVENTORY, DRIVERS (19+ event types)

**Produces events for:**
- RISK (violation escalation)
- METRICS (compliance KPIs)

**Why it matters:** Compliance sees almost everything. It's the audit backbone.

---

### ✅ METRICS is the Universal Sink
**Consumes events from:**
- ALL SERVICES (29 event types)

**Produces events for:**
- NONE (metrics is the final destination)

**Why it matters:** Every event eventually flows to metrics. It's the observability endpoint.

---

### ✅ POLICIES ↔ STAFF ↔ RISK ↔ COMPLIANCE is a Governance Loop
```
POLICIES → STAFF → RISK → COMPLIANCE → RISK
    ▲                                    │
    └────────────────────────────────────┘
```

**Why it matters:** This loop ensures governance stays consistent. Policy changes trigger role updates, which trigger risk evaluations, which trigger compliance checks, which may trigger policy updates.

---

## 7. ZERO-DEPENDENCY SERVICES

### STORES
- **Consumes:** Nothing
- **Produces:** STORE_CREATED, STORE_UPDATED

**Why:** Stores is a foundational entity. It doesn't react to other services.

---

## 8. DEPENDENCY VIOLATION DETECTION

The following are **PROHIBITED** and will be flagged in code review:

❌ **Direct database access** across services  
❌ **Synchronous HTTP calls** between services (use events)  
❌ **Shared mutable state** between services  
❌ **Cross-tenant event consumption**  
❌ **Bypassing the API gateway** for external calls  

---

## 9. FINAL STATUS

This service dependency graph is the **authoritative map** of how GlenKeos services interact.

**Used for:**
- Architecture reviews
- Compliance audits
- Incident response (identifying blast radius)
- Service hardening (understanding attack surface)
- Onboarding (understanding system flow)
- Regeneration validation (ensuring no drift)

**The GlenKeos service dependency model is complete and immutable.**
