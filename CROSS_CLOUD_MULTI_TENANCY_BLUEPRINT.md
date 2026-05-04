# CROSS-CLOUD MULTI-TENANCY BLUEPRINT

**Multi-Tenant, Multi-Cloud Architecture for GlenKeos**

---

## 1. Tenancy Model

GlenKeos uses **logical multi-tenancy**:

- Each tenant = brand or enterprise customer
- Each tenant has:
  - Tenant ID (unique identifier)
  - Tenant-scoped data (all resources tagged with tenant_id)
  - Tenant-scoped events (tenant context in event envelope)
  - Tenant-scoped metrics (tenant-level observability)

### Tenant Types

1. **Single-Store Tenant** - Independent restaurant operator
2. **Multi-Store Tenant** - Regional chain (5-50 stores)
3. **Enterprise Tenant** - National/global chain (50+ stores)

---

## 2. Cloud Model

GlenKeos supports deployment across:

- **AWS** (Amazon Web Services)
- **Azure** (Microsoft Azure)
- **GCP** (Google Cloud Platform)

Each cloud environment runs:

- 9 microservices (Stores, Orders, Inventory, Drivers, Staff, Policies, Risk, Compliance, Metrics)
- API Gateway
- Event Bus
- WebSocket Broadcaster
- Metrics Pipeline

### Cloud-Agnostic Design

All services are containerized and orchestrated via Kubernetes, enabling:

- Cloud portability
- Multi-cloud deployment
- Cloud-specific optimizations (while maintaining consistent interfaces)

---

## 3. Isolation Layers

### A. Data Isolation

**Database Level:**
- Every table includes `tenant_id` column
- Row-Level Security (RLS) enforces tenant boundaries
- Tenant-scoped encryption keys (optional per-tenant encryption)
- Tenant-scoped database users (for high-security tenants)

**Example RLS Policy:**
```sql
CREATE POLICY tenant_isolation_policy ON orders
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### B. Event Isolation

**Event Bus Level:**
- Tenant-scoped topics (e.g., `tenant_abc123.orders.created`)
- Tenant-scoped consumer groups
- Event envelope includes `tenantId` field
- Cross-tenant event consumption prohibited

**Example Event Envelope:**
```json
{
  "id": "uuid",
  "type": "ORDER_CREATED",
  "tenantId": "tenant_abc123",
  "entityType": "order",
  "entityId": "ord_xyz789",
  "timestamp": "2026-04-16T10:30:00Z",
  "actorId": "staff_001",
  "metadata": {},
  "version": "1.0.0"
}
```

### C. Compute Isolation

**Kubernetes Level:**
- Namespace per tenant (for enterprise tenants)
- Shared namespaces with tenant context (for standard tenants)
- Resource quotas per tenant
- Autoscaling per tenant workload

**Service Level:**
- Tenant context injected at API Gateway
- Tenant validation on every request
- Tenant-scoped rate limiting
- Tenant-scoped circuit breakers

### D. Network Isolation

- Private VPC per tenant (enterprise tier only)
- Shared VPC with tenant segmentation (standard tier)
- Tenant-scoped IP allowlisting
- Tenant-scoped firewall rules

---

## 4. Cross-Cloud Synchronization

### Event Replication

- Events published to primary cloud event bus
- Cross-cloud event bridge replicates to secondary clouds
- Event ordering preserved via sequence numbers
- Event deduplication via correlation IDs

### Metrics Aggregation

- Metrics emitted in each cloud
- Metrics aggregated to centralized metrics store
- Tenant-scoped dashboards
- Cross-cloud performance comparison

### Policy Synchronization

- Policies defined once (in primary region)
- Policy updates replicated to all clouds
- Policy versioning ensures consistency
- Policy acknowledgment tracked per cloud

---

## 5. Tenant Provisioning Pipeline

### Automated Tenant Onboarding

**Stage 1: Tenant Registration**
1. Create tenant record in `tenants` table
2. Generate unique `tenant_id` (e.g., `tenant_abc123`)
3. Set tenant tier (STANDARD, ENTERPRISE)
4. Set tenant region (US, EU, APAC, etc.)

**Stage 2: Encryption & Security**
1. Generate tenant-scoped encryption keys
2. Store keys in secrets vault (per-tenant namespace)
3. Configure MFA requirements (if enterprise tier)
4. Set up IP allowlisting (if requested)

**Stage 3: Database Provisioning**
1. Create tenant-scoped database schema (if enterprise tier)
2. OR configure RLS rules (if standard tier)
3. Create indexes for tenant data
4. Initialize seed data (roles, default policies)

**Stage 4: Event Bus Provisioning**
1. Create tenant-scoped topics (all 29 event types)
2. Create tenant-scoped consumer groups
3. Configure event retention (per tenant SLA)
4. Set up dead letter queues (DLQs)

**Stage 5: Service Deployment**
1. Deploy tenant-scoped services (if enterprise tier)
2. OR configure shared services with tenant context (if standard tier)
3. Configure autoscaling thresholds
4. Set up resource quotas

**Stage 6: Event & Logging**
1. Emit `TENANT_CREATED` event
2. Log tenant creation in compliance_events
3. Notify tenant admin (email, dashboard)

**Timeline:** Fully automated, completes in < 5 minutes

---

## 6. Tenant Lifecycle Management

### Tenant Upgrade (Standard → Enterprise)

1. Provision dedicated infrastructure
2. Migrate data to tenant-scoped schema
3. Reconfigure event topics
4. Update service routing
5. Zero-downtime migration
6. Emit `TENANT_UPGRADED` event

### Tenant Downgrade (Enterprise → Standard)

1. Migrate data to shared schema with RLS
2. Reconfigure event topics
3. Deprovision dedicated infrastructure
4. Emit `TENANT_DOWNGRADED` event

### Tenant Suspension

1. Disable API access
2. Stop event consumption
3. Retain data (per retention policy)
4. Emit `TENANT_SUSPENDED` event

### Tenant Deletion

1. Validate deletion request (requires admin approval)
2. Export tenant data (if requested)
3. Delete tenant data from all systems
4. Purge event logs (per retention policy)
5. Revoke encryption keys
6. Emit `TENANT_DELETED` event
7. Hard-delete tenant record after retention period

---

## 7. Tenant Isolation Testing

### Automated Isolation Tests

Run daily for all tenants:

1. **Data Leakage Test** - Verify tenant A cannot read tenant B's data
2. **Event Leakage Test** - Verify tenant A does not receive tenant B's events
3. **API Leakage Test** - Verify tenant A cannot access tenant B's resources
4. **Metrics Leakage Test** - Verify tenant dashboards show only own data

### Penetration Testing

Quarterly per-tenant penetration tests:

- Attempt cross-tenant data access
- Attempt privilege escalation across tenants
- Attempt event injection into other tenant topics
- Verify RLS enforcement

---

## 8. Tenant SLA & Guarantees

### Availability SLA

- **Standard Tier:** 99.5% uptime (43.8 hours downtime/year)
- **Enterprise Tier:** 99.95% uptime (4.38 hours downtime/year)

### Performance SLA

- **API Response Time:** p95 < 200ms
- **Event Delivery:** < 1 second (same region)
- **Cross-Cloud Event Delivery:** < 5 seconds

### Data Residency SLA

- Level 4 data NEVER leaves tenant's jurisdiction
- Level 3 data replication requires tenant approval
- Breach of data residency = SLA credit + remediation

---

## 9. Cost Allocation

### Tenant-Level Cost Tracking

Track per tenant:

- Compute usage (CPU, memory)
- Storage usage (database, blob storage)
- Network egress
- Event bus throughput
- API call volume

### Chargeback Model

- **Standard Tier:** Flat monthly fee + usage-based billing
- **Enterprise Tier:** Custom pricing + dedicated infrastructure costs

---

## 10. Multi-Cloud Failover

### Active-Active Architecture

- Tenants can be deployed across multiple clouds simultaneously
- API Gateway routes to nearest healthy cloud
- Event replication keeps clouds in sync
- Database replication (async) for disaster recovery

### Cloud Failover Triggers

1. Cloud provider outage (> 5 minutes)
2. Regional network partition
3. Data center failure
4. Manual failover (for maintenance)

**Failover Time:** < 2 minutes (automated)

---

**This blueprint enables GlenKeos to operate as a global, multi-tenant SaaS platform across AWS, Azure, and GCP.**

**Tenant isolation is enforced at every layer: data, events, compute, and network.**
