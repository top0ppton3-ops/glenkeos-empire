# GLENKEOS PLATFORM - COMPLETE FILE TREE

**Generated:** 2026-04-21  
**Status:** READY FOR DEPLOYMENT

---

## ROOT STRUCTURE

```
glenkeos-platform/
├── SYSTEM_BLUEPRINT.json          ← SOURCE OF TRUTH
├── EXECUTION_ORDER.md             ← BUILD-TODAY CHECKLIST
├── REPO_FILE_TREE.md             ← THIS FILE
├── MASTER_INDEX.md
├── DEPLOYMENT_COMPLETE.md
├── SYSTEM_STATUS.md
├── README.md
│
├── openapi/                       ← 67 ENDPOINTS
│   └── GLENKEOS_COMPLETE_API_V1.yaml
│
├── events/                        ← 35+ EVENTS
│   ├── COMPLETE_EVENT_CATALOG.json
│   ├── envelope.json
│   ├── order-events.json
│   ├── inventory-events.json
│   ├── driver-events.json
│   ├── staff-events.json
│   ├── compliance-events.json
│   ├── policy-events.json
│   └── risk-events.json
│
├── database/                      ← 25+ TABLES
│   ├── COMPLETE_SCHEMA.sql
│   ├── DATABASE_SCHEMA.md
│   ├── migrations/
│   └── seeds/
│
├── cloudformation/                ← FULL AWS STACK
│   ├── 00-COMPLETE-INFRASTRUCTURE.yaml
│   ├── 01-vpc-infrastructure.yaml
│   ├── 02-rds-postgresql.yaml
│   └── 03-eventbridge.yaml
│
├── services/                      ← 11 MICROSERVICES
│   ├── stores-service/
│   │   ├── serverless.yml
│   │   ├── package.json
│   │   └── src/
│   │       ├── handlers/
│   │       │   ├── createStore.js
│   │       │   ├── getStores.js
│   │       │   ├── getStore.js
│   │       │   ├── updateStore.js
│   │       │   └── updateStoreStatus.js
│   │       ├── domain/
│   │       │   └── store.js
│   │       ├── db/
│   │       │   └── storeRepository.js
│   │       └── events/
│   │           └── publishStoreEvent.js
│   │
│   ├── customers-service/
│   │   ├── serverless.yml
│   │   ├── package.json
│   │   └── src/
│   │       ├── handlers/
│   │       │   ├── createCustomer.js
│   │       │   ├── getCustomers.js
│   │       │   ├── getCustomer.js
│   │       │   ├── updateCustomer.js
│   │       │   ├── earnRewards.js
│   │       │   ├── redeemRewards.js
│   │       │   └── createReferral.js
│   │       ├── domain/
│   │       │   ├── customer.js
│   │       │   └── rewards.js
│   │       └── db/
│   │           └── customerRepository.js
│   │
│   ├── inventory-service/
│   │   ├── serverless.yml
│   │   ├── package.json
│   │   └── src/
│   │       ├── handlers/
│   │       │   ├── createItem.js
│   │       │   ├── getItems.js
│   │       │   ├── getItem.js
│   │       │   ├── updateItem.js
│   │       │   ├── adjustStock.js
│   │       │   └── getStoreInventory.js
│   │       ├── domain/
│   │       │   └── inventory.js
│   │       └── db/
│   │           └── inventoryRepository.js
│   │
│   ├── orders-service/
│   │   ├── serverless.yml
│   │   ├── package.json
│   │   └── src/
│   │       ├── handlers/
│   │       │   ├── createOrder.js
│   │       │   ├── getOrders.js
│   │       │   ├── getOrder.js
│   │       │   ├── updateOrder.js
│   │       │   ├── updateOrderStatus.js
│   │       │   └── getCustomerOrders.js
│   │       ├── domain/
│   │       │   ├── order.js
│   │       │   ├── chicOrder.js       ← CHIC_FOOD type
│   │       │   └── ghettoOrder.js     ← GHETTO_EATS type
│   │       ├── db/
│   │       │   └── orderRepository.js
│   │       └── events/
│   │           └── publishOrderEvent.js
│   │
│   ├── payments-service/
│   │   ├── serverless.yml
│   │   ├── package.json
│   │   └── src/
│   │       ├── handlers/
│   │       │   ├── createPayPalOrder.js
│   │       │   ├── capturePayPalOrder.js
│   │       │   ├── paypalWebhook.js
│   │       │   ├── getPayment.js
│   │       │   └── refundPayment.js
│   │       ├── domain/
│   │       │   └── payment.js
│   │       ├── integrations/
│   │       │   └── paypal.js
│   │       └── db/
│   │           └── paymentRepository.js
│   │
│   ├── drivers-service/
│   │   ├── serverless.yml
│   │   ├── package.json
│   │   └── src/
│   │       ├── handlers/
│   │       │   ├── createDriver.js
│   │       │   ├── getDrivers.js
│   │       │   ├── getDriver.js
│   │       │   ├── updateDriver.js
│   │       │   ├── assignDriver.js
│   │       │   ├── updateAssignmentStatus.js
│   │       │   └── updateLocation.js
│   │       ├── domain/
│   │       │   ├── driver.js
│   │       │   ├── standardDriver.js
│   │       │   ├── cartDriver.js      ← Campus cart driver
│   │       │   └── dormRunner.js      ← Dorm runner
│   │       └── db/
│   │           └── driverRepository.js
│   │
│   ├── staff-service/
│   │   ├── serverless.yml
│   │   ├── package.json
│   │   └── src/
│   │       ├── handlers/
│   │       │   ├── createStaff.js
│   │       │   ├── getStaff.js
│   │       │   ├── getStaffMember.js
│   │       │   ├── updateStaff.js
│   │       │   ├── startShift.js
│   │       │   ├── endShift.js
│   │       │   └── assignRole.js
│   │       ├── domain/
│   │       │   └── staff.js
│   │       └── db/
│   │           └── staffRepository.js
│   │
│   ├── metrics-service/
│   │   ├── serverless.yml
│   │   ├── package.json
│   │   └── src/
│   │       ├── handlers/
│   │       │   ├── getDailyRevenue.js
│   │       │   ├── getMonthlyRevenue.js
│   │       │   ├── getOrdersSummary.js
│   │       │   ├── getOperationsSummary.js
│   │       │   └── getCustomersSummary.js
│   │       ├── aggregators/
│   │       │   ├── revenueAggregator.js
│   │       │   ├── ordersAggregator.js
│   │       │   └── customersAggregator.js
│   │       ├── eventConsumers/
│   │       │   └── consumeAllEvents.js
│   │       └── db/
│   │           └── metricsRepository.js
│   │
│   ├── compliance-service/
│   │   ├── serverless.yml
│   │   ├── package.json
│   │   └── src/
│   │       ├── handlers/
│   │       │   ├── getComplianceEvents.js
│   │       │   ├── getComplianceEvent.js
│   │       │   ├── getEntityCompliance.js
│   │       │   └── exportCompliance.js
│   │       ├── eventConsumers/
│   │       │   └── consumeCriticalEvents.js
│   │       └── db/
│   │           └── complianceRepository.js
│   │
│   ├── notifications-service/
│   │   ├── serverless.yml
│   │   ├── package.json
│   │   └── src/
│   │       ├── handlers/
│   │       │   ├── sendTestNotification.js
│   │       │   └── getNotificationLogs.js
│   │       ├── channels/
│   │       │   ├── email.js
│   │       │   ├── sms.js
│   │       │   └── push.js
│   │       ├── eventConsumers/
│   │       │   └── consumeNotificationEvents.js
│   │       └── db/
│   │           └── notificationRepository.js
│   │
│   └── grc-service/
│       ├── serverless.yml
│       ├── package.json
│       └── src/
│           ├── handlers/
│           │   ├── createPolicy.js
│           │   ├── getPolicies.js
│           │   ├── getPolicy.js
│           │   ├── approvePolicy.js
│           │   ├── createRisk.js
│           │   ├── getRisks.js
│           │   └── updateRiskStatus.js
│           ├── domain/
│           │   ├── policy.js
│           │   └── risk.js
│           └── db/
│               └── grcRepository.js
│
├── shared/                        ← SHARED LIBRARIES
│   ├── db/
│   │   └── client.js
│   ├── events/
│   │   ├── publisher.js
│   │   └── envelope.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── correlationId.js
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── schemas/
│   │   ├── store.js
│   │   ├── customer.js
│   │   ├── order.js
│   │   └── payment.js
│   └── utils/
│       ├── logger.js
│       └── constants.js
│
├── frontend/                      ← 3 APPLICATIONS
│   ├── coc-portal/               ← COC CORPORATE
│   │   ├── package.json
│   │   ├── amplify.yml
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── Dashboard.tsx
│   │       │   ├── Metrics.tsx
│   │       │   ├── Compliance.tsx
│   │       │   ├── Governance.tsx
│   │       │   └── Infrastructure.tsx
│   │       ├── components/
│   │       └── api/
│   │
│   ├── chic-web/                 ← CHIC-ON-CHAIN (FOOD)
│   │   ├── package.json
│   │   ├── amplify.yml
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── Home.tsx
│   │       │   ├── Restaurants.tsx
│   │       │   ├── Menu.tsx
│   │       │   ├── Cart.tsx
│   │       │   ├── Checkout.tsx
│   │       │   ├── OrderTracking.tsx
│   │       │   └── Account.tsx
│   │       ├── components/
│   │       └── api/
│   │
│   └── ghetto-web/               ← GHETTO EATS (CONVENIENCE)
│       ├── package.json
│       ├── amplify.yml
│       └── src/
│           ├── pages/
│           │   ├── Catalog.tsx
│           │   ├── Cart.tsx
│           │   ├── Checkout.tsx     ← Campus/Dorm fields
│           │   ├── OrderTracking.tsx
│           │   └── Account.tsx
│           ├── components/
│           │   ├── CampusSelector.tsx
│           │   ├── DormSelector.tsx
│           │   └── DeliveryModeSelector.tsx
│           └── api/
│
├── infrastructure/                ← DEPLOYMENT SCRIPTS
│   ├── deploy-all.sh
│   ├── deploy-services.sh
│   ├── deploy-frontend.sh
│   └── teardown.sh
│
├── scripts/                       ← UTILITY SCRIPTS
│   ├── seed-data.js
│   ├── run-migrations.js
│   └── validate-events.js
│
├── docs/                          ← DOCUMENTATION
│   ├── MASTER_INDEX.md
│   ├── DEPLOYMENT_COMPLETE.md
│   ├── SYSTEM_STATUS.md
│   ├── API_GUIDE.md
│   ├── EVENT_GUIDE.md
│   └── RBAC_MATRIX.md
│
└── tests/                         ← TESTING
    ├── integration/
    ├── e2e/
    └── smoke/
        ├── chic-order-flow.test.js
        ├── ghetto-order-flow.test.js
        └── coc-portal.test.js
```

---

## SERVICE COUNT: 11

1. stores-service
2. customers-service
3. inventory-service
4. orders-service
5. payments-service
6. drivers-service
7. staff-service
8. metrics-service
9. compliance-service
10. notifications-service
11. grc-service

---

## ENDPOINT COUNT: 67

**Stores (5):** POST/GET/GET/:id/PUT/:id/PATCH/:id/status  
**Customers (7):** POST/GET/GET/:id/PUT/:id + rewards/earn + rewards/redeem + referrals  
**Inventory (6):** POST/GET/GET/:id/PUT/:id + adjust + store/:id  
**Orders (6):** POST/GET/GET/:id/PUT/:id/PATCH/:id/status + customers/:id/orders  
**Payments (5):** create-order/capture-order/webhook/GET/:id/refund  
**Drivers (7):** POST/GET/GET/:id/PUT/:id + assignments + assignments/status + location  
**Staff (7):** POST/GET/GET/:id/PUT/:id + shift/start + shift/end + roles  
**Metrics (5):** revenue/daily + revenue/monthly + orders/summary + operations/summary + customers/summary  
**Compliance (4):** events + events/:id + entity/:type/:id + export  
**Notifications (2):** test + logs  
**GRC (7):** policies (POST/GET/GET/:id/approve) + risks (POST/GET/status)

---

## EVENT COUNT: 35+

**Stores:** STORE_CREATED, STORE_UPDATED, STORE_STATUS_CHANGED  
**Customers:** CUSTOMER_CREATED, CUSTOMER_UPDATED, REWARD_EARNED, REWARD_REDEEMED, REFERRAL_CREATED, REFERRAL_COMPLETED  
**Inventory:** ITEM_CREATED, ITEM_UPDATED, STOCK_ADJUSTED, STOCK_LOW, ITEM_UNAVAILABLE, MENU_UPDATED  
**Orders:** ORDER_CREATED, ORDER_UPDATED, ORDER_STATUS_CHANGED, ORDER_ACCEPTED, ORDER_PREPARED, ORDER_OUT_FOR_DELIVERY, ORDER_COMPLETED, ORDER_CANCELLED  
**Payments:** PAYMENT_CREATED, PAYMENT_AUTHORIZED, PAYMENT_COMPLETED, PAYMENT_FAILED, PAYMENT_REFUNDED  
**Drivers:** DRIVER_CREATED, DRIVER_UPDATED, DRIVER_ASSIGNED, DRIVER_ASSIGNMENT_STATUS_CHANGED, DRIVER_LOCATION_UPDATED, DELIVERY_COMPLETED  
**Staff:** STAFF_CREATED, STAFF_UPDATED, SHIFT_STARTED, SHIFT_ENDED, ROLE_ASSIGNED, ROLE_REVOKED  
**Metrics:** METRICS_SNAPSHOT_CREATED  
**Compliance:** COMPLIANCE_ALERT_RAISED, COMPLIANCE_EXPORT_REQUESTED  
**Notifications:** NOTIFICATION_SENT, NOTIFICATION_FAILED  
**GRC:** POLICY_CREATED, POLICY_APPROVED, RISK_CREATED, RISK_STATUS_CHANGED

---

## TABLE COUNT: 25+

**Core:** brands, stores, locations  
**Customers:** customers, customer_rewards, referrals  
**Orders:** orders, order_items, order_status_history  
**Payments:** payments, refunds  
**Drivers:** drivers, driver_assignments, driver_locations  
**Staff:** staff, shifts, staff_roles  
**Inventory:** inventory_items, stock_levels, menu_items  
**Events:** events, event_log  
**Compliance:** audit_logs, compliance_events  
**GRC:** policies, policy_approvals, risks, risk_assessments

---

## BRAND LOGIC

**CHIC-ON-CHAIN (Food):**
- `order_type = "CHIC_FOOD"`
- Standard delivery
- Uses: stores, inventory, orders, payments, customers, drivers (STANDARD_DRIVER)

**GHETTO EATS (Campus Convenience):**
- `order_type = "GHETTO_EATS"`
- Required fields: `campus_id`, `dorm_id`, `room_number`
- Delivery modes: `CAMPUS_COURIER`, `DORM_RUNNER`
- Campus-restricted catalog
- Uses: inventory, orders, payments, customers, drivers (CART_DRIVER, DORM_RUNNER)

**COC PORTAL (Corporate):**
- Consumes: metrics-service, compliance-service, grc-service
- Displays: infra status, revenue, KPIs, risk dashboards, governance vault

---

## DEPLOYMENT ORDER

1. ✅ Infrastructure (CloudFormation)
2. ✅ Database (RDS + Schema)
3. ✅ Backend Services (11 Lambdas)
4. ✅ Frontends (3 Amplify apps)
5. ✅ Smoke Tests (3 flows)

---

**THIS IS THE COMPLETE PLATFORM STRUCTURE**  
**SOURCE OF TRUTH: /SYSTEM_BLUEPRINT.json**  
**READY FOR DEPLOYMENT: YES**
