# Vendor Management Procedures

**Version**: 1.0.0  
**Effective Date**: April 24, 2026  
**Owner**: Chief Information Security Officer  
**Review Cycle**: Annual

---

## 1. Purpose & Scope

This document establishes procedures for:
- **Vendor Selection**: Due diligence before engaging third-party vendors
- **Vendor Assessment**: Security, compliance, and financial risk evaluation
- **Contract Management**: DPAs, SLAs, and legal agreements
- **Ongoing Monitoring**: Quarterly reviews and annual re-assessments
- **Vendor Offboarding**: Secure data deletion when vendor relationship ends

**Scope**: All third-party vendors that process, store, or have access to GlenKeos data.

---

## 2. Vendor Risk Classification

### 2.1 Risk Tiers

| Tier | Definition | Examples | Assessment Frequency |
|------|-----------|----------|---------------------|
| **Critical** | Processes L3-L4 data, service outage = business outage | Supabase, Vercel, Stripe | Quarterly |
| **High** | Processes L2 data, significant business impact | PayPal, Twilio, SendGrid | Semi-annually |
| **Medium** | Processes L1 data, moderate business impact | Sentry, UptimeRobot | Annually |
| **Low** | No data access, minimal business impact | Design tools, analytics | As needed |

### 2.2 Data Classification Reference

| Classification | Examples | Risk Level |
|---------------|----------|-----------|
| **L4 - Critical** | Database credentials, API secrets | Catastrophic if exposed |
| **L3 - Restricted** | Payment tokens, audit logs | Severe if exposed |
| **L2 - Confidential** | Customer PII, order details | High if exposed |
| **L1 - Internal** | Application logs, metrics | Moderate if exposed |
| **L0 - Public** | Menu items, store locations | No risk |

---

## 3. Vendor Selection Process

### 3.1 Pre-Selection Checklist

Before engaging a new vendor, verify:
- [ ] Business justification documented (why this vendor? what problem does it solve?)
- [ ] Budget approved (cost within allocated budget?)
- [ ] Alternative solutions evaluated (at least 2 competitors considered)
- [ ] Security assessment completed (SOC 2? GDPR compliant? Encryption?)
- [ ] Legal review completed (contract terms acceptable? DPA signed?)
- [ ] Technical integration feasible (APIs documented? SDKs available?)
- [ ] Vendor viability confirmed (company financially stable? not shutting down?)

### 3.2 Vendor Security Questionnaire

**Send to all Critical and High-tier vendors**:

```markdown
# GlenKeos Vendor Security Questionnaire

**Vendor Name**: _________________
**Contact**: _________________
**Date**: _________________

## 1. Compliance & Certifications
- [ ] SOC 2 Type II report available? (Required for Critical vendors)
- [ ] ISO 27001 certified?
- [ ] GDPR compliant? (Required if processing EU data)
- [ ] PCI-DSS compliant? (Required if processing payment data)
- [ ] HIPAA compliant? (Not applicable to GlenKeos)

Attach: SOC 2 report, compliance certificates

## 2. Data Security
- [ ] Encryption at rest? (Algorithm: ________________)
- [ ] Encryption in transit? (TLS 1.2+ required)
- [ ] Data residency location? (Region: ________________)
- [ ] Multi-tenant or dedicated infrastructure?
- [ ] Data segregation controls? (How is our data isolated?)
- [ ] Backup frequency? (Daily minimum)
- [ ] Backup retention? (30 days minimum)

## 3. Access Controls
- [ ] Multi-Factor Authentication (MFA) available?
- [ ] Role-Based Access Control (RBAC)?
- [ ] Audit logging enabled? (Retention period: ________________)
- [ ] Access review frequency? (Quarterly minimum)

## 4. Incident Response
- [ ] Incident response plan documented?
- [ ] Breach notification process? (Timeframe: ________________)
- [ ] Incident contact: ________________

## 5. Business Continuity
- [ ] Uptime SLA? (________________%)
- [ ] Disaster recovery plan tested? (Last test date: ________________)
- [ ] RTO (Recovery Time Objective): ________________
- [ ] RPO (Recovery Point Objective): ________________

## 6. Subprocessors
- [ ] Do you use subprocessors? (Yes/No)
- [ ] If yes, list subprocessors: ________________
- [ ] Do subprocessors have equivalent security controls?

## 7. Data Privacy
- [ ] Data Processing Agreement (DPA) available?
- [ ] Standard Contractual Clauses (SCCs) for EU transfers?
- [ ] Data deletion procedure? (How long after termination? ________________)

## 8. Security Testing
- [ ] Penetration testing frequency? (Annually minimum)
- [ ] Vulnerability scanning frequency? (Monthly minimum)
- [ ] Bug bounty program?

## 9. Personnel Security
- [ ] Background checks for employees with data access?
- [ ] Security awareness training for all employees?
- [ ] Confidentiality agreements signed?

## 10. Vendor Viability
- [ ] Years in business: ________________
- [ ] Number of employees: ________________
- [ ] Number of customers: ________________
- [ ] Funding/revenue: ________________
- [ ] Recent security incidents? (If yes, explain: ________________)
```

### 3.3 Vendor Risk Score

After questionnaire review, calculate risk score:

| Category | Weight | Score (0-10) | Weighted Score |
|----------|--------|--------------|---------------|
| **Compliance & Certifications** | 25% | _____ | _____ |
| **Data Security** | 30% | _____ | _____ |
| **Access Controls** | 15% | _____ | _____ |
| **Incident Response** | 10% | _____ | _____ |
| **Business Continuity** | 10% | _____ | _____ |
| **Vendor Viability** | 10% | _____ | _____ |
| **TOTAL** | 100% | | **_____** |

**Decision Matrix**:
- **Score 8-10**: APPROVED (Low Risk)
- **Score 6-7.9**: APPROVED WITH CONDITIONS (Medium Risk)
- **Score 4-5.9**: REQUIRES REMEDIATION (High Risk)
- **Score 0-3.9**: REJECTED (Critical Risk)

---

## 4. Current Vendor Inventory

### 4.1 Critical Vendors

#### Supabase (Database, Auth, Realtime)
- **Risk Tier**: Critical
- **Data Classification**: L2-L4 (All data)
- **SOC 2**: ✅ Type II (expires 2027-01-15)
- **GDPR**: ✅ Compliant (DPA signed 2026-04-01)
- **DPA Status**: ✅ Signed
- **Contract Term**: Monthly subscription (cancel anytime)
- **Annual Cost**: $300/year (Pro plan)
- **Review Date**: 2026-07-01 (quarterly)
- **Contact**: support@supabase.com | https://supabase.com/support
- **Backup Plan**: Migrate to AWS RDS + custom auth (ETA: 2 weeks, cost: $200/mo)

**Critical Dependencies**:
- PostgreSQL database (core data storage)
- Row-Level Security policies (tenant isolation)
- Supabase Auth (user authentication)
- Realtime (WebSocket subscriptions)
- Edge Functions (serverless backend)

**Exit Strategy**:
- Export database via pg_dump
- Migrate auth to Auth0 or custom JWT solution
- Replace Realtime with custom WebSocket server
- Replace Edge Functions with Vercel Serverless Functions
- **Estimated migration time**: 2-3 weeks
- **Estimated migration cost**: $50,000 (engineering time)

---

#### Vercel (Frontend Hosting, CDN, Edge Functions)
- **Risk Tier**: Critical
- **Data Classification**: L0-L1 (Logs only)
- **SOC 2**: ✅ Type II (expires 2027-03-20)
- **GDPR**: ✅ Compliant (DPA signed 2026-04-01)
- **DPA Status**: ✅ Signed
- **Contract Term**: Monthly subscription
- **Annual Cost**: $240/year (Pro plan)
- **Review Date**: 2026-07-01 (quarterly)
- **Contact**: support@vercel.com | https://vercel.com/support
- **Backup Plan**: Migrate to Netlify or Cloudflare Pages (ETA: 1 week)

**Critical Dependencies**:
- Next.js hosting
- CDN (global edge caching)
- Automatic deployments from GitHub
- Preview environments

**Exit Strategy**:
- Export build configuration
- Migrate to Netlify (similar platform, 1-day migration)
- Migrate to Cloudflare Pages (requires build config changes, 3-day migration)
- Self-host on AWS Amplify (2-week migration, $100/mo)

---

#### Stripe (Payment Processing)
- **Risk Tier**: Critical
- **Data Classification**: L4 (Payment data)
- **SOC 2**: ✅ PCI Level 1 (highest certification)
- **GDPR**: ✅ Compliant (DPA signed 2026-04-01)
- **DPA Status**: ✅ Signed
- **Contract Term**: No contract (pay-per-transaction)
- **Annual Cost**: $12,000/year (2.9% + $0.30 per transaction, estimated)
- **Review Date**: 2026-07-01 (quarterly)
- **Contact**: +1-888-926-2289 | https://support.stripe.com
- **Backup Plan**: PayPal only (already integrated)

**Critical Dependencies**:
- Credit/debit card processing
- Payment method tokenization (PCI compliance)
- Webhook notifications (payment status updates)

**Exit Strategy**:
- Already dual-provider (Stripe + PayPal)
- Can disable Stripe and use PayPal 100% immediately
- Alternative: Square, Braintree, Adyen (1-week integration)

---

#### PayPal (Payment Processing - Alternative)
- **Risk Tier**: Critical
- **Data Classification**: L4 (Payment data)
- **SOC 2**: ✅ PCI Level 1
- **GDPR**: ✅ Compliant (DPA signed 2026-04-01)
- **DPA Status**: ✅ Signed
- **Contract Term**: No contract
- **Annual Cost**: $10,000/year (2.59% + $0.49 per transaction, estimated)
- **Review Date**: 2026-07-01 (quarterly)
- **Contact**: +1-888-221-1161 | https://www.paypal.com/us/smarthelp/contact-us
- **Backup Plan**: Stripe only (already integrated)

**Exit Strategy**: Same as Stripe (dual-provider model)

---

### 4.2 High-Tier Vendors

#### Twilio (SMS Notifications)
- **Risk Tier**: High
- **Data Classification**: L2 (Phone numbers)
- **SOC 2**: ✅ Type II
- **GDPR**: ✅ Compliant
- **DPA Status**: ⏳ Pending signature (sent 2026-04-20)
- **Contract Term**: Pay-as-you-go
- **Annual Cost**: $3,600/year ($0.0075 per SMS × 40,000 SMS/month)
- **Review Date**: 2026-10-01 (semi-annual)
- **Contact**: support@twilio.com
- **Backup Plan**: AWS SNS, Vonage, Plivo

**Exit Strategy**:
- Export phone number inventory
- Migrate to AWS SNS (3-day integration, $0.0065 per SMS)
- Migrate to Vonage (1-week integration, $0.0076 per SMS)

---

#### SendGrid (Transactional Email)
- **Risk Tier**: High
- **Data Classification**: L2 (Email addresses)
- **SOC 2**: ✅ Type II
- **GDPR**: ✅ Compliant
- **DPA Status**: ⏳ Pending signature (sent 2026-04-20)
- **Contract Term**: Monthly subscription
- **Annual Cost**: $180/year (Essentials plan, 50K emails/month)
- **Review Date**: 2026-10-01 (semi-annual)
- **Contact**: support@sendgrid.com
- **Backup Plan**: Resend, AWS SES, Postmark

**Exit Strategy**:
- Export email templates
- Migrate to Resend (1-day integration, same cost)
- Migrate to AWS SES ($0.10 per 1,000 emails = $60/year)

---

### 4.3 Medium-Tier Vendors

#### Sentry (Error Tracking)
- **Risk Tier**: Medium
- **Data Classification**: L1 (Application logs, stack traces)
- **SOC 2**: ⏳ Not required (no PII in error logs)
- **GDPR**: ✅ Compliant (PII scrubbing enabled)
- **DPA Status**: N/A
- **Contract Term**: Monthly subscription
- **Annual Cost**: $312/year (Team plan, 100K events/month)
- **Review Date**: 2027-04-01 (annual)
- **Contact**: support@sentry.io
- **Backup Plan**: Rollbar, Datadog, self-hosted Sentry

**Exit Strategy**:
- Export error data (CSV)
- Migrate to Rollbar (same-day integration, $99/mo)
- Self-host Sentry (open source, $50/mo infrastructure)

---

#### UptimeRobot (Uptime Monitoring)
- **Risk Tier**: Medium
- **Data Classification**: L1 (Public URL monitoring)
- **SOC 2**: ⏳ Not required
- **GDPR**: N/A (no personal data)
- **DPA Status**: N/A
- **Contract Term**: Free tier (50 monitors)
- **Annual Cost**: $0/year
- **Review Date**: 2027-04-01 (annual)
- **Contact**: support@uptimerobot.com
- **Backup Plan**: Pingdom, StatusCake, Datadog

**Exit Strategy**:
- Export monitor configurations
- Migrate to Pingdom (1-day setup, $10/mo)
- Migrate to Datadog Synthetics ($15/mo)

---

## 5. Data Processing Agreements (DPAs)

### 5.1 DPA Requirements

**All vendors processing L2-L4 data MUST sign a DPA** covering:

1. **Data Processing Terms**:
   - Vendor processes data only per GlenKeos instructions
   - Vendor does not sell, share, or use data for own purposes
   - Vendor implements appropriate security measures

2. **Subprocessors**:
   - Vendor must disclose all subprocessors
   - Vendor must obtain GlenKeos approval before adding new subprocessors
   - Subprocessors must have equivalent security controls

3. **Data Subject Rights**:
   - Vendor assists with GDPR requests (access, deletion, portability)
   - Response time: 72 hours maximum

4. **Breach Notification**:
   - Vendor notifies GlenKeos within 24 hours of breach discovery
   - Vendor provides incident details (what, when, how, who affected)

5. **Data Deletion**:
   - Vendor deletes all GlenKeos data within 30 days of termination
   - Vendor provides written confirmation of deletion

6. **Audit Rights**:
   - GlenKeos can audit vendor security controls annually
   - Vendor provides SOC 2 report as alternative to on-site audit

7. **Liability**:
   - Vendor is liable for data breaches caused by vendor negligence
   - Indemnification for GDPR fines resulting from vendor breach

### 5.2 DPA Template

**[See APPENDIX A: Standard Data Processing Agreement Template]**

### 5.3 DPA Tracking

| Vendor | DPA Required? | DPA Signed? | Signature Date | Expiration | Next Review |
|--------|--------------|-------------|---------------|-----------|-------------|
| Supabase | ✅ Yes | ✅ Signed | 2026-04-01 | 2027-04-01 | 2026-10-01 |
| Vercel | ✅ Yes | ✅ Signed | 2026-04-01 | 2027-04-01 | 2026-10-01 |
| Stripe | ✅ Yes | ✅ Signed | 2026-04-01 | No expiration | 2026-10-01 |
| PayPal | ✅ Yes | ✅ Signed | 2026-04-01 | No expiration | 2026-10-01 |
| Twilio | ✅ Yes | ⏳ Pending | N/A | N/A | 2026-05-15 |
| SendGrid | ✅ Yes | ⏳ Pending | N/A | N/A | 2026-05-15 |
| Sentry | ❌ No | N/A | N/A | N/A | N/A |
| UptimeRobot | ❌ No | N/A | N/A | N/A | N/A |

---

## 6. Ongoing Vendor Monitoring

### 6.1 Quarterly Review (Critical Vendors)

**Checklist** (complete every 3 months):
- [ ] SOC 2 report still valid? (check expiration date)
- [ ] No security incidents reported? (check vendor status page)
- [ ] SLA performance acceptable? (check uptime reports)
- [ ] Cost within budget? (check monthly invoices)
- [ ] Any new subprocessors added? (review vendor notifications)
- [ ] DPA still valid? (check expiration date)
- [ ] Contact information current? (verify support email/phone)

**Deliverable**: Vendor Review Report (1-page summary)

### 6.2 Annual Re-Assessment (All Vendors)

**Procedure**:
1. Re-send vendor security questionnaire
2. Re-calculate risk score
3. Review contract terms (renew, renegotiate, or terminate)
4. Update DPA if needed
5. Document findings in vendor file

**Deliverable**: Annual Vendor Assessment Report (submitted to CISO)

---

## 7. Vendor Offboarding

### 7.1 Offboarding Checklist

When terminating vendor relationship:
- [ ] Export all GlenKeos data from vendor systems
- [ ] Verify data export completeness (row counts, file sizes)
- [ ] Request data deletion confirmation from vendor (in writing)
- [ ] Revoke vendor API keys/credentials
- [ ] Remove vendor access to GlenKeos systems
- [ ] Cancel subscription/contract
- [ ] Update documentation (remove vendor from ARCHITECTURE.md, etc.)
- [ ] Notify affected teams (engineering, operations, finance)
- [ ] Update disaster recovery playbook (remove vendor from escalation list)
- [ ] Archive vendor files (DPA, SOC 2 reports, invoices) for 7 years

**Timeline**: Complete within 30 days of termination decision

### 7.2 Data Deletion Verification

**Step 1: Request Deletion**
```
Subject: Data Deletion Request - Contract Termination

Dear [Vendor],

GlenKeos LLC is terminating our contract effective [date].

Per our Data Processing Agreement Section 8, we request deletion of all GlenKeos data within 30 days.

Please confirm completion of deletion via email with the following details:
- Date of deletion: ________________
- Data deleted: ________________
- Deletion method: [Hard delete | Crypto-shredding | Other]
- Name of person who performed deletion: ________________
- Certification of deletion: [Attached]

Thank you,
[Your Name]
Chief Information Security Officer
GlenKeos LLC
```

**Step 2: Verify Deletion**
```bash
# Attempt to access data (should fail)
curl -X GET https://vendor-api.com/data/glenkeos \
  -H "Authorization: Bearer REVOKED_KEY"
# Expected: HTTP 401 Unauthorized

# Confirm with vendor support
# "Can you confirm GlenKeos data has been deleted from all systems including backups?"
```

**Step 3: Document Deletion**
- File deletion confirmation email
- Note deletion date in vendor offboarding log
- Update compliance audit log

---

## 8. Vendor Incident Management

### 8.1 Vendor-Caused Incidents

**Scenario**: Vendor breach, outage, or service degradation

**Procedure**:
1. **Assess Impact** (within 15 minutes):
   - Is GlenKeos data affected?
   - Are GlenKeos customers impacted?
   - What is the severity? (P0/P1/P2)

2. **Activate Incident Response** (if P0 or P1):
   - Follow INCIDENT_RESPONSE_PLAYBOOK.md
   - Contact vendor support immediately
   - Escalate per vendor escalation path

3. **Customer Communication** (within 30 minutes):
   - Notify affected customers
   - Provide status updates every 30 minutes

4. **Remediation**:
   - Work with vendor to restore service
   - If vendor unable to resolve: Activate backup plan (switch to alternative vendor)

5. **Postmortem** (within 5 business days):
   - Document incident timeline
   - Assess vendor performance
   - Re-evaluate vendor risk score
   - Consider vendor replacement if SLA breach

### 8.2 Vendor SLA Breach

**SLA Breach Criteria**:
- Uptime < 99.9% in any month
- Support response time exceeds SLA (e.g., > 1 hour for Critical vendors)
- Data breach due to vendor negligence

**Remediation**:
1. Request SLA credit (per contract terms)
2. Demand root cause analysis from vendor
3. Demand remediation plan with timeline
4. Re-assess vendor risk score
5. If repeated breaches: Initiate vendor replacement process

---

## 9. Compliance & Audit

### 9.1 Annual Compliance Report

**Due Date**: June 1 each year (for SOC 2 audit)

**Report Includes**:
- List of all Critical and High-tier vendors
- DPA status for each vendor
- SOC 2 status for each vendor
- Vendor risk scores
- Incidents caused by vendors (past 12 months)
- Vendor changes (added, removed, replaced)

**Recipients**: Chief Information Security Officer, Compliance Officer, External Auditor

### 9.2 Vendor Documentation (Audit Evidence)

**Maintain for 7 years**:
- Vendor contracts
- Data Processing Agreements (DPAs)
- SOC 2 Type II reports
- Vendor security questionnaires
- Vendor review reports (quarterly/annual)
- Incident reports (vendor-caused)
- DPA deletion confirmations (offboarding)

**Storage Location**: `/docs/compliance/vendor-files/` (encrypted, access-controlled)

---

## APPENDIX A: Standard Data Processing Agreement Template

```markdown
# DATA PROCESSING AGREEMENT

This Data Processing Agreement ("DPA") is entered into as of ________________ ("Effective Date") by and between:

**Data Controller**: GlenKeos LLC, 123 Main St, San Francisco, CA 94105 ("Customer")  
**Data Processor**: ________________ ("Vendor")

## 1. DEFINITIONS

**Personal Data**: Any information relating to an identified or identifiable natural person as defined by GDPR Article 4(1).

**Processing**: Any operation performed on Personal Data, including collection, storage, use, disclosure, or deletion.

**Subprocessor**: Any third party engaged by Vendor to process Personal Data on behalf of Customer.

## 2. SCOPE OF PROCESSING

**Data Categories**:
- [ ] Customer names and contact information
- [ ] Order history and transaction data
- [ ] Payment information (tokenized)
- [ ] Location data (delivery addresses)
- [ ] Device and usage data
- [ ] Other: ________________

**Processing Activities**:
- [ ] Storage
- [ ] Retrieval
- [ ] Analysis
- [ ] Transmission
- [ ] Other: ________________

**Data Subjects**: GlenKeos customers, store managers, drivers, staff

**Processing Duration**: Until termination of contract + 30 days

## 3. VENDOR OBLIGATIONS

Vendor shall:

a) Process Personal Data only on documented instructions from Customer  
b) Ensure persons authorized to process Personal Data are bound by confidentiality  
c) Implement appropriate technical and organizational security measures:
   - Encryption at rest (AES-256 minimum)
   - Encryption in transit (TLS 1.2+ minimum)
   - Access controls (MFA, RBAC)
   - Audit logging (12-month retention minimum)  
d) Engage Subprocessors only with Customer's prior written consent  
e) Assist Customer in responding to data subject requests (within 72 hours)  
f) Notify Customer of Personal Data breach within 24 hours of discovery  
g) Delete or return all Personal Data within 30 days of termination  
h) Make available all information necessary to demonstrate compliance  
i) Submit to audits by Customer or authorized third party (annually)

## 4. SUBPROCESSORS

**Current Subprocessors**:
- ________________
- ________________

Vendor shall:
- Provide 30 days' notice before adding new Subprocessors
- Ensure Subprocessors are bound by equivalent data protection obligations
- Remain fully liable for Subprocessor acts or omissions

Customer may object to new Subprocessor within 14 days of notice.

## 5. DATA SUBJECT RIGHTS

Vendor shall assist Customer (within 72 hours) in responding to requests for:
- Access to Personal Data (GDPR Art. 15)
- Rectification of Personal Data (GDPR Art. 16)
- Erasure of Personal Data (GDPR Art. 17)
- Restriction of processing (GDPR Art. 18)
- Data portability (GDPR Art. 20)
- Objection to processing (GDPR Art. 21)

## 6. DATA BREACH NOTIFICATION

In the event of a Personal Data breach, Vendor shall:
- Notify Customer within 24 hours (email: security@glenkeos.com)
- Provide details: nature of breach, categories and approximate number of data subjects affected, likely consequences, measures taken or proposed
- Cooperate with Customer in breach investigation and remediation

## 7. DATA DELETION

Upon termination, Vendor shall (within 30 days):
- Delete all Personal Data from production systems
- Delete all Personal Data from backups (or destroy encryption keys)
- Provide written certification of deletion

Exceptions: Vendor may retain Personal Data to the extent required by law (with notice to Customer).

## 8. LIABILITY & INDEMNIFICATION

Vendor shall indemnify Customer for:
- GDPR fines resulting from Vendor's breach of this DPA
- Third-party claims arising from Vendor's unauthorized processing
- Costs of breach notification and remediation

Liability cap: [INSERT AMOUNT] or actual damages, whichever is higher

## 9. AUDIT RIGHTS

Customer may audit Vendor's compliance with this DPA:
- Frequency: Annually (or immediately upon reasonable suspicion of breach)
- Notice: 30 days (waived in case of suspected breach)
- Scope: All systems processing Customer Personal Data
- Alternative: Vendor may provide SOC 2 Type II report in lieu of on-site audit

## 10. INTERNATIONAL TRANSFERS

If Personal Data is transferred outside the EU/EEA, Vendor shall:
- Implement Standard Contractual Clauses (SCCs) approved by EU Commission
- Ensure adequate level of protection (GDPR Article 45/46)
- Notify Customer of transfer location

## 11. TERM & TERMINATION

This DPA shall remain in effect until:
- Termination of the underlying service agreement, OR
- Customer provides written notice of termination

Upon termination, Article 7 (Data Deletion) applies.

## 12. GOVERNING LAW

This DPA shall be governed by the laws of [California, USA / EU GDPR].

---

**CUSTOMER**:  
GlenKeos LLC

By: ________________  
Name: ________________  
Title: Chief Information Security Officer  
Date: ________________

**VENDOR**:  
________________

By: ________________  
Name: ________________  
Title: ________________  
Date: ________________
```

---

**Review this document annually or when vendor landscape changes significantly.**
