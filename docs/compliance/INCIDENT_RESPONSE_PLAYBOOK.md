# Incident Response Playbook

**Version**: 1.0.0  
**Last Updated**: April 24, 2026  
**Owner**: Chief Information Security Officer  
**On-Call Rotation**: PagerDuty

---

## 1. Incident Response Framework

### 1.1 Incident Lifecycle

```
DETECT → ASSESS → CONTAIN → NOTIFY → REMEDIATE → RECOVER → DOCUMENT → LEARN
```

### 1.2 Severity Levels

| Level | Response Time | Impact | Examples | Escalation |
|-------|--------------|--------|----------|------------|
| **P0 - Critical** | 5 minutes | Complete service outage, data breach | Database down, payment processing failure, security breach | CEO, CTO, CISO immediately |
| **P1 - High** | 15 minutes | Severe degradation, high error rate | API errors > 5%, slow response times | CTO, CISO within 30 min |
| **P2 - Medium** | 1 hour | Moderate degradation, feature broken | Single feature down, approaching SLO breach | Engineering manager within 2 hours |
| **P3 - Low** | 1 business day | Minor issue, cosmetic | UI glitch, non-critical error | Next standup meeting |

### 1.3 Incident Commander Role

**Who**: On-call engineer (rotates weekly)

**Responsibilities**:
- Declare incident severity
- Coordinate response team
- Make go/no-go decisions
- Communicate with stakeholders
- Document incident timeline
- Lead postmortem

**Authority**: Can override normal procedures to restore service

---

## 2. P0 - Critical Incident Runbooks

### 2.1 Service Down (Complete Outage)

**Symptoms**:
- UptimeRobot alerts "Service Down"
- HTTP 503/504 errors
- Multiple customer reports of inaccessible site

**Detection**:
- UptimeRobot alert (2+ consecutive failures)
- Vercel deployment error
- Customer support tickets spike

**Immediate Actions (first 5 minutes)**:
```bash
# 1. Check Vercel status
curl -I https://codebuild-default-webhook-source-lo.vercel.app
# Expected: HTTP/2 200 OK

# 2. Check Vercel dashboard
# https://vercel.com/glenkeos/codebuild-default-webhook-source-lo

# 3. Check recent deployments
vercel ls codebuild-default-webhook-source-lo --limit 5

# 4. Check Vercel system status
# https://www.vercel-status.com/
```

**Diagnosis**:
```bash
# If frontend is down:
# - Check Vercel deployment status (failed build?)
# - Check DNS resolution: `dig codebuild-default-webhook-source-lo.vercel.app`
# - Check SSL certificate: `openssl s_client -connect codebuild-default-webhook-source-lo.vercel.app:443`

# If API is down:
# - Check Supabase dashboard: https://supabase.com/dashboard/project/beswluhdxaphtitaovly
# - Check database connection: `pg_isready -h db.beswluhdxaphtitaovly.supabase.co`
# - Check Edge Functions logs
```

**Resolution**:
```bash
# Option 1: Rollback to last working deployment
vercel rollback codebuild-default-webhook-source-lo

# Option 2: Redeploy from main branch
vercel --prod

# Option 3: If DNS issue, update DNS records in Vercel dashboard
# Option 4: If Vercel platform issue, wait for Vercel status page resolution
```

**Communication Template**:
```
INCIDENT: P0 - Service Down
STATUS: [INVESTIGATING | IDENTIFIED | RESOLVING | MONITORING | RESOLVED]
START TIME: 2026-04-24 14:32 UTC
IMPACT: All customers unable to access GlenKeos platform
ROOT CAUSE: [To be determined]
CURRENT ACTION: [Specific action being taken]
ETA: [Estimated time to resolution]
NEXT UPDATE: [Time of next status update]
```

**Escalation**:
- If unresolved after 15 minutes → Escalate to CTO
- If unresolved after 30 minutes → Escalate to CEO
- If security-related → Notify CISO immediately

---

### 2.2 Database Down / Unreachable

**Symptoms**:
- All API requests return 500 errors
- Database connection timeouts
- Supabase dashboard shows "Connection Failed"

**Detection**:
- Sentry alerts: High volume of database errors
- Supabase monitoring: Connection pool at 100%
- API response time spike to > 30s

**Immediate Actions**:
```bash
# 1. Check Supabase project status
# https://supabase.com/dashboard/project/beswluhdxaphtitaovly

# 2. Check database connection
psql "postgresql://postgres:[password]@db.beswluhdxaphtitaovly.supabase.co:5432/postgres" -c "SELECT 1;"

# 3. Check connection pool usage
# Supabase Dashboard → Database → Connection Pooling
# Look for: Active connections / Max connections
```

**Diagnosis**:
```sql
-- Check for long-running queries
SELECT 
  pid, 
  now() - query_start AS duration, 
  state, 
  query 
FROM pg_stat_activity 
WHERE state != 'idle' 
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC 
LIMIT 10;

-- Check for locks
SELECT 
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- Check disk space
SELECT 
  pg_size_pretty(pg_database_size('postgres')) AS database_size,
  pg_size_pretty(pg_total_relation_size('orders')) AS orders_table_size,
  pg_size_pretty(pg_total_relation_size('order_items')) AS order_items_table_size;
```

**Resolution**:
```sql
-- Option 1: Kill long-running query
SELECT pg_terminate_backend(12345); -- Replace with actual PID

-- Option 2: Restart connection pooler (Supabase Dashboard)
-- Settings → Database → Connection Pooler → Restart

-- Option 3: Scale up database (if resource exhaustion)
-- Supabase Dashboard → Settings → Database → Upgrade Plan

-- Option 4: Restore from backup (last resort)
-- Supabase Dashboard → Database → Backups → Restore
```

**Communication Template**:
```
INCIDENT: P0 - Database Unreachable
STATUS: INVESTIGATING
START TIME: 2026-04-24 15:47 UTC
IMPACT: All API requests failing (100% error rate)
ROOT CAUSE: [Database connection pool exhausted | Long-running query | Disk full]
CURRENT ACTION: [Specific action]
ETA: 10 minutes
```

---

### 2.3 Payment Processing Failure

**Symptoms**:
- Customers cannot complete checkout
- PayPal/Stripe API errors
- Orders stuck in "PENDING" status

**Detection**:
- Payment error rate > 10%
- Customer support tickets: "Payment failed"
- Sentry alerts: PayPal API 500 errors

**Immediate Actions**:
```bash
# 1. Check PayPal API status
curl https://api-m.paypal.com/v1/oauth2/token \
  -u "${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}" \
  -d "grant_type=client_credentials"
# Expected: HTTP 200 with access_token

# 2. Check Stripe API status
curl https://api.stripe.com/v1/charges \
  -u "${STRIPE_SECRET_KEY}:" \
  -d "amount=100" \
  -d "currency=usd" \
  -d "source=tok_visa"
# Expected: HTTP 200 with charge object

# 3. Check environment variables
echo $PAYPAL_CLIENT_ID
echo $PAYPAL_CLIENT_SECRET
echo $STRIPE_SECRET_KEY
# Ensure all are set and not expired
```

**Diagnosis**:
- Check PayPal/Stripe dashboard for service incidents
- Check API credentials (expired? revoked?)
- Check rate limits (exceeded quota?)
- Check recent code changes (new bug introduced?)

**Resolution**:
```bash
# Option 1: Switch payment provider (if one is down)
# Temporarily disable PayPal in admin dashboard, use Stripe only

# Option 2: Rotate API credentials (if expired)
# Vercel Dashboard → Settings → Environment Variables → Update

# Option 3: Increase rate limits (contact PayPal/Stripe support)

# Option 4: Rollback recent deployment (if new bug)
vercel rollback codebuild-default-webhook-source-lo
```

**Customer Communication**:
```
Subject: Payment Processing Temporarily Unavailable

Dear Customer,

We are currently experiencing technical difficulties with our payment processing system. 

Your order has been saved. Please try again in 10 minutes, or contact support@glenkeos.com for assistance.

We apologize for the inconvenience.

- GlenKeos Team
```

---

### 2.4 Security Breach / Data Leak

**Symptoms**:
- Unauthorized access detected in audit logs
- Customer data exposed publicly
- Ransomware demand received
- Suspicious database queries

**Detection**:
- Sentry alerts: Unusual API access patterns
- Supabase audit log: Failed login attempts spike
- Customer reports: "Someone accessed my account"
- Security researcher disclosure

**IMMEDIATE ACTIONS (DO NOT DELAY)**:
```bash
# 1. ISOLATE THE BREACH
# - Revoke compromised API keys
# - Disable compromised user accounts
# - Block malicious IP addresses

# 2. PRESERVE EVIDENCE
# - DO NOT delete logs
# - DO NOT restart systems (unless actively under attack)
# - Export audit logs immediately:
#   Supabase Dashboard → Database → SQL Editor
SELECT * FROM compliance_audit_log 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
#   Export to CSV for forensic analysis

# 3. NOTIFY INCIDENT COMMANDER + CISO
# DO NOT discuss publicly until legal/PR approval
```

**Breach Assessment Checklist**:
- [ ] What data was accessed? (PII, payment data, credentials?)
- [ ] How many customers affected?
- [ ] How did attacker gain access? (SQL injection, stolen credentials, insider threat?)
- [ ] Is attacker still in the system?
- [ ] Has data been exfiltrated or just viewed?

**Legal Notification Requirements**:
| Regulation | Notification Deadline | Who to Notify |
|------------|----------------------|---------------|
| **GDPR** | 72 hours from discovery | Supervisory authority (ICO, CNIL, etc.) |
| **CCPA** | Without unreasonable delay | California Attorney General + affected residents |
| **HIPAA** | 60 days | HHS Secretary + affected individuals |
| **PCI-DSS** | Immediately | Payment brands (Visa, Mastercard) + acquiring bank |

**Containment Steps**:
```sql
-- 1. Revoke all active sessions
DELETE FROM auth.sessions;

-- 2. Force password reset for all users
UPDATE auth.users SET encrypted_password = NULL;

-- 3. Disable compromised API keys
-- Vercel Dashboard → Environment Variables → Rotate all secrets

-- 4. Block malicious IP addresses
-- Vercel Dashboard → Firewall → Add IP to blocklist
```

**Communication Template (Internal)**:
```
SECURITY INCIDENT: P0 - Data Breach
SEVERITY: CRITICAL
DISCOVERY TIME: 2026-04-24 16:23 UTC
BREACH TYPE: [Unauthorized access | Data exfiltration | Ransomware]
AFFECTED DATA: [Customer PII | Payment data | Internal systems]
AFFECTED USERS: [Number] customers
ATTACKER ACCESS: [Still active | Contained]
CONTAINMENT STATUS: [In progress | Complete]
LEGAL NOTIFICATION: [Required | Not required]
NEXT STEPS: [Specific actions]

DISTRIBUTION: CEO, CTO, CISO, Legal, PR - CONFIDENTIAL
```

**External Communication** (only after legal approval):
```
Subject: Important Security Notice for Your GlenKeos Account

Dear [Customer Name],

We are writing to inform you of a security incident that may have affected your account.

WHAT HAPPENED:
On [date], we discovered unauthorized access to our systems. We immediately contained the breach and launched an investigation.

WHAT INFORMATION WAS INVOLVED:
[Specific data types: name, email, order history, etc.]

WHAT WE ARE DOING:
- We have secured our systems and blocked the unauthorized access
- We are working with cybersecurity experts to investigate
- We have notified law enforcement and regulatory authorities
- We are implementing additional security measures

WHAT YOU SHOULD DO:
- Reset your password immediately at [link]
- Monitor your payment card statements for suspicious activity
- Enable two-factor authentication (recommended)

We sincerely apologize for this incident and are committed to protecting your data.

For questions: security@glenkeos.com | 1-555-123-4567

- GlenKeos Security Team
```

---

## 3. P1 - High Incident Runbooks

### 3.1 High Error Rate (> 1%)

**Symptoms**:
- Sentry alerts: Error rate > 1% for 15+ minutes
- Dashboard shows elevated error count
- Some customers experiencing issues

**Diagnosis**:
```bash
# 1. Check Sentry dashboard
# https://sentry.io/organizations/glenkeos/issues/

# 2. Identify error patterns
# - Same error message repeated?
# - Specific endpoint failing?
# - Specific tenant affected?

# 3. Check recent deployments
vercel ls codebuild-default-webhook-source-lo --limit 10

# 4. Check error details
# Sentry → Issues → [Click specific error] → View breadcrumbs and stack trace
```

**Resolution**:
```bash
# If caused by recent deployment:
vercel rollback codebuild-default-webhook-source-lo

# If caused by external service:
# - Check third-party status pages (Stripe, PayPal, Twilio)
# - Implement circuit breaker to gracefully degrade

# If caused by database issue:
# - Check slow query log
# - Add missing index
# - Optimize query
```

---

### 3.2 Slow API Response (p95 > 500ms)

**Symptoms**:
- Vercel Analytics shows elevated response times
- Customers report "slow loading"
- Timeout errors in Sentry

**Diagnosis**:
```sql
-- Check slow queries in PostgreSQL
SELECT 
  query, 
  calls, 
  total_time, 
  mean_time, 
  max_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 20;

-- Check missing indices
SELECT 
  schemaname, 
  tablename, 
  attname, 
  n_distinct, 
  correlation 
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;
```

**Resolution**:
```sql
-- Add missing index (example)
CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders(customer_id);
CREATE INDEX CONCURRENTLY idx_orders_status_created ON orders(status, created_at);

-- Analyze table statistics
ANALYZE orders;
ANALYZE order_items;

-- Vacuum to reclaim space
VACUUM ANALYZE;
```

---

### 3.3 Disk Space Low (> 90%)

**Symptoms**:
- Supabase Dashboard shows disk usage > 90%
- Database write errors
- Backup failures

**Diagnosis**:
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- Check for bloat
SELECT 
  schemaname, 
  tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename) - pg_relation_size(schemaname || '.' || tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
```

**Resolution**:
```sql
-- Option 1: Delete old data (per retention policy)
DELETE FROM application_logs WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM auth.sessions WHERE expires_at < NOW();

-- Option 2: Vacuum to reclaim space
VACUUM FULL compliance_audit_log; -- Warning: locks table during operation

-- Option 3: Archive old data to S3
-- Export to CSV, upload to S3, delete from database

-- Option 4: Upgrade Supabase plan
-- Supabase Dashboard → Settings → Billing → Upgrade
```

---

## 4. Postmortem Template

**Required for**: All P0 incidents, P1 incidents with customer impact

**Timeline**: Complete within 5 business days of resolution

### Postmortem Document Structure

```markdown
# Postmortem: [Incident Title]

**Date**: 2026-04-24  
**Severity**: P0 - Critical  
**Duration**: 47 minutes  
**Affected Customers**: 3,245 (estimated)  
**Revenue Impact**: $12,000 (estimated)

## Summary
[2-3 sentence description of what happened]

## Timeline (all times UTC)
- 14:32 - UptimeRobot alert: Service down
- 14:34 - Incident commander paged (John Doe)
- 14:37 - Root cause identified (database connection pool exhausted)
- 14:42 - Mitigation deployed (killed long-running query)
- 14:55 - Service restored
- 15:19 - All customers able to access platform

## Root Cause
[Detailed technical explanation of what caused the incident]

## Impact
- **Customers Affected**: 3,245 users unable to place orders
- **Duration**: 47 minutes
- **Revenue Lost**: ~$12,000 (based on average $255/min order rate)
- **SLA Impact**: 99.99% monthly uptime target breached (now 99.95%)

## What Went Well
- Incident detected within 2 minutes
- Incident commander responded in < 5 minutes
- Root cause identified quickly (database locks visible in pg_stat_activity)
- Mitigation deployed within 10 minutes of root cause identification

## What Went Wrong
- No automatic alerting for connection pool exhaustion (manual dashboard check required)
- Long-running query should have been killed automatically (no timeout configured)
- Communication to customers delayed by 15 minutes (no pre-written template)

## Action Items
| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| Implement automatic connection pool monitoring + alerting | DBA | 2026-05-01 | Open |
| Configure statement_timeout=30s on all queries | Engineering | 2026-05-01 | Open |
| Create incident communication templates | Support | 2026-04-25 | Open |
| Add pg_stat_statements dashboard to Grafana | DevOps | 2026-05-05 | Open |
| Document long-running query kill procedure | DBA | 2026-04-25 | Open |

## Lessons Learned
- Supabase connection pool limits are lower than expected for our traffic (12 connections on free tier)
- Need better visibility into database performance (slow query log, connection pool metrics)
- Customer communication is critical during outages (reduces support ticket volume)
```

---

## 5. Communication Protocols

### 5.1 Internal Communication (During Incident)

**Slack Channel**: #incidents (auto-created by PagerDuty)

**Update Frequency**:
- P0: Every 15 minutes (minimum)
- P1: Every 30 minutes
- P2: Hourly

**Required Information**:
- Current status (INVESTIGATING | IDENTIFIED | RESOLVING | MONITORING | RESOLVED)
- Impact assessment
- Current action being taken
- ETA to resolution

### 5.2 External Communication (Customers)

**Status Page**: https://status.glenkeos.com (future)

**When to Communicate**:
- P0: Within 15 minutes of incident declaration
- P1: Within 1 hour (if customer-facing)
- P2: Only if customer reports come in

**Email Template** (P0):
```
Subject: [RESOLVED] Service Disruption on April 24, 2026

We experienced a service disruption today from 14:32 - 15:19 UTC.

WHAT HAPPENED: Our database experienced connection issues, causing order placement failures.

IMPACT: Some customers were unable to place orders for approximately 47 minutes.

RESOLUTION: We identified and resolved the root cause. All systems are now operational.

PREVENTION: We are implementing additional monitoring and automated safeguards.

We sincerely apologize for the inconvenience. If you experienced issues, please contact support@glenkeos.com for assistance.

- GlenKeos Operations Team
```

---

## 6. On-Call Rotation

### 6.1 Schedule

| Week | Primary On-Call | Secondary On-Call |
|------|----------------|------------------|
| Apr 21-27 | John Doe | Jane Smith |
| Apr 28 - May 4 | Jane Smith | Bob Johnson |
| May 5-11 | Bob Johnson | John Doe |

**Handoff**: Every Monday at 9:00 AM UTC

### 6.2 On-Call Responsibilities

- Respond to pages within 5 minutes
- Acknowledge incident in PagerDuty
- Act as Incident Commander
- Document incident timeline
- Write postmortem

**On-Call Compensation**: $200/week + $100/hour during active incident

---

## 7. Escalation Matrix

| Issue | Escalate To | When |
|-------|------------|------|
| P0 unresolved after 15 min | CTO | Immediately |
| P0 unresolved after 30 min | CEO | Immediately |
| Any security incident | CISO | Immediately (do not wait) |
| Data breach | Legal + PR | Immediately |
| Payment processing failure | Finance + PayPal/Stripe support | Within 30 minutes |
| Supabase platform issue | Supabase support | Immediately |
| Vercel platform issue | Vercel support | Immediately |

**Contact Information**:
- CTO: +1-555-123-4501 (call/SMS anytime)
- CEO: +1-555-123-4500 (call/SMS anytime)
- CISO: +1-555-123-4502 (call/SMS anytime)
- Supabase Support: support@supabase.com (< 1 hour response on Pro plan)
- Vercel Support: support@vercel.com (< 30 min response on Enterprise plan)

---

**This playbook is a living document. Update after every major incident.**
