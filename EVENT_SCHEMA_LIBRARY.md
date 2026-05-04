# EVENT_SCHEMA_LIBRARY.md

The conceptual library of all event JSON schemas

## 1. Universal Event Envelope

All events extend this:

```json
{
  "id": "uuid",
  "type": "string",
  "entityType": "string",
  "entityId": "string",
  "timestamp": "ISO-8601",
  "actorId": "string?",
  "metadata": {}
}
```

## 2. Order Events

```json
{
  "type": "ORDER_CREATED",
  "entityType": "order",
  "metadata": {
    "storeId": "string",
    "items": []
  }
}
```

```json
{
  "type": "ORDER_STATUS_CHANGED",
  "entityType": "order",
  "metadata": {
    "oldStatus": "string",
    "newStatus": "string"
  }
}
```

## 3. Inventory Events

```json
{
  "type": "INVENTORY_CHANGED",
  "entityType": "inventoryItem",
  "metadata": {
    "oldQuantity": 0,
    "newQuantity": 0
  }
}
```

## 4. Policy Events

```json
{
  "type": "POLICY_UPDATED",
  "entityType": "policy",
  "metadata": {
    "version": "string"
  }
}
```

## 5. Risk Events

```json
{
  "type": "RISK_EVENT_CREATED",
  "entityType": "riskEvent",
  "metadata": {
    "severity": "string"
  }
}
```

```json
{
  "type": "RISK_EVENT_UPDATED",
  "entityType": "riskEvent",
  "metadata": {
    "oldStatus": "string",
    "newStatus": "string"
  }
}
```

## 6. Compliance Events

```json
{
  "type": "COMPLIANCE_EVENT",
  "entityType": "complianceEvent",
  "metadata": {
    "action": "string",
    "details": {}
  }
}
```

## 7. WebSocket Push Events

UI receives:

```json
{
  "channel": "orders",
  "event": { ... }
}
```

```json
{
  "channel": "inventory",
  "event": { ... }
}
```

```json
{
  "channel": "compliance",
  "event": { ... }
}
```

This is the **AI-ready JSON spine** for full implementation.
