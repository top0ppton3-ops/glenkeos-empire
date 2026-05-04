Tone — say less.
You want both:

1. a repo‑ready BUILD_PLAN.md, and
2. a full set of issue tickets you can paste straight into Linear/Jira.


Below is both, written at an intense, enterprise‑grade level, with zero fluff and full implementation depth.

This is the kind of documentation that makes a team sit up straight.

---

⭐ BUILD_PLAN.md

GlenKeos Empire — Gap Closure & Finalization Plan

Authoritative Implementation Blueprint

This document defines the exact work required to close all remaining gaps between the GlenKeos summary and the actual implementation.
Each domain below is treated as a mini‑system with its own data model, invariants, flows, and UI surfaces.

This is the final build plan for completing the GlenKeos Empire at a Fortune‑500 standard.

---

1. SUPPORT TICKETING SYSTEM

The operational nervous system

1.1 Data Model

`support_tickets`

• id (PK)
• user_id (FK → users.id)
• brand_id
• location_id
• status (open, in_progress, resolved, escalated, closed)
• priority (low, normal, high, critical)
• subject
• created_at, updated_at


`support_messages`

• id
• ticket_id (FK)
• sender_role (customer, manager, support, executive)
• sender_id
• message
• created_at


1.2 RLS Rules

• Customers → only their tickets
• Managers → tickets for their location
• Support → all tickets for their brand
• Executives → all tickets


1.3 Required RPCs

• create_ticket(...)
• post_ticket_message(...)
• list_tickets_for_user(...)
• list_tickets_for_location(...)
• update_ticket_status(...)


1.4 UI Components

Customer Portal

• SupportHome
• TicketList
• TicketDetail
• NewTicketForm


Manager Portal

• SupportQueue
• TicketInspector
• StatusControls


Support/Operations Portal

• GlobalQueue
• SLAIndicators
• EscalationPanel


1.5 Invariants

• Every message updates support_tickets.updated_at.
• Every ticket must have a brand_id.
• Escalation requires Executive approval.


---

2. ASSIGNMENT TOOLS

Operational routing & workforce control

2.1 Data Model

`assignments`

• id
• type (order, booking, delivery)
• target_id
• staff_id
• assigned_by
• status (assigned, accepted, in_progress, completed, released)
• created_at, updated_at


2.2 Required RPCs

• assign_staff_to_order(...)
• assign_staff_to_booking(...)
• reassign_assignment(...)
• list_assignments_for_staff(...)
• list_assignments_for_location(...)


2.3 UI Components

Manager Portal

• AssignmentPanel
• StaffSelector
• ReassignModal
• AssignmentOverview


Staff Portal

• MyAssignments
• AssignmentStatusControls


2.4 Invariants

• Only one active assignment per target.
• Staff must belong to same location.
• Reassign triggers notifications to both old and new staff.


---

3. REAL‑TIME NOTIFICATIONS

Cross‑system reflex layer

3.1 Data Model

`notifications`

• id
• user_id
• role
• type
• payload (jsonb)
• read_at
• created_at


3.2 Event Triggers

• New order
• New booking
• New assignment
• Support message
• Status change (order/booking/delivery)


3.3 Delivery Mechanism

• Supabase Realtime subscription on notifications table.


3.4 UI Components

• NotificationBell
• NotificationDropdown
• NotificationItem
• MarkAllReadButton


3.5 Invariants

• Max 100 stored per user.
• Payload must always contain deep‑link target.


---

4. DELIVERY ENGINE

Logistics brain of the empire

4.1 Data Model

`delivery_zones`

• id
• brand_id
• location_id
• polygon
• base_fee
• per_mile_fee
• active


`deliveries`

• id
• order_id
• driver_id
• status
• eta
• started_at
• completed_at
• last_location


4.2 Required RPCs

• resolve_delivery(address, brand_id)
• create_delivery(order_id, location_id)
• update_delivery_status(delivery_id, status, eta?)


4.3 UI Components

Customer Portal

• DeliveryFeeDisplay
• DeliveryETA
• DeliveryTracking


Manager Portal

• DeliveryBoard
• DeliveryInspector
• DriverAssignment


Staff Portal

• MyDeliveries
• DeliveryStatusControls


4.4 Invariants

• Delivery status must sync with order status.
• ETA must be recalculated on status changes.


---

5. PRICING ENGINE VISIBILITY

Admin control of the pricing brain

5.1 Backend Contract

• resolve_menu(brand_id, location_id)
• resolve_pricing(cart, user_id, location_id)


5.2 UI Components

Manager Portal

• LocalPricingRules
• LocalPromotions


Corporate Portal

• BrandPricingRules
• BrandPromotions
• LoyaltyConfig


5.3 Invariants

• Frontend must never compute totals.
• All pricing must come from RPCs.


---

6. ASSIGNMENT ENGINE (BACKEND MODULE)

Formalizing the routing logic

6.1 Required Functions

• assign(...)
• reassign(...)
• release(...)
• list_for_staff(...)
• list_for_location(...)


6.2 Invariants

• All assignment flows must use this module.
• No direct table writes allowed outside engine.


---

⭐ END OF BUILD_PLAN.md

---

⭐ LINEAR / JIRA ISSUE SET

Paste‑ready tickets for engineering execution

---

EPIC: Support Ticketing System

Description: Implement full support ticketing domain + UI across Customer, Manager, and Support portals.

Issue 1 — Create `support_tickets` and `support_messages` tables

Issue 2 — Implement RLS policies for all roles

Issue 3 — Build RPC: `create_ticket`

Issue 4 — Build RPC: `post_ticket_message`

Issue 5 — Build RPC: `list_tickets_for_user`

Issue 6 — Build RPC: `list_tickets_for_location`

Issue 7 — Build RPC: `update_ticket_status`

Issue 8 — Build Customer Support UI (list + detail + new ticket)

Issue 9 — Build Manager Support Queue

Issue 10 — Build Support/Operations Global Queue

---

EPIC: Assignment Tools

Description: Surface assignment logic into full Manager + Staff UI.

Issue 11 — Normalize `assignments` table

Issue 12 — Implement RPC: `assign_staff_to_order`

Issue 13 — Implement RPC: `assign_staff_to_booking`

Issue 14 — Implement RPC: `reassign_assignment`

Issue 15 — Build Manager AssignmentPanel

Issue 16 — Build Staff MyAssignments view

Issue 17 — Build AssignmentStatusControls

---

EPIC: Real‑Time Notifications

Description: Implement cross‑system notification engine.

Issue 18 — Create `notifications` table

Issue 19 — Add event triggers for orders/bookings/support

Issue 20 — Implement Realtime subscription

Issue 21 — Build NotificationBell component

Issue 22 — Build NotificationDropdown

Issue 23 — Build MarkAllReadButton

---

EPIC: Delivery Engine

Description: Build full logistics domain + UI.

Issue 24 — Create `delivery_zones` table

Issue 25 — Create `deliveries` table

Issue 26 — Implement RPC: `resolve_delivery`

Issue 27 — Implement RPC: `create_delivery`

Issue 28 — Implement RPC: `update_delivery_status`

Issue 29 — Build Customer DeliveryFeeDisplay

Issue 30 — Build Customer DeliveryTracking

Issue 31 — Build Manager DeliveryBoard

Issue 32 — Build Staff MyDeliveries

---

EPIC: Pricing Engine Visibility

Description: Expose pricing rules + promotions to Manager/Corporate.

Issue 33 — Build Manager LocalPricingRules

Issue 34 — Build Manager LocalPromotions

Issue 35 — Build Corporate BrandPricingRules

Issue 36 — Build Corporate BrandPromotions

Issue 37 — Build Corporate LoyaltyConfig

---

EPIC: Assignment Engine (Backend)

Description: Formalize assignment logic into a dedicated module.

Issue 38 — Implement `assign` function

Issue 39 — Implement `reassign` function

Issue 40 — Implement `release` function

Issue 41 — Implement `list_for_staff`

Issue 42 — Implement `list_for_location`

Issue 43 — Document assignment engine API

---

Tone — this is both deliverables:

• A full BUILD_PLAN.md
• A full Linear/Jira issue set


If you want, I can now generate a Gantt‑style execution timeline, a team assignment matrix, or a QA test plan.