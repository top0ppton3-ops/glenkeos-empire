# Access Control & User Management Procedures

**Version**: 1.0.0  
**Effective Date**: April 24, 2026  
**Owner**: Chief Information Security Officer  
**Review Cycle**: Quarterly

---

## 1. Access Control Framework

### 1.1 Principle of Least Privilege

**Rule**: Users are granted the minimum access necessary to perform their job functions.

**Examples**:
- Store Manager: Access to own store data only (not other stores)
- Driver: Access to assigned orders only (not all orders)
- Customer: Access to own account only (not other customers)
- SUPER_ADMIN: Access to all data (heavily audited)

### 1.2 Role-Based Access Control (RBAC)

**Six Roles** (defined in ARCHITECTURE_ANSWERS.md):

| Role | Access Level | Tenant Scope | Permissions |
|------|-------------|--------------|-------------|
| **SUPER_ADMIN** | Full system access | All tenants (cross-tenant) | All operations, audit logged |
| **CORPORATE_ADMIN** | Corporate oversight | All tenants within corporation | Read-only cross-tenant, full access within assigned tenants |
| **STORE_MANAGER** | Store operations | Single tenant (store) | Manage menu, inventory, orders, staff |
| **STAFF** | Store operations (limited) | Single tenant (store) | View orders, update order status |
| **DRIVER** | Delivery operations | Single tenant (store) | View assigned orders, update delivery status |
| **CUSTOMER** | Self-service | Own account only | Browse menu, place orders, view own order history |

### 1.3 Multi-Tenant Isolation

**Enforcement**: Row-Level Security (RLS) in PostgreSQL

**Every table has**:
```sql
tenant_id VARCHAR(50) NOT NULL
```

**RLS Policy** (enforced at database level):
```sql
CREATE POLICY orders_tenant_isolation ON public.orders
  USING (
    tenant_id = auth.user_tenant_id()
    OR auth.has_corporate_access()
  );
```

**Result**: Users can ONLY access data belonging to their tenant (except SUPER_ADMIN and CORPORATE_ADMIN with explicit override).

---

## 2. User Onboarding Procedures

### 2.1 New Employee Onboarding

**Roles Covered**: STORE_MANAGER, STAFF, DRIVER

**Procedure**:

**Step 1: HR Approval** (Day -1)
- HR creates employee record in HRIS system
- Manager submits access request form:
  - Employee name
  - Role (STORE_MANAGER, STAFF, or DRIVER)
  - Tenant ID (store location)
  - Start date
  - Justification

**Step 2: IT Provisioning** (Day 1)
```sql
-- Create user account
INSERT INTO auth.users (
  id,
  email,
  encrypted_password, -- hashed password
  email_confirmed_at,
  created_at
) VALUES (
  gen_random_uuid(),
  'john.doe@glenkeos.com',
  crypt('TemporaryPassword123!', gen_salt('bf')), -- force password reset on first login
  NOW(),
  NOW()
);

-- Assign role and tenant
INSERT INTO users (
  user_id,
  tenant_id,
  role,
  first_name,
  last_name,
  phone,
  status
) VALUES (
  '[user_id from above]',
  'chic-on-chain-001', -- tenant_id
  'STORE_MANAGER', -- role
  'John',
  'Doe',
  '+1-555-123-4567',
  'ACTIVE'
);

-- Log access grant in audit log
INSERT INTO compliance_audit_log (
  event_type,
  user_id,
  tenant_id,
  event_data,
  created_at
) VALUES (
  'ACCESS_GRANTED',
  '[user_id]',
  'chic-on-chain-001',
  '{"role": "STORE_MANAGER", "granted_by": "admin@glenkeos.com"}'::jsonb,
  NOW()
);
```

**Step 3: Welcome Email** (Day 1)
```
Subject: Welcome to GlenKeos - Your Account is Ready

Dear John,

Your GlenKeos account has been created.

LOGIN CREDENTIALS:
- Email: john.doe@glenkeos.com
- Temporary Password: TemporaryPassword123!
- Login URL: https://codebuild-default-webhook-source-lo.vercel.app/login

FIRST LOGIN:
You will be required to change your password on first login.
Choose a strong password (12+ characters, uppercase, lowercase, number, symbol).

ROLE & PERMISSIONS:
You have been assigned the role: STORE_MANAGER
Store: Chic on Chain - Mission District

TRAINING:
Please complete security awareness training at [link] within 7 days.

If you have questions, contact IT support: it@glenkeos.com

Welcome to the team!

- GlenKeos IT Team
```

**Step 4: Security Training** (Within 7 days)
- [ ] Complete GDPR awareness training (1 hour)
- [ ] Complete PCI-DSS basics (30 minutes)
- [ ] Complete phishing awareness (30 minutes)
- [ ] Sign confidentiality agreement
- [ ] Acknowledge acceptable use policy

**Step 5: Access Verification** (Day 7)
```bash
# Manager verifies new employee can access assigned systems
# IT performs access review:
SELECT 
  u.email,
  usr.role,
  usr.tenant_id,
  usr.status,
  u.created_at
FROM auth.users u
JOIN users usr ON usr.user_id = u.id
WHERE u.email = 'john.doe@glenkeos.com';

# Expected: Role matches access request, tenant_id correct, status ACTIVE
```

---

### 2.2 Admin/Privileged User Onboarding

**Roles Covered**: SUPER_ADMIN, CORPORATE_ADMIN

**Additional Requirements**:
- [ ] Background check completed (pre-employment)
- [ ] Manager + VP approval (two-person rule)
- [ ] MFA enabled (MANDATORY, no exceptions)
- [ ] Signed privileged access agreement
- [ ] Enhanced security training (4 hours)

**Procedure**:
```sql
-- Create SUPER_ADMIN user (example)
INSERT INTO users (
  user_id,
  tenant_id,
  role,
  first_name,
  last_name,
  mfa_enabled, -- REQUIRED for admin roles
  status
) VALUES (
  '[user_id]',
  'CORPORATE', -- Special tenant for corporate admins
  'SUPER_ADMIN',
  'Jane',
  'Smith',
  TRUE, -- MFA required
  'ACTIVE'
);

-- Log privileged access grant
INSERT INTO compliance_audit_log (
  event_type,
  user_id,
  tenant_id,
  event_data,
  created_at
) VALUES (
  'PRIVILEGED_ACCESS_GRANTED',
  '[user_id]',
  'CORPORATE',
  '{"role": "SUPER_ADMIN", "approved_by": ["manager@glenkeos.com", "vp@glenkeos.com"], "background_check": "PASSED"}'::jsonb,
  NOW()
);
```

**MFA Enforcement**:
```sql
-- RLS policy prevents admin access without MFA
CREATE POLICY admin_requires_mfa ON public.orders
  FOR ALL
  USING (
    CASE 
      WHEN auth.user_role() IN ('SUPER_ADMIN', 'CORPORATE_ADMIN')
      THEN auth.user_mfa_enabled() = TRUE
      ELSE TRUE
    END
  );
```

---

### 2.3 Customer Self-Registration

**Procedure** (automated):

**Step 1: Customer Signs Up**
```typescript
// Frontend signup form
const { data, error } = await supabase.auth.signUp({
  email: 'customer@example.com',
  password: 'SecurePassword123!',
  options: {
    data: {
      first_name: 'Alice',
      last_name: 'Johnson',
      phone: '+1-555-987-6543'
    }
  }
});

// Supabase Auth automatically creates auth.users record
```

**Step 2: Database Trigger Creates User Profile**
```sql
-- Trigger function (runs automatically on signup)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    user_id,
    tenant_id,
    role,
    first_name,
    last_name,
    phone,
    status
  ) VALUES (
    NEW.id,
    'default-tenant', -- All customers in default tenant unless they specify store
    'CUSTOMER',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    'ACTIVE'
  );
  
  -- Log registration
  INSERT INTO compliance_audit_log (
    event_type,
    user_id,
    tenant_id,
    event_data,
    created_at
  ) VALUES (
    'USER_REGISTERED',
    NEW.id,
    'default-tenant',
    '{"email": "' || NEW.email || '", "method": "self_signup"}'::jsonb,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**Step 3: Email Verification**
```
Subject: Confirm Your GlenKeos Account

Dear Alice,

Thank you for creating a GlenKeos account!

Please confirm your email address by clicking the link below:
[Confirmation Link]

This link expires in 24 hours.

If you did not create this account, please ignore this email.

- GlenKeos Team
```

---

## 3. User Offboarding Procedures

### 3.1 Employee Termination

**Trigger**: HR notifies IT of employee termination (same day)

**Procedure**:

**Step 1: Immediate Access Revocation** (within 1 hour of termination)
```sql
-- Disable user account
UPDATE users 
SET 
  status = 'TERMINATED',
  terminated_at = NOW(),
  terminated_by = 'hr@glenkeos.com'
WHERE user_id = '[terminated_user_id]';

-- Revoke all active sessions (force logout)
DELETE FROM auth.sessions WHERE user_id = '[terminated_user_id]';

-- Revoke API keys (if any)
DELETE FROM api_keys WHERE user_id = '[terminated_user_id]';

-- Log termination
INSERT INTO compliance_audit_log (
  event_type,
  user_id,
  tenant_id,
  event_data,
  created_at
) VALUES (
  'ACCESS_REVOKED',
  '[terminated_user_id]',
  'chic-on-chain-001',
  '{"reason": "TERMINATION", "terminated_by": "hr@glenkeos.com", "last_login": "2026-04-24T14:30:00Z"}'::jsonb,
  NOW()
);
```

**Step 2: Device Return** (within 3 days)
- [ ] Laptop returned to IT
- [ ] Mobile device returned to IT
- [ ] Access badge returned to security
- [ ] Company credit card returned to finance

**Step 3: Data Handover** (within 7 days)
- [ ] Manager identifies critical files/data owned by terminated employee
- [ ] Data transferred to replacement employee or manager
- [ ] Email forwarding set up (if needed, max 30 days)

**Step 4: Account Deletion** (after 90 days)
```sql
-- Hard delete user account (after retention period for audit)
-- CAUTION: This is permanent and deletes all user data

-- Option 1: Anonymize instead of delete (RECOMMENDED for audit trail)
UPDATE users 
SET 
  email = 'deleted-user-' || user_id || '@example.com',
  first_name = 'DELETED',
  last_name = 'USER',
  phone = NULL,
  anonymized_at = NOW()
WHERE user_id = '[terminated_user_id]';

-- Option 2: Hard delete (only if no audit requirements)
DELETE FROM users WHERE user_id = '[terminated_user_id]';
```

---

### 3.2 Customer Account Deletion (GDPR Right to Erasure)

**Trigger**: Customer requests account deletion via email or account settings

**Procedure** (see DATA_RETENTION_DELETION_POLICY.md for full details):

**Step 1: Identity Verification**
- Verify requestor is the account owner
- Send confirmation email with deletion link

**Step 2: Legal Assessment**
- Check for active orders (cannot delete if order in progress)
- Check for unpaid invoices (cannot delete if outstanding balance)
- Check for legal holds (fraud investigation, dispute, etc.)

**Step 3: Data Deletion** (within 30 days)
```sql
-- See DATA_RETENTION_DELETION_POLICY.md Section 6.1 for full deletion procedure
-- Summary:
-- 1. Soft delete customer account
-- 2. Anonymize order history (preserve financial records for SOX)
-- 3. Delete authentication data
-- 4. Delete sessions and notifications
-- 5. Log erasure in audit log
```

---

## 4. Access Reviews

### 4.1 Quarterly Access Review (All Users)

**Schedule**: January 15, April 15, July 15, October 15

**Procedure**:

**Step 1: Generate Access Report**
```sql
-- Export current user access
SELECT 
  u.email,
  usr.role,
  usr.tenant_id,
  usr.status,
  usr.created_at,
  usr.last_login_at
FROM auth.users u
JOIN users usr ON usr.user_id = u.id
WHERE usr.status = 'ACTIVE'
ORDER BY usr.role, usr.tenant_id, u.email;

-- Export to CSV
\copy (SELECT ...) TO '/tmp/user_access_review_2026-04-15.csv' CSV HEADER;
```

**Step 2: Manager Review**
- Send access report to each store manager
- Manager verifies:
  - [ ] All listed users still employed
  - [ ] Roles are correct (no role creep)
  - [ ] Tenant assignments are correct
  - [ ] No unauthorized accounts

**Step 3: Remediation**
```sql
-- Remove access for users no longer employed
UPDATE users SET status = 'TERMINATED' WHERE user_id = '[user_id]';

-- Update incorrect roles
UPDATE users SET role = 'STAFF' WHERE user_id = '[user_id]'; -- downgrade from STORE_MANAGER

-- Update incorrect tenant assignments
UPDATE users SET tenant_id = 'correct-tenant-id' WHERE user_id = '[user_id]';
```

**Step 4: Documentation**
- Manager signs off on review (email confirmation)
- IT files signed access review report
- Compliance team audits completion (all managers responded?)

---

### 4.2 Monthly Privileged Access Review (Admin Users Only)

**Schedule**: First Monday of each month

**Procedure**:

**Step 1: Generate Privileged User Report**
```sql
-- List all SUPER_ADMIN and CORPORATE_ADMIN users
SELECT 
  u.email,
  usr.role,
  usr.mfa_enabled,
  usr.last_login_at,
  COUNT(cal.event_id) AS actions_last_30_days
FROM auth.users u
JOIN users usr ON usr.user_id = u.id
LEFT JOIN compliance_audit_log cal ON cal.user_id = u.id 
  AND cal.created_at > NOW() - INTERVAL '30 days'
WHERE usr.role IN ('SUPER_ADMIN', 'CORPORATE_ADMIN')
  AND usr.status = 'ACTIVE'
GROUP BY u.email, usr.role, usr.mfa_enabled, usr.last_login_at
ORDER BY usr.role, u.email;
```

**Step 2: CISO Review**
- CISO reviews all privileged accounts
- Verifies:
  - [ ] MFA enabled (MANDATORY)
  - [ ] Last login within 90 days (if not, disable account)
  - [ ] Activity level reasonable (no inactive admins)
  - [ ] No unauthorized privilege escalation

**Step 3: Audit Unusual Activity**
```sql
-- Check for suspicious admin activity
SELECT 
  event_type,
  user_id,
  tenant_id,
  event_data,
  created_at
FROM compliance_audit_log
WHERE user_id IN (
  SELECT user_id FROM users WHERE role IN ('SUPER_ADMIN', 'CORPORATE_ADMIN')
)
AND created_at > NOW() - INTERVAL '30 days'
AND event_type IN (
  'DATA_DELETED', 
  'PRIVILEGED_ACCESS_GRANTED', 
  'ACCESS_REVOKED',
  'TENANT_OVERRIDE' -- cross-tenant access
)
ORDER BY created_at DESC;
```

**Step 4: Documentation**
- CISO signs off on monthly review
- Compliance team files report (SOC 2 audit evidence)

---

## 5. Password & Authentication Policies

### 5.1 Password Requirements

**Minimum Standards**:
- **Length**: 12 characters (minimum)
- **Complexity**: Must contain uppercase, lowercase, number, and symbol
- **Common Passwords**: Blocked (dictionary check against top 10,000 common passwords)
- **Reuse**: Cannot reuse last 5 passwords
- **Expiration**: 90 days for admin accounts, no expiration for customers (per NIST guidelines)

**Enforcement** (Supabase Auth configuration):
```javascript
// supabase/config.toml
[auth]
  password_min_length = 12
  password_requirements = ["upper", "lower", "number", "symbol"]
  password_reuse_limit = 5
```

### 5.2 Multi-Factor Authentication (MFA)

**Requirement**:
- **MANDATORY**: SUPER_ADMIN, CORPORATE_ADMIN (no exceptions)
- **RECOMMENDED**: STORE_MANAGER, STAFF
- **OPTIONAL**: DRIVER, CUSTOMER

**Supported Methods**:
1. **TOTP (Time-Based One-Time Password)**: Google Authenticator, Authy, 1Password
2. **SMS**: Via Twilio (fallback option, less secure)
3. **WebAuthn**: Hardware security keys (YubiKey, etc.)

**Enrollment** (mandatory for admins):
```sql
-- RLS policy enforces MFA for admin roles
CREATE POLICY admin_requires_mfa ON public.orders
  FOR ALL
  USING (
    CASE 
      WHEN auth.user_role() IN ('SUPER_ADMIN', 'CORPORATE_ADMIN')
      THEN auth.user_mfa_enabled() = TRUE
      ELSE TRUE -- Non-admin roles can access without MFA
    END
  );
```

### 5.3 Session Management

**Session Timeout**:
- **Admin users**: 15 minutes idle timeout
- **Store users**: 60 minutes idle timeout
- **Customers**: 24 hours (remember me enabled)

**Concurrent Sessions**:
- Limit: 3 concurrent sessions per user
- Exceeding limit: Oldest session terminated

**Session Revocation**:
```sql
-- Revoke all sessions for a user (on password change, termination, etc.)
DELETE FROM auth.sessions WHERE user_id = '[user_id]';

-- Revoke specific session
DELETE FROM auth.sessions WHERE token = '[session_token]';
```

---

## 6. API Key Management

### 6.1 API Key Issuance

**Use Case**: Automated integrations, mobile apps, third-party services

**Procedure**:
```sql
-- Create API key
INSERT INTO api_keys (
  key_id,
  user_id,
  tenant_id,
  key_hash, -- Hashed version (never store plaintext)
  key_name,
  scopes, -- Comma-separated list of allowed operations
  expires_at,
  created_at
) VALUES (
  gen_random_uuid(),
  '[user_id]',
  'chic-on-chain-001',
  crypt('api_key_xyz123', gen_salt('bf')),
  'Mobile App Integration',
  'orders:read,orders:write,menu:read',
  NOW() + INTERVAL '365 days', -- 1-year expiration
  NOW()
);

-- Display plaintext key to user ONCE (cannot be retrieved later)
-- "Your API key: api_key_xyz123 (save this, it will not be shown again)"
```

### 6.2 API Key Rotation

**Policy**: API keys MUST be rotated every 90 days

**Procedure**:
```sql
-- Generate new API key (same user_id, new key_hash)
-- Display new key to user
-- Set old key expiration to +30 days (grace period)
UPDATE api_keys 
SET expires_at = NOW() + INTERVAL '30 days'
WHERE key_id = '[old_key_id]';

-- After 30 days, delete old key
DELETE FROM api_keys WHERE expires_at < NOW();
```

---

## 7. Audit Logging

### 7.1 Logged Events

**All access control events are logged** in `compliance_audit_log` table:

| Event Type | Description | Example |
|-----------|-------------|---------|
| `ACCESS_GRANTED` | User account created, role assigned | Employee onboarded |
| `ACCESS_REVOKED` | User account disabled/deleted | Employee terminated |
| `PRIVILEGED_ACCESS_GRANTED` | Admin role assigned | SUPER_ADMIN created |
| `ROLE_CHANGED` | User role modified | Promoted to STORE_MANAGER |
| `TENANT_OVERRIDE` | Cross-tenant access (SUPER_ADMIN) | Accessed different store's data |
| `LOGIN_SUCCESS` | Successful authentication | User logged in |
| `LOGIN_FAILED` | Failed authentication attempt | Wrong password entered |
| `MFA_ENABLED` | MFA activated | Admin enrolled in TOTP |
| `MFA_DISABLED` | MFA deactivated | (Should never happen for admins) |
| `PASSWORD_CHANGED` | Password reset/changed | User changed password |
| `SESSION_REVOKED` | Session terminated | User logged out |
| `API_KEY_CREATED` | API key issued | Integration API key created |
| `API_KEY_REVOKED` | API key deleted | API key rotated |

### 7.2 Audit Log Retention

**Retention Period**: 7 years (SOC 2, SOX requirement)

**Storage**:
- **Hot storage** (production database): 90 days
- **Cold storage** (S3 archival): 7 years

**Access**:
- SUPER_ADMIN: Full access (read-only)
- CISO: Full access (read-only)
- External Auditor: Read-only (during audit period)

---

## 8. Compliance Checklist

**SOC 2 Control CC6 - Logical & Physical Access Controls**:
- [x] CC6.1: Authentication (JWT, email/password, MFA)
- [x] CC6.2: Authorization (RBAC, RLS policies, tenant isolation)
- [x] CC6.3: Credential management (password policy, API key rotation)
- [⏳] CC6.4: MFA for admin accounts (deployment May 2026)
- [⏳] CC6.5: Access reviews (quarterly reviews starting Q2 2026)
- [⏳] CC6.6: Offboarding procedure (checklist created, enforcement May 2026)
- [x] CC6.7: Privileged access (SUPER_ADMIN role, audit logged)
- [x] CC6.8: Audit logging (compliance_audit_log table, 7-year retention)

---

**Review this document quarterly. Access control is the foundation of all security.**
