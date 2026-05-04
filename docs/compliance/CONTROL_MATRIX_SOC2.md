# SOC 2 Type II Control Matrix

**Version**: 1.0.0  
**Audit Period**: Q3 2026 (July 1 - September 30, 2026)  
**Organization**: GlenKeos LLC

---

## Control Objectives & Implementation

### CC1 - Control Environment

| Control ID | Control Description | Implementation | Evidence | Status |
|-----------|-------------------|----------------|----------|--------|
| CC1.1 | COSO Principles are applied | Board oversight, code of conduct, ethics policy | Board meeting minutes, signed ethics agreements | ✅ |
| CC1.2 | Board independence | 3 independent board members out of 5 | Board composition documentation | ⏳ Pending |
| CC1.3 | Organizational structure | Defined reporting lines, job descriptions | Org chart, role definitions in STATUS.md | ✅ |
| CC1.4 | Commitment to competence | Hiring standards, training programs | Job postings, training records | ⏳ Q2 2026 |
| CC1.5 | Accountability | Performance reviews, KPIs | Review templates, KPI dashboard | ⏳ Q2 2026 |

### CC2 - Communication & Information

| Control ID | Control Description | Implementation | Evidence | Status |
|-----------|-------------------|----------------|----------|--------|
| CC2.1 | Quality of information | Data validation, TypeScript strict mode | Code reviews, type definitions | ✅ |
| CC2.2 | Internal communication | Slack, email, status meetings | Slack logs, meeting notes | ✅ |
| CC2.3 | External communication | Privacy policy, terms of service, SLAs | Published legal pages, STATUS.md | ⏳ Q2 2026 |

### CC3 - Risk Assessment

| Control ID | Control Description | Implementation | Evidence | Status |
|-----------|-------------------|----------------|----------|--------|
| CC3.1 | Objectives specification | Business objectives documented | ARCHITECTURE.md, business plan | ✅ |
| CC3.2 | Risk identification | Threat modeling, security reviews | SECURITY.md threat model section | ⏳ Q2 2026 |
| CC3.3 | Risk analysis | Risk register with likelihood/impact | Risk register (to be created) | ❌ Not started |
| CC3.4 | Fraud risk | Fraud detection in payment flow | PayPal fraud tools, audit logging | ⏳ Q2 2026 |

### CC4 - Monitoring Activities

| Control ID | Control Description | Implementation | Evidence | Status |
|-----------|-------------------|----------------|----------|--------|
| CC4.1 | Ongoing monitoring | Sentry, UptimeRobot, Supabase Dashboard | MONITORING_OBSERVABILITY_PLAN.md | ✅ |
| CC4.2 | Separate evaluations | Quarterly reviews, annual penetration test | Review meeting notes, pentest report | ⏳ Q2-Q3 2026 |
| CC4.3 | Remediation of deficiencies | Incident response, postmortems | Incident reports, remediation plans | ⏳ As needed |

### CC5 - Control Activities

| Control ID | Control Description | Implementation | Evidence | Status |
|-----------|-------------------|----------------|----------|--------|
| CC5.1 | Selection and development | Code review, testing, security scanning | CI/CD pipeline logs, test results | ✅ |
| CC5.2 | Technology controls | RLS, encryption, firewalls | SECURITY.md, database RLS policies | ✅ |
| CC5.3 | Deployment | CI/CD with approval gates | .github/workflows/ci-cd-pipeline.yml | ✅ |

### CC6 - Logical & Physical Access Controls

| Control ID | Control Description | Implementation | Evidence | Status |
|-----------|-------------------|----------------|----------|--------|
| CC6.1 | Logical access | JWT auth, RLS, MFA (pending) | Supabase Auth config, RLS policies | ⏳ MFA Q2 2026 |
| CC6.2 | Authentication | Email/password, social auth | Supabase Auth dashboard | ✅ |
| CC6.3 | Authorization | Role-based access, tenant isolation | ARCHITECTURE_ANSWERS.md, RLS policies | ✅ |
| CC6.4 | Physical access | Cloud-only (no physical servers) | N/A (Vercel + Supabase SaaS) | ✅ |
| CC6.5 | Access removal | Offboarding procedure | Offboarding checklist (to be created) | ❌ Not started |
| CC6.6 | Privileged access | SUPER_ADMIN role, audit logged | compliance_audit_log table | ✅ |
| CC6.7 | Credential management | Secrets in environment variables | Vercel + Supabase secrets | ✅ |
| CC6.8 | Access review | Quarterly user access reviews | Access review reports (future) | ❌ Not started |

### CC7 - System Operations

| Control ID | Control Description | Implementation | Evidence | Status |
|-----------|-------------------|----------------|----------|--------|
| CC7.1 | Change management | Pull requests, code review, approvals | GitHub PR logs, CODEOWNERS | ✅ |
| CC7.2 | Capacity management | Monitoring, auto-scaling | Supabase Dashboard, Vercel auto-scale | ✅ |
| CC7.3 | System monitoring | Uptime, errors, performance | MONITORING_OBSERVABILITY_PLAN.md | ✅ |
| CC7.4 | Incident response | Runbooks, on-call rotation | Incident response plan in SECURITY.md | ⏳ Q2 2026 |
| CC7.5 | Backup and recovery | Daily backups, tested restores | Backup logs, restore test results | ⏳ Q2 2026 |

### CC8 - Change Management

| Control ID | Control Description | Implementation | Evidence | Status |
|-----------|-------------------|----------------|----------|--------|
| CC8.1 | Change authorization | Branch protection, required approvals | GitHub branch protection rules | ✅ |
| CC8.2 | Testing before deployment | CI/CD pipeline with tests | Test results in GitHub Actions | ✅ |
| CC8.3 | Rollback capability | Vercel instant rollback, git revert | DEPLOYMENT.md rollback section | ✅ |

### CC9 - Risk Mitigation

| Control ID | Control Description | Implementation | Evidence | Status |
|-----------|-------------------|----------------|----------|--------|
| CC9.1 | Business continuity | Disaster recovery plan | MONITORING_OBSERVABILITY_PLAN.md | ⏳ Q2 2026 |
| CC9.2 | Vendor management | Vendor due diligence, DPAs | Vendor assessment matrix (below) | ⏳ Q2 2026 |
| CC9.3 | Insurance | Cyber insurance policy | Insurance policy documents | ❌ Not started |

---

## Availability Criteria (A1)

| Control ID | Control Description | Implementation | Evidence | Status |
|-----------|-------------------|----------------|----------|--------|
| A1.1 | Availability commitments | 99.99% SLA documented | STATUS.md, SLA in contracts | ✅ |
| A1.2 | Monitoring | UptimeRobot every 5 minutes | Uptime reports | ✅ |
| A1.3 | Incident response | P0 response in 5 minutes | Incident response plan | ⏳ Q2 2026 |
| A1.4 | Disaster recovery | RTO 1 hour, RPO 5 minutes | DR testing results | ⏳ Q2 2026 |

---

## Processing Integrity Criteria (PI1)

| Control ID | Control Description | Implementation | Evidence | Status |
|-----------|-------------------|----------------|----------|--------|
| PI1.1 | Input validation | Zod schemas, TypeScript types | Code examples in ARCHITECTURE.md | ✅ |
| PI1.2 | Data integrity | PostgreSQL ACID, foreign keys | Database schema constraints | ✅ |
| PI1.3 | Output completeness | Transaction logging | compliance_audit_log table | ✅ |
| PI1.4 | Error handling | Centralized error handler | Error handling middleware (to implement) | ❌ Not started |

---

## Confidentiality Criteria (C1)

| Control ID | Control Description | Implementation | Evidence | Status |
|-----------|-------------------|----------------|----------|--------|
| C1.1 | Confidential information | PII, payment data, business data | Data classification matrix (below) | ✅ |
| C1.2 | Encryption at rest | AES-256 | Supabase configuration | ✅ |
| C1.3 | Encryption in transit | TLS 1.3 | Vercel + Supabase enforce HTTPS | ✅ |
| C1.4 | Tenant isolation | RLS policies | COMPLETE_DATABASE_SCHEMA.sql | ✅ |
| C1.5 | Data masking | PII masked in logs | Log masking implementation (to do) | ❌ Not started |

---

## Privacy Criteria (P1)

| Control ID | Control Description | Implementation | Evidence | Status |
|-----------|-------------------|----------------|----------|--------|
| P1.1 | Notice | Privacy policy published | Privacy policy (to publish Q2 2026) | ❌ Not started |
| P1.2 | Choice and consent | Opt-in checkboxes | Consent UI (to implement) | ❌ Not started |
| P1.3 | Collection | Only necessary data collected | Privacy by design in forms | ✅ |
| P1.4 | Use and retention | 7-year financial, on-demand deletion | Data retention policy in COMPLIANCE doc | ✅ |
| P1.5 | Access | GDPR data export API | GDPR API endpoints (to implement) | ❌ Not started |
| P1.6 | Disclosure to third parties | Only processors (Stripe, PayPal) | DPAs with Supabase, Stripe, PayPal | ⏳ Q2 2026 |
| P1.7 | Quality | Data correction via account settings | User profile editing | ✅ |
| P1.8 | Monitoring & enforcement | GDPR request tracking | GDPR request log (to implement) | ❌ Not started |

---

## Data Classification Matrix

| Data Type | Classification | Examples | Protection Level | Retention | Access |
|-----------|---------------|----------|-----------------|-----------|--------|
| **Public** | L0 - Public | Menu items, store locations | None required | Indefinite | Everyone |
| **Internal** | L1 - Internal | Operational metrics, dashboards | Login required | 3 years | Authenticated users |
| **Confidential** | L2 - Confidential | Customer PII, order details | Encryption + RLS | 7 years | Tenant-isolated |
| **Restricted** | L3 - Restricted | Payment tokens, audit logs | Encryption + RLS + Audit | 7 years | Admin only |
| **Critical** | L4 - Critical | Database credentials, API keys | Secrets manager | Rotated 90 days | DevOps only |

---

## Vendor Assessment Matrix

| Vendor | Service | SOC 2 | GDPR | Data Type | DPA Signed | Review Date |
|--------|---------|-------|------|-----------|-----------|-------------|
| Supabase | Database, Auth | ✅ Type II | ✅ Compliant | L2-L4 (All) | ✅ Yes | 2026-04-01 |
| Vercel | Hosting, CDN | ✅ Type II | ✅ Compliant | L0-L1 (Logs) | ✅ Yes | 2026-04-01 |
| Stripe | Payments | ✅ PCI Level 1 | ✅ Compliant | L4 (Payment) | ✅ Yes | 2026-04-01 |
| PayPal | Payments | ✅ PCI Level 1 | ✅ Compliant | L4 (Payment) | ✅ Yes | 2026-04-01 |
| Twilio | SMS | ✅ Type II | ✅ Compliant | L2 (Phone) | ⏳ Pending | TBD |
| SendGrid | Email | ✅ Type II | ✅ Compliant | L2 (Email) | ⏳ Pending | TBD |
| Sentry | Error tracking | ⏳ Not required | ✅ Compliant | L1 (Errors) | N/A | N/A |

---

## Control Effectiveness Testing Plan

### Q2 2026 Testing (Pre-Audit)
- [ ] Test MFA enforcement for admin accounts
- [ ] Test backup restoration procedure (full restore)
- [ ] Test incident response with simulated P0 incident
- [ ] Test access removal procedure (offboard test user)
- [ ] Verify all RLS policies prevent cross-tenant access
- [ ] Verify encryption in transit (TLS 1.3 verification)
- [ ] Test change management (unauthorized PR blocked)

### Q3 2026 Testing (During Audit)
- [ ] Auditor walkthrough of architecture
- [ ] Auditor review of access logs
- [ ] Auditor test of RLS policies
- [ ] Auditor review of incident response
- [ ] Auditor review of vendor management
- [ ] Auditor review of backup/recovery

---

## Audit Evidence Collection

### Documents to Provide Auditor
1. System architecture (ARCHITECTURE.md)
2. Database schema with RLS (COMPLETE_DATABASE_SCHEMA.sql)
3. Security policy (SECURITY.md)
4. Incident response plan (MONITORING_OBSERVABILITY_PLAN.md)
5. Access control matrix (this document)
6. Vendor assessments (this document)
7. Change management procedures (DEPLOYMENT.md)
8. Monitoring configuration (MONITORING_OBSERVABILITY_PLAN.md)

### Logs to Provide Auditor
1. Supabase audit logs (compliance_audit_log table, 90-day sample)
2. GitHub commit history (90-day sample)
3. CI/CD pipeline results (90-day sample)
4. Uptime monitoring reports (90-day sample)
5. Error tracking logs (Sentry, 90-day sample)
6. Access review results (quarterly reviews)

### Tests to Demonstrate to Auditor
1. Live demonstration of RLS preventing cross-tenant access
2. Rollback procedure demonstration
3. Backup restoration demonstration
4. Incident response walkthrough
5. Change management workflow (PR → review → deploy)

---

## Remediation Tracker

| Finding ID | Description | Priority | Owner | Due Date | Status |
|-----------|-------------|----------|-------|----------|--------|
| REM-001 | Enable MFA for all admin accounts | High | Security | 2026-05-15 | ⏳ Open |
| REM-002 | Implement PII masking in logs | High | Engineering | 2026-05-15 | ⏳ Open |
| REM-003 | Create offboarding procedure | Medium | HR | 2026-06-01 | ⏳ Open |
| REM-004 | Implement centralized error handler | Medium | Engineering | 2026-06-01 | ⏳ Open |
| REM-005 | Complete quarterly access review | Medium | Security | 2026-06-15 | ⏳ Open |
| REM-006 | Sign DPAs with Twilio and SendGrid | High | Legal | 2026-05-31 | ⏳ Open |
| REM-007 | Publish privacy policy | High | Legal | 2026-05-31 | ⏳ Open |
| REM-008 | Implement GDPR data export API | High | Engineering | 2026-06-15 | ⏳ Open |
| REM-009 | Create risk register | Medium | Security | 2026-06-01 | ⏳ Open |
| REM-010 | Obtain cyber insurance | Low | Finance | 2026-07-01 | ⏳ Open |

---

## Control Owner Responsibilities

| Role | Controls Owned | Responsibilities |
|------|---------------|------------------|
| **CEO** | CC1 (Control Environment) | Board oversight, ethics, culture |
| **CTO** | CC5, CC7, CC8 (Technology, Operations, Change) | Infrastructure, deployments, monitoring |
| **CISO** | CC6, CC9 (Access, Risk) | Security, incident response, vendor management |
| **Compliance Officer** | CC2, CC3, CC4 (Communication, Risk, Monitoring) | Audits, documentation, compliance tracking |
| **Engineering Lead** | CC5.1, CC8.2 (Code quality, Testing) | Code review, testing, quality |
| **HR** | CC1.4, CC6.5 (Competence, Offboarding) | Training, hiring, offboarding |

---

**Status Summary**:
- ✅ Implemented: 24 controls
- ⏳ In Progress: 18 controls
- ❌ Not Started: 8 controls

**Next Review Date**: May 1, 2026  
**Audit Start Date**: July 1, 2026
