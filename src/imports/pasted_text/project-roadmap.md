You’re right to reject that “consolidated completion” line — that’s status‑report talk, not empire‑building talk.

Let’s rewrite the whole thing as Phases 1–10, full depth, with clear completion criteria, and then take Phase 6 to 100% and pull Phase 7 down into something real.

I’ll treat what you wrote as the current snapshot and rebuild the roadmap around it.

---

Phase overview (1–10) with real goals

Phase	Name	True Goal	
1	Identity Spine	Auth, roles, IAM, RLS fully wired and enforced	
2	Core Data & Domains	All core tables, relations, and RPCs stable	
3	Menu & Pricing Engine	Dynamic menus, pricing, promos, loyalty hooks	
4	GoldKey Engine	Full booking + package + assignment system	
5	Customer Portal	8 components fully operational, no dead ends	
6	Manager Control Tower	Order board, booking board, menu & staff control	
7	Corporate Command	Brand‑level config, analytics, loyalty, promos	
8	Executive IAM Vault	Audit, approvals, risk, policy editor	
9	Ops & Reliability	Monitoring, alerts, incident, backups, scaling	
10	Optimization & Expansion	Performance, UX polish, new brands, new lanes	


You’re saying:

• Phase 5: “Complete” (customer portal operational with 8 components).
• Phase 6: “50%” (manager order board + booking board only).
• Total: 65%.


We’re going to tighten 1–5, then take 6 to 100%, and pull 7 into focus so it’s not a vague “later”.

---

Phase 1 — Identity Spine (must be 100% or nothing else is real)

What “done” actually means:

• Auth:• Email/password or OAuth flows working.
• Session persistence across refresh.
• Logout clears everything.

• Roles:• CUSTOMER, EMPLOYEE, MANAGER, CORPORATE, EXECUTIVE, ADMIN defined in DB.
• user_roles table wired and populated.

• RLS:• Every table with user‑specific or tenant‑specific data has RLS enabled.
• Policies written for:• Customers only see their own orders/bookings/support.
• Employees only see assigned tasks.
• Managers only see their location’s data.
• Corporate sees brand‑wide.
• Executive sees everything.


• IAM:• Permission map (even if in code/config) that says:• Which role can read/write which domain.

• Edge Functions check role before executing high‑risk actions.



If any of this is fuzzy, Phase 1 is not complete.

---

Phase 2 — Core Data & Domains (the skeleton)

What “done” actually means:

• All core tables exist and are stable:• tenants, brands, locations
• users, user_roles
• menu_*, pricing_rules, promotions
• orders, order_items
• bookings, service_packages, services
• staff_profiles, vehicles, assignments
• loyalty_accounts, loyalty_transactions
• support_tickets, support_messages
• analytics_events, audit_logs, feature_flags

• All foreign keys are in place.
• All enums are defined and used consistently.
• All core RPCs exist:• resolve_menu(brand_id, location_id)
• resolve_pricing(cart, user_id, location_id)
• resolve_delivery(address, brand_id)
• create_order(...)
• create_booking(...)



If schema is still shifting under your devs’ feet, Phase 2 is not done.

---

Phase 3 — Menu & Pricing Engine (Ghetto Eats + GoldKey)

What “done” actually means:

• Menu:• Categories, items, options, option values all CRUD‑able.
• Location overrides work (local price, local availability).
• Time windows respected (visible_from, visible_to).
• sold_out respected.

• Pricing:• Base price + option deltas + add‑ons.
• pricing_rules applied:• Happy hour, time windows, day‑of‑week, surge.

• promotions applied:• Code, min subtotal, date range, usage limits.


• Loyalty hooks:• Earn on completed orders.
• Redeem at checkout (discount line item).
• VIP tiers can gate promos/items.

• Resolved menu:• Frontend never calculates prices.
• Always calls resolve_menu and resolve_pricing.



If devs are still doing price math in components, Phase 3 is not done.

---

Phase 4 — GoldKey Engine (bookings, packages, assignments)

What “done” actually means:

• Services & packages:• services table populated (black truck, pool party, etc.).
• service_packages for Standard/Premium/Elite.
• Add‑ons modeled via options or separate table.

• Booking flow:• Customer can:• Pick service → pick package → fill form → submit.

• System sets status:• PENDING_REVIEW → CONFIRMED → IN_PROGRESS → COMPLETED.


• Assignments:• Staff can be assigned to bookings.
• Staff see assigned bookings in their portal.

• Snapshots:• Booking snapshot stored so later changes don’t mutate past bookings.



If GoldKey is still “just forms” without full lifecycle, Phase 4 is not done.

---

Phase 5 — Customer Portal (you say “complete”, let’s define it)

You wrote:

Phase 5 complete - full customer portal operational with 8 components (shopping, checkout, tracking, loyalty, GoldKey).

Let’s define those 8 components so “complete” actually means something:

1. Brand Selector• Choose Ghetto Eats / GoldKey / Chic‑on‑Chain.

2. Menu Browser• Categories, items, options, availability, prices.

3. Cart• Add/remove items, update quantities, see totals.

4. Checkout• Address, payment method, promos, loyalty redemption.

5. Order Tracking• Status timeline, driver location (if delivery).

6. Loyalty Dashboard• Points, tier, history, available rewards.

7. GoldKey Booking• Service selection, package selection, booking form, confirmation.

8. Support• Open ticket, view ticket status, message thread.



If all 8 are live, wired to backend, and role‑locked, Phase 5 is truly complete.

---

Phase 6 — Manager Control Tower (take this to 100%)

You said:

Phase 6 at 50% - manager order board and booking board delivered.

Good start.
To take Phase 6 to 100%, the Manager environment must become a control tower, not just a dashboard.

Phase 6 — Full Definition of Done

A. Order Board (you have this)

• Live list of orders for manager’s location.
• Filters: status, time range, channel.
• Actions:• Change status (e.g. accept, cancel).
• Assign staff/driver.
• Open order detail.



B. Booking Board (you have this)

• Live list of bookings for manager’s location.
• Filters: status, date, service type.
• Actions:• Approve/decline.
• Assign staff/vehicle.
• Open booking detail.



C. Menu Control (missing, must add)

Manager must be able to:

• View all menu items for their location.
• Toggle:• active / inactive
• sold_out

• Edit:• base_price (location override)
• visible_from / visible_to

• Manage:• Options (e.g. sizes, sauces)
• Option values (e.g. 10pc, 20pc, extra ranch)



Endpoints / functions:

• GET /manager/menu?location_id=...
• PATCH /manager/menu-item/:id
• PATCH /manager/menu-item/:id/sold-out
• PATCH /manager/menu-item/:id/time-window
• POST /manager/menu-item-option
• PATCH /manager/menu-item-option/:id


D. Local Pricing & Promos (missing, must add)

Manager must be able to:

• Create location‑specific pricing rules:• Happy hour at one store.
• Late‑night surcharge.

• Create location‑specific promos:• “Tuesday Wings Special” at one location.



Endpoints / functions:

• POST /manager/pricing-rule
• PATCH /manager/pricing-rule/:id
• POST /manager/promotion
• PATCH /manager/promotion/:id


E. Staff & Assignment Control (missing, must add)

Manager must be able to:

• View staff list for their location.
• See who’s on shift / off shift.
• Assign staff to:• Orders.
• Bookings.

• See assignment history.


Endpoints / functions:

• GET /manager/staff?location_id=...
• POST /manager/assignment (order/booking + staff)
• PATCH /manager/assignment/:id (reassign, cancel)


F. Refund & Issue Handling (missing, must add)

Manager must be able to:

• See refund requests.
• Approve/deny refunds within limit.
• Escalate above limit to Corporate/Executive.
• See support tickets for their location.


Endpoints / functions:

• GET /manager/refunds?location_id=...
• POST /manager/refund-decision
• GET /manager/support-tickets?location_id=...


G. Metrics Snapshot (optional but powerful)

Manager should see:

• Orders today / this week.
• Revenue.
• Top items.
• Problem rates (refunds, late deliveries).


When all A–G exist and are wired to real data, Phase 6 is 100%.

---

Phase 7 — Corporate Command (pull this down from the clouds)

Right now Phase 7 is probably just a concept. Let’s make it concrete.

Corporate must be able to:

• Define brand‑level menu templates.
• Push templates to locations.
• Define brand‑level pricing rules.
• Define brand‑level promotions.
• Define loyalty tiers and rules.
• See brand‑wide analytics.


Phase 7 — Definition of Done

A. Brand Menu Templates

• Create/edit menu items at brand level.
• Mark which locations inherit which items.
• Push updates to multiple locations.


B. Brand Pricing Rules

• Create rules that apply across all locations:• National promo.
• Brand‑wide happy hour.

• See where they’re active.


C. Brand Promotions

• Create promo codes:• Brand‑wide.
• Tier‑locked.
• Time‑limited.



D. Loyalty Configuration

• Define:• Earn rate.
• Redeem rate.
• Tier thresholds.
• Tier benefits.



E. Brand Analytics

• See:• Orders by location.
• Revenue by location.
• Top items.
• Promo performance.
• Loyalty engagement.



When A–E exist, Phase 7 is real, not just “we’ll do corporate later”.

---

Phase 8 — Executive IAM Vault (don’t overbuild yet, but define it)

You don’t need to fully build this tonight, but you must define it so you don’t paint yourself into a corner.

Executive must be able to:

• See all audit logs.
• Approve high‑risk actions:• Large refunds.
• Global price changes.
• Global promos.

• Manage IAM policies:• Which roles can do what.

• See risk dashboard:• Fraud signals.
• Abuse patterns.
• Security incidents.



---

Phase 9 & 10 — Ops, Reliability, Optimization

These are:

• Monitoring, alerts, logs.
• Backups, restores.
• Load testing.
• Performance tuning.
• UX polish.
• New brands, new flows.


We don’t need to detail them yet — but they’re not “nice to have”. They’re how this doesn’t fall apart at scale.

---

Where you actually are vs where you think you are

You wrote:

Phase 5 complete
Phase 6 at 50%
Total: 65%

With the definitions above:

• If Phase 1–4 are truly solid → good.
• If Phase 5 has all 8 components wired → good.
• Phase 6 is only 50% because it’s missing:• Menu control.
• Local pricing/promos.
• Staff/assignment control.
• Refund/issue handling.



Your next move is simple:

• Take Phase 6 to 100% using A–G above as the checklist.
• Define Phase 7 exactly as written so your team knows what “Corporate Command” actually means when you’re ready to build it.


If you want, I can turn Phase 6’s A–G into a literal MANAGER_PORTAL_CHECKLIST.md your devs can work down line by line.