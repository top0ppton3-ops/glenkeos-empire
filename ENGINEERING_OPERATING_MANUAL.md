# ENGINEERING OPERATING MANUAL

**How GlenKeos Engineers Build, Maintain, and Extend the Platform**

---

## 1. Core Philosophy

> **Everything flows from JSON.**  
> Code is generated.  
> Behavior is defined in the spec.  
> Engineers maintain the spec, not the code.

---

## 2. Daily Workflow

### A. When Adding a Feature

1. Update `/contracts` (data shape)
2. Update `/events` (new events if needed)
3. Update `/openapi` (new endpoints)
4. Regenerate code
5. Implement business logic
6. Update tests
7. Update documentation
8. Commit

### B. When Fixing a Bug

1. Confirm spec vs implementation
2. If spec is wrong → fix spec first
3. If code is wrong → fix code
4. Regenerate if needed
5. Update tests
6. Update status docs
7. Commit

### C. When Reviewing Code

- Compare implementation to spec
- Reject anything not spec-aligned
- Reject any drift
- Reject any undocumented behavior
- Approve only if tests pass

### D. When Reviewing Vendor Work

- Verify spec alignment
- Check for drift
- Validate security
- Validate performance
- Ensure documentation complete

---

## 3. System Boundaries

### Backend Services (9 Total)

- **Stores Service** - Store management
- **Orders Service** - Order lifecycle (6 endpoints)
- **Inventory Service** - Inventory tracking
- **Drivers Service** - Driver operations + GPS
- **Staff Service** - Auth + RBAC
- **Policies Service** - Governance
- **Risk Service** - Risk monitoring
- **Compliance Service** - Audit trail
- **Metrics Service** - Analytics

### Cross-Cutting Components

- **API Gateway** - Single entry point, auth, routing
- **Event Bus** - State change notifications
- **WebSocket Broadcaster** - Real-time UI updates

---

## 4. Data Ownership

Each service owns its tables:

| Service | Tables Owned |
|---------|--------------|
| Stores | stores |
| Orders | orders, order_items |
| Inventory | inventory_items |
| Drivers | drivers |
| Staff | staff, staff_roles, staff_store_access |
| Policies | policies, policy_acknowledgments |
| Risk | risk_events, risk_event_notes |
| Compliance | compliance_events |
| Metrics | metrics |

**Rule:** No cross-service database access. Use REST APIs or events.

---

## 5. Regeneration Rules

### When to Regenerate

Regenerate code when:

- A contract changes
- An event schema changes
- An endpoint changes
- Database schema changes

### How to Regenerate

```bash
# Generate types from contracts
npm run generate:types

# Generate API client from OpenAPI
npm run generate:client

# Generate migrations from schema
npm run generate:migrations

# Generate hooks from SDK
npm run generate:hooks
```

### Regeneration Safety

- Never overwrite manual business logic
- Always validate generated code
- Always run tests after regeneration
- Always check for drift

---

## 6. Security Practices

### Authentication

- All requests authenticated via JWT
- Token validation at API Gateway
- Services trust gateway, read claims from headers

### Authorization

- RBAC enforced using `staff.roles[]`
- 13 granular roles defined in contracts
- Permissions checked at service level

### MFA

- Required for:
  - SUPER_ADMIN
  - COMPLIANCE_OFFICER
  - RISK_MANAGER
- Enforced at login

### Audit Trail

- All state changes logged to `compliance_events`
- Immutable audit trail (cannot be modified/deleted)
- Includes actor, entity, timestamp, metadata

---

## 7. Performance Optimization

### Database

- All foreign keys indexed
- Composite indexes for common queries
- Full-text search for searchable fields
- JSONB GIN indexes for flexible queries

### API

- Response caching where appropriate
- Pagination for list endpoints
- Selective field loading

### Events

- Event consumers horizontally scalable
- Dead letter queue for failed events
- Event replay capability

---

## 8. Monitoring & Observability

### Metrics to Track

**Per-Service:**
- Request count (by endpoint, status)
- Response time (p50, p95, p99)
- Error rate
- Database query time

**System-Wide:**
- Orders per hour
- Active drivers
- Inventory stockouts
- Compliance event volume

### Logging

All logs in structured JSON format:

```json
{
  "timestamp": "ISO-8601",
  "level": "info|warn|error",
  "service": "orders-service",
  "traceId": "uuid",
  "message": "Order created",
  "orderId": "ord_123",
  "storeId": "store_001"
}
```

### Alerting

Alert on:

- API error rate > 1%
- Response time p95 > 200ms
- Database connection pool exhausted
- Event processing lag > 1 minute
- Compliance event anomalies

---

## 9. Testing Strategy

### Contract Tests

Validate all responses against JSON schemas:

```typescript
const response = await api.orders.get("ord_123");
const valid = validateAgainstContract(response, orderContract);
```

### Integration Tests

Test all endpoints:

- Happy path
- Error cases
- Edge cases
- Permission checks

### Event Tests

Test event flow:

- Event producer emits correct shape
- Event consumer processes correctly
- WebSocket broadcaster pushes to UI

### Performance Tests

- Load testing for peak traffic
- Stress testing for failure modes
- Endurance testing for stability

---

## 10. Deployment Process

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Spec aligned with code
- [ ] Documentation updated
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Security scan completed

### Deployment Steps

1. Deploy database migrations
2. Deploy backend services (blue-green)
3. Deploy API Gateway configuration
4. Deploy frontend (if needed)
5. Smoke test critical paths
6. Monitor metrics for 1 hour
7. Rollback if issues detected

### Post-Deployment

- Update `BACKEND_IMPLEMENTATION_STATUS.md`
- Create deployment notes
- Monitor for 24 hours
- Conduct retrospective

---

## 11. Incident Response

### Severity Levels

**P0 (Critical)** - System down, data loss
- Response time: < 15 minutes
- Resolution target: < 2 hours

**P1 (High)** - Major feature broken
- Response time: < 1 hour
- Resolution target: < 4 hours

**P2 (Medium)** - Minor feature broken
- Response time: < 4 hours
- Resolution target: < 24 hours

**P3 (Low)** - Cosmetic issue
- Response time: < 24 hours
- Resolution target: < 1 week

### Incident Process

1. Detect (automated alerts)
2. Triage (assign severity)
3. Investigate (find root cause)
4. Mitigate (temporary fix if needed)
5. Resolve (permanent fix)
6. Document (post-mortem)

---

## 12. Continuous Improvement

### Weekly

- Review metrics
- Address performance regressions
- Update documentation

### Monthly

- Security audit
- Performance tuning
- Dependency updates

### Quarterly

- Architecture review
- Capacity planning
- Tech debt assessment

---

**This manual defines how GlenKeos engineering operates.**

**Follow these practices to maintain platform integrity.**
