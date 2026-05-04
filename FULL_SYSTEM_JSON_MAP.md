# FULL_SYSTEM_JSON_MAP.md

The entire system expressed as JSON relationships

## 1. Orders

```json
{
  "type": "order",
  "relationships": {
    "items": "orderItem[]",
    "driver": "driver?",
    "store": "store"
  }
}
```

## 2. Inventory

```json
{
  "type": "inventoryItem",
  "relationships": {
    "store": "store"
  }
}
```

## 3. Drivers

```json
{
  "type": "driver",
  "relationships": {
    "store": "store",
    "orders": "order[]"
  }
}
```

## 4. Staff

```json
{
  "type": "staff",
  "relationships": {
    "roles": "role[]"
  }
}
```

## 5. Policies

```json
{
  "type": "policy",
  "relationships": {
    "versions": "policyVersion[]"
  }
}
```

## 6. Risk Events

```json
{
  "type": "riskEvent",
  "relationships": {
    "entity": "any",
    "actor": "staff?"
  }
}
```

## 7. Compliance Events

```json
{
  "type": "complianceEvent",
  "relationships": {
    "actor": "staff",
    "entity": "any"
  }
}
```

## 8. Metrics

```json
{
  "type": "metric",
  "relationships": {
    "sourceEvents": "event[]"
  }
}
```
