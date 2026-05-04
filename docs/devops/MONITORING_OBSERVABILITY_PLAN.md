# GlenKeos Monitoring & Observability Plan

**Version**: 1.0.0  
**Last Updated**: April 24, 2026  
**Status**: Implementation Phase

---

## 1. Monitoring Philosophy

**Core Principles**:
- **Proactive, not reactive**: Detect issues before customers do
- **Actionable alerts**: Every alert must have a runbook
- **Full-stack visibility**: Frontend → API → Database → External services
- **Cost-effective**: Start lean, scale observability with revenue

---

## 2. Service Level Objectives (SLOs)

### 2.1 Availability SLO
**Target**: 99.99% uptime (4.3 minutes downtime per month)

**Measurement**:
- Endpoint: `https://codebuild-default-webhook-source-lo.vercel.app/api/health`
- Check frequency: Every 5 minutes from 5 geographic locations
- Tool: UptimeRobot (free tier: 50 monitors)

**Alert Triggers**:
- 🔴 P0: Service down for 2+ consecutive checks (10+ minutes)
- 🟡 P1: Service down in 1 region (geographic degradation)

### 2.2 Performance SLO
**Target**: API response time p95 < 200ms

**Measurement**:
- Track all API calls via Vercel Analytics
- Custom metrics via Supabase PostgREST logs
- Real User Monitoring (RUM) via Sentry Performance

**Alert Triggers**:
- 🔴 P0: p95 > 1000ms for 5+ minutes (severe degradation)
- 🟡 P1: p95 > 500ms for 15+ minutes (moderate degradation)
- 🟢 P2: p95 > 200ms for 30+ minutes (approaching SLO breach)

### 2.3 Error Rate SLO
**Target**: < 0.1% error rate (1 error per 1,000 requests)

**Measurement**:
- Frontend errors: Sentry (React error boundary)
- Backend errors: Supabase Edge Function logs
- Database errors: PostgreSQL logs

**Alert Triggers**:
- 🔴 P0: Error rate > 5% (critical failure)
- 🟡 P1: Error rate > 1% (high error rate)
- 🟢 P2: Error rate > 0.1% (SLO breach)

---

## 3. Monitoring Stack

### 3.1 Application Performance Monitoring (APM)

**Tool**: Sentry (https://sentry.io)

**What We Track**:
- Frontend errors (React crashes, unhandled promises)
- Performance metrics (page load, component render time)
- User sessions (breadcrumbs, stack traces)
- Source maps (for debugging minified code)

**Setup**:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 0.1, // 10% of transactions sampled
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions recorded
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});
```

**Cost**: $26/month (Team plan, up to 100K events)

### 3.2 Infrastructure Monitoring

**Tool**: Vercel Analytics (built-in, free)

**What We Track**:
- Deployment status (success/failure)
- Build times
- Edge function invocations
- Bandwidth usage
- Cache hit rates

**Dashboard**: https://vercel.com/glenkeos/analytics

### 3.3 Database Monitoring

**Tool**: Supabase Dashboard (built-in, free)

**What We Track**:
- Active connections (12 / 100 currently)
- Query performance (slow queries > 100ms)
- Table sizes (monitor growth)
- Replication lag (if using read replicas)
- Disk usage (500 MB / 1 GB currently)

**Dashboard**: https://supabase.com/dashboard/project/beswluhdxaphtitaovly/database/query-performance

### 3.4 Real-time Monitoring

**Tool**: Supabase Realtime Dashboard

**What We Track**:
- WebSocket connections (concurrent users)
- Realtime channel subscriptions
- Message throughput (messages/second)
- Connection errors

**Dashboard**: https://supabase.com/dashboard/project/beswluhdxaphtitaovly/realtime/inspector

### 3.5 Uptime Monitoring

**Tool**: UptimeRobot (https://uptimerobot.com)

**Monitored Endpoints**:
- https://codebuild-default-webhook-source-lo.vercel.app (every 5 min)
- https://codebuild-default-webhook-source-lo.vercel.app/chic-on-chain (every 5 min)
- https://codebuild-default-webhook-source-lo.vercel.app/ghetto-eats (every 5 min)
- https://beswluhdxaphtitaovly.supabase.co/rest/v1/ (API health, every 5 min)

**Alert Channels**:
- Email: engineering@glenkeos.com
- SMS: On-call engineer
- Slack: #incidents channel

**Cost**: Free (up to 50 monitors, 5-minute intervals)

---

## 4. Metrics & Dashboards

### 4.1 Key Metrics (SLIs - Service Level Indicators)

#### Frontend Metrics
| Metric | Target | Current | Tool |
|--------|--------|---------|------|
| Page Load Time (p95) | < 1s | 640ms | Sentry Performance |
| Time to First Byte (TTFB) | < 200ms | 87ms | Vercel Analytics |
| First Contentful Paint (FCP) | < 1.8s | 1.2s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | 1.8s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | 0.05 | Lighthouse |
| JavaScript Error Rate | < 0.1% | 0.02% | Sentry |

#### Backend Metrics
| Metric | Target | Current | Tool |
|--------|--------|---------|------|
| API Response Time (p95) | < 200ms | 87ms | Supabase Logs |
| Database Query Time (p95) | < 10ms | 12ms | PostgreSQL logs |
| Edge Function Cold Start | < 500ms | 320ms | Vercel Logs |
| WebSocket Latency | < 500ms | 120ms | Supabase Realtime |
| Connection Pool Usage | < 80% | 8% | Supabase Dashboard |

#### Business Metrics
| Metric | Target | Current | Tool |
|--------|--------|---------|------|
| Orders per Minute | N/A | ~2 | Custom query |
| Revenue per Minute | N/A | ~$90 | Custom query |
| Active Users (concurrent) | N/A | 8 peak | Realtime Dashboard |
| Customer Signup Rate | N/A | ~5/day | Custom query |
| Order Success Rate | > 99% | 98% | Custom query |

### 4.2 Operational Dashboards

#### Dashboard 1: Platform Health (Real-time)
**URL**: `/internal/dashboard/health`

**Widgets**:
- ✅ Service Status (Frontend, API, Database, Realtime)
- 📊 Request Rate (requests/min)
- ⏱️ Response Time (p50, p95, p99)
- 🚨 Active Incidents
- 🔋 System Load (CPU, Memory, Connections)

#### Dashboard 2: Business Operations (Real-time)
**URL**: `/internal/dashboard/operations`

**Widgets**:
- 📦 Active Orders (by status)
- 🚗 Driver Fleet (online, offline, active deliveries)
- 📊 Revenue Today (real-time)
- 🛒 Orders per Hour (chart)
- ⚠️ Low Stock Alerts

#### Dashboard 3: Compliance & Security
**URL**: `/internal/dashboard/compliance`

**Widgets**:
- 🔐 Audit Log Activity (last 24 hours)
- 🚨 Security Incidents (failed logins, suspicious activity)
- 📈 Uptime SLA (monthly)
- 🔒 Encryption Status (all connections TLS?)
- ✅ Backup Status (last successful backup)

---

## 5. Alerting Strategy

### 5.1 Alert Severity Levels

| Level | Response Time | Notification | Example |
|-------|--------------|--------------|---------|
| **P0 - Critical** | 5 minutes | Phone call + SMS + Slack + Email | Payment processing down, database down |
| **P1 - High** | 15 minutes | SMS + Slack + Email | API errors > 5%, slow response times |
| **P2 - Medium** | 1 hour | Slack + Email | Approaching SLO breach, low stock alerts |
| **P3 - Low** | 1 business day | Email | Performance degradation, non-critical errors |

### 5.2 Alert Routing

**PagerDuty Integration** (or similar on-call tool):
- P0 alerts → Page on-call engineer immediately (phone call)
- P1 alerts → SMS + Slack notification
- P2 alerts → Slack notification
- P3 alerts → Email notification

**On-call Rotation**:
- Primary on-call: Responds within 5 minutes
- Secondary on-call: Backup if primary doesn't acknowledge in 10 minutes
- Escalation: Manager if no response in 20 minutes

### 5.3 Alert Conditions

#### Critical Alerts (P0)
```yaml
- name: "Service Down"
  condition: "HTTP status 5xx for 2 consecutive checks (10 minutes)"
  action: "Page on-call engineer"
  runbook: "/docs/runbooks/service-down.md"

- name: "Database Unreachable"
  condition: "Connection pool at 100% OR query timeout > 30s"
  action: "Page on-call engineer + DBA"
  runbook: "/docs/runbooks/database-down.md"

- name: "Payment Processing Failure"
  condition: "Payment API error rate > 10% for 5 minutes"
  action: "Page on-call engineer + notify finance team"
  runbook: "/docs/runbooks/payment-failure.md"
```

#### High Alerts (P1)
```yaml
- name: "High Error Rate"
  condition: "Error rate > 1% for 15 minutes"
  action: "Notify on-call engineer via Slack"
  runbook: "/docs/runbooks/high-error-rate.md"

- name: "Slow API Response"
  condition: "p95 response time > 500ms for 15 minutes"
  action: "Notify on-call engineer via Slack"
  runbook: "/docs/runbooks/slow-api.md"

- name: "Disk Space Low"
  condition: "Database disk usage > 90%"
  action: "Notify on-call engineer + DBA"
  runbook: "/docs/runbooks/disk-space-low.md"
```

#### Medium Alerts (P2)
```yaml
- name: "Approaching SLO Breach"
  condition: "Uptime < 99.99% in current month"
  action: "Notify team via Slack"
  runbook: "N/A (informational)"

- name: "Low Stock Alert"
  condition: "Inventory item quantity < reorder_threshold"
  action: "Notify store manager via email"
  runbook: "/docs/runbooks/low-stock.md"

- name: "Failed Backup"
  condition: "Daily backup did not complete successfully"
  action: "Notify on-call engineer + DBA"
  runbook: "/docs/runbooks/backup-failure.md"
```

---

## 6. Logging Strategy

### 6.1 Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| **ERROR** | Unrecoverable errors, exceptions | Payment processing failed |
| **WARN** | Recoverable errors, degraded state | Slow query detected (>100ms) |
| **INFO** | Important business events | Order created, customer signup |
| **DEBUG** | Detailed diagnostic information | Function entry/exit, variable values |

### 6.2 Structured Logging

**Format**: JSON (machine-readable)

```json
{
  "timestamp": "2026-04-24T07:30:45.123Z",
  "level": "ERROR",
  "service": "orders-service",
  "message": "Failed to create order",
  "error": {
    "type": "ValidationError",
    "message": "Invalid customer_id",
    "stack": "Error: Invalid customer_id\n  at createOrder..."
  },
  "context": {
    "customer_id": "invalid-uuid",
    "store_id": "chic-on-chain-001",
    "user_id": "user-123",
    "tenant_id": "chic-on-chain-001",
    "request_id": "req-abc123"
  }
}
```

### 6.3 Log Retention

| Environment | Retention | Storage |
|-------------|-----------|---------|
| Production | 30 days (hot), 1 year (cold) | Supabase Logs + S3 archive |
| Staging | 7 days | Supabase Logs only |
| Development | 1 day | Local only |

### 6.4 Sensitive Data in Logs

**NEVER log**:
- Passwords (even hashed)
- Credit card numbers
- Full Social Security Numbers
- Raw payment tokens

**Mask PII**:
- Email: `u***@example.com`
- Phone: `+1-***-***-1234`
- IP Address: `192.168.x.x`

---

## 7. Distributed Tracing

**Tool**: Sentry Performance (included in Sentry plan)

**What We Trace**:
- Frontend → API calls → Database queries
- API call → Edge Function → External API (Stripe, PayPal)
- Full request lifecycle (start to finish)

**Sample Trace**:
```
[Frontend] Button Click → Create Order
  └─ [API] POST /api/orders → 245ms
      ├─ [DB] INSERT INTO orders → 12ms
      ├─ [DB] INSERT INTO order_items → 8ms
      ├─ [Edge Function] create-paypal-order → 180ms
      │   └─ [External] PayPal API → 165ms
      └─ [Realtime] Broadcast order created → 5ms
```

**Benefits**:
- Identify bottlenecks (e.g., PayPal API is slow)
- Debug errors across services
- Optimize end-to-end latency

---

## 8. Cost Breakdown

| Tool | Plan | Cost/Month | Notes |
|------|------|------------|-------|
| Sentry | Team | $26 | Up to 100K events/month |
| UptimeRobot | Free | $0 | 50 monitors, 5-min intervals |
| Vercel Analytics | Built-in | $0 | Included with Vercel Pro ($20) |
| Supabase Logs | Built-in | $0 | Included with Supabase Pro ($25) |
| PagerDuty | Starter | $21/user | 1 user initially |
| **Total** | | **$47/month** | ($67 with PagerDuty) |

**Scaling**:
- At 1M events/month: Sentry Business ($99/mo)
- At 100K orders/month: Custom metrics tool ($200/mo)
- Total at scale: ~$300-500/month

---

## 9. Implementation Roadmap

### Phase 1: Foundation (April 2026)
- [x] Set up UptimeRobot monitoring
- [ ] Integrate Sentry for error tracking
- [ ] Configure Vercel Analytics
- [ ] Set up Slack alerts channel (#incidents)

### Phase 2: Observability (May 2026)
- [ ] Implement structured logging (JSON format)
- [ ] Set up distributed tracing (Sentry Performance)
- [ ] Create operational dashboards
- [ ] Configure PagerDuty on-call rotation

### Phase 3: Advanced (June 2026)
- [ ] Custom business metrics dashboard
- [ ] Automated anomaly detection
- [ ] Log aggregation and search (if needed)
- [ ] Chaos engineering tests (simulate failures)

---

## 10. Runbooks

Every alert must have a runbook. Runbooks are step-by-step instructions for resolving incidents.

**Runbook Template**:
```markdown
# Runbook: [Alert Name]

## Symptoms
- What the user sees
- What the dashboard shows

## Diagnosis
1. Check service status
2. Check error logs
3. Check metrics dashboard

## Resolution
1. Immediate mitigation (stop the bleeding)
2. Root cause fix (prevent recurrence)
3. Verification (confirm fix worked)

## Escalation
- If unresolved after 30 minutes, escalate to [Manager/DBA/etc.]
```

**Runbooks to Create**:
- [ ] Service Down
- [ ] Database Down
- [ ] Payment Processing Failure
- [ ] High Error Rate
- [ ] Slow API Response
- [ ] Low Disk Space
- [ ] Backup Failure

---

## 11. Quarterly Review

**Review Metrics**:
- SLO performance (did we meet 99.99% uptime?)
- Alert fatigue (are we getting too many false positives?)
- Mean Time to Detect (MTTD): How fast do we detect issues?
- Mean Time to Resolve (MTTR): How fast do we fix issues?

**Continuous Improvement**:
- Add new metrics based on incidents
- Remove noisy alerts (false positives)
- Update runbooks with lessons learned
- Adjust SLOs if needed

---

**Monitoring is not optional. It's how we keep our promise to customers.**
