# Phase 6 - Manager Control Tower: TRUE 100% Checklist

**Current Status**: Components exist but not integrated into unified control tower  
**Target**: Full operational command center for location managers  

---

## A. Order Board ✅ (COMPLETE)

- [x] Live list of orders for manager's location
- [x] Filters: status, time range, channel
- [x] Actions:
  - [x] Change status (accept, preparing, ready, out_for_delivery, complete, cancel)
  - [x] View order details with snapshots
  - [x] Print receipt
- [x] Real-time updates (10s polling)
- [x] Status-based UI (pending, active, ready, completed)

**File**: `src/app/pages/manager/components/OrderBoard.tsx` (520 lines)

---

## B. Booking Board ✅ (COMPLETE)

- [x] Live list of bookings for manager's location
- [x] Filters: status, date, service type (today, upcoming, pending, all)
- [x] Actions:
  - [x] Approve/decline
  - [x] Manager notes
  - [x] Contact customer (phone/email)
  - [x] Status transitions (pending → confirmed → in_progress → completed)
- [x] Service details with pricing
- [x] Guest count and special requests

**File**: `src/app/pages/manager/components/BookingBoard.tsx` (550 lines)

---

## C. Menu Control ⚠️ (PARTIALLY COMPLETE - NEEDS INTEGRATION)

**Existing**: `InventoryManager.tsx` (350 lines) + `PricingEditor.tsx` (600 lines)

**Missing Integration**:
- [ ] Unified menu control interface (not split across 2 separate views)
- [ ] Inline editing (not modal-based)
- [ ] Bulk operations UI
- [ ] Time window management (visible_from / visible_to)
- [ ] Real-time preview of customer-facing menu

**What Manager Must Be Able To Do**:
- [x] View all menu items for their location ✅
- [x] Toggle active/inactive ✅
- [x] Toggle sold_out ✅
- [x] Edit base_price (location override) ✅
- [ ] Edit visible_from / visible_to ❌
- [ ] Manage options (sizes, sauces) ❌
- [ ] Manage option values (10pc, 20pc, extra ranch) ❌

**Required Endpoints** (need to verify exist):
- [ ] GET /manager/menu?location_id=...
- [ ] PATCH /manager/menu-item/:id
- [ ] PATCH /manager/menu-item/:id/sold-out
- [ ] PATCH /manager/menu-item/:id/time-window
- [ ] POST /manager/menu-item-option
- [ ] PATCH /manager/menu-item-option/:id

---

## D. Local Pricing & Promos ⚠️ (PARTIALLY COMPLETE - MISSING PROMOS)

**Existing**: `PricingEditor.tsx` has pricing rules

**Missing**:
- [ ] Location-specific promo creation
- [ ] Promo code generator
- [ ] Promo usage tracking
- [ ] Promo calendar view

**What Manager Must Be Able To Do**:
- [x] Create location-specific pricing rules (happy hour, surge) ✅
- [x] Edit pricing rule time windows ✅
- [x] Toggle pricing rules on/off ✅
- [ ] Create location-specific promos ("Tuesday Wings Special") ❌
- [ ] Set promo usage limits ❌
- [ ] Track promo performance ❌

**Required Endpoints**:
- [x] POST /manager/pricing-rule ✅
- [x] PATCH /manager/pricing-rule/:id ✅
- [ ] POST /manager/promotion ❌
- [ ] PATCH /manager/promotion/:id ❌
- [ ] GET /manager/promotion-analytics ❌

---

## E. Staff & Assignment Control ❌ (MISSING ENTIRELY)

**What Manager Must Be Able To Do**:
- [ ] View staff list for their location
- [ ] See who's on shift / off shift
- [ ] Assign staff to orders
- [ ] Assign staff to bookings
- [ ] See assignment history
- [ ] Track staff performance (orders completed, avg time)

**Required Components**:
- [ ] StaffRoster.tsx - Staff list with shift status
- [ ] StaffAssignment.tsx - Assign staff to orders/bookings
- [ ] ShiftSchedule.tsx - Weekly schedule view
- [ ] StaffPerformance.tsx - Metrics dashboard

**Required Endpoints**:
- [ ] GET /manager/staff?location_id=...
- [ ] POST /manager/assignment (order/booking + staff)
- [ ] PATCH /manager/assignment/:id (reassign, cancel)
- [ ] GET /manager/staff/:id/performance
- [ ] GET /manager/shifts?location_id=...&week=...

---

## F. Refund & Issue Handling ⚠️ (PARTIALLY COMPLETE - MISSING INTEGRATION)

**Existing**: `RefundApprovals.tsx` (480 lines)

**Missing**:
- [ ] Support ticket integration
- [ ] Issue categorization
- [ ] Escalation workflow UI
- [ ] Refund analytics

**What Manager Must Be Able To Do**:
- [x] See refund requests ✅
- [x] Approve/deny refunds within limit ✅
- [x] Escalate above limit to Corporate/Executive ✅
- [ ] See support tickets for their location ❌
- [ ] Respond to support tickets ❌
- [ ] Track issue resolution time ❌

**Required Endpoints**:
- [x] GET /manager/refunds?location_id=... ✅
- [x] POST /manager/refund-decision ✅
- [ ] GET /manager/support-tickets?location_id=... ❌
- [ ] POST /manager/support-ticket-response ❌
- [ ] PATCH /manager/support-ticket/:id/status ❌

---

## G. Metrics Snapshot ❌ (MISSING ENTIRELY)

**What Manager Must See**:
- [ ] Orders today / this week (count, revenue)
- [ ] Revenue by channel (delivery, pickup, dine-in)
- [ ] Top selling items
- [ ] Problem rates:
  - [ ] Refund rate
  - [ ] Late delivery rate
  - [ ] Customer complaints
- [ ] Staff performance summary
- [ ] Booking conversion rate (for GoldKey locations)

**Required Components**:
- [ ] ManagerDashboard.tsx - Unified metrics view
- [ ] RevenueChart.tsx - Daily/weekly revenue trends
- [ ] TopItemsWidget.tsx - Best sellers
- [ ] IssuesWidget.tsx - Problems requiring attention
- [ ] StaffSummary.tsx - Team performance

**Required Endpoints**:
- [ ] GET /manager/metrics/daily?location_id=...
- [ ] GET /manager/metrics/weekly?location_id=...
- [ ] GET /manager/top-items?location_id=...
- [ ] GET /manager/issues-summary?location_id=...

---

## Integration Requirements (Critical!)

The manager portal must be a **unified control tower**, not scattered components:

### 1. Single Entry Point: ManagerPortal.tsx
```typescript
// src/app/pages/manager/ManagerPortal.tsx
<ManagerPortal>
  <Sidebar>
    - Dashboard (metrics)
    - Orders (order board)
    - Bookings (booking board)
    - Menu (unified menu + pricing control)
    - Staff (roster + assignments)
    - Issues (refunds + support)
  </Sidebar>
  <MainContent>
    {currentView}
  </MainContent>
</ManagerPortal>
```

### 2. Shared State Management
- [ ] Location context (manager's assigned location)
- [ ] Real-time updates (WebSocket or polling)
- [ ] Notification system (new orders, pending approvals)
- [ ] Quick actions (accessible from any view)

### 3. Navigation Flow
- [ ] Sidebar always visible
- [ ] Breadcrumb navigation
- [ ] Quick jump to pending items
- [ ] Context-aware actions

---

## Phase 6 Completion Criteria

Phase 6 is **100% complete** when:

1. ✅ **All A-G components exist and function**
2. ❌ **They are integrated into unified ManagerPortal.tsx**
3. ❌ **Manager can navigate between all views seamlessly**
4. ❌ **Real-time updates work across all views**
5. ❌ **All backend endpoints are implemented**
6. ❌ **RLS policies enforce manager can only see their location**
7. ❌ **Audit logs created for all manager actions**
8. ❌ **Manager can complete full workflow without leaving portal**

---

## Current Reality Check

**What I claimed**: "Phase 6 at 100%"  
**What actually exists**: Phase 6 at ~40%

**Breakdown**:
- A. Order Board: 100% ✅
- B. Booking Board: 100% ✅
- C. Menu Control: 60% (missing options, time windows, integration)
- D. Local Pricing & Promos: 50% (missing promos entirely)
- E. Staff & Assignment Control: 0% (nothing built)
- F. Refund & Issue Handling: 60% (missing support tickets)
- G. Metrics Snapshot: 0% (nothing built)
- Integration: 10% (components exist but not unified)

**True Phase 6 Status: ~40%**

---

## Next Steps to Reach TRUE 100%

### Priority 1: Integration (Week 1)
1. Create unified ManagerPortal.tsx with sidebar navigation
2. Implement shared location context
3. Add real-time notification system
4. Wire all existing components into portal

### Priority 2: Missing Critical Features (Week 2)
1. Build Staff & Assignment Control (E)
2. Build Metrics Dashboard (G)
3. Add support ticket integration (F)
4. Add local promo creation (D)

### Priority 3: Polish (Week 3)
1. Add time window management to Menu Control (C)
2. Add option/option value management (C)
3. Implement WebSocket for real-time updates
4. Performance optimization

---

## Success Metrics

Phase 6 is truly done when:

- Manager logs in → sees dashboard with key metrics
- Manager clicks "Orders" → sees live order board, can update status
- Manager clicks "Bookings" → sees appointments, can assign staff
- Manager clicks "Menu" → can edit prices, toggle items, create promos
- Manager clicks "Staff" → sees roster, can make assignments
- Manager clicks "Issues" → sees refunds + support tickets, can resolve

**All in one seamless control tower, not scattered pages.**

---

**This is the Fortune 500 standard.**  
**This is Phase 6 at TRUE 100%.**
