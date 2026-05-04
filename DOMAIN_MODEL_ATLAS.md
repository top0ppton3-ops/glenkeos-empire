# DOMAIN_MODEL_ATLAS.md

## 1. Orders domain

- **Entities:** Order, OrderItem
- **Key fields:** status, storeId, items, driverId, timestamps
- **Relationships:** Order → OrderItem[], Order → Driver?

## 2. Inventory domain

- **Entities:** InventoryItem
- **Key fields:** sku, quantity, threshold, status
- **Relationships:** InventoryItem → Store

## 3. Drivers domain

- **Entities:** Driver
- **Key fields:** status, vehicleType, storeId
- **Relationships:** Driver → Store, Driver → Order[]

## 4. Staff domain

- **Entities:** Staff, Role
- **Key fields:** email, roles[]
- **Relationships:** Staff → Role[]

## 5. Policies domain

- **Entities:** Policy, PolicyVersion (conceptual)
- **Key fields:** name, version, category, content
- **Relationships:** Policy → PolicyVersion[]

## 6. Risk domain

- **Entities:** RiskEvent
- **Key fields:** severity, status, entityType, entityId
- **Relationships:** RiskEvent → Entity, RiskEvent → Staff?

## 7. Compliance domain

- **Entities:** ComplianceEvent
- **Key fields:** type, actorId, entityType, entityId, timestamp
- **Relationships:** ComplianceEvent → Staff, ComplianceEvent → Entity

This atlas is the **map**; the JSON in `contracts/` is the **truth**.
