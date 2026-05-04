## Backend Service Architecture

Complete microservices architecture for GlenKeos backend.

---

## Architecture Overview

**Pattern:** Microservices with event-driven communication  
**API Gateway:** Single entry point for all clients  
**Event Bus:** Central message broker for domain events  
**Database:** PostgreSQL with per-service ownership  

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway                          │
│  - Authentication (JWT)                                 │
│  - Rate Limiting                                        │
│  - Request Routing                                      │
│  - Response Aggregation                                 │
└────────────┬────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────┐
             │              │              │              │
      ┌──────▼─────┐ ┌─────▼──────┐ ┌────▼──────┐ ┌────▼──────┐
      │  Stores    │ │  Orders    │ │ Inventory │ │  Drivers  │
      │  Service   │ │  Service   │ │  Service  │ │  Service  │
      └─────┬──────┘ └─────┬──────┘ └────┬──────┘ └────┬──────┘
            │              │              │              │
            └──────────────┴──────────────┴──────────────┘
                           │
                    ┌──────▼────────┐
                    │   Event Bus   │
                    │  (Redis/SNS)  │
                    └──────┬────────┘
                           │
            ┌──────────────┼──────────────┬──────────────┐
            │              │              │              │
      ┌─────▼──────┐ ┌────▼───────┐ ┌───▼────────┐ ┌──▼──────┐
      │Compliance  │ │  Metrics   │ │  WebSocket │ │  Staff  │
      │  Service   │ │  Service   │ │Broadcaster │ │ Service │
      └────────────┘ └────────────┘ └────────────┘ └─────────┘
```

---

## Service Catalog

### 1. Stores Service

**Responsibility:** Manage physical store locations

**Owns:**
- `stores` table

**Endpoints:**
- `GET /stores` - List stores
- `GET /stores/:id` - Get store details
- `POST /stores` - Create store
- `PATCH /stores/:id` - Update store

**Events Produced:**
- STORE_CREATED
- STORE_UPDATED
- STORE_STATUS_CHANGED

**Events Consumed:**
- None

**Dependencies:**
- None (foundational service)

---

### 2. Orders Service

**Responsibility:** Complete order lifecycle management

**Owns:**
- `orders` table
- `order_items` table

**Endpoints:**
- `GET /orders` - List orders (filtered by store, status, customer, driver)
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `PATCH /orders/:id` - Update order
- `PATCH /orders/:id/status` - Update order status
- `PATCH /orders/:id/assign-driver` - Assign driver to order

**Events Produced:**
- ORDER_CREATED
- ORDER_STATUS_CHANGED
- ORDER_ASSIGNED
- ORDER_CANCELLED
- ORDER_DELIVERED

**Events Consumed:**
- DRIVER_STATUS_CHANGED (for auto-assignment)
- INVENTORY_OUT_OF_STOCK (for order validation)

**Dependencies:**
- Stores Service (store validation)
- Drivers Service (driver assignment)
- Inventory Service (stock validation)

---

### 3. Inventory Service

**Responsibility:** Inventory tracking and threshold management

**Owns:**
- `inventory_items` table

**Endpoints:**
- `GET /inventory` - List inventory items
- `GET /inventory/:id` - Get inventory item
- `POST /inventory` - Create inventory item
- `PATCH /inventory/:id` - Update inventory item (quantity, threshold, etc.)

**Events Produced:**
- INVENTORY_CHANGED
- INVENTORY_LOW_STOCK
- INVENTORY_OUT_OF_STOCK
- INVENTORY_RESTOCKED

**Events Consumed:**
- ORDER_CREATED (to decrement stock)
- ORDER_CANCELLED (to restore stock)

**Dependencies:**
- Stores Service (store validation)

---

### 4. Drivers Service

**Responsibility:** Driver management and real-time tracking

**Owns:**
- `drivers` table

**Endpoints:**
- `GET /drivers` - List drivers
- `GET /drivers/:id` - Get driver details
- `POST /drivers` - Create driver
- `PATCH /drivers/:id` - Update driver
- `PATCH /drivers/:id/status` - Update driver status
- `PATCH /drivers/:id/location` - Update GPS location

**Events Produced:**
- DRIVER_STATUS_CHANGED
- DRIVER_LOCATION_UPDATED
- DRIVER_ASSIGNED_ORDER
- DRIVER_COMPLETED_ORDER

**Events Consumed:**
- ORDER_STATUS_CHANGED (when order is DELIVERED, free up driver)

**Dependencies:**
- Stores Service (store validation)
- Orders Service (order assignment)

---

### 5. Staff Service

**Responsibility:** Staff authentication, authorization, and RBAC

**Owns:**
- `staff` table
- `staff_roles` table
- `staff_store_access` table

**Endpoints:**
- `POST /staff/login` - Authenticate staff
- `POST /staff/logout` - Logout staff
- `POST /staff/refresh` - Refresh JWT token
- `GET /staff` - List staff
- `GET /staff/:id` - Get staff details
- `POST /staff` - Create staff member
- `PATCH /staff/:id` - Update staff member
- `PATCH /staff/:id/roles` - Update roles
- `PATCH /staff/:id/stores` - Update store access

**Events Produced:**
- STAFF_CREATED
- STAFF_UPDATED
- ROLE_CHANGED
- ACCESS_GRANTED
- ACCESS_REVOKED

**Events Consumed:**
- None

**Dependencies:**
- None (foundational service)

---

### 6. Policies Service

**Responsibility:** Governance policy management and versioning

**Owns:**
- `policies` table
- `policy_acknowledgments` table

**Endpoints:**
- `GET /policies` - List policies
- `GET /policies/:id` - Get policy details
- `POST /policies` - Create policy
- `PATCH /policies/:id` - Update policy
- `POST /policies/:id/approve` - Approve policy
- `POST /policies/:id/acknowledge` - Staff acknowledges policy

**Events Produced:**
- POLICY_CREATED
- POLICY_UPDATED
- POLICY_APPROVED
- POLICY_ARCHIVED

**Events Consumed:**
- None

**Dependencies:**
- Staff Service (approval workflow)

---

### 7. Risk Service

**Responsibility:** Risk event monitoring and mitigation

**Owns:**
- `risk_events` table
- `risk_event_notes` table

**Endpoints:**
- `GET /risk/events` - List risk events
- `GET /risk/events/:id` - Get risk event details
- `POST /risk/events` - Create risk event
- `PATCH /risk/events/:id` - Update risk event
- `POST /risk/events/:id/notes` - Add note to risk event

**Events Produced:**
- RISK_EVENT_CREATED
- RISK_EVENT_UPDATED
- RISK_EVENT_ASSIGNED
- RISK_EVENT_RESOLVED

**Events Consumed:**
- ORDER_CREATED (risk scoring)
- ORDER_STATUS_CHANGED (high-value order monitoring)
- INVENTORY_OUT_OF_STOCK (operational risk)

**Dependencies:**
- Staff Service (assignment)

---

### 8. Compliance Service

**Responsibility:** Immutable audit trail for all compliance-relevant events

**Owns:**
- `compliance_events` table

**Endpoints:**
- `GET /compliance/events` - List compliance events (audit log)
- `GET /compliance/events/:id` - Get compliance event details
- `POST /compliance/events` - Log compliance event (system-triggered)

**Events Produced:**
- COMPLIANCE_EVENT (system-wide broadcast)

**Events Consumed:**
- **ALL EVENTS** (listens to entire event bus, logs relevant events)

**Dependencies:**
- All services (consumes events from all)

---

### 9. Metrics Service

**Responsibility:** Operational metrics computation and aggregation

**Owns:**
- `metrics` table

**Endpoints:**
- `GET /metrics` - Get metrics (filtered by store, type, dimension, period)

**Events Produced:**
- None (read-only service)

**Events Consumed:**
- **ALL EVENTS** (consumes all events to compute metrics)

**Dependencies:**
- All services (aggregates data from all)

---

## Cross-Cutting Concerns

### API Gateway

**Responsibilities:**
- JWT authentication
- Rate limiting (per IP, client_id, user_id)
- Request routing to services
- Response aggregation
- CORS handling
- Request/response logging

**Technology:** Kong / AWS API Gateway / Nginx

---

### Event Bus

**Responsibilities:**
- Event publishing (producers)
- Event routing (topics/channels)
- Event consumption (subscribers)
- Message persistence
- Dead letter queue for failed events

**Technology:** Redis Pub/Sub / RabbitMQ / AWS SNS+SQS

**Event Envelope:**
```json
{
  "id": "uuid",
  "type": "EVENT_TYPE",
  "entityType": "order",
  "entityId": "ord_123",
  "timestamp": "2026-04-16T10:30:00Z",
  "actorId": "staff_123",
  "actorType": "STAFF",
  "metadata": {},
  "version": "1.0.0",
  "correlationId": "uuid"
}
```

---

### WebSocket Broadcaster

**Responsibilities:**
- Listen to event bus
- Push events to connected frontend clients
- Manage WebSocket connections
- Channel-based subscriptions (orders, inventory, drivers, etc.)

**Technology:** Socket.io / ws / AWS AppSync

**Channels:**
- `orders` - Order lifecycle events
- `inventory` - Inventory changes
- `drivers` - Driver status/location updates
- `compliance` - Compliance events
- `risk` - Risk events

---

## Communication Patterns

### Synchronous (REST)

**When to Use:**
- Client → Service requests (all CRUD operations)
- Service → Service (only when absolutely necessary)

**Pattern:**
```
Frontend → API Gateway → Service → Database → Response
```

---

### Asynchronous (Events)

**When to Use:**
- State changes that other services care about
- Audit trail logging
- Metrics computation
- Real-time UI updates

**Pattern:**
```
Service → Event Bus → [Compliance, Metrics, WebSocket, Other Services]
```

---

## Service-to-Service Communication

### Principle: Minimize Direct Calls

**Preferred:** Event-driven communication  
**Acceptable:** REST calls only when synchronous response needed

### When Direct Calls Are OK

1. **Validation** - Check if store exists before creating order
2. **Lookup** - Get driver details when assigning order
3. **Enrichment** - Fetch store info to include in response

### When Events Are Required

1. **State changes** - Order status changed → notify all listeners
2. **Audit trail** - All actions → compliance service
3. **Metrics** - All events → metrics service
4. **Real-time updates** - All events → WebSocket broadcaster

---

## Service Deployment

### Container Strategy

Each service is a separate Docker container:

```
glenkeos/
├── stores-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── orders-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── ...
```

### Environment Variables (Per Service)

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/glenkeos

# Service
SERVICE_NAME=orders-service
SERVICE_PORT=3001

# Event Bus
EVENT_BUS_URL=redis://localhost:6379
EVENT_BUS_TOPICS=order.*,inventory.*

# API Gateway
INTERNAL_API_KEY=secret

# Observability
LOG_LEVEL=info
SENTRY_DSN=https://...
```

---

## Data Ownership & Boundaries

### Strict Table Ownership

- **orders-service** owns `orders`, `order_items` (full CRUD)
- **inventory-service** owns `inventory_items` (full CRUD)
- **drivers-service** owns `drivers` (full CRUD)
- Other services **read-only** via REST API calls

### Cross-Service Queries

**Anti-Pattern:** Direct database access across services  
**Pattern:** REST API calls or event-driven eventual consistency

**Example:**
```typescript
// ❌ WRONG: orders-service directly queries drivers table
const driver = await db.query('SELECT * FROM drivers WHERE id = $1', [driverId]);

// ✅ CORRECT: orders-service calls drivers-service API
const driver = await driversServiceClient.get(`/drivers/${driverId}`);
```

---

## Scaling Strategy

### Horizontal Scaling

**Stateless Services** (can scale infinitely):
- Stores Service
- Orders Service
- Inventory Service
- Drivers Service
- Staff Service
- Policies Service
- Risk Service

**Stateful Services** (require coordination):
- WebSocket Broadcaster (sticky sessions)

### Vertical Scaling

**Database:**
- Read replicas for heavy read services (Metrics)
- Connection pooling (PgBouncer)
- Partitioning (compliance_events, metrics)

**Event Bus:**
- Sharding by topic
- Clustering (Redis Cluster / RabbitMQ Cluster)

---

## Monitoring & Observability

### Per-Service Metrics

- Request count (by endpoint, status code)
- Response time (p50, p95, p99)
- Error rate
- Database query time
- Event processing lag

### System-Wide Metrics

- Total orders/hour
- Average order prep time
- Driver utilization
- Inventory stockout rate
- Compliance event volume

### Logging

**Structured JSON logs:**
```json
{
  "timestamp": "2026-04-16T10:30:00Z",
  "level": "info",
  "service": "orders-service",
  "traceId": "uuid",
  "message": "Order created",
  "orderId": "ord_123",
  "storeId": "store_001"
}
```

### Distributed Tracing

- Trace ID propagation across services
- OpenTelemetry / Jaeger
- Span per service call + database query

---

## Security

### Authentication

- **API Gateway** validates JWT on all requests
- **Services** trust gateway, read claims from headers (`X-User-Id`, `X-User-Roles`)

### Authorization

- **API Gateway** enforces basic role checks
- **Services** enforce fine-grained RBAC using `staff_roles` table

### Inter-Service Auth

- Internal API key for service-to-service calls
- Mutual TLS (mTLS) for production

---

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid JWT)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (duplicate/constraint violation)
- `500` - Internal server error

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_ORDER_STATUS",
    "message": "Cannot transition from DELIVERED to IN_PREP",
    "details": {
      "currentStatus": "DELIVERED",
      "requestedStatus": "IN_PREP"
    }
  }
}
```

---

## Testing Strategy

### Unit Tests

- Pure functions
- Business logic
- Validation rules

### Integration Tests

- API endpoint tests
- Database queries
- Event producers

### Contract Tests

- Service-to-service API contracts
- Event schema validation

### End-to-End Tests

- Full user workflows
- Multi-service interactions

---

This architecture is production-ready and scales to millions of orders per day.
