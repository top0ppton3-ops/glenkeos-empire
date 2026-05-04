# Database Schema Documentation

Complete PostgreSQL database schema for GlenKeos backend.

---

## Overview

**Database:** PostgreSQL 14+  
**Migrations:** 10 sequential SQL files  
**Tables:** 14 core tables + 2 junction tables  
**Extensions:** uuid-ossp  

---

## Schema Summary

| Table | Purpose | Rows (Est.) | Key Features |
|-------|---------|-------------|--------------|
| `stores` | Physical store locations | 10-100 | Address, operating hours, multi-brand |
| `orders` | Customer orders | 100K-1M+ | 10 status lifecycle, pricing, risk scoring |
| `order_items` | Order line items | 300K-3M+ | SKU tracking, modifiers |
| `inventory_items` | Per-store inventory | 1K-10K | Threshold alerts, auto-status |
| `drivers` | Delivery drivers | 100-1K | GPS tracking, real-time status |
| `staff` | Staff members | 50-500 | Authentication, MFA |
| `staff_roles` | Role assignments | 100-1K | 13 granular roles |
| `staff_store_access` | Store permissions | 200-2K | Multi-store access |
| `policies` | Governance policies | 50-200 | Versioning, approvals |
| `policy_acknowledgments` | Policy tracking | 1K-10K | Staff acknowledgment |
| `risk_events` | Risk monitoring | 1K-50K | Severity, mitigation |
| `risk_event_notes` | Risk comments | 5K-100K | Timeline tracking |
| `compliance_events` | Audit trail | 1M-10M+ | **Immutable**, indexed |
| `metrics` | Operational metrics | 100K-1M+ | Time-series aggregations |

---

## Migration Files

### 001_create_stores.sql

**Creates:** `stores` table

**Key Features:**
- UUID primary key
- Flattened address (street, city, state, zip, country)
- JSON operating hours per day
- Status: ACTIVE | INACTIVE | MAINTENANCE
- Auto-updated `updated_at` trigger
- Full-text search on name

**Indexes:**
- Brand + city/state for location queries
- Full-text search for store name
- Status for filtering active stores

---

### 002_create_orders.sql

**Creates:** `orders`, `order_items` tables

**Key Features:**
- 10-stage order lifecycle (PLACED → DELIVERED)
- Complete pricing breakdown (subtotal, tax, delivery_fee, tip, discount, total)
- Flattened delivery address
- Risk scoring (score, level, flags)
- Compliance tracking
- Timestamp per status (placed_at, confirmed_at, ready_at, etc.)
- Auto-update status timestamps on status change

**Indexes:**
- Composite store+status for ops dashboard queries
- Driver assignment tracking
- Created_at for time-series queries
- Risk level for high-risk filtering

**Child Table:** `order_items`
- Line items with SKU, quantity, price
- JSON modifiers for customizations
- Cascade delete with order

---

### 003_create_inventory.sql

**Creates:** `inventory_items` table

**Key Features:**
- Per-store inventory tracking
- 5 categories (INGREDIENT, PACKAGING, SUPPLY, BEVERAGE, OTHER)
- Quantity + threshold = auto status
- Auto-update status trigger (IN_STOCK | LOW_STOCK | OUT_OF_STOCK)
- Supplier information
- Unit cost tracking
- Unique constraint: one SKU per store

**Indexes:**
- Store + SKU composite for lookups
- Low stock filtering
- Category queries
- Full-text search on name

---

### 004_create_drivers.sql

**Creates:** `drivers` table

**Key Features:**
- Real-time GPS tracking (lat/lon with timestamp)
- 5 status levels (ONLINE, OFFLINE, BUSY, ON_BREAK, INACTIVE)
- Vehicle details (type, make, model, license plate)
- Performance metrics (rating, total_deliveries, on_time_percentage)
- Current order assignment
- Auto-update location timestamp trigger

**Indexes:**
- Store + status for assignment routing
- Current order for dispatch tracking
- Location for proximity queries

---

### 005_create_staff.sql

**Creates:** `staff`, `staff_roles`, `staff_store_access` tables

**Key Features:**
- Authentication support (password_hash, MFA)
- 13 granular roles (SUPER_ADMIN, COMPLIANCE_OFFICER, STORE_MANAGER, etc.)
- Multi-store access control
- Login tracking (last_login, failed_attempts, lockout)
- Auto-reset failed logins on successful auth

**Junction Tables:**
- `staff_roles`: Many-to-many staff ↔ roles
- `staff_store_access`: Many-to-many staff ↔ stores

**Indexes:**
- Email (unique, case-insensitive)
- Role lookups
- Store access queries

---

### 006_create_policies.sql

**Creates:** `policies`, `policy_acknowledgments` tables

**Key Features:**
- Semantic versioning (X.Y.Z)
- 8 policy categories (DATA_PRIVACY, FOOD_SAFETY, etc.)
- Status: DRAFT | ACTIVE | ARCHIVED | DEPRECATED
- Effective/expiration dates
- Approval workflow (approved_by, approved_at)
- Version history (previous_version_id)
- Tags for searchability

**Child Table:** `policy_acknowledgments`
- Staff acknowledgment tracking
- IP address capture
- Unique constraint per policy+staff

**Indexes:**
- Name + category composite
- Full-text search (name, summary, content)
- Tag GIN index
- Active policies filter

---

### 007_create_risk_events.sql

**Creates:** `risk_events`, `risk_event_notes` tables

**Key Features:**
- 4 severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- 5 status levels (OPEN, IN_REVIEW, MITIGATED, RESOLVED, ESCALATED)
- 8 risk categories (FRAUD, FOOD_SAFETY, OPERATIONAL, etc.)
- Flexible JSONB indicators
- Mitigation steps tracking
- Assignment + resolution workflow
- Auto-set resolved_at trigger

**Child Table:** `risk_event_notes`
- Timeline of comments
- Author tracking

**Indexes:**
- Severity + status composite
- Entity type + ID for related events
- Open events filter
- Full-text search (title, description)

---

### 008_create_compliance_events.sql

**Creates:** `compliance_events` table

**Key Features:**
- **Immutable** audit trail (prevents UPDATE/DELETE)
- 14 event types (ORDER_CREATED, ROLE_CHANGED, DATA_EXPORTED, etc.)
- Actor tracking (staff, system, API, customer)
- Entity tracking (what was affected)
- JSON metadata for event-specific data
- Request context (IP, user agent)
- Auto-set timestamp trigger

**Triggers:**
- Prevent updates/deletes
- Force timestamp to NOW()
- Immutability enforcement

**Indexes:**
- Event type + actor + timestamp for audit queries
- Entity type + ID for entity history
- JSONB GIN index for metadata queries

---

### 009_create_metrics.sql

**Creates:** `metrics` table + 2 views

**Key Features:**
- Store-scoped or global metrics
- 9 metric types (ACTIVE_ORDERS, AVG_PREP_TIME, REVENUE, etc.)
- 5 units (COUNT, MINUTES, PERCENTAGE, CURRENCY, RATIO)
- 5 time dimensions (REALTIME, HOURLY, DAILY, WEEKLY, MONTHLY)
- Period tracking (start/end timestamps)
- Trend data (direction, percentage, comparison type)
- Unique constraint per metric+period

**Views:**
- `realtime_metrics`: Latest realtime metrics per store/type
- `daily_metrics_summary`: Daily aggregations (min/max/avg)

**Indexes:**
- Store + type + dimension composite
- Realtime metrics filter
- Dashboard query optimization

---

### 010_add_foreign_key_constraints.sql

**Creates:** Final cross-table indexes and comments

**Adds:**
- Missing FK indexes for performance
- Documentation comments for relationships

---

## Triggers & Functions

### Auto-Update Triggers

1. **`update_updated_at_column()`** - Applied to 8 tables
   - Auto-sets `updated_at = NOW()` on every UPDATE

2. **`update_order_status_timestamps()`** - Orders
   - Auto-sets status-specific timestamps (confirmed_at, ready_at, etc.)

3. **`update_inventory_status()`** - Inventory
   - Auto-calculates status based on quantity vs threshold

4. **`update_driver_location_timestamp()`** - Drivers
   - Auto-sets `location_last_updated` when GPS changes

5. **`reset_failed_logins()`** - Staff
   - Resets failed login counter on successful auth

6. **`set_policy_approved_at()`** - Policies
   - Auto-sets `approved_at` when status → ACTIVE

7. **`set_risk_resolved_at()`** - Risk Events
   - Auto-sets `resolved_at` when status → RESOLVED

### Immutability Triggers

1. **`prevent_compliance_event_modification()`** - Compliance Events
   - Blocks all UPDATE/DELETE operations
   - Enforces immutable audit trail

2. **`ensure_compliance_timestamp()`** - Compliance Events
   - Forces timestamp to NOW() on INSERT
   - Prevents timestamp manipulation

---

## Indexes Strategy

### Performance Indexes

**High-Frequency Queries:**
- Store + status composites (orders, inventory, drivers)
- Timestamp descending (orders, metrics, compliance_events)
- Foreign key lookups (all FKs indexed)

**Search Indexes:**
- Full-text GIN (stores.name, inventory.name, policies content, risk_events title+description)
- JSONB GIN (order.risk_flags, compliance_events.metadata)
- Array GIN (policies.tags)

**Filtered Indexes:**
- WHERE status = 'ACTIVE' (stores, policies)
- WHERE risk_level IN ('HIGH', 'CRITICAL') (orders)
- WHERE dimension = 'REALTIME' (metrics)

---

## Data Integrity

### Unique Constraints

- `staff.email` - Case-insensitive unique
- `inventory_items(store_id, sku)` - One SKU per store
- `staff_roles(staff_id, role)` - No duplicate role assignments
- `staff_store_access(staff_id, store_id)` - No duplicate access grants
- `policy_acknowledgments(policy_id, staff_id)` - One ack per policy
- `metrics(store_id, metric_type, dimension, period_start)` - No duplicate metrics

### Foreign Key Constraints

All relationships enforced:
- `ON DELETE CASCADE` - Child data (order_items, staff_roles, etc.)
- `ON DELETE SET NULL` - Nullable FKs (driver_id in orders)
- `ON DELETE RESTRICT` - Protected relationships (stores in orders)

### Check Constraints

All enums enforced at DB level:
- Order status (10 values)
- Inventory category (5 values)
- Staff roles (13 values)
- Policy categories (8 values)
- Risk severity/status/category
- Compliance event types (14 values)
- Metric types (9 values)

---

## Seed Data

**Location:** `/database/seeds/`

### 001_seed_stores.sql

- 3 active stores (2 Ghetto Eats, 1 Greek Royal Cuisine)
- 1 maintenance store
- Full operating hours
- Atlanta locations

### 002_seed_staff.sql

- 1 Super Admin
- 1 Compliance Officer
- 1 Store Manager
- 1 Kitchen Manager
- 1 Dispatcher
- 1 Inventory Manager
- Store access assignments
- Role assignments

---

## Performance Characteristics

### Expected Query Performance

| Query Type | Table | Index | Performance |
|------------|-------|-------|-------------|
| Get order by ID | orders | PK | <1ms |
| List orders by store+status | orders | idx_orders_store_status | <5ms |
| Get inventory by store | inventory_items | idx_inventory_store_id | <10ms |
| Low stock items | inventory_items | idx_inventory_low_stock | <5ms |
| Available drivers | drivers | idx_drivers_store_status | <5ms |
| Compliance events by entity | compliance_events | idx_compliance_events_entity | <50ms |
| Realtime metrics | metrics (view) | idx_metrics_realtime | <10ms |
| Full-text store search | stores | idx_stores_name_search | <50ms |

### Storage Estimates (1 year)

- **orders** + **order_items**: ~10GB (1M orders × 3 items avg)
- **compliance_events**: ~50GB (10M events with JSONB)
- **metrics**: ~5GB (time-series aggregations)
- **Total**: ~75-100GB with indexes

---

## Backup & Maintenance

### Recommended Schedule

- **Full backup**: Daily (off-peak hours)
- **Incremental backup**: Every 6 hours
- **WAL archiving**: Continuous
- **Retention**: 30 days

### Maintenance Tasks

- **VACUUM ANALYZE**: Weekly (all tables)
- **REINDEX**: Monthly (GIN indexes on large tables)
- **Partition old data**: Quarterly (compliance_events, metrics)

---

## Migration Execution

### Order of Execution

```bash
psql -d glenkeos < database/migrations/001_create_stores.sql
psql -d glenkeos < database/migrations/002_create_orders.sql
psql -d glenkeos < database/migrations/003_create_inventory.sql
psql -d glenkeos < database/migrations/004_create_drivers.sql
psql -d glenkeos < database/migrations/005_create_staff.sql
psql -d glenkeos < database/migrations/006_create_policies.sql
psql -d glenkeos < database/migrations/007_create_risk_events.sql
psql -d glenkeos < database/migrations/008_create_compliance_events.sql
psql -d glenkeos < database/migrations/009_create_metrics.sql
psql -d glenkeos < database/migrations/010_add_foreign_key_constraints.sql
```

### Seed Data

```bash
psql -d glenkeos < database/seeds/001_seed_stores.sql
psql -d glenkeos < database/seeds/002_seed_staff.sql
```

---

## Connection Requirements

- **PostgreSQL**: 14.0 or higher
- **Extensions**: uuid-ossp
- **User permissions**: CREATE TABLE, CREATE INDEX, CREATE TRIGGER, CREATE FUNCTION
- **Recommended**: Connection pooling (PgBouncer)
- **Max connections**: 100-200 (depending on load)

---

This schema is production-ready and optimized for the GlenKeos multi-entity restaurant ecosystem.
