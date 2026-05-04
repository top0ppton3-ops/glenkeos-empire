# GlenKeos Enterprise Compliance Baseline

**Version**: 1.0.0  
**Last Updated**: April 24, 2026  
**Status**: Implementation Phase  
**Audit Target**: SOC 2 Type II certification by Q3 2026

---

## Executive Summary

This document establishes the compliance baseline for GlenKeos enterprise platform to meet:
- **SOC 2 Type II** (Security, Availability, Processing Integrity, Confidentiality, Privacy)
- **GDPR** (General Data Protection Regulation - EU data privacy)
- **PCI-DSS** (Payment Card Industry Data Security Standard - via Stripe/PayPal)
- **CCPA** (California Consumer Privacy Act)

**Current State**: Pre-audit preparation phase  
**Target Date**: Q3 2026 for SOC 2 Type II audit  
**Estimated Cost**: $15,000-50,000 (first year), $10,000/year ongoing

---

## 1. SOC 2 Type II Compliance

### 1.1 Trust Services Criteria

#### Security (SEC)
**Requirement**: Information and systems are protected against unauthorized access

**Implementation**:
- ✅ **Authentication**: JWT-based auth via Supabase Auth
  - Multi-factor authentication (MFA) available (currently disabled, enable in Q2)
  - Session management with refresh tokens
  - Password policy: minimum 8 characters, complexity requirements
  
- ✅ **Authorization**: Row-level security (RLS) at database level
  - Tenant isolation enforced via RLS policies
  - Role-based access control (6 roles: SUPER_ADMIN, CORPORATE_ADMIN, STORE_MANAGER, STAFF, DRIVER, CUSTOMER)
  - No user can bypass RLS (enforced at PostgreSQL level)

- ✅ **Encryption**:
  - Data at rest: AES-256 (Supabase default)
  - Data in transit: TLS 1.3 (Vercel + Supabase enforce HTTPS)
  - Database connections: SSL/TLS enforced
  
- ✅ **Access Controls**:
  - Least privilege principle: users only see data for their tenant
  - Corporate override: SUPER_ADMIN can access all tenants (audit logged)
  - API rate limiting: 100 requests per 10 seconds per IP (Vercel default)

**Evidence Required for Audit**:
- [ ] Security policy document (written, approved by management)
- [ ] Access control matrix (role → permissions mapping)
- [ ] Penetration test report (annual requirement)
- [ ] Vulnerability scan results (quarterly requirement)
- [ ] Incident response plan (documented, tested)

#### Availability (AVA)
**Requirement**: System is available for operation and use as committed

**Implementation**:
- ✅ **SLA Commitment**: 99.99% uptime (4.3 minutes downtime per month)
- ✅ **Infrastructure**: Multi-region deployment via Vercel (300+ edge locations)
- ✅ **Database**: Supabase PostgreSQL with automatic failover
- ✅ **Monitoring**: UptimeRobot pinging every 5 minutes
- ❌ **Disaster Recovery**: RTO 1 hour, RPO 5 minutes (not yet tested)
- ❌ **Backup Verification**: Daily backups exist, but restore testing not yet scheduled

**Evidence Required for Audit**:
- [ ] Uptime reports (monthly, showing 99.99%+ availability)
- [ ] Disaster recovery plan (documented)
- [ ] Disaster recovery test results (quarterly requirement)
- [ ] Backup restoration test results (monthly requirement)
- [ ] Capacity planning documentation

#### Processing Integrity (PI)
**Requirement**: System processing is complete, valid, accurate, timely, and authorized

**Implementation**:
- ✅ **Data Validation**: TypeScript type safety + Zod schema validation
- ✅ **Transaction Integrity**: PostgreSQL ACID transactions
- ✅ **Foreign Keys**: Referential integrity enforced at database level
- ✅ **Audit Logging**: Immutable audit log for all order/payment changes
- ⚠️ **Error Handling**: Centralized error handler (partially implemented)

**Evidence Required for Audit**:
- [ ] Data validation rules documentation
- [ ] Test results showing validation works
- [ ] Transaction integrity tests
- [ ] Audit log sample showing all required fields captured

#### Confidentiality (CON)
**Requirement**: Confidential information is protected as committed

**Implementation**:
- ✅ **Data Classification**: Customer PII, payment data, business data
- ✅ **Tenant Isolation**: Hard isolation via tenant_id + RLS
- ✅ **Secrets Management**: Vercel environment variables (encrypted)
- ✅ **No Secrets in Code**: All API keys stored in environment variables
- ❌ **Data Masking**: PII not masked in logs (action required)

**Evidence Required for Audit**:
- [ ] Data classification policy
- [ ] Data handling procedures
- [ ] Evidence of secrets rotation (90-day policy)
- [ ] Access logs showing who accessed confidential data

#### Privacy (PRI)
**Requirement**: Personal information is collected, used, retained, disclosed, and disposed of per commitments

**Implementation**:
- ⚠️ **Privacy Policy**: Drafted, not yet published
- ⚠️ **Cookie Consent**: Not yet implemented (required for GDPR)
- ✅ **Data Retention**: 7-year retention for financial records
- ❌ **GDPR Rights**: Data export/deletion API not yet implemented
- ✅ **Data Processing Agreement**: Signed with Supabase

**Evidence Required for Audit**:
- [ ] Published privacy policy
- [ ] Cookie consent banner implementation
- [ ] Data retention schedule
- [ ] Data subject access request (DSAR) handling procedures
- [ ] Evidence of DSAR responses

---

## 2. GDPR Compliance

### 2.1 Legal Basis
**GlenKeos Role**: Data Controller (we collect and determine purpose of data)  
**Supabase Role**: Data Processor (processes data per our instructions)  
**Customer Role**: Data Subject (owns their personal data)

### 2.2 Data Subject Rights

#### Right to Access (Article 15)
**Requirement**: Users can request a copy of all their personal data

**Implementation Status**: ❌ NOT IMPLEMENTED
**Action Required**:
- Build customer data export API endpoint
- Generate PDF/CSV with all customer data (orders, addresses, preferences)
- Respond within 30 days of request

**API Endpoint to Build**:
```typescript
POST /api/gdpr/data-export
Request: { customer_email: "user@example.com" }
Response: { download_url: "https://...", expires_at: "..." }
```

#### Right to Rectification (Article 16)
**Requirement**: Users can request corrections to their data

**Implementation Status**: ✅ IMPLEMENTED (via account settings page)

#### Right to Erasure / "Right to be Forgotten" (Article 17)
**Requirement**: Users can request complete deletion of their data

**Implementation Status**: ❌ NOT IMPLEMENTED
**Action Required**:
- Build account deletion workflow
- Hard delete customer data (or anonymize where legal retention required)
- Delete within 30 days of request
- Cascade delete: customers → orders → order_items → notifications

**Exceptions**: Cannot delete if:
- Active legal obligation (e.g., 7-year financial retention for tax purposes)
- Active fraud investigation
- Outstanding payment obligation

**API Endpoint to Build**:
```typescript
POST /api/gdpr/delete-account
Request: { customer_id: "...", confirmation: true }
Response: { status: "scheduled", deletion_date: "..." }
```

#### Right to Data Portability (Article 20)
**Requirement**: Users can download their data in machine-readable format

**Implementation Status**: ❌ NOT IMPLEMENTED
**Action Required**:
- Export data in JSON or CSV format
- Include: orders, addresses, payment methods (masked), preferences
- Provide download link valid for 7 days

### 2.3 Consent Management

**Requirement**: Explicit opt-in consent for:
- Marketing emails
- Analytics tracking
- Cookie usage (non-essential cookies)

**Implementation Status**: ❌ NOT IMPLEMENTED
**Action Required**:
1. Add consent checkboxes to signup form
2. Cookie consent banner on first visit
3. Store consent records in database:
   ```sql
   CREATE TABLE consent_records (
     customer_id UUID,
     consent_type VARCHAR(50), -- 'marketing', 'analytics', 'cookies'
     consented BOOLEAN,
     consented_at TIMESTAMP,
     consent_source VARCHAR(50), -- 'signup', 'settings', 'email'
     ip_address INET,
     user_agent TEXT
   );
   ```

### 2.4 Data Breach Notification

**Requirement**: Notify supervisory authority within 72 hours of breach

**Incident Response Plan**:
1. **Detect breach** (via monitoring, customer report, or security scan)
2. **Assess impact** (how many users affected, what data exposed)
3. **Contain breach** (disable compromised credentials, isolate systems)
4. **Notify supervisory authority** within 72 hours
5. **Notify affected customers** without undue delay
6. **Document incident** in compliance audit log

**Supervisory Authority** (for US operations): State Attorney General + FTC  
**Supervisory Authority** (for EU operations): Irish Data Protection Commission

**Template Notification**:
```
Subject: Data Breach Notification - GlenKeos Platform

Date: [DATE]
Breach discovered: [DATE]
Nature of breach: [DESCRIPTION]
Data affected: [EMAIL, PASSWORD HASHES, ETC.]
Number of affected users: [COUNT]
Remediation steps: [ACTIONS TAKEN]
User actions required: [RESET PASSWORD, MONITOR ACCOUNTS, ETC.]
Contact: security@glenkeos.com
```

### 2.5 GDPR Fines (Compliance Motivation)

**Minor Violations**: Up to €10M or 2% of annual revenue (whichever is greater)  
**Major Violations**: Up to €20M or 4% of annual revenue (whichever is greater)

**For GlenKeos at $500M annual revenue**:
- Minor breach = $10M fine minimum
- Major breach = $20M fine minimum

**Compliance is not optional.**

---

## 3. PCI-DSS Compliance

### 3.1 Approach: Use Stripe/PayPal (SAQ A)

**Do We Need PCI-DSS?**
- If we store credit card data: **YES** (full PCI-DSS Level 1 compliance)
- If we use Stripe/PayPal: **NO** (they handle card data, we use SAQ A)

**GlenKeos Approach**: Use Stripe/PayPal exclusively

**SAQ A** (Self-Assessment Questionnaire A):
- We never see, store, or transmit raw card numbers
- Stripe Elements / PayPal Checkout collect card data directly
- We receive payment tokens only
- ~22 questions to answer (vs. 300+ for full PCI-DSS)

### 3.2 PCI-DSS Controls (SAQ A)

| # | Requirement | Implementation | Status |
|---|-------------|----------------|--------|
| 1 | Install and maintain firewall | Vercel + Supabase handle this | ✅ |
| 2 | Do not use vendor defaults | Custom passwords, no defaults | ✅ |
| 3 | Protect stored cardholder data | We don't store card data | ✅ |
| 4 | Encrypt transmission of data | TLS 1.3 enforced | ✅ |
| 5 | Protect against malware | Vercel scans for malware | ✅ |
| 6 | Develop secure systems | TypeScript, code review, security scans | ✅ |
| 7 | Restrict access by business need | RLS policies enforce this | ✅ |
| 8 | Assign unique ID to each user | Supabase Auth handles this | ✅ |
| 9 | Restrict physical access | Cloud-only (no on-prem servers) | ✅ |
| 10 | Track all access to data | Compliance audit log | ✅ |
| 11 | Regularly test security | Penetration testing (annual) | ⚠️ Pending |
| 12 | Maintain security policy | Document exists (this file) | ⚠️ Draft |

**Evidence Required**:
- [ ] SAQ A questionnaire completed and signed
- [ ] Attestation of Compliance (AOC) signed by executive
- [ ] Quarterly vulnerability scans (ASV scan)
- [ ] Annual penetration test report

---

## 4. CCPA Compliance (California Consumer Privacy Act)

### 4.1 User Rights (Similar to GDPR)

**Right to Know**: What personal information we collect  
**Right to Delete**: Request deletion of personal information  
**Right to Opt-Out**: Opt out of sale of personal information (we don't sell data)  
**Right to Non-Discrimination**: Cannot discriminate against users who exercise rights

**Implementation**: Reuse GDPR implementation (rights are nearly identical)

---

## 5. Compliance Implementation Checklist

### Phase 1: Critical (Complete by May 2026)
- [ ] Publish privacy policy on website
- [ ] Implement cookie consent banner
- [ ] Build GDPR data export API
- [ ] Build GDPR account deletion API
- [ ] Store consent records in database
- [ ] Enable MFA for all admin accounts
- [ ] Implement centralized error handler
- [ ] Mask PII in application logs
- [ ] Document security policy
- [ ] Document incident response plan

### Phase 2: Audit Prep (Complete by June 2026)
- [ ] Complete SOC 2 readiness assessment
- [ ] Contract with SOC 2 auditor
- [ ] Complete SAQ A for PCI-DSS
- [ ] Run penetration test (hire third party)
- [ ] Run quarterly vulnerability scan
- [ ] Test disaster recovery plan
- [ ] Test backup restoration process
- [ ] Document all policies and procedures
- [ ] Train employees on security awareness

### Phase 3: Audit (July-August 2026)
- [ ] SOC 2 Type II audit begins
- [ ] Provide evidence to auditor
- [ ] Remediate any audit findings
- [ ] Receive SOC 2 Type II report
- [ ] Publish SOC 2 report to customers

---

## 6. Compliance Monitoring & Metrics

### 6.1 Key Performance Indicators (KPIs)

| Metric | Target | Current | Frequency |
|--------|--------|---------|-----------|
| Uptime SLA | 99.99% | 100% | Monthly |
| Security incidents | 0 | 0 | Monthly |
| Failed login attempts | <5% | 2% | Weekly |
| Vulnerability scan findings | 0 critical | N/A | Quarterly |
| Audit log completeness | 100% | 100% | Daily |
| Backup success rate | 100% | 100% | Daily |
| GDPR requests responded | 100% within 30 days | N/A | Monthly |

### 6.2 Compliance Dashboard

**Build Status**: ❌ NOT YET BUILT

**Proposed Dashboard**:
- Uptime percentage (last 30 days)
- Security incidents (last 90 days)
- Audit log coverage (% of tables with audit triggers)
- Backup status (last successful backup time)
- GDPR requests (open, in-progress, completed)
- Compliance score (% of controls implemented)

---

## 7. Audit Preparation Timeline

### May 2026
- Week 1: Complete privacy policy, cookie banner
- Week 2: Implement GDPR data export/deletion
- Week 3: Enable MFA, mask PII in logs
- Week 4: Document all security policies

### June 2026
- Week 1: Contract SOC 2 auditor
- Week 2: Run penetration test
- Week 3: Complete SOC 2 readiness assessment
- Week 4: Remediate any pre-audit findings

### July-August 2026
- SOC 2 Type II audit (6-8 weeks)
- Provide evidence to auditor
- Weekly check-ins with audit team
- Final report delivered by end of August

### September 2026
- Publish SOC 2 report to enterprise customers
- Use SOC 2 certification in sales materials
- Annual audit scheduled for September 2027

---

## 8. Roles & Responsibilities

| Role | Responsibility | Person |
|------|---------------|--------|
| **CISO** (Chief Information Security Officer) | Overall compliance program | TBD (hire by May 2026) |
| **Compliance Officer** | SOC 2 audit coordination | TBD |
| **VP Engineering** | Technical implementation | Engineering Lead |
| **Legal Counsel** | Privacy policy, GDPR | External counsel |
| **DPO** (Data Protection Officer) | GDPR compliance (EU) | TBD (required if processing EU data) |

---

## 9. Vendor Management

### 9.1 Third-Party Processors

| Vendor | Service | Data Processed | SOC 2 Status | DPA Signed |
|--------|---------|----------------|--------------|------------|
| Supabase | Database, Auth | All customer data | ✅ SOC 2 Type II | ✅ Yes |
| Vercel | Hosting, CDN | Application code, logs | ✅ SOC 2 Type II | ✅ Yes |
| Stripe | Payments | Payment data (they own it) | ✅ PCI-DSS Level 1 | ✅ Yes |
| PayPal | Payments | Payment data (they own it) | ✅ PCI-DSS Level 1 | ✅ Yes |
| Twilio | SMS | Phone numbers | ✅ SOC 2 Type II | ❌ Pending |
| SendGrid | Email | Email addresses | ✅ SOC 2 Type II | ❌ Pending |
| Sentry | Error tracking | Application errors, PII | ❌ Not required | N/A |

**Action Required**: Sign DPAs with Twilio and SendGrid

---

## 10. Compliance Budget

### First Year (2026)
- SOC 2 audit: $15,000-50,000
- Penetration testing: $5,000-10,000
- Vulnerability scanning: $2,000/year
- Legal counsel (privacy policy, DPAs): $5,000
- **Total**: $27,000-67,000

### Ongoing (Annual)
- SOC 2 annual audit: $10,000-15,000
- Penetration testing: $5,000
- Vulnerability scanning: $2,000
- **Total**: $17,000-22,000/year

---

## 11. Compliance Training

### Required Training (All Employees)
- **Security Awareness**: Annual (1 hour)
  - Phishing awareness
  - Password security
  - Incident reporting
  
- **GDPR Training**: Annual (30 minutes)
  - Data subject rights
  - Breach notification
  - Handling customer requests

- **Compliance Basics**: Annual (30 minutes)
  - SOC 2 overview
  - Why compliance matters
  - Employee responsibilities

**Training Platform**: TBD (consider KnowBe4, SANS, or internal training)

---

## 12. Contact Information

**For compliance questions**: compliance@glenkeos.com  
**For security incidents**: security@glenkeos.com  
**For GDPR requests**: privacy@glenkeos.com  
**Emergency hotline**: +1-415-555-SECURE (24/7)

---

**Approval**:
- [ ] Reviewed by Legal: _______________ Date: ___________
- [ ] Approved by CTO: _______________ Date: ___________
- [ ] Approved by CEO: _______________ Date: ___________

**Next Review Date**: July 1, 2026 (quarterly review required)

---

**This document is the foundation for enterprise-grade compliance. Execution is non-negotiable.**
