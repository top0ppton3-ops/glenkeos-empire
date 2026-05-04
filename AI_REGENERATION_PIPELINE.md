# AI REGENERATION PIPELINE

**How AI Rebuilds the Entire GlenKeos Platform From Spec**

---

## 1. Purpose

The AI Regeneration Pipeline enables complete code regeneration from specification files. This ensures:

- No vendor lock-in
- Consistent implementation
- Spec-to-code alignment
- Reproducible builds

---

## 2. Inputs

AI receives the following authoritative sources:

### Specifications
- `/contracts/*.json` - Domain models (9 files)
- `/events/*.json` - Event schemas (8 files)
- `/openapi/glenkeos-api-v1.yaml` - REST API spec
- `/database/migrations/*.sql` - Database schema (10 files)
- `/docs/*.md` - Architecture & wiring (25+ files)

### Configuration
- Service boundaries
- Tech stack preferences
- Deployment targets

---

## 3. Pipeline Stages

### Stage 1: Parse

AI reads and validates:

- **Domain models** from contracts
- **Event schemas** from events
- **API endpoints** from OpenAPI
- **Database schema** from migrations
- **Service boundaries** from architecture docs

**Output:** Validated specification graph

---

### Stage 2: Generate Types

AI generates:

**Backend Types:**
```typescript
// From contracts/order.json
export interface Order {
  id: string;
  storeId: string;
  status: OrderStatus;
  items: OrderItem[];
  pricing: OrderPricing;
  // ... all fields from contract
}
```

**Event Types:**
```typescript
// From events/order-events.json
export interface OrderCreatedEvent extends EventEnvelope {
  type: 'ORDER_CREATED';
  entityType: 'order';
  metadata: {
    storeId: string;
    customerId: string;
    total: number;
  };
}
```

**Output:** Complete type system

---

### Stage 3: Generate Backend

AI generates for each service:

**Controllers:**
```typescript
// From openapi/glenkeos-api-v1.yaml
@Controller('/orders')
export class OrdersController {
  @Get('/')
  async listOrders(@Query() params: ListOrdersParams): Promise<OrdersResponse> {
    // Generated from OpenAPI spec
  }
  
  @Get('/:id')
  async getOrder(@Param('id') id: string): Promise<OrderResponse> {
    // Generated from OpenAPI spec
  }
}
```

**Services:**
```typescript
export class OrdersService {
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    // Business logic placeholder
    // Developer implements this
  }
}
```

**Repositories:**
```typescript
export class OrdersRepository {
  async findById(id: string): Promise<Order | null> {
    // Generated from database schema
  }
  
  async findByStoreId(storeId: string): Promise<Order[]> {
    // Generated from indexes
  }
}
```

**Output:** Complete backend scaffolding

---

### Stage 4: Generate Event System

AI generates:

**Event Producers:**
```typescript
export class OrderEventsProducer {
  async emitOrderCreated(order: Order, actorId: string): Promise<void> {
    const event: OrderCreatedEvent = {
      id: uuid(),
      type: 'ORDER_CREATED',
      entityType: 'order',
      entityId: order.id,
      timestamp: new Date().toISOString(),
      actorId,
      actorType: 'STAFF',
      metadata: {
        storeId: order.storeId,
        customerId: order.customerId,
        total: order.pricing.total
      },
      version: '1.0.0'
    };
    
    await this.eventBus.publish('orders', event);
  }
}
```

**Event Consumers:**
```typescript
export class ComplianceEventsConsumer {
  @EventHandler('ORDER_CREATED')
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    // Log to compliance_events table
  }
}
```

**Output:** Complete event system

---

### Stage 5: Generate Frontend

AI generates:

**API Client:**
```typescript
// From openapi/glenkeos-api-v1.yaml
export const ordersApi = {
  listOrders: (params?: ListOrdersParams) => 
    client.get<OrdersResponse>('/orders', { params }),
    
  getOrder: (id: string) => 
    client.get<OrderResponse>(`/orders/${id}`),
    
  createOrder: (data: CreateOrderRequest) => 
    client.post<OrderResponse>('/orders', data)
};
```

**React Query Hooks:**
```typescript
export function useOrders(params?: ListOrdersParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.listOrders(params)
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => 
      ordersApi.createOrder(data)
  });
}
```

**Base Components:**
```typescript
// From contracts/order.json shape
export const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <Card>
      <Text>Order {order.id}</Text>
      <Badge status={order.status} />
      <Text>${order.pricing.total}</Text>
    </Card>
  );
};
```

**Output:** Complete frontend layer

---

### Stage 6: Generate Tests

AI generates:

**Contract Tests:**
```typescript
describe('Order API Contract', () => {
  it('should match order contract', async () => {
    const response = await api.orders.get('ord_123');
    const valid = validateContract(response.data, orderContract);
    expect(valid).toBe(true);
  });
});
```

**Event Flow Tests:**
```typescript
describe('Order Events', () => {
  it('should emit ORDER_CREATED on order creation', async () => {
    const order = await ordersService.create(orderData);
    const event = await eventBus.waitForEvent('ORDER_CREATED');
    expect(event.entityId).toBe(order.id);
  });
});
```

**Output:** Complete test suites

---

### Stage 7: Generate Infrastructure

AI generates:

**Docker Compose:**
```yaml
services:
  orders-service:
    build: ./services/orders
    environment:
      DATABASE_URL: ${DATABASE_URL}
      EVENT_BUS_URL: ${EVENT_BUS_URL}
    depends_on:
      - postgres
      - redis
```

**Kubernetes Manifests:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: orders-service
        image: glenkeos/orders-service:latest
```

**Output:** Complete infrastructure as code

---

## 4. Regeneration Triggers

Regenerate when:

- A contract changes (data shape update)
- An event schema changes (new event or modified metadata)
- An endpoint changes (new route or modified parameters)
- A service boundary changes (new service or ownership change)
- Database schema changes (new table, index, or constraint)

---

## 5. Regeneration Safety Rules

### Protected Areas

**Never Overwrite:**
- Business logic implementations
- Custom validation rules
- Manual optimizations
- Test fixtures

**Always Regenerate:**
- Types
- Interfaces
- Base controllers
- Base repositories
- Event schemas
- API client

### Validation Steps

Before deploying regenerated code:

1. **Schema Validation** - Ensure all contracts valid
2. **Type Checking** - No TypeScript errors
3. **Contract Tests** - All contract tests pass
4. **Integration Tests** - Critical paths work
5. **Performance Tests** - No regressions

---

## 6. Regeneration Commands

### Full Regeneration

```bash
npm run regenerate:all
```

Regenerates:
- Types
- Controllers
- Repositories
- Event producers/consumers
- API client
- Hooks
- Base components
- Tests
- Infrastructure

### Partial Regeneration

```bash
# Types only
npm run regenerate:types

# Backend only
npm run regenerate:backend

# Frontend only
npm run regenerate:frontend

# Tests only
npm run regenerate:tests
```

---

## 7. AI Configuration

### Tech Stack

AI uses these technologies:

**Backend:**
- TypeScript
- Node.js
- Express / Fastify
- PostgreSQL
- Redis (event bus)

**Frontend:**
- TypeScript
- React
- React Query
- Tailwind CSS

**Infrastructure:**
- Docker
- Kubernetes
- GitHub Actions

### Code Style

AI generates code following:

- ESLint configuration
- Prettier configuration
- TypeScript strict mode
- Project conventions

---

## 8. Regeneration Workflow

```
┌─────────────────┐
│  Spec Changes   │
│  (contracts,    │
│   events, API)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Reads Spec  │
│  Validates      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Generates   │
│  Code           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │
│  Tests Run      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Manual Review  │
│  & Approval     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Commit &       │
│  Deploy         │
└─────────────────┘
```

---

## 9. Success Metrics

Regeneration is successful when:

- All types match contracts exactly
- All endpoints match OpenAPI spec exactly
- All events match event schemas exactly
- All tests pass
- No manual code overwritten
- No drift between spec and code
- System functions identically before/after

---

## 10. Maintenance

### Weekly

- Review regeneration logs
- Address any warnings
- Update AI configuration if needed

### Monthly

- Regenerate entire codebase
- Compare with current implementation
- Identify and fix drift

### Quarterly

- Update AI pipeline version
- Review and optimize generation templates
- Benchmark generation performance

---

**The AI Regeneration Pipeline ensures the platform remains spec-aligned and vendor-proof.**

**Regenerate frequently. Trust the spec.**
