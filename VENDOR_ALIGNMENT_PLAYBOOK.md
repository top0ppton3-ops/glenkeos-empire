# VENDOR ALIGNMENT PLAYBOOK

**How Vendors Must Work With GlenKeos / GRC**

---

## 1. Operating Principles

- **Spec is law**
- **JSON is the source of truth**
- **Events drive the system**
- **No drift allowed**
- **Regeneration must always work**

---

## 2. Vendor Workflow

### Step 1 — Read the Spec

Start with:

- `SINGLE_FILE_MASTER_SPEC.md`
- `/contracts`
- `/events`
- `/openapi`

Do not proceed until you understand these completely.

### Step 2 — Generate Code

Use AI/codegen to generate:

- Types
- Controllers
- Migrations
- Event producers
- Event consumers
- Client SDK
- Hooks
- Components

### Step 3 — Implement Services

Follow:

- `BACKEND_SERVICE_ARCHITECTURE.md`
- `DATABASE_SCHEMA.md`
- Service wiring documentation

### Step 4 — Validate

Run:

- Contract tests
- Event flow tests
- Schema validation
- Performance tests

### Step 5 — Document

Update:

- `BACKEND_IMPLEMENTATION_STATUS.md`
- `DEPLOYMENT_NOTES.md`

---

## 3. Vendor Rules

### Prohibited Actions

- ❌ No new endpoints without spec update
- ❌ No new fields without contract update
- ❌ No new events without schema update
- ❌ No silent changes
- ❌ No undocumented behavior
- ❌ No bypassing the event bus
- ❌ No bypassing the gateway
- ❌ No cross-service database access

### Required Actions

- ✅ Always update spec before code
- ✅ Always regenerate from spec
- ✅ Always validate against contracts
- ✅ Always document changes
- ✅ Always run tests
- ✅ Always preserve audit trail

---

## 4. Quality Standards

### Code Quality

- All code generated from specs
- All manual code reviewed
- All changes traceable to spec updates
- All tests passing before deployment

### Security

- JWT validation on all endpoints
- RBAC enforced for all operations
- MFA required for privileged roles
- Audit events logged for all changes
- Secrets never in code

### Performance

- All queries use indexes
- All endpoints respond < 100ms (p95)
- All events process < 500ms (p95)
- All services scale horizontally

---

## 5. Communication Protocol

### Weekly Status Reports

Vendor must provide:

- Progress against `BACKEND_IMPLEMENTATION_STATUS.md`
- Blockers and dependencies
- Upcoming milestones
- Risk assessment

### Change Requests

All changes require:

1. Written justification
2. Spec update proposal
3. Impact analysis
4. GlenKeos approval

### Incident Response

For production incidents:

1. Immediate notification (< 15 minutes)
2. Root cause analysis (< 24 hours)
3. Remediation plan (< 48 hours)
4. Post-mortem report (< 1 week)

---

## 6. Handoff Requirements

### Knowledge Transfer

Vendor must provide:

- Architecture walkthrough
- Service dependency map
- Deployment runbook
- Troubleshooting guide
- Performance tuning guide

### Documentation

All documentation must be:

- Written in Markdown
- Version controlled
- Kept in sync with code
- Reviewed and approved

---

## 7. Exit Criteria

Vendor engagement ends when:

- All services deployed and stable
- All tests passing
- All documentation complete
- GlenKeos team trained
- 30-day stabilization period complete
- Final acceptance granted

---

**This playbook ensures vendor work aligns with GlenKeos standards.**

**Follow it exactly.**
