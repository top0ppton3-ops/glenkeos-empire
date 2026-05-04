# COMPONENT_DATA_FLOW_MAP.md

How JSON flows into components → pages → UI

## 1. Data Source → Hook → Component

### OrderCard

```
GET /orders → useOrders() → <OrderCard order={order} />
```

### KDSTile

```
GET /orders?status=IN_PROGRESS → useOrders() → <KDSTile order={order} />
```

### InventoryBlock

```
GET /inventory → useInventory() → <InventoryBlock item={item} />
```

### ComplianceBlock

```
GET /compliance/events → useComplianceEvents() → <ComplianceBlock event={event} />
```

### KPITile

```
GET /ops/metrics → useMetrics() → <KPITile metric={metric} />
```

## 2. Component → Page Composition

### Ops Dashboard

- KPITile
- OrderCardList
- KDSTileGrid
- InventoryBlockList

### KDS

- KDSTileGrid

### Inventory

- InventoryBlockList

### Compliance

- ComplianceTable
- ComplianceBlock

### Analytics

- KPITile
- Charts
- Tables

## 3. Event → UI Flow

Events update:

- OrderCard
- KDSTile
- InventoryBlock
- ComplianceBlock
