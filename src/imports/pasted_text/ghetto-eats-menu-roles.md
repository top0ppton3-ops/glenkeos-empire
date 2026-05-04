You got it—let’s make this something your people can literally code from without guessing.

Below is the menu + processing system for all 5 roles, and how they integrate—end‑to‑end, clean, and predictable.

---

1. Shared menu model (what everyone touches)

This is the single source of truth for Ghetto Eats (and can extend to others):

Tables:

• menu_categories• id, brand_id, location_id, name, sort_order, active

• menu_items• id, brand_id, location_id, category_id
• name, description, base_price, currency
• active, sold_out
• visible_from, visible_to
• tags, image_url

• menu_item_options• id, menu_item_id
• name (e.g. “Size”, “Sauce”)
• type (single_select, multi_select)
• required, sort_order

• menu_item_option_values• id, option_id
• label (e.g. “10pc”, “20pc”)
• price_delta, sort_order

• pricing_rules• id, brand_id, location_id, menu_item_id
• rule_type (happy_hour, time_window, day_of_week, surge, promo_code)
• conditions (jsonb)
• price_modifier_type (absolute, percentage)
• price_modifier_value
• active

• promotions• id, brand_id
• code, description
• discount_type (percentage, fixed_amount, free_item)
• discount_value
• min_subtotal
• start_at, end_at
• max_uses_per_user
• required_tier (nullable)
• active



Core idea:
Everyone interacts with these same tables, but with different permissions and UI.

---

2. Role 1: Customer — “Use the menu”

What they see:

• Only menu_items.active = true
• Only sold_out = false
• Only items within visible_from/visible_to
• Prices after applying:• pricing_rules
• promotions
• loyalty redemption (if used)



Flow:

1. Load categories + items:• GET /api/menu?brand=ghetto-eats&location_id=...

2. Build cart:• Items + options + quantities

3. Apply pricing:• Base price + option deltas + pricing_rules + promos

4. Checkout:• Send final payload to /api/orders

5. Order created:• orders + order_items rows

6. Loyalty:• On completion, loyalty_transactions entry



Coding rule:
Customer never writes to menu tables—read‑only.

---

3. Role 2: Employee — “Execute the menu”

Employees don’t edit the menu—they fulfill what the menu creates.

What they see:

• Orders with resolved menu snapshots:• order_items.name_snapshot
• order_items.options_snapshot

• No direct access to menu_items editing.


Flow:

1. See assigned orders:• GET /api/employee/orders?status=...

2. View order details:• Includes item names, options, notes

3. Update status:• PATCH /api/orders/:id/status → preparing, out_for_delivery, delivered



Coding rule:
Employee code uses order snapshots, not live menu data, so menu changes don’t break old orders.

---

4. Role 3: Manager — “Control the menu locally”

Managers control location‑level menu and pricing.

What they can do:

• Toggle active / sold_out per item
• Edit base_price for their location
• Edit visible_from/visible_to
• Manage categories
• Manage options and option values
• Create local pricing rules (e.g. happy hour at one store)


Key endpoints:

• GET /api/manager/menu?location_id=...
• PATCH /api/manager/menu-item/:id
• POST /api/manager/menu-item
• POST /api/manager/pricing-rule
• PATCH /api/manager/pricing-rule/:id


Coding rule:

• Manager UI is a CRUD layer over:• menu_categories
• menu_items
• menu_item_options
• menu_item_option_values
• pricing_rules (scoped to location_id)



RLS ensures they only touch rows for their location_id.

---

5. Role 4: Corporate — “Design the system menu”

Corporate defines brand‑level structure and rules.

What they can do:

• Create global categories and items (brand‑wide)
• Set default prices
• Define global pricing rules (e.g. national promo)
• Define promotions (promo codes, VIP deals)
• Define loyalty earn/redeem rules (in separate loyalty tables)
• Push templates to locations


Key endpoints:

• GET /api/corporate/menu?brand_id=...
• POST /api/corporate/menu-item-template
• PATCH /api/corporate/menu-item-template/:id
• POST /api/corporate/pricing-rule
• POST /api/corporate/promotion


Coding rule:

• Corporate works mostly at brand_id level.
• Managers override at location_id level.
• Customer always sees resolved view:• Brand defaults + location overrides + active rules.



---

6. Role 5: Executive IAM — “Guard the system”

This role doesn’t touch menu content—they govern who can.

What they control:

• Which identities can:• Edit menu items
• Edit pricing rules
• Edit promotions

• Audit logs:• Who changed what, when, and from where

• High‑risk approvals:• Large pricing changes
• Global promotions
• System‑wide menu changes



Key tables:

• audit_logs
• feature_flags
• IAM config (role → permission mapping, can be in DB or config)


Coding rule:

• Every write to:• menu_items
• pricing_rules
• promotions
must create an audit_logs row:• actor_user_id
• action (e.g. MENU_ITEM_UPDATED)
• target_type (menu_item, pricing_rule, etc.)
• target_id
• metadata (before/after snapshot)



---

7. How they integrate — one mental model for your devs

Here’s the simple mental model your devs should code to:

1. Corporate defines the global menu + rules (brand level).
2. Manager adjusts the local menu + rules (location level).
3. Customer sees the resolved menu:• Brand defaults
• Location overrides
• Active pricing rules
• Active promotions

4. Employee fulfills orders created from that resolved menu.
5. Executive IAM controls who can change what and logs everything.


Code pattern:

• Read path (customer):• GET /api/menu → backend:• Fetch menu_items (brand + location)
• Apply pricing_rules
• Attach promotions context
• Return fully resolved menu (no client‑side guessing)


• Write path (manager/corporate):• POST/PATCH /api/... → backend:• Validate role via JWT
• Enforce RLS
• Write to menu_* / pricing_rules / promotions
• Log to audit_logs




---

8. What your devs should literally implement

Backend:

• A single MenuService (or equivalent) that:• Reads raw tables
• Resolves:• Active items
• Time windows
• Sold out
• Pricing rules
• Promotions

• Returns a clean JSON menu for the frontend.



Frontend:

• Customer side:• Never builds prices manually.
• Always uses the resolved menu from backend.

• Manager/Corporate side:• CRUD forms mapped 1:1 to tables:• Items
• Options
• Rules
• Promotions




IAM:

• Permissions like:• menu.read
• menu.write.location
• menu.write.brand
• pricing.write.location
• pricing.write.brand
• promotions.write

• Executive IAM can toggle these per role.


---

If your people follow this, they’ll have:

• One clean schema
• One clear read path
• One clear write path
• Five roles that never conflict, only layer


That’s how you push this menu and delivery system to the max without chaos.