# ENTERPRISE ACCESS CONTROL MATRIX

**Role-Based Access Control (RBAC) for All GlenKeos Systems**

---

## 1. Roles (13 Total)

### Administrative Roles

1. **SUPER_ADMIN** - Full system access
2. **COMPLIANCE_OFFICER** - Audit + compliance management
3. **RISK_MANAGER** - Risk event management

### Operational Roles

4. **STORE_MANAGER** - Store operations
5. **ASSISTANT_MANAGER** - Limited store operations
6. **KITCHEN_MANAGER** - Kitchen + prep oversight
7. **KITCHEN_STAFF** - Order preparation
8. **CASHIER** - Order entry + payment
9. **DISPATCHER** - Driver assignment
10. **DRIVER_COORDINATOR** - Driver management

### Support Roles

11. **CUSTOMER_SERVICE** - Customer support
12. **INVENTORY_MANAGER** - Inventory tracking

### Read-Only Roles

13. **VIEWER** - Read-only access

---

## 2. Access Matrix (Complete)

### Legend

- **RW** = Read + Write (full CRUD)
- **R** = Read only
- **W** = Write only (create/update, no read)
- **SELF** = Only own record
- **ASSIGNED** = Only assigned records
- **—** = No access

---

### Stores Access

| Role | Stores |
|------|--------|
| SUPER_ADMIN | RW |
| COMPLIANCE_OFFICER | R |
| RISK_MANAGER | R |
| STORE_MANAGER | RW (assigned stores) |
| ASSISTANT_MANAGER | R (assigned stores) |
| KITCHEN_MANAGER | R (assigned stores) |
| KITCHEN_STAFF | R (assigned stores) |
| CASHIER | R (assigned stores) |
| DISPATCHER | R (assigned stores) |
| DRIVER_COORDINATOR | R (assigned stores) |
| CUSTOMER_SERVICE | R |
| INVENTORY_MANAGER | R (assigned stores) |
| VIEWER | R |

---

### Orders Access

| Role | Orders |
|------|--------|
| SUPER_ADMIN | RW |
| COMPLIANCE_OFFICER | R |
| RISK_MANAGER | R |
| STORE_MANAGER | RW (assigned stores) |
| ASSISTANT_MANAGER | RW (assigned stores) |
| KITCHEN_MANAGER | R (assigned stores) |
| KITCHEN_STAFF | R (assigned stores) |
| CASHIER | RW (assigned stores) |
| DISPATCHER | RW (assigned stores) |
| DRIVER_COORDINATOR | R |
| CUSTOMER_SERVICE | R |
| INVENTORY_MANAGER | R (assigned stores) |
| VIEWER | R |

---

### Inventory Access

| Role | Inventory |
|------|-----------|
| SUPER_ADMIN | RW |
| COMPLIANCE_OFFICER | R |
| RISK_MANAGER | R |
| STORE_MANAGER | RW (assigned stores) |
| ASSISTANT_MANAGER | R (assigned stores) |
| KITCHEN_MANAGER | R (assigned stores) |
| KITCHEN_STAFF | R (assigned stores) |
| CASHIER | R (assigned stores) |
| DISPATCHER | R (assigned stores) |
| DRIVER_COORDINATOR | — |
| CUSTOMER_SERVICE | R |
| INVENTORY_MANAGER | RW (assigned stores) |
| VIEWER | R |

---

### Drivers Access

| Role | Drivers |
|------|---------|
| SUPER_ADMIN | RW |
| COMPLIANCE_OFFICER | R |
| RISK_MANAGER | R |
| STORE_MANAGER | RW (assigned stores) |
| ASSISTANT_MANAGER | R (assigned stores) |
| KITCHEN_MANAGER | R (assigned stores) |
| KITCHEN_STAFF | — |
| CASHIER | R (assigned stores) |
| DISPATCHER | RW (assigned stores) |
| DRIVER_COORDINATOR | RW (assigned stores) |
| CUSTOMER_SERVICE | R |
| INVENTORY_MANAGER | — |
| VIEWER | R |

---

### Staff Access

| Role | Staff |
|------|-------|
| SUPER_ADMIN | RW |
| COMPLIANCE_OFFICER | R |
| RISK_MANAGER | R |
| STORE_MANAGER | R (assigned stores) |
| ASSISTANT_MANAGER | R (assigned stores) |
| KITCHEN_MANAGER | R (assigned stores) |
| KITCHEN_STAFF | SELF |
| CASHIER | SELF |
| DISPATCHER | R (assigned stores) |
| DRIVER_COORDINATOR | R (assigned stores) |
| CUSTOMER_SERVICE | SELF |
| INVENTORY_MANAGER | SELF |
| VIEWER | R |

---

### Policies Access

| Role | Policies |
|------|----------|
| SUPER_ADMIN | RW |
| COMPLIANCE_OFFICER | RW |
| RISK_MANAGER | R |
| STORE_MANAGER | R |
| ASSISTANT_MANAGER | R |
| KITCHEN_MANAGER | R |
| KITCHEN_STAFF | R |
| CASHIER | R |
| DISPATCHER | R |
| DRIVER_COORDINATOR | R |
| CUSTOMER_SERVICE | R |
| INVENTORY_MANAGER | R |
| VIEWER | R |

---

### Risk Events Access

| Role | Risk Events |
|------|-------------|
| SUPER_ADMIN | RW |
| COMPLIANCE_OFFICER | R |
| RISK_MANAGER | RW |
| STORE_MANAGER | R (assigned stores) |
| ASSISTANT_MANAGER | R (assigned stores) |
| KITCHEN_MANAGER | — |
| KITCHEN_STAFF | — |
| CASHIER | — |
| DISPATCHER | — |
| DRIVER_COORDINATOR | — |
| CUSTOMER_SERVICE | — |
| INVENTORY_MANAGER | — |
| VIEWER | R |

---

### Compliance Events Access

| Role | Compliance Events |
|------|-------------------|
| SUPER_ADMIN | R |
| COMPLIANCE_OFFICER | RW (create-only, immutable) |
| RISK_MANAGER | R |
| STORE_MANAGER | R (assigned stores) |
| ASSISTANT_MANAGER | — |
| KITCHEN_MANAGER | — |
| KITCHEN_STAFF | — |
| CASHIER | — |
| DISPATCHER | — |
| DRIVER_COORDINATOR | — |
| CUSTOMER_SERVICE | — |
| INVENTORY_MANAGER | — |
| VIEWER | R |

---

### Metrics Access

| Role | Metrics |
|------|---------|
| SUPER_ADMIN | R |
| COMPLIANCE_OFFICER | R |
| RISK_MANAGER | R |
| STORE_MANAGER | R (assigned stores) |
| ASSISTANT_MANAGER | R (assigned stores) |
| KITCHEN_MANAGER | R (assigned stores) |
| KITCHEN_STAFF | R (assigned stores) |
| CASHIER | R (assigned stores) |
| DISPATCHER | R (assigned stores) |
| DRIVER_COORDINATOR | R (assigned stores) |
| CUSTOMER_SERVICE | R |
| INVENTORY_MANAGER | R (assigned stores) |
| VIEWER | R |

---

## 3. Enforcement Points

### API Gateway Level

- JWT validation
- Role extraction from claims
- Basic role checks (e.g., authenticated vs. public)

### Service Level

- Fine-grained RBAC
- Resource-level permissions
- Store-scoping enforcement

### Database Level

- Row-Level Security (RLS)
- Tenant isolation
- Audit logging

### Event Bus Level

- Topic access control
- Consumer group permissions

---

## 4. MFA Requirements

### Mandatory MFA

Required for:
- **SUPER_ADMIN**
- **COMPLIANCE_OFFICER**
- **RISK_MANAGER**

### Optional MFA

Recommended for:
- **STORE_MANAGER**
- **DISPATCHER**
- **DRIVER_COORDINATOR**

### No MFA

- KITCHEN_STAFF
- CASHIER
- VIEWER

---

## 5. Session Management

### Session Duration

| Role | Duration | Idle Timeout |
|------|----------|--------------|
| SUPER_ADMIN | 4 hours | 30 minutes |
| COMPLIANCE_OFFICER | 8 hours | 1 hour |
| RISK_MANAGER | 8 hours | 1 hour |
| STORE_MANAGER | 8 hours | 2 hours |
| Others | 12 hours | 4 hours |

### Session Termination

- Logout triggers compliance event
- Session expiry logged
- Failed auth attempts tracked

---

## 6. Permission Inheritance

No inheritance model. Roles are explicit and flat.

**Example:**
- STORE_MANAGER does NOT inherit from ASSISTANT_MANAGER
- Each role is independently defined

---

## 7. Audit Trail

All access to Level 3+ resources generates:

- Compliance event
- Actor ID
- Resource type
- Resource ID
- Action (read/write/delete)
- Result (success/denied)
- Timestamp
- IP address

---

## 8. Role Assignment

### Who Can Assign Roles?

| Role | Can Assign |
|------|------------|
| SUPER_ADMIN | All roles |
| COMPLIANCE_OFFICER | VIEWER, CUSTOMER_SERVICE |
| STORE_MANAGER | KITCHEN_STAFF, CASHIER (assigned stores only) |

### Role Assignment Logging

All role changes generate:
- ROLE_CHANGED event
- Old roles
- New roles
- Changed by
- Timestamp

---

## 9. Least Privilege Principle

- Default role: VIEWER
- Users request elevated access
- Access approved by authorized role
- Access reviewed quarterly

---

## 10. Emergency Access

### Break-Glass Procedure

For critical incidents:

1. SUPER_ADMIN enables emergency access
2. Temporary elevated role granted
3. All actions logged
4. Emergency access auto-expires in 1 hour
5. Post-incident review required

---

**This matrix enforces enterprise-grade access control across all GlenKeos systems.**

**Permissions are explicit, auditable, and enforceable.**
