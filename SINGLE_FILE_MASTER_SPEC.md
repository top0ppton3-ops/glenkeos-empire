# SINGLE_FILE_MASTER_SPEC.md

**The complete AI-ready implementation spine for GlenKeos backend**

This document references all conceptual documentation and serves as the single entry point for any AI implementing the backend system.

---

## Purpose

This is the **master index** for backend implementation. It does not contain implementation code — it is the **conceptual blueprint** that enables any AI to generate the full backend from JSON contracts.

---

## Document Structure

### 1. System Architecture

**Read:** `SYSTEM_WIRING_OVERVIEW.md`

- High-level system wiring
- Vertical slice example (Orders domain)
- Cross-cutting concerns (auth, events, brand tiers)

**Read:** `DOMAIN_MODEL_ATLAS.md`

- All 7 domain models
- Entity relationships
- Key fields per domain

---

### 2. JSON Contracts & Data Flow

**Read:** `AI_JSON_IMPLEMENTATION_FLOW.md`

- Master JSON contract index
- Endpoint flow patterns
- Frontend flow (JSON → hooks → components)
- Event flow (JSON → bus → UI)
- Implementation pipeline (10 steps)
- Brand tier alignment

**Read:** `FULL_SYSTEM_JSON_MAP.md`

- System expressed as JSON relationships
- Entity-to-entity mappings

**Read:** `COMPONENT_DATA_FLOW_MAP.md`

- Data source → hook → component mappings
- Component → page composition
- Event → UI flow

**Read:** `EVENT_TO_UI_PIPELINE.md`

- Event emission
- Event bus processing
- WebSocket push
- UI updates
- Metrics updates

---

### 3. Repository & Generation

**Read:** `REPO_STRUCTURE.md`

- JSON-first repository layout
- Folder structure
- File organization

**Read:** `SERVICE_GENERATION_SEQUENCE.md`

- Step-by-step service generation order
- From JSON → types → OpenAPI → services → events → tests

**Read:** `FRONTEND_BOOTSTRAP_PLAN.md`

- Frontend generation sequence
- JSON → hooks → components → pages
- WebSocket listeners
- Brand tier application

**Read:** `EVENT_SCHEMA_LIBRARY.md`

- Universal event envelope
- All domain event schemas
- WebSocket push events

---

### 4. AI Handoff & Starter Kit

**Read:** `AI_CODEGEN_HANDOFF_GUIDE.md`

- What the AI receives
- What the AI should generate (in order)
- Rules for the AI

**Read:** `FULL_IMPLEMENTATION_STARTER_KIT.md`

- Core implementation idea
- Minimal required folders
- Minimal required contracts (seed files)

---

### 5. Implementation Checklist

**Read:** `IMPLEMENTATION_CHECKLIST.md`

- Canonical JSON contracts
- Endpoint mappings (30+ endpoints)
- Component ↔ JSON mappings
- Event shapes & flow
- Implementation tasks (6 phases)
- RBAC permission matrix (13 roles × 7 resources)
- Success criteria
- Handoff instructions

---

## Implementation Flow

### Phase 1: Setup

1. Read `SINGLE_FILE_MASTER_SPEC.md` (this file)
2. Read `REPO_STRUCTURE.md` to understand folder layout
3. Read `FULL_IMPLEMENTATION_STARTER_KIT.md` for minimal requirements

### Phase 2: Understand the System

1. Read `SYSTEM_WIRING_OVERVIEW.md` for architecture
2. Read `DOMAIN_MODEL_ATLAS.md` for data models
3. Read `AI_JSON_IMPLEMENTATION_FLOW.md` for full flow
4. Read `FULL_SYSTEM_JSON_MAP.md` for relationships

### Phase 3: Understand Data & Event Flow

1. Read `COMPONENT_DATA_FLOW_MAP.md` for frontend data flow
2. Read `EVENT_TO_UI_PIPELINE.md` for event flow
3. Read `EVENT_SCHEMA_LIBRARY.md` for event schemas

### Phase 4: Generate Code

1. Read `AI_CODEGEN_HANDOFF_GUIDE.md` for generation rules
2. Read `SERVICE_GENERATION_SEQUENCE.md` for backend sequence
3. Read `FRONTEND_BOOTSTRAP_PLAN.md` for frontend sequence
4. Read `IMPLEMENTATION_CHECKLIST.md` for detailed tasks

### Phase 5: Execute

Follow `IMPLEMENTATION_CHECKLIST.md` line by line:

1. Infrastructure setup
2. Service implementation (all 7 domains)
3. Route wiring
4. Event handler implementation
5. Testing
6. Deployment

---

## Rules for Implementation

1. **JSON contracts are immutable** — Never modify without explicit instruction
2. **Event envelope is universal** — All events follow the same shape
3. **Component props = JSON shapes** — No mutation between backend and frontend
4. **Follow the flow** — Contracts → Types → OpenAPI → Services → Events → Hooks → Components
5. **Brand tier alignment** — B1 (operational), B2 (marketing), B3 (corporate)
6. **RBAC enforcement** — 13 roles, granular permissions, immutable audit trail

---

## Success Criteria

**Backend is ready when:**

- All 30+ endpoints respond correctly
- All 7 domain services operational
- Event bus emitting domain events
- WebSocket broadcasting to frontend
- RBAC enforcing permissions
- Audit trail capturing all actions
- Tests passing (unit + integration)

**Integration is ready when:**

- Frontend hooks receiving JSON
- Components rendering from JSON
- Real-time updates flowing via WebSocket
- Ops Dashboard displaying live data
- All 5 internal portal modules functional

---

## Document Map (Quick Reference)

| Document | Purpose |
|----------|---------|
| `SINGLE_FILE_MASTER_SPEC.md` | **This file** — Master index |
| `AI_JSON_IMPLEMENTATION_FLOW.md` | Complete JSON-driven implementation blueprint |
| `FULL_SYSTEM_JSON_MAP.md` | JSON relationships across all domains |
| `COMPONENT_DATA_FLOW_MAP.md` | JSON → hooks → components → pages |
| `EVENT_TO_UI_PIPELINE.md` | Backend events → WebSocket → UI updates |
| `FULL_IMPLEMENTATION_STARTER_KIT.md` | Minimal setup requirements |
| `AI_CODEGEN_HANDOFF_GUIDE.md` | What AI receives and generates |
| `SYSTEM_WIRING_OVERVIEW.md` | High-level architecture wiring |
| `DOMAIN_MODEL_ATLAS.md` | All 7 domain entities & relationships |
| `REPO_STRUCTURE.md` | Folder & file organization |
| `SERVICE_GENERATION_SEQUENCE.md` | Backend generation order |
| `FRONTEND_BOOTSTRAP_PLAN.md` | Frontend generation order |
| `EVENT_SCHEMA_LIBRARY.md` | All event schemas |
| `IMPLEMENTATION_CHECKLIST.md` | Detailed tasks & endpoints |

---

## Handoff Instructions

**To implement this system:**

1. Give this file (`SINGLE_FILE_MASTER_SPEC.md`) to the implementing AI
2. The AI reads all referenced documents
3. The AI follows `IMPLEMENTATION_CHECKLIST.md` exactly
4. The AI generates code following `AI_CODEGEN_HANDOFF_GUIDE.md` rules
5. The AI validates against success criteria

**Frontend is production-ready.**  
**Backend is fully specified.**  
**The spine is locked.**

**Execute this exactly as written.**

---

## Contact & Support

For questions about:

- **Frontend implementation** — Reference existing code in `/src/app`
- **Backend contracts** — Reference `IMPLEMENTATION_CHECKLIST.md` Section 1
- **Endpoint mappings** — Reference `IMPLEMENTATION_CHECKLIST.md` Section 2
- **Event flows** — Reference `EVENT_TO_UI_PIPELINE.md` and `EVENT_SCHEMA_LIBRARY.md`
- **Component integration** — Reference `COMPONENT_DATA_FLOW_MAP.md`

---

**This is the battlefield, staged and ready.**

**Go build.**
