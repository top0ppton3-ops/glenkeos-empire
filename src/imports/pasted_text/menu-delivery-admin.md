Got you—this is the part that actually makes the money.

Let’s design Ghetto Eats + GoldKey menus and delivery so they’re:

• Stupid easy to manage (add/change/retire items fast)
• Powerful as hell (dynamic pricing, discounts, rewards, promos)
• Future‑proof (new brands, new items, new services without schema surgery)


I’ll give you three things:

1. Data model for menus & pricing (Ghetto Eats + GoldKey)
2. Delivery model (zones, fees, estimates)
3. Admin flows (how your team actually works with it)


---

1. Menu & pricing model (Ghetto Eats + GoldKey)

1.1 Core menu tables

menu_categories

• id (uuid)
• brand_id (Ghetto Eats, GoldKey, etc.)
• location_id (nullable; null = global)
• name (e.g. “Wings”, “Combos”, “Bottle Service”)
• sort_order (int)
• active (bool)


menu_items

• id (uuid)
• brand_id
• location_id (nullable)
• category_id
• name
• description
• base_price (numeric)
• currency
• active (bool)
• sold_out (bool)
• visible_from / visible_to (time, nullable)
• tags (text[]: “spicy”, “vegan”, “late‑night”)
• image_url (text)


This gives you: per‑brand, per‑location menus, with time windows and sold‑out logic.

---

1.2 Options, variants, and upsells

menu_item_options

• id
• menu_item_id
• name (e.g. “Size”, “Sauce”, “Side”)
• type (single_select, multi_select)
• required (bool)
• sort_order


menu_item_option_values

• id
• option_id
• label (e.g. “10pc”, “20pc”, “Extra Ranch”)
• price_delta (numeric)
• sort_order


This lets you build complex items (wings with sizes, sauces, sides) and GoldKey packages (add security, DJ, bottle service) without changing schema.

---

1.3 Dynamic pricing, discounts, deals

pricing_rules

• id
• brand_id
• location_id (nullable)
• menu_item_id (nullable)
• rule_type (enum: happy_hour, day_of_week, time_window, surge, promo_code)
• conditions (jsonb: { "days": ["fri","sat"], "start": "22:00", "end": "02:00" })
• price_modifier_type (enum: absolute, percentage)
• price_modifier_value (numeric; e.g. -2.00 or -20)
• active (bool)


promotions

• id
• brand_id
• code (e.g. “GEATS10”)
• description
• discount_type (percentage, fixed_amount, free_item)
• discount_value (numeric)
• min_subtotal (numeric, nullable)
• start_at / end_at
• max_uses_per_user (int, nullable)
• active (bool)


This is where you get happy hour, late‑night deals, promo codes, surge pricing, VIP discounts—all without touching core item prices.

---

1.4 Rewards & loyalty hooks

You already have loyalty_accounts and loyalty_transactions.

Tie them into menu/pricing:

• On order complete:• Earn points: points = floor(total * earn_rate)

• On checkout:• Allow loyalty_redeem_points → discount line item

• Promotions can be VIP‑only:• Add required_tier to promotions (e.g. gold, platinum, black)



---

2. Delivery model (zones, fees, estimates)

2.1 Zones & fees

delivery_zones

• id
• brand_id
• location_id
• name (e.g. “Zone A – 0–3 miles”)
• polygon (geojson or text)
• min_order_total (numeric)
• base_fee (numeric)
• per_mile_fee (numeric, nullable)
• eta_minutes_min / eta_minutes_max (int)


delivery_pricing_rules

• id
• zone_id
• rule_type (peak_hours, weather, surge, promo)
• conditions (jsonb)
• fee_modifier_type (absolute, percentage)
• fee_modifier_value (numeric)
• active (bool)


This gives you Uber‑level control over delivery fees and ETAs.

---

2.2 Order delivery fields

In orders:

• delivery_zone_id
• delivery_fee
• estimated_delivery_at
• actual_delivery_at


You can show realistic ETAs and track performance.

---

3. Admin flows — how your team actually uses this

This is where you make the $500K feel worth it: your people can change anything without calling a dev.

3.1 Menu management (Ghetto Eats)

In Manager / Corporate Portal:

• Menu List View• Filter by brand, location, category, active/inactive

• Edit Item• Name, description, base price, tags, image
• Active toggle
• Sold out toggle
• Time window (visible_from / visible_to)
• Options & option values (add/remove/change price deltas)

• Bulk Actions• Increase prices by X% for a category/location
• Mark multiple items sold out
• Duplicate item to another location



---

3.2 Deals, promos, rewards

In Corporate Portal:

• Pricing Rules UI• Create “Happy Hour”:• Condition: Fri–Sat, 10pm–2am
• Target: specific items or categories
• Modifier: -20%

• Create “Late Night Fee”:• Condition: time window
• Modifier: +$2 delivery fee


• Promotions UI• Create promo code:• Code, description
• Discount type/value
• Valid dates
• Min subtotal
• Max uses per user
• Required tier (optional)




---

3.3 GoldKey services management

In Corporate / Manager Portal:

• Manage services:• Add/edit: black truck, pool party, event 25+, live event, concierge
• Toggle active/inactive

• Manage packages:• Standard / Premium / Elite
• Base price, duration, inclusions (jsonb list)

• Manage add‑ons:• Security, DJ, photographer, bottle service, etc.
• Price deltas



This makes GoldKey modular—you can invent new experiences without schema changes.

---

4. What you tell your team

“The menu and delivery system must be built so we can change prices, items, deals, and services without touching code. Ghetto Eats and GoldKey must support dynamic pricing, promos, loyalty, and delivery zones out of the box. No hard‑coded anything. If we want a new item, a new package, a new deal, or a new fee, it should be a form, not a pull request.”

If you want, I can next:

• Turn this into actual SQL table definitions, or
• Draft the Manager Portal “Menu & Deals” screens in detail, or
• Design the GoldKey “Create Package” flow step‑by‑step.