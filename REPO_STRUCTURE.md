# REPO_STRUCTURE.md

A JSON-first, AI-ready repository layout

```
repo/
├── contracts/                 # JSON source of truth
│     ├── order.json
│     ├── inventoryItem.json
│     ├── driver.json
│     ├── staff.json
│     ├── policy.json
│     ├── riskEvent.json
│     └── complianceEvent.json
│
├── openapi/                   # Generated from contracts
│     └── v1.yaml
│
├── backend/                   # Services generated from OpenAPI
│     ├── orders/
│     ├── inventory/
│     ├── drivers/
│     ├── staff/
│     ├── policies/
│     ├── risk/
│     ├── compliance/
│     └── ops-metrics/
│
├── events/                    # Event envelope + domain events
│     ├── envelope.json
│     ├── order-events.json
│     ├── inventory-events.json
│     ├── policy-events.json
│     ├── risk-events.json
│     └── compliance-events.json
│
├── frontend/                  # Hooks + components + pages
│     ├── hooks/
│     ├── components/
│     └── pages/
│
├── infra/                     # Conceptual infra definitions
│     ├── environments/
│     └── pipeline/
│
└── docs/                      # All conceptual docs
      ├── IMPLEMENTATION_CHECKLIST.md
      ├── IMPLEMENTATION_FLOWCHART.md
      ├── API_AUTOGENERATION_PLAN.md
      ├── COMPONENT_AUTOGENERATION_PLAN.md
      ├── EVENT_PIPELINE_AUTOGENERATION_PLAN.md
      └── AI_JSON_IMPLEMENTATION_FLOW.md
```

**Everything flows from `/contracts` → generated code.**
