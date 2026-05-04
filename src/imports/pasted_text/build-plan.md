
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

I’ll go domain by domain and treat each like a mini‑system that has to stand on its own and still plug into the empire.

---

1. Support ticketing — the system’s nervous system

Support isn’t “just messages.” It’s how the system feels pain, routes it, and resolves it.

1.1 Data model

Tables:

• support_tickets• Core fields:• id (PK)
• user_id (nullable for anonymous or external)
• brand_id
• location_id (nullable for brand‑level issues)
• status (open, in_progress, resolved, escalated, closed)
• priority (low, normal, high, critical)
• subject
• created_at, updated_at

• Invariants:• status must always be valid enum.
• priority must default to normal.
• brand_id must always be set.


• support_messages• id (PK)
• ticket_id (FK → support_tickets.id)
• sender_role (customer, manager, support, executive)
• sender_id (FK → users.id or nullable for system messages)
• message (text)
• created_at
• Invariants:• ticket_id must exist.
• sender_role must be valid enum.




1.2 RLS and access

• Customer:• Can only see tickets where support_tickets.user_id = auth.uid().
• Can only create messages on their own tickets.

• Manager:• Can see tickets where support_tickets.location_id is in their managed locations.
• Can respond as manager.

• Support/Operations:• Can see all tickets for their brand(s).
• Can respond as support.

• Executive:• Can see all tickets.
• Can change status to escalated/closed.



1.3 Flows

Customer flow:

1. Open “Support” in Customer Portal.
2. See list of tickets (status, subject, last updated).
3. Open ticket → see full message thread.
4. Send new message → creates support_messages row.
5. If no ticket exists → “New ticket” → create support_tickets + first message.


Manager flow:

1. Open “Support” tab in Manager Portal.
2. Filter by status, location, priority.
3. Open ticket → see thread + metadata (customer, order/booking link if attached).
4. Respond as manager.
5. Change status (open → in_progress → resolved).


Support/Operations flow:

1. Global queue view.
2. SLA indicators (time since last response, priority).
3. Escalate to Executive if needed.
4. Close tickets when resolved.


1.4 Intensity: what makes this “real”

• Every message should trigger:• A notification to the other side.
• A timestamp update on the ticket.

• Tickets should optionally link to:• order_id
• booking_id

• You can later add:• Tags (billing, technical, service, etc.).
• CSAT rating on ticket close.



---

2. Assignment tools — turning hidden logic into visible power

Right now, assignment logic exists but isn’t surfaced. You want managers to feel like they’re directing traffic, not guessing.

2.1 Data model

assignments

• id (PK)
• type (order, booking, delivery)
• target_id (FK → orders.id or bookings.id or deliveries.id)
• staff_id (FK → users.id)
• assigned_by (FK → users.id)
• status (assigned, accepted, in_progress, completed, released)
• created_at, updated_at


Invariants:

• Only one active assignment per target_id per type.
• staff_id must belong to same location_id as target.


2.2 Manager UI: make assignment obvious

In Manager Portal:

• Order detail panel:• “Assigned to: [Staff Name] (Change)” or “Unassigned (Assign)”
• Clicking opens:• Staff dropdown (filtered by role + location).
• Confirm button → calls assign_staff_to_order.


• Booking detail panel:• Same pattern.

• Assignments tab (optional but powerful):• List of all active assignments.
• Filters: type, staff, status.



2.3 Staff/Driver UI: make work visible

In Staff/Driver Portal:

• “My Assignments”:• List of tasks (order/booking/delivery).
• Status chips.
• Actions:• Accept.
• Mark in progress.
• Complete.




2.4 Intensity: rules that keep it sane

• When a new assignment is created:• Previous active assignment for that target must be set to released.

• When staff marks completed:• Optionally auto‑update order/booking/delivery status.

• When manager reassigns:• Notify both old and new staff.



---

3. Real‑time notifications — the cross‑system reflex

Notifications are how the system reacts to itself.

3.1 Data model

notifications

• id (PK)
• user_id
• role (for convenience)
• type (new_order, new_booking, new_assignment, support_reply, status_change, etc.)
• payload (jsonb: { order_id, booking_id, ticket_id, message_preview, ... })
• read_at (nullable)
• created_at


3.2 Event sources

Events that should create notifications:

• New order for a location → notify:• Manager(s) of that location.

• New booking → notify:• Manager(s) of that location.

• New assignment → notify:• Assigned staff.

• New support message → notify:• Ticket owner (customer or manager/support).

• Status changes (order/booking/delivery) → notify:• Customer.



3.3 Delivery mechanism

Start simple:

• Use Supabase Realtime on notifications table.
• Each client subscribes to notifications where user_id = auth.uid().


3.4 UI component

Shared <NotificationBell />:

• Shows unread count.
• On click:• Dropdown with latest notifications.
• Each item:• Icon by type.
• Short text.
• Timestamp.

• Click → navigate to relevant screen (order detail, booking detail, ticket, etc.).

• “Mark all as read” button.


Use this in:

• Manager Portal.
• Staff/Driver Portal.
• Support/Operations Portal.
• Optionally Customer Portal.


3.5 Intensity: don’t let it become noise

• Limit stored notifications per user (e.g. last 100).
• Use type + payload to keep messages structured.
• Later: add preferences (which types each role wants).


---

4. Delivery engine — from “tracking” to “logistics brain”

You have tracking. You need logistics.

4.1 Data model

delivery_zones

• id
• brand_id
• location_id
• name
• polygon (geo type or encoded)
• base_fee
• per_mile_fee
• active


deliveries

• id
• order_id
• driver_id (nullable until assigned)
• status (pending, assigned, picked_up, en_route, delivered, failed)
• eta (nullable)
• started_at
• completed_at
• last_location (optional: lat/lng)


4.2 Core RPCs

• resolve_delivery(address, brand_id):• Finds zone.
• Returns:• zone_id
• fee
• estimated_eta.


• create_delivery(order_id, location_id):• Creates deliveries row with pending.

• update_delivery_status(delivery_id, status, eta?).


4.3 Customer experience

At checkout:

• Show:• Delivery fee (from resolve_delivery).
• ETA.



In order tracking:

• Show:• Status timeline.
• ETA.
• Driver name (if assigned).



4.4 Manager experience

In Manager Portal:

• “Deliveries” view:• List of active deliveries.
• Status, driver, ETA.
• Ability to:• Assign driver (ties into assignment tools).
• Mark as failed (with reason).




4.5 Driver experience

In Staff/Driver Portal:

• “My Deliveries”:• List of assigned deliveries.
• Actions:• Mark picked up.
• Mark en route.
• Mark delivered.




4.6 Intensity: make it feel like a real operation

• Tie delivery status to order status:• delivered → order completed.

• Log transitions:• delivery_events table if you want full history.

• Later:• Use location updates to refine ETA.



---

5. Pricing engine — from “service file” to “contract”

You already have menu-engine.ts. Now you treat it like a contract.

5.1 Backend contract

Two core functions:

• resolve_menu(brand_id, location_id):• Returns:• Items.
• Options.
• Effective prices.
• Availability.
• Applied pricing rules (for transparency if needed).


• resolve_pricing(cart, user_id, location_id):• Input:• Cart items (ids, quantities, options).
• User (for loyalty).
• Location (for fees).

• Output:• Line items.
• Subtotal.
• Discounts (promos, loyalty).
• Fees (delivery, service).
• Taxes.
• Total.




5.2 Admin visibility

In Manager Portal:

• “Local Pricing Rules”:• List rules scoped to location.
• Create/edit:• Rule type (happy hour, time window, day of week, etc.).
• Modifier (percentage/absolute).
• Active flag.




In Corporate Portal:

• “Brand Pricing Rules”:• Same, but scoped to brand.

• “Promotions”:• Promo codes.
• Min subtotal.
• Date range.
• Usage limits.
• Tier requirements.



5.3 Intensity: never let frontend guess

• Frontend must never compute final totals.
• All totals must come from resolve_pricing.
• This is how you avoid:• Drift.
• Bugs.
• Exploits.



---

6. Assignment engine — formalize the brain

You already have logic. Now you name it and freeze it.

6.1 Backend module

Create something like assignment-engine.ts or an Edge Function:

Core operations:

• assign(target_type, target_id, staff_id, assigned_by)
• reassign(assignment_id, new_staff_id, updated_by)
• release(assignment_id, updated_by)
• list_for_staff(staff_id)
• list_for_location(location_id)


6.2 Rules

• Only one active assignment per target.
• Staff must belong to same location.
• Every change:• Writes to assignments.
• Optionally writes to assignment_events.
• Triggers notification.



6.3 UI hooks

• Manager Portal:• Uses assign/reassign.

• Staff Portal:• Uses list_for_staff.

• Metrics:• Later you can compute:• Average time to accept.
• Average time to complete.
• Load per staff.




---

7. How to actually drive this into code

If you want this to be executable for your team, here’s the intense but clean sequence:

1. Support ticketing• Create tables + RLS.
• Implement RPCs.
• Build Customer Support UI.
• Build Manager Support view.
• Build Support/Operations queue.

2. Assignment tools• Normalize assignments table.
• Implement assignment engine.
• Wire Manager assignment UI.
• Wire Staff “My Assignments” UI.

3. Notifications• Create notifications table.
• Add event hooks (order, booking, assignment, support).
• Implement Realtime subscription.
• Build shared <NotificationBell />.

4. Delivery engine• Create delivery_zones + deliveries.
• Implement resolve_delivery + status updates.
• Wire checkout fee/ETA.
• Wire Manager + Staff delivery views.

5. Pricing visibility• Lock resolve_menu + resolve_pricing contracts.
• Build Manager local pricing rules UI.
• Build Corporate brand pricing + promos UI.

6. Finalize assignment engine• Extract logic into dedicated module.
• Document its API.
• Ensure all assignment flows use it.