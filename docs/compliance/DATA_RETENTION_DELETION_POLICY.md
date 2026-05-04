# Data Retention & Deletion Policy

**Version**: 1.0.0  
**Effective Date**: April 24, 2026  
**Last Updated**: April 24, 2026  
**Policy Owner**: Chief Privacy Officer  
**Review Cycle**: Annual

---

## 1. Purpose & Scope

This policy establishes standards for the retention and deletion of data to ensure:
- **Legal Compliance**: GDPR, CCPA, SOX, PCI-DSS requirements
- **Business Continuity**: Preserve data needed for operations and audits
- **Cost Optimization**: Minimize storage costs by deleting obsolete data
- **Security**: Reduce attack surface by eliminating unnecessary data

**Scope**: All data collected, processed, or stored by GlenKeos LLC across all environments (production, staging, development).

---

## 2. Legal & Regulatory Requirements

### 2.1 GDPR (General Data Protection Regulation)
**Applies to**: All EU residents' data

**Key Requirements**:
- **Article 5(1)(e)**: Storage limitation - keep data no longer than necessary
- **Article 17**: Right to erasure ("right to be forgotten")
- **Article 30**: Records of processing activities must be maintained

**Penalties**: Up to €20M or 4% of annual revenue (whichever is higher)

### 2.2 CCPA (California Consumer Privacy Act)
**Applies to**: California residents' data

**Key Requirements**:
- **Section 1798.105**: Right to deletion
- **Section 1798.120**: Right to opt-out of sale

**Penalties**: Up to $7,500 per intentional violation

### 2.3 SOX (Sarbanes-Oxley Act)
**Applies to**: Financial records

**Key Requirements**:
- **Section 802**: 7-year retention for audit records
- **Section 1520**: Destruction of records = felony

### 2.4 PCI-DSS (Payment Card Industry Data Security Standard)
**Applies to**: Payment card data

**Key Requirements**:
- **Requirement 3.1**: Keep cardholder data to minimum necessary
- **Requirement 3.2**: Do not store sensitive authentication data after authorization

---

## 3. Data Classification & Retention Periods

| Data Type | Classification | Retention Period | Legal Basis | Deletion Method |
|-----------|---------------|-----------------|-------------|----------------|
| **User Account Data** | L2 - Confidential | Active + 30 days after account closure | GDPR Art. 6(1)(b) - Contract | Hard delete |
| **Customer PII** | L2 - Confidential | Active + 7 years after last transaction | SOX, Tax law | Soft delete → hard delete after 7 years |
| **Order History** | L2 - Confidential | 7 years from order date | SOX, Tax law | Soft delete → hard delete after 7 years |
| **Payment Transaction Logs** | L3 - Restricted | 7 years from transaction date | SOX, PCI-DSS | Encrypted storage → hard delete after 7 years |
| **Payment Card Data (tokenized)** | L4 - Critical | Until card expires or customer removes | PCI-DSS Req 3.1 | Immediate hard delete on removal |
| **Audit Logs (compliance_audit_log)** | L3 - Restricted | 7 years from event date | SOX 802, SOC 2 | Immutable → archive to cold storage |
| **Application Logs (Sentry)** | L1 - Internal | 30 days hot + 1 year cold | Operational need | Auto-delete after retention period |
| **Database Backups** | L2-L4 (varies) | 30 days full + 7 days incremental | Business continuity | Encrypted auto-delete after retention |
| **Marketing Consent Records** | L2 - Confidential | Active + 3 years after consent withdrawn | GDPR Art. 7(1) | Hard delete after retention |
| **Support Tickets** | L2 - Confidential | 3 years from ticket closure | Customer service | Soft delete → hard delete after 3 years |
| **Analytics Data (anonymized)** | L1 - Internal | Indefinite (if truly anonymized) | GDPR Art. 11 | Not applicable (anonymized) |
| **Session Logs** | L2 - Confidential | 90 days | Security monitoring | Auto-delete after 90 days |
| **Employee Records** | L2 - Confidential | Active + 7 years after termination | Employment law | Hard delete after retention |
| **Contracts & Agreements** | L2 - Confidential | 7 years after termination | Contract law, SOX | Archive → hard delete after 7 years |
| **Tax Records** | L3 - Restricted | 7 years from filing date | IRS regulations | Archive → hard delete after 7 years |

---

## 4. Deletion Methods

### 4.1 Soft Delete (Logical Deletion)
**When to Use**: Data subject to legal hold or business need for recovery

**Implementation**:
```sql
-- Add deleted_at column to table
ALTER TABLE customers ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Soft delete
UPDATE customers 
SET deleted_at = NOW() 
WHERE customer_id = 'customer-uuid';

-- Exclude soft-deleted records in queries
SELECT * FROM customers WHERE deleted_at IS NULL;
```

**Characteristics**:
- Record remains in database but marked as deleted
- Can be recovered if needed (within retention period)
- RLS policies must respect deleted_at flag
- Scheduled job converts to hard delete after retention period

### 4.2 Hard Delete (Physical Deletion)
**When to Use**: Permanent removal after retention period or immediate GDPR erasure request

**Implementation**:
```sql
-- Hard delete (permanent)
DELETE FROM customers WHERE customer_id = 'customer-uuid';

-- Cascading delete (if foreign keys configured)
DELETE FROM users WHERE user_id = 'user-uuid'; 
-- Automatically deletes linked orders, sessions, etc.
```

**Characteristics**:
- Record permanently removed from database
- **NOT RECOVERABLE** (only from backups, which are also deleted per schedule)
- Triggers cascade deletes on related records
- Audit log entry created before deletion

### 4.3 Anonymization (Pseudonymization)
**When to Use**: Preserve data for analytics while removing PII

**Implementation**:
```sql
-- Anonymize customer data
UPDATE customers 
SET 
  first_name = 'REDACTED',
  last_name = 'REDACTED',
  email = CONCAT('deleted-', customer_id, '@example.com'),
  phone = NULL,
  address_line1 = 'REDACTED',
  address_line2 = NULL,
  city = 'REDACTED',
  state = state, -- Keep for analytics
  zip_code = LEFT(zip_code, 3) || '00', -- Keep first 3 digits only
  date_of_birth = NULL,
  anonymized_at = NOW()
WHERE customer_id = 'customer-uuid';
```

**Characteristics**:
- Removes all PII while preserving aggregate data
- Useful for business analytics and reporting
- GDPR compliant if truly anonymous (cannot re-identify)
- Audit log records anonymization event

### 4.4 Encryption Key Destruction (Crypto-Shredding)
**When to Use**: Large datasets encrypted with unique keys

**Implementation**:
```sql
-- Store encrypted data with per-record encryption key
-- Deletion = destroy the encryption key
DELETE FROM encryption_keys WHERE record_id = 'record-uuid';
-- Data becomes permanently unrecoverable without key
```

**Characteristics**:
- Fast deletion of large datasets
- Data remains in storage but is cryptographically unrecoverable
- Useful for backups (destroy keys, leave encrypted data)
- GDPR compliant (data is effectively deleted)

---

## 5. Automated Deletion Jobs

### 5.1 Daily Cleanup Job
**Schedule**: Every day at 2:00 AM UTC

**Tasks**:
```sql
-- 1. Hard delete soft-deleted records past retention period
DELETE FROM customers 
WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '7 years';

-- 2. Delete expired sessions
DELETE FROM auth.sessions 
WHERE expires_at < NOW();

-- 3. Delete old application logs
DELETE FROM application_logs 
WHERE created_at < NOW() - INTERVAL '30 days';

-- 4. Anonymize old support tickets
UPDATE support_tickets 
SET 
  customer_email = 'REDACTED',
  customer_phone = NULL,
  anonymized_at = NOW()
WHERE 
  status = 'CLOSED' 
  AND closed_at < NOW() - INTERVAL '3 years'
  AND anonymized_at IS NULL;
```

**Monitoring**: Job completion logged to compliance_audit_log

### 5.2 Weekly Backup Cleanup
**Schedule**: Every Sunday at 3:00 AM UTC

**Tasks**:
- Delete backups older than 30 days (full backups)
- Delete incremental backups older than 7 days
- Verify backup deletion in Supabase Dashboard

### 5.3 Monthly Audit Log Archival
**Schedule**: First day of each month at 1:00 AM UTC

**Tasks**:
```sql
-- Archive audit logs older than 90 days to cold storage
-- (Supabase automatic archival to S3)
-- Audit logs are NEVER deleted (7-year retention in cold storage)
```

---

## 6. GDPR Right to Erasure ("Right to be Forgotten")

### 6.1 Erasure Request Process

**Step 1: Customer Submits Request**
- Via email: privacy@glenkeos.com
- Via account settings: "Delete My Account" button
- Via support ticket

**Step 2: Identity Verification** (within 24 hours)
- Verify requestor is the data subject
- Methods: Email confirmation, account login, government ID (if disputed)

**Step 3: Legal Assessment** (within 72 hours)
- Check for legal holds (active orders, disputes, investigations)
- Check for contractual obligations (pending payments)
- Check for legitimate interests (fraud prevention)

**Step 4: Erasure Execution** (within 30 days of request)
```sql
-- Begin transaction
BEGIN;

-- 1. Soft delete customer account
UPDATE customers 
SET deleted_at = NOW(), deletion_reason = 'GDPR_ERASURE_REQUEST' 
WHERE customer_id = 'customer-uuid';

-- 2. Anonymize order history (preserve financial records for SOX)
UPDATE orders 
SET 
  delivery_address = 'REDACTED',
  delivery_notes = NULL,
  customer_notes = NULL
WHERE customer_id = 'customer-uuid';

-- 3. Delete authentication data
DELETE FROM auth.users WHERE id = 'user-uuid';

-- 4. Delete sessions
DELETE FROM auth.sessions WHERE user_id = 'user-uuid';

-- 5. Delete notifications
DELETE FROM notifications WHERE user_id = 'user-uuid';

-- 6. Log erasure in audit log
INSERT INTO compliance_audit_log (
  event_type, user_id, tenant_id, ip_address, 
  event_data, created_at
) VALUES (
  'GDPR_ERASURE_COMPLETED',
  'user-uuid',
  'tenant-id',
  '0.0.0.0',
  '{"customer_id": "customer-uuid", "request_date": "2026-04-24", "completion_date": "2026-05-24"}'::jsonb,
  NOW()
);

COMMIT;
```

**Step 5: Confirmation** (within 48 hours of completion)
- Send confirmation email to requestor
- Document erasure in compliance tracker

### 6.2 Exceptions to Erasure

**CANNOT erase data if**:
1. **Legal obligation**: SOX requires 7-year retention of financial records
2. **Active contract**: Order in progress, unpaid invoices
3. **Legal claims**: Ongoing litigation, disputes
4. **Public interest**: Fraud investigation, regulatory inquiry
5. **Archiving purposes**: Anonymized data for historical research

**Response**: Inform customer of exception with legal basis cited

---

## 7. Data Deletion Verification

### 7.1 Verification Checklist

After deletion, verify data is removed from:
- [ ] Production database (PostgreSQL)
- [ ] Database backups (Supabase auto-backups)
- [ ] Application logs (Sentry, Vercel)
- [ ] Analytics systems (if applicable)
- [ ] Third-party processors (Stripe, PayPal, Twilio, SendGrid)
- [ ] CDN cache (Vercel edge cache)
- [ ] Developer workstations (if applicable)

### 7.2 Third-Party Processor Deletion

**Stripe**: 
- Data retained for 7 years for PCI compliance
- Request deletion via Stripe Dashboard → Settings → Data Retention

**PayPal**:
- Data retained for 7 years for financial regulations
- Request deletion via PayPal support ticket

**Twilio**:
- SMS logs retained for 90 days
- Automatic deletion after 90 days

**SendGrid**:
- Email logs retained for 30 days
- Automatic deletion after 30 days

**Sentry**:
- Error logs retained per project settings (30 days default)
- Automatic deletion after retention period

---

## 8. Backup Retention & Deletion

### 8.1 Backup Schedule

| Backup Type | Frequency | Retention | Storage Location |
|-------------|-----------|-----------|-----------------|
| Full Backup | Daily | 30 days | Supabase (encrypted) |
| Incremental Backup | Every 6 hours | 7 days | Supabase (encrypted) |
| Point-in-Time Recovery | Continuous | 7 days | Supabase WAL logs |
| Disaster Recovery Snapshot | Weekly | 90 days | Supabase + S3 cold storage |

### 8.2 Backup Deletion

**Automatic Deletion**:
- Supabase automatically deletes backups older than retention period
- No manual intervention required

**Manual Deletion** (emergency only):
```bash
# Delete specific backup (requires service role key)
supabase db backup delete --backup-id=backup-uuid
```

**Crypto-Shredding for GDPR**:
- When customer requests erasure, backup encryption keys are destroyed
- Backups remain but customer data is cryptographically unrecoverable

---

## 9. Audit Trail & Compliance Reporting

### 9.1 Deletion Audit Log

Every deletion event is logged:
```sql
INSERT INTO compliance_audit_log (
  event_type,
  user_id,
  tenant_id,
  table_name,
  record_id,
  event_data,
  created_at
) VALUES (
  'DATA_DELETED',
  'admin-user-id',
  'tenant-id',
  'customers',
  'customer-uuid',
  '{"deletion_method": "hard_delete", "reason": "GDPR_ERASURE", "retention_period_expired": false}'::jsonb,
  NOW()
);
```

### 9.2 Monthly Deletion Report

**Report Includes**:
- Total records deleted (by table)
- Deletion method breakdown (soft vs. hard)
- GDPR erasure requests processed
- Data retention policy violations (if any)
- Backup storage usage trends

**Recipients**: Chief Privacy Officer, Chief Information Security Officer, Compliance Team

---

## 10. Roles & Responsibilities

| Role | Responsibilities |
|------|-----------------|
| **Chief Privacy Officer** | Policy owner, GDPR compliance, erasure request approval |
| **Data Protection Officer** | Monitor compliance, advise on data protection |
| **Database Administrator** | Execute deletion jobs, manage backups, verify deletions |
| **Engineering Team** | Implement deletion logic, automate cleanup jobs |
| **Legal Team** | Advise on legal holds, retention requirements |
| **Compliance Team** | Audit deletion processes, quarterly reviews |

---

## 11. Training & Awareness

**Required Training**:
- All employees: Annual GDPR awareness training
- Engineering: Data deletion procedures, soft vs. hard delete
- Support: How to handle erasure requests
- Management: Legal retention requirements, compliance obligations

**Training Records**: Maintained for 3 years in HR system

---

## 12. Policy Review & Updates

**Review Cycle**: Annual (or when regulations change)

**Next Review Date**: April 24, 2027

**Version History**:
| Version | Date | Changes | Approved By |
|---------|------|---------|-------------|
| 1.0.0 | 2026-04-24 | Initial policy | Chief Privacy Officer |

---

## 13. Contact Information

**Data Protection Inquiries**:
- Email: privacy@glenkeos.com
- Phone: +1 (555) 123-4567
- Address: GlenKeos LLC, 123 Main St, San Francisco, CA 94105

**Erasure Requests**:
- Email: privacy@glenkeos.com
- Subject Line: "GDPR Erasure Request - [Customer ID or Email]"

---

**This policy is enforceable and binding. Violations may result in legal penalties and disciplinary action.**
