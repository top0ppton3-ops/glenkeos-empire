# Disaster Recovery Playbook

**Version**: 1.0.0  
**Last Updated**: April 24, 2026  
**Owner**: Chief Technology Officer  
**Review Cycle**: Quarterly

---

## 1. Disaster Recovery Objectives

### 1.1 Recovery Time Objective (RTO)
**Target**: 1 hour (maximum tolerable downtime)

**By Service**:
| Service | RTO | Justification |
|---------|-----|---------------|
| Frontend (Vercel) | 15 minutes | Auto-scaling, instant rollback |
| Database (Supabase) | 1 hour | Restore from backup + verification |
| Authentication (Supabase Auth) | 30 minutes | Restore from backup |
| Realtime (Supabase Realtime) | 30 minutes | Automatic reconnection |
| Payment Processing (Stripe/PayPal) | 5 minutes | External service (out of our control) |
| Edge Functions (Supabase) | 15 minutes | Redeploy from git |

### 1.2 Recovery Point Objective (RPO)
**Target**: 5 minutes (maximum acceptable data loss)

**Backup Frequency**:
- Database: Continuous (Point-in-Time Recovery via WAL logs)
- Full backup: Daily at 2:00 AM UTC
- Incremental backup: Every 6 hours
- Git commits: Continuous (on every merge to main)

**Data Loss Scenarios**:
- **Best case**: 0 seconds (PITR to exact failure time)
- **Typical case**: < 5 minutes (restore to last incremental backup)
- **Worst case**: 24 hours (restore to last daily full backup)

---

## 2. Disaster Scenarios

### 2.1 Scenario Classification

| Scenario | Likelihood | Impact | RTO | Recovery Complexity |
|----------|-----------|--------|-----|-------------------|
| **Vercel Region Outage** | Low | High | 15 min | Low (auto-failover) |
| **Supabase Region Outage** | Very Low | Critical | 1 hour | Medium (restore backup) |
| **Complete Data Loss** | Very Low | Catastrophic | 4 hours | High (full rebuild) |
| **Ransomware Attack** | Low | Critical | 2 hours | High (forensics + restore) |
| **Accidental Data Deletion** | Medium | Medium | 30 min | Low (restore from backup) |
| **DNS Hijacking** | Low | High | 10 min | Low (update DNS) |
| **DDoS Attack** | Medium | High | 5 min | Low (enable Vercel firewall) |
| **Code Deployment Failure** | Medium | Medium | 5 min | Low (rollback) |

---

## 3. Disaster Recovery Procedures

### 3.1 Vercel Region Outage

**Detection**:
- UptimeRobot alerts: Service down from multiple regions
- Vercel status page: https://www.vercel-status.com/

**Procedure**:
```bash
# Step 1: Verify Vercel platform issue (not our code)
curl -I https://codebuild-default-webhook-source-lo.vercel.app
# If Vercel status page confirms outage, proceed

# Step 2: Deploy to backup region (if available on Enterprise plan)
# Vercel automatically handles multi-region failover on Enterprise plan
# On Pro plan: Wait for Vercel resolution (typically < 15 minutes)

# Step 3: Communicate to customers
# Use status page or social media (since main site is down)

# Step 4: Monitor Vercel status page for resolution
```

**Workaround** (if extended outage):
- Deploy static "maintenance mode" page to separate hosting (e.g., GitHub Pages)
- Update DNS to point to maintenance page
- Accept orders via phone/email manually

**Recovery Verification**:
```bash
# Test frontend
curl -I https://codebuild-default-webhook-source-lo.vercel.app
# Expected: HTTP/2 200 OK

# Test API proxy
curl https://codebuild-default-webhook-source-lo.vercel.app/api/health
# Expected: {"status":"ok","timestamp":"2026-04-24T..."}

# Test Edge Functions
curl https://beswluhdxaphtitaovly.supabase.co/functions/v1/health
# Expected: {"status":"healthy"}
```

---

### 3.2 Supabase Database Disaster Recovery

#### Scenario A: Database Corruption (Physical Failure)

**Detection**:
- All database queries fail with connection errors
- Supabase dashboard shows database offline
- Supabase support confirms corruption

**Procedure**:

**Step 1: Declare Incident** (Time: T+0)
```bash
# Page on-call DBA immediately
# Declare P0 incident in Slack #incidents
# Notify CTO, CEO, CISO
```

**Step 2: Assess Damage** (Time: T+5 minutes)
```bash
# Attempt connection to database
psql "postgresql://postgres:[PASSWORD]@db.beswluhdxaphtitaovly.supabase.co:5432/postgres"

# If connection fails completely: Physical failure confirmed
# If connection succeeds but queries fail: Data corruption likely

# Check Supabase status
# https://status.supabase.com/
```

**Step 3: Identify Restore Point** (Time: T+10 minutes)
```bash
# List available backups
# Supabase Dashboard → Database → Backups

# Available restore points:
# - Point-in-Time Recovery: Any timestamp within last 7 days
# - Full backups: Daily (last 30 days)
# - Incremental backups: Every 6 hours (last 7 days)

# Choose restore point:
# - If corruption just occurred: PITR to 5 minutes before incident
# - If corruption time unknown: Most recent full backup
```

**Step 4: Restore from Backup** (Time: T+15 minutes)
```bash
# Option 1: Point-in-Time Recovery (PREFERRED)
# Supabase Dashboard → Database → Backups → Point-in-Time Recovery
# Enter timestamp: 2026-04-24 14:25:00 UTC (5 min before incident)
# Confirm restore (creates new database instance)
# ETA: 15-30 minutes depending on database size

# Option 2: Full Backup Restore
# Supabase Dashboard → Database → Backups → Select backup
# Click "Restore"
# ETA: 30-45 minutes

# Option 3: Manual Restore from SQL Dump (if Supabase unavailable)
# 1. Download backup from Supabase
# 2. Create new Supabase project
# 3. Restore via psql:
psql "postgresql://postgres:[PASSWORD]@[NEW_PROJECT].supabase.co:5432/postgres" < backup.sql
```

**Step 5: Verify Data Integrity** (Time: T+45 minutes)
```sql
-- Connect to restored database
psql "postgresql://postgres:[PASSWORD]@db.beswluhdxaphtitaovly.supabase.co:5432/postgres"

-- Verify table row counts
SELECT 
  'stores' AS table_name, COUNT(*) AS row_count FROM stores
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'compliance_audit_log', COUNT(*) FROM compliance_audit_log;

-- Compare to pre-incident counts (from monitoring dashboard)
-- Expected: Row counts within 5-10 of pre-incident values (accounting for 5-min RPO)

-- Verify recent orders (data loss check)
SELECT order_id, customer_id, total_amount, created_at 
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC 
LIMIT 10;

-- Verify RLS policies still active
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Verify indices exist
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Step 6: Update Application Connection** (Time: T+50 minutes)
```bash
# If restored to NEW Supabase project:
# Update environment variables
# Vercel Dashboard → Settings → Environment Variables
VITE_SUPABASE_URL=https://[NEW_PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[NEW_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[NEW_SERVICE_KEY]
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[NEW_PROJECT_ID].supabase.co:5432/postgres

# Redeploy frontend
vercel --prod

# If restored to SAME Supabase project:
# No changes needed, application reconnects automatically
```

**Step 7: Resume Service** (Time: T+55 minutes)
```bash
# Test end-to-end flow
# 1. Visit https://codebuild-default-webhook-source-lo.vercel.app
# 2. Create test order
# 3. Verify order appears in database
# 4. Verify Realtime updates working

# If all tests pass: Declare incident resolved
```

**Step 8: Assess Data Loss** (Time: T+60 minutes)
```sql
-- Identify lost orders (if any)
-- Compare last order timestamp in database to incident time
SELECT MAX(created_at) AS last_order_time 
FROM orders;

-- If last_order_time < incident_time - 5 minutes:
-- Data loss beyond RPO occurred

-- Calculate lost orders
SELECT COUNT(*) AS potentially_lost_orders
FROM compliance_audit_log
WHERE event_type = 'ORDER_CREATED'
  AND created_at > (SELECT MAX(created_at) FROM orders)
  AND created_at < NOW() - INTERVAL '5 minutes';
-- (Audit log is immutable and backed up separately)

-- Contact affected customers
SELECT DISTINCT 
  u.email,
  cal.event_data->>'order_id' AS lost_order_id
FROM compliance_audit_log cal
JOIN auth.users u ON u.id = cal.user_id
WHERE cal.event_type = 'ORDER_CREATED'
  AND cal.created_at > (SELECT MAX(created_at) FROM orders);
```

**Step 9: Customer Communication** (Time: T+90 minutes)
```
Subject: Service Disruption - Action Required

Dear [Customer Name],

We experienced a technical issue today that may have affected your recent order.

WHAT HAPPENED:
Between 14:25 - 15:30 UTC, we experienced a database issue. Your order placed at [time] may not have been processed.

WHAT YOU NEED TO DO:
Please check your order history at https://codebuild-default-webhook-source-lo.vercel.app/orders

If your order does not appear:
1. Place your order again (we have restored full service)
2. Contact support@glenkeos.com for a 20% discount code

We sincerely apologize for the inconvenience.

- GlenKeos Operations Team
```

---

#### Scenario B: Accidental Data Deletion (Human Error)

**Example**: `DELETE FROM orders WHERE 1=1;` (forgot WHERE clause)

**Detection**:
- Application errors: "Order not found"
- Database monitoring: Row count drop on orders table
- Manual report: "All orders disappeared"

**Procedure**:

**Step 1: STOP IMMEDIATELY**
```sql
-- DO NOT run any more queries
-- DO NOT restart application
-- DO NOT run backups (would overwrite good backup with empty data)

-- Check audit log to confirm deletion
SELECT event_type, user_id, event_data, created_at
FROM compliance_audit_log
WHERE table_name = 'orders' 
  AND event_type = 'DATA_DELETED'
ORDER BY created_at DESC
LIMIT 100;
```

**Step 2: Identify Deletion Time** (within 5 minutes of discovery)
```sql
-- Find exact deletion timestamp
SELECT MAX(created_at) AS last_deleted_time
FROM compliance_audit_log
WHERE table_name = 'orders' 
  AND event_type = 'ORDER_CREATED';

-- This is the restore point target (1 second before deletion)
```

**Step 3: Restore Deleted Data via Point-in-Time Recovery**
```bash
# Option 1: Restore entire database to point before deletion
# Supabase Dashboard → Database → Backups → Point-in-Time Recovery
# Timestamp: [last_deleted_time - 1 second]
# WARNING: Loses all data created AFTER this timestamp

# Option 2: Restore to separate database, export deleted data, re-import
# (PREFERRED if deletion was > 1 hour ago)

# Create new Supabase project for restore
# Restore backup to new project
# Export deleted data:
psql "postgresql://postgres:[PASSWORD]@[RESTORE_PROJECT].supabase.co:5432/postgres" \
  -c "COPY (SELECT * FROM orders) TO STDOUT" > orders_recovered.csv

# Import to production:
psql "postgresql://postgres:[PASSWORD]@db.beswluhdxaphtitaovly.supabase.co:5432/postgres" \
  -c "\COPY orders FROM 'orders_recovered.csv' CSV"
```

**Step 4: Verify Recovery**
```sql
-- Check row counts match pre-deletion
SELECT COUNT(*) FROM orders;
-- Compare to monitoring dashboard (should match)

-- Verify recent orders are present
SELECT * FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

**Step 5: Prevent Recurrence**
```sql
-- Implement safeguards:
-- 1. Require explicit tenant_id in DELETE statements
ALTER TABLE orders ADD CONSTRAINT require_tenant_id_in_delete 
  CHECK (tenant_id IS NOT NULL);

-- 2. Create backup "trash" table for soft deletes
CREATE TABLE orders_deleted AS SELECT * FROM orders WHERE false;

-- 3. Require code review for any DELETE statements (code review process)
```

---

### 3.3 Complete Catastrophic Failure (Everything Down)

**Scenario**: Supabase account compromised, all projects deleted, no backups accessible

**Procedure** (Cold Start Rebuild):

**Step 1: Assess Damage** (Time: T+0)
```bash
# Verify extent of damage
# - Supabase dashboard accessible? 
# - Vercel dashboard accessible?
# - Git repository intact? (GitHub)
# - Backups downloadable?

# If ALL of the above are YES: Not a complete catastrophe, proceed with standard recovery
# If ANY critical component missing: Cold start rebuild required
```

**Step 2: Create New Supabase Project** (Time: T+15 minutes)
```bash
# Go to https://supabase.com/dashboard
# Create new project
# Name: glenkeos-recovery-[date]
# Region: Same as original (US West)
# Database password: Generate strong password

# Save credentials:
NEW_PROJECT_URL=https://[new-project-id].supabase.co
NEW_ANON_KEY=[new-anon-key]
NEW_SERVICE_KEY=[new-service-key]
NEW_DB_PASSWORD=[new-password]
```

**Step 3: Restore Database Schema** (Time: T+20 minutes)
```bash
# Option 1: From git repository (PREFERRED)
git clone https://github.com/glenkeos/glenkeos-platform.git
cd glenkeos-platform
psql "postgresql://postgres:$NEW_DB_PASSWORD@db.[new-project-id].supabase.co:5432/postgres" \
  < docs/architecture/COMPLETE_DATABASE_SCHEMA.sql

# Option 2: From local backup (if git unavailable)
psql "postgresql://postgres:$NEW_DB_PASSWORD@db.[new-project-id].supabase.co:5432/postgres" \
  < /backups/glenkeos_schema_2026-04-24.sql

# Verify schema created
psql "postgresql://postgres:$NEW_DB_PASSWORD@db.[new-project-id].supabase.co:5432/postgres" \
  -c "\dt" # List tables (should show 9 tables)
```

**Step 4: Restore Data** (Time: T+30 minutes)
```bash
# If backups available (from Supabase download or S3):
psql "postgresql://postgres:$NEW_DB_PASSWORD@db.[new-project-id].supabase.co:5432/postgres" \
  < /backups/glenkeos_data_2026-04-24.sql

# If NO backups available (catastrophic data loss):
# Load seed data only (stores, menu items)
psql "postgresql://postgres:$NEW_DB_PASSWORD@db.[new-project-id].supabase.co:5432/postgres" \
  < docs/database/seed_data.sql

# Customer data lost: Send apology email, offer recovery assistance
```

**Step 5: Update Application Configuration** (Time: T+40 minutes)
```bash
# Update Vercel environment variables
vercel env add VITE_SUPABASE_URL production
# Enter: https://[new-project-id].supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Enter: [new-anon-key]

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Enter: [new-service-key]

vercel env add DATABASE_URL production
# Enter: postgresql://postgres:[password]@db.[new-project-id].supabase.co:5432/postgres

# Redeploy frontend
vercel --prod
```

**Step 6: Redeploy Edge Functions** (Time: T+50 minutes)
```bash
# Link to new Supabase project
supabase link --project-ref [new-project-id]

# Deploy all Edge Functions
supabase functions deploy --no-verify-jwt

# Verify deployment
curl https://[new-project-id].supabase.co/functions/v1/health
# Expected: {"status":"healthy"}
```

**Step 7: Test Critical Paths** (Time: T+55 minutes)
```bash
# Test 1: User authentication
curl -X POST https://[new-project-id].supabase.co/auth/v1/signup \
  -H "Content-Type: application/json" \
  -H "apikey: $NEW_ANON_KEY" \
  -d '{"email":"test@example.com","password":"testpass123"}'
# Expected: User created

# Test 2: Create order (end-to-end)
# Visit https://codebuild-default-webhook-source-lo.vercel.app
# Place test order
# Verify order appears in database

# Test 3: Realtime subscriptions
# Open browser console
# Subscribe to orders channel
# Create order
# Verify realtime update received
```

**Step 8: Resume Service** (Time: T+60 minutes)
```bash
# If all tests pass:
# - Update status page: Service restored
# - Send customer communication
# - Declare incident resolved
```

**Step 9: Data Recovery Assistance** (Time: T+120 minutes)
```bash
# If customer data was lost:
# 1. Contact Supabase support for backup recovery assistance
# 2. Check S3 archival backups (if configured)
# 3. Restore from git history (if seed data was committed)
# 4. Offer customers manual data re-entry assistance
```

---

### 3.4 Ransomware Attack

**Detection**:
- Files encrypted with .locked extension
- Ransom note in database
- Supabase dashboard shows unauthorized access

**Procedure**:

**Step 1: ISOLATE IMMEDIATELY** (Time: T+0)
```bash
# DO NOT PAY RANSOM
# DO NOT NEGOTIATE WITH ATTACKERS

# 1. Disconnect compromised systems
# Revoke all Supabase API keys:
# Supabase Dashboard → Settings → API → Rotate all keys

# 2. Revoke all user sessions
psql "postgresql://postgres:[PASSWORD]@db.beswluhdxaphtitaovly.supabase.co:5432/postgres" \
  -c "DELETE FROM auth.sessions;"

# 3. Block attacker IP addresses
# Supabase Dashboard → Settings → Firewall → Add blocklist

# 4. Preserve evidence (DO NOT delete logs)
# Export audit logs immediately
```

**Step 2: Notify Authorities** (Time: T+15 minutes)
```bash
# 1. Contact FBI Cyber Division
# Phone: 1-800-CALL-FBI (1-800-225-5324)
# Email: ic3.gov (Internet Crime Complaint Center)

# 2. Contact local law enforcement

# 3. Contact cyber insurance provider

# 4. Contact legal counsel

# DO NOT communicate publicly until legal clearance
```

**Step 3: Assess Encryption** (Time: T+30 minutes)
```bash
# Check if database is encrypted by ransomware
psql "postgresql://postgres:[PASSWORD]@db.beswluhdxaphtitaovly.supabase.co:5432/postgres" \
  -c "SELECT * FROM orders LIMIT 1;"

# If data is readable: Database not encrypted (attacker may have exfiltrated only)
# If data is garbled/encrypted: Proceed with restore from backup
```

**Step 4: Restore from Backup** (Time: T+45 minutes)
```bash
# Use Point-in-Time Recovery to point BEFORE attack
# Supabase Dashboard → Database → Backups → PITR
# Timestamp: [last known good state, from audit logs]

# Follow standard database recovery procedure (Section 3.2)
```

**Step 5: Forensic Analysis** (Time: T+60 minutes - ongoing)
```bash
# Work with cybersecurity firm to determine:
# 1. How did attacker gain access? (stolen credentials, SQL injection, etc.)
# 2. What data was accessed/exfiltrated?
# 3. Are backdoors still present?

# Preserve evidence:
# - Export all logs
# - Take snapshots of compromised systems
# - Document timeline of events
```

**Step 6: Breach Notification** (Time: T+72 hours - GDPR deadline)
```bash
# GDPR requires notification within 72 hours
# See INCIDENT_RESPONSE_PLAYBOOK.md Section 2.4 for notification procedures

# Notify:
# 1. Supervisory authority (ICO, CNIL, etc.)
# 2. Affected customers
# 3. Payment processors (if payment data exposed)
# 4. Cyber insurance provider
```

**Step 7: Implement Hardening** (Time: T+1 week)
```bash
# 1. Enable MFA for all admin accounts
# 2. Rotate all API keys and passwords
# 3. Implement IP allowlisting for database access
# 4. Add intrusion detection system (IDS)
# 5. Conduct penetration test
# 6. Update incident response playbook
```

---

## 4. Testing & Validation

### 4.1 Disaster Recovery Testing Schedule

| Test Type | Frequency | Last Tested | Next Test |
|-----------|-----------|-------------|-----------|
| **Backup Restore (Non-Prod)** | Monthly | TBD | 2026-05-15 |
| **Tabletop Exercise** | Quarterly | TBD | 2026-06-01 |
| **Full DR Simulation** | Annually | TBD | 2026-10-01 |
| **Code Rollback Test** | Weekly | 2026-04-20 | 2026-04-27 |

### 4.2 Monthly Backup Restore Test

**Procedure**:
```bash
# 1. Create test Supabase project
# 2. Restore latest production backup to test project
# 3. Verify data integrity
# 4. Test application against restored database
# 5. Document results
# 6. Delete test project

# SUCCESS CRITERIA:
# - Restore completes in < 30 minutes
# - All tables present with correct row counts
# - Application connects and functions normally
# - No data corruption detected
```

### 4.3 Quarterly Tabletop Exercise

**Scenario Examples**:
- "Supabase region outage lasts 4 hours"
- "Accidental deletion of customers table"
- "Ransomware encrypts database"

**Participants**:
- CTO (Incident Commander)
- DBA (Recovery Owner)
- Engineering Lead
- CISO
- CEO (if P0 scenario)

**Format**:
- 90-minute facilitated discussion
- Step through recovery procedures
- Identify gaps in playbook
- Update playbook based on findings

---

## 5. Business Continuity

### 5.1 Manual Workaround (If Technology Fails)

**Scenario**: All systems down, recovery ETA > 4 hours

**Manual Order Processing**:
```
1. Accept orders via phone/email
2. Record in Google Sheets (offline backup)
3. Process payments manually via Square/PayPal
4. Dispatch drivers via phone/SMS
5. Reconcile with database when system restored

Phone Number: 1-555-GLENKEOS (1-555-453-6536)
Email: orders@glenkeos.com
```

**Revenue Protection**:
- Estimated manual capacity: 50 orders/hour (vs. 120/hour normal)
- Revenue impact: ~$7,000/hour lost throughput
- Acceptable for up to 8 hours (then close stores temporarily)

---

## 6. Communication Plan

### 6.1 Stakeholder Notification

| Stakeholder | Notification Method | Timeframe |
|-------------|-------------------|-----------|
| **Customers** | Email + status page | Within 30 min of incident |
| **Store Managers** | Phone call + SMS | Within 15 min of incident |
| **Drivers** | SMS broadcast | Within 15 min of incident |
| **Investors** | Email + phone | Within 2 hours (P0 only) |
| **Board of Directors** | Email | Within 4 hours (P0 only) |
| **Insurance Provider** | Phone + email | Within 24 hours |
| **Regulators** | Official notice | Per legal requirements |

---

## 7. Post-Recovery Checklist

After disaster recovery, verify:
- [ ] All services operational (frontend, API, database, realtime)
- [ ] Data integrity verified (row counts, sample queries)
- [ ] Authentication working (login, signup, password reset)
- [ ] Payments processing (test transaction)
- [ ] Realtime updates functioning (test subscription)
- [ ] Monitoring restored (Sentry, UptimeRobot receiving data)
- [ ] Backups resuming (next scheduled backup completes)
- [ ] Security controls active (RLS policies, encryption, MFA)
- [ ] Customer communication sent
- [ ] Incident postmortem scheduled (within 5 business days)
- [ ] Lessons learned documented
- [ ] Playbook updated with new findings

---

## 8. Contact Information

### 8.1 Emergency Contacts

**Internal**:
- CTO: +1-555-123-4501 (24/7)
- DBA: +1-555-123-4503 (24/7)
- CISO: +1-555-123-4502 (24/7)
- CEO: +1-555-123-4500 (P0 only)

**External**:
- Supabase Support: support@supabase.com | https://supabase.com/support
- Vercel Support: support@vercel.com | https://vercel.com/support
- Stripe Support: +1-888-926-2289 | https://support.stripe.com
- PayPal Support: +1-888-221-1161 | https://www.paypal.com/us/smarthelp/contact-us
- Cyber Insurance: cyberresponse@insurance.com | +1-800-CYBER-01

### 8.2 Vendor SLAs

| Vendor | Support Tier | Response Time | Availability |
|--------|-------------|--------------|--------------|
| Supabase | Pro Plan | < 1 hour | Business hours |
| Vercel | Pro Plan | < 30 minutes | 24/7 |
| Stripe | Standard | < 4 hours | 24/7 |
| PayPal | Business | < 2 hours | Business hours |

---

**Test this playbook quarterly. A disaster recovery plan that isn't tested is just documentation.**
