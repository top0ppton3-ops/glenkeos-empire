# EVENT_TO_UI_PIPELINE.md

How events move from backend → bus → UI

## 1. Event Emitted

Backend emits event using envelope:

```json
{
  "id": "uuid",
  "type": "ORDER_STATUS_CHANGED",
  "entityType": "order",
  "entityId": "123",
  "timestamp": "ISO-8601",
  "metadata": {
    "oldStatus": "NEW",
    "newStatus": "IN_PROGRESS"
  }
}
```

## 2. Event Bus Receives

Conceptually:

- SNS/SQS
- or in-process emitter

## 3. Consumers Process

- Compliance logs
- Metrics aggregates
- Analytics stores
- WebSocket broadcaster prepares payload

## 4. WebSocket Push

UI receives:

```json
{
  "channel": "orders",
  "event": {
    "type": "ORDER_STATUS_CHANGED",
    "entityId": "123",
    "metadata": {
      "newStatus": "IN_PROGRESS"
    }
  }
}
```

## 5. UI Updates

React Query invalidates:

- useOrders()
- useOrder(id)

Components re-render:

- OrderCard
- KDSTile

## 6. Metrics Update

Events feed:

- KPITile
- MetricBlock
- Analytics charts
