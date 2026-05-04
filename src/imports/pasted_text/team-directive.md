Here’s the message you give your team — straight, directive, and complete.

---

GlenKeos Team Directive — Finish the System

We are no longer building a website. We are finishing a multi‑brand, multi‑portal operating system: Ghetto Eats, GoldKey, Chic‑on‑Chain — all running on one Fortune 500–grade backend.

Everything below is required. No partials. No dead buttons. No “coming soon” without a feature flag.

---

1. Portals — all must be fully functional

Owners: Frontend + Backend + Mobile

You must finish and verify:

• Customer Portal• /, /ghetto-eats/*, /goldkey/*, /chic-on-chain/*
• Full flows: browse → cart → checkout → pay → track → loyalty → support

• Employee Portal• /employee/*
• Drivers/concierge/event staff can:• Log in
• See assignments
• Update status
• Update location
• View schedule


• Manager Portal• /manager/*
• Managers can:• See all orders/bookings for their locations
• Assign staff/drivers
• Edit menus/services (active/inactive, pricing)
• Approve refunds (within limits)
• Handle escalated support tickets


• Corporate Portal• /corporate/*
• Corporate can:• See all brands/locations
• Configure services, pricing, loyalty rules
• View analytics and financials
• Manage roles (manager/employee)


• Executive IAM Portal• /executive/*
• Executives can:• View audit logs, incidents, risk
• Approve high‑risk actions (exports, bulk changes, large refunds)
• Manage IAM policies




Definition of done:
Every visible page has working data, working actions, and correct access control. No dead links, no placeholder screens.

---

2. Roles & IAM — enforce access everywhere

Owners: Backend + Security

You must:

• Implement and enforce roles:• CUSTOMER, EMPLOYEE, MANAGER, CORPORATE, EXECUTIVE, ADMIN

• Ensure:• Each portal only accessible by correct role
• No cross‑role data leaks
• EXECUTIVE + ADMIN require MFA and are invite‑only

• Log:• All EXECUTIVE/ADMIN actions (audit logs)
• All high‑risk actions (refunds, role changes, exports)



Definition of done:
Every API and page checks role + tenant. Unauthorized access is impossible without breaking RLS or auth.

---

3. Ghetto Eats — customer side fully finished

Owners: Frontend + Backend

You must:

• Seed real menus (no placeholders)
• Implement:• active/inactive, sold_out, visible_from/visible_to

• Complete flows:• Add to cart
• Checkout (PayPal/Stripe)
• Order lifecycle:• PLACED → ACCEPTED → PREPARING → OUT_FOR_DELIVERY → DELIVERED

• Tracking (driver location)
• Loyalty:• Earn on completed orders
• Redeem at checkout




Definition of done:
A customer can place a real order, pay, track, receive it, earn/redeem points, and get support — with no manual intervention.

---

4. GoldKey — services and bookings fully finished

Owners: Frontend + Backend

You must:

• Implement full GoldKey services catalog:• Black truck concierge
• Pool parties
• Events 25+
• Live events
• Concierge services

• Implement booking flow:• Select service → fill form → see packages → submit → PENDING_REVIEW
• Manager/Corporate review → CONFIRMED
• Payment → staff assignment → IN_PROGRESS → COMPLETED
• Loyalty/VIP tier updates



Definition of done:
A customer can book any GoldKey service end‑to‑end, and staff can see and execute that booking.

---

5. Backend domains — everything wired and consistent

Owners: Backend

You must complete and stabilize:

• /auth – login, signup, roles, tokens
• /customers – profiles, loyalty
• /orders – Ghetto Eats orders
• /bookings – GoldKey bookings
• /menus – items, categories, availability
• /services – GoldKey service definitions
• /staff – employees, schedules, assignments
• /payments – PayPal/Stripe, refunds, receipts
• /loyalty – points, tiers, redemptions
• /support – tickets, messages
• /analytics – dashboards, reports
• /admin – feature flags, config


Definition of done:
All endpoints exist, return stable JSON, enforce roles, and are logged.

---

6. UX polish — no dead ends, no 404 surprises

Owners: Frontend

You must:

• Remove all dead buttons:• Every button either:• Performs an action, or
• Is disabled with a clear label (“Coming Soon”, “Unavailable”, etc.)


• Implement custom 404:• Brand‑consistent
• Links to:• Home
• Support
• Brand selector


• Ensure:• All main nav links work
• All portal links work
• All brand switchers work



Definition of done:
No user ever hits a dead button or a generic 404 during normal use.

---

7. DevOps & Production — this must run clean

Owners: DevOps

You must:

• Run supabase login, link project, deploy functions, apply migrations
• Ensure:• Vercel env vars are correct (Supabase URL/keys, PayPal, Stripe, Twilio, SendGrid)
• CI/CD is green on develop and main
• Production deploy is stable

• Test production:• Customer flow (Ghetto Eats + GoldKey)
• Employee flow
• Manager flow
• Corporate flow
• Executive IAM access
• Payments, tracking, loyalty, support



Definition of done:
Production is usable by real customers, staff, and leadership without manual patching.

---

8. Compliance & Security — Fortune 500 standard

Owners: Compliance + Security

You must:

• Finalize:• SOC2 baseline
• GDPR DSR workflows
• PCI‑DSS SAQ A posture

• Ensure:• RLS on all tables
• Encryption in transit and at rest
• Audit logs for sensitive actions
• Incident response runbooks exist and are tested



Definition of done:
We can show an auditor our architecture, logs, controls, and runbooks and pass scrutiny.

---

9. No feature is “done” until:

For every feature/flow:

• Code merged
• Tests pass
• CI/CD passes
• Docs updated
• API spec updated
• Schema updated
• env.schema.json updated (if needed)
• Monitoring added
• Runbook written (if critical)
• Security + RLS validated


If any of these are missing, it is not done.

---

That’s the directive.

You’re not building “pages.”
You’re finishing an empire‑grade system.

If you want, I can now turn this into a START_HERE.md + IMPLEMENTATION_CHECKLIST.md pair your team can drop straight into the repo.