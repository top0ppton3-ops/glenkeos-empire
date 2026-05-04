# 🏢 GLENKEOS FORTUNE 500 OPERATING SYSTEM BLUEPRINT

**Status**: Implementation in progress  
**Target**: Q4 2026 Full Production Launch  
**Last Updated**: 2026-05-03

---

## EXECUTIVE SUMMARY

This is not a website. This is a **multi-brand, multi-portal enterprise operating system** powering three Fortune 500 brands:

1. **Ghetto Eats** - Food delivery and restaurant operations
2. **GoldKey** - Luxury concierge, black truck services, events
3. **Chic-on-Chain** - Fashion and lifestyle brand

---

## 1. PORTAL ARCHITECTURE

### The 5 Portals

GlenKeos operates **5 distinct application surfaces**, each with different authentication, permissions, and UI:

#### 1.1 Customer Portal
- **URL**: `app.glenkeos.com/customer`
- **For**: End customers (Ghetto Eats, GoldKey, Chic-on-Chain)
- **Actions**: Browse menus, place orders, pay, track deliveries, manage account, loyalty rewards
- **Brands**: All three brands accessible via brand switcher

#### 1.2 Employee Portal
- **URL**: `app.glenkeos.com/employee`
- **For**: Drivers, concierges, event staff, support agents
- **Actions**: View assignments, update status (en route, delivered), clock in/out, view schedule, track earnings/tips
- **Mobile-first**: Optimized for phones while working

#### 1.3 Manager Portal
- **URL**: `app.glenkeos.com/manager`
- **For**: Store managers, dispatch coordinators, shift leads
- **Actions**: Manage staff, approve orders, assign drivers, handle escalations, manage menus (pricing, availability), view location performance metrics

#### 1.4 Corporate Portal
- **URL**: `app.glenkeos.com/corporate`
- **For**: GlenKeos HQ, brand owners, executives
- **Actions**: Multi-brand analytics, financial reports, compliance dashboards, brand configuration, pricing strategy, service expansion

#### 1.5 Partner/VIP Portal (GoldKey)
- **URL**: `app.glenkeos.com/goldkey`
- **For**: High-value clients, event planners, VIPs, recurring customers
- **Actions**: Book black trucks, pool parties, events 25+, recurring services, concierge requests, view booking history, VIP tier status

### Shared Infrastructure

All portals share:
- ✅ One authentication system (Supabase Auth)
- ✅ One identity model (users table with role enum)
- ✅ One permissions matrix (role-based access control)
- ✅ One design system (Tailwind CSS theme)

---

## 2. ROLE MATRIX & PERMISSIONS

### Core Roles

| Role | Portal Access | Description |
|------|---------------|-------------|
| `CUSTOMER` | Customer Portal | End users placing orders, bookings |
| `EMPLOYEE` | Employee Portal | Drivers, concierges, event staff |
| `MANAGER` | Manager Portal | Location/brand-level management |
| `CORPORATE` | Corporate Portal | HQ executives, multi-brand oversight |
| `ADMIN` | All Portals | Superuser, internal GlenKeos staff |

### Detailed Permissions

#### CUSTOMER
- ✅ View menus (Ghetto Eats, Chic-on-Chain)
- ✅ Place orders
- ✅ Pay via PayPal/Stripe
- ✅ Track orders in real-time
- ✅ View loyalty balance
- ✅ Redeem rewards
- ✅ Create support tickets
- ✅ Manage profile (name, email, phone, addresses)
- ❌ Cannot access employee, manager, or corporate features

#### EMPLOYEE
- ✅ View assigned tasks (deliveries, events, rides)
- ✅ Update task status (accepted, en route, completed)
- ✅ Update GPS location (for customer tracking)
- ✅ View schedule (shifts, assignments)
- ✅ View tips/earnings
- ❌ Cannot assign tasks to other employees
- ❌ Cannot modify orders or menus

#### MANAGER
- ✅ View all orders for their location(s)
- ✅ Assign drivers/staff to orders
- ✅ Approve/deny refunds (up to $500 limit)
- ✅ Manage menus (activate/deactivate items, pricing, availability windows)
- ✅ View performance metrics (orders, delivery times, staff performance)
- ✅ Handle escalated support tickets
- ❌ Cannot view other locations' data
- ❌ Cannot modify corporate pricing rules

#### CORPORATE
- ✅ View all brands (Ghetto Eats, GoldKey, Chic-on-Chain)
- ✅ Configure services (what's offered, where, pricing tiers)
- ✅ Manage loyalty rules (earn rates, tiers, promotions)
- ✅ View financial reports (revenue, refunds, payouts)
- ✅ Manage roles (promote managers, employees)
- ✅ Approve new locations/markets
- ✅ Access compliance dashboards (SOC 2, GDPR, PCI-DSS)

#### ADMIN
- ✅ All permissions above
- ✅ System configuration
- ✅ Feature flags (enable/disable features per brand)
- ✅ Data exports (CSV, JSON)
- ✅ Compliance tools (DSR, audit logs, GDPR deletion)
- ✅ Impersonate users (for support/debugging)

---

## 3. CUSTOMER-SIDE FLOWS

### 3.1 Ghetto Eats - Food + Delivery

**Service Type**: On-demand food delivery  
**Target Market**: Urban neighborhoods, late-night, campus  
**Payment**: PayPal, Stripe  
**Loyalty**: Yes (points per dollar spent)

#### Customer Flow

1. **Landing** → Customer arrives at Ghetto Eats homepage
2. **Location Detection** → Auto-detect or select location
3. **Menu Browsing** → View only active menus for their location/time
4. **Add to Cart** → Add items, customize (sides, notes)
5. **Cart Review** → See subtotal, fees, taxes, delivery estimate
6. **Checkout** → Choose payment method (PayPal/Stripe)
7. **Payment** → Complete payment, receive order confirmation
8. **Order Tracking** → Real-time status updates:
   - `PLACED` → Order received
   - `ACCEPTED` → Restaurant confirmed
   - `PREPARING` → Food being prepared
   - `OUT_FOR_DELIVERY` → Driver on the way (live GPS tracking)
   - `DELIVERED` → Order complete
9. **Post-Delivery** → Rate order, earn loyalty points, reorder option

#### Menu State Requirements

Each menu item must have:

```json
{
  "id": "uuid",
  "name": "Hot Wings 10pc",
  "description": "Spicy wings with fries",
  "price": 14.99,
  "currency": "USD",
  "active": true,           // Can be ordered
  "sold_out": false,        // Temporarily unavailable
  "visible_from": "16:00",  // Time window start
  "visible_to": "02:00",    // Time window end
  "tags": ["spicy", "popular"]
}
```

#### Button State Logic

Buttons must be **disabled** if:
- Item is `active: false` → Show "Unavailable"
- Current time outside `visible_from`/`visible_to` → Show "Closed"
- Item is `sold_out: true` → Show "Sold Out"

No button should be clickable in invalid states.

---

### 3.2 GoldKey - Luxury Services

**Service Type**: Kingsman-style luxury concierge  
**Target Market**: High-value clients, VIPs, events  
**Payment**: PayPal, Stripe, invoicing for corporate accounts  
**Loyalty**: VIP tiers (Silver, Gold, Platinum, Black)

#### Services Offered

1. **Black Truck Concierge**
   - Hourly bookings (4-hour minimum)
   - Point-to-point rides
   - Night packages (8pm-4am all-inclusive)

2. **Pool Parties**
   - Venue rental + staff + security
   - DJ/music curation
   - Custom branding/decor
   - Bartender + open bar options

3. **Events 25+**
   - Birthdays, corporate events, nightlife
   - Full event production (planning, staff, security)
   - Red carpet service
   - Photography/videography

4. **Live Events**
   - Concert tickets + VIP access
   - Backstage passes
   - Meet & greets with artists
   - Private box/suite rentals

5. **On-Demand Concierge**
   - Personal errands
   - Restaurant reservations
   - Gift procurement
   - Travel arrangements
   - 24/7 personal assistant

#### Customer Flow

1. **Landing** → Customer arrives at GoldKey homepage
2. **Service Selection** → Choose service category (Black Truck, Pool Party, etc.)
3. **Booking Form** → Fill out:
   - Date/time
   - Location(s)
   - Party size
   - Preferences (music, vibe, dress code, dietary restrictions)
4. **Package Selection** → Choose tier:
   - **Standard** - Base service, standard inclusions
   - **Premium** - Enhanced service, priority support
   - **Elite** - White-glove service, dedicated concierge
5. **Submit Booking** → Status: `PENDING_REVIEW`
6. **Manager Review** → Manager/Corporate reviews, adjusts pricing/packages
7. **Confirmation** → Status: `CONFIRMED`, payment link sent
8. **Payment** → Complete payment (or invoiced for corporate accounts)
9. **Staff Assignment** → Drivers, hosts, security assigned
10. **Event Execution** → Status: `IN_PROGRESS`
11. **Completion** → Status: `COMPLETED`, loyalty points + VIP tier updated

#### Package Tiers

| Tier | Price Multiplier | Inclusions |
|------|------------------|------------|
| Standard | 1.0x | Base service, standard staff |
| Premium | 1.5x | Priority booking, enhanced service, dedicated coordinator |
| Elite | 2.5x | White-glove, 24/7 concierge, red carpet treatment |

---

## 4. BACKEND JSON CONTRACTS

### 4.1 Authentication

**Endpoint**: `POST /api/auth/login`

Request:
```json
{
  "email": "string",
  "password": "string",
  "role": "customer|employee|manager|corporate|admin"
}
```

Response:
```json
{
  "token": "jwt-string",
  "user": {
    "id": "uuid",
    "role": "customer",
    "tenant_id": "uuid",
    "profile": {
      "name": "string",
      "email": "string",
      "phone": "string"
    }
  }
}
```

### 4.2 Menu (Ghetto Eats)

**Endpoint**: `GET /api/menu?brand=ghetto-eats&location_id=uuid`

Response:
```json
{
  "brand": "ghetto-eats",
  "location_id": "uuid",
  "categories": [
    {
      "id": "uuid",
      "name": "Wings",
      "items": [
        {
          "id": "uuid",
          "name": "Hot Wings 10pc",
          "description": "Spicy wings with fries",
          "price": 14.99,
          "currency": "USD",
          "active": true,
          "sold_out": false,
          "visible_from": "16:00",
          "visible_to": "02:00",
          "tags": ["spicy", "popular"]
        }
      ]
    }
  ]
}
```

### 4.3 Order (Ghetto Eats)

**Endpoint**: `POST /api/orders`

Request:
```json
{
  "brand": "ghetto-eats",
  "location_id": "uuid",
  "items": [
    {
      "menu_item_id": "uuid",
      "quantity": 2,
      "notes": "Extra crispy"
    }
  ],
  "delivery_address": "string",
  "payment_method": "paypal|stripe",
  "loyalty_redeem_points": 0
}
```

Response:
```json
{
  "order_id": "uuid",
  "status": "PLACED",
  "payment_status": "PENDING",
  "estimated_delivery": "2026-05-03T18:45:00Z"
}
```

### 4.4 GoldKey Booking

**Endpoint**: `POST /api/goldkey/bookings`

Request:
```json
{
  "service_type": "black_truck|pool_party|event_25_plus|live_event|concierge",
  "date": "2026-05-10",
  "start_time": "21:00",
  "end_time": "02:00",
  "pickup_location": "string",
  "dropoff_location": "string|null",
  "party_size": 8,
  "preferences": {
    "music": "hip-hop",
    "vibe": "luxury",
    "notes": "birthday, dress code all black"
  },
  "package_tier": "standard|premium|elite"
}
```

Response:
```json
{
  "booking_id": "uuid",
  "status": "PENDING_REVIEW",
  "review_eta": "2026-05-03T20:00:00Z"
}
```

### 4.5 Loyalty

**Endpoint**: `GET /api/loyalty/balance?user_id=uuid`

Response:
```json
{
  "user_id": "uuid",
  "points": 4200,
  "tier": "gold",
  "next_tier": "platinum",
  "points_to_next_tier": 800
}
```

---

## 5. CLEANUP MANDATE - NO BROKEN BUTTONS

### 5.1 404 Pages

**Requirement**: Every route must either:
- Render a valid page, OR
- Redirect to a valid page

**Custom 404 Page Requirements**:
- Brand-consistent design
- Links to:
  - Home
  - Support
  - Brand selector (Ghetto Eats / GoldKey / Chic-on-Chain)
- Clear error message: "Page not found"
- Suggested next steps

### 5.2 Button States

**Rule**: No button should do nothing or throw console errors.

Every button must:
- Call a defined action (API call, navigation, state update), OR
- Be visibly disabled with a reason (tooltip or label)

Examples:
- ❌ Bad: Button clickable but no handler attached
- ✅ Good: Button disabled with tooltip "Sold out until 4pm"

### 5.3 Process Completeness

**Rule**: Every visible flow must be fully wired.

Options:
1. **Fully implemented** - API exists, returns correct JSON, UI handles all states
2. **Coming Soon** - Hidden behind feature flag with "Coming Soon" badge

No half-implemented features visible to users.

---

## 6. Q4 IMPLEMENTATION CHECKLIST

### Section 1 - Portals ✅

- [ ] Customer portal fully functional (Ghetto Eats, GoldKey, Chic-on-Chain)
- [ ] Employee portal live (assignments, status, schedule)
- [ ] Manager portal live (orders, staff, menus)
- [ ] Corporate portal live (brands, analytics, finance)
- [ ] VIP/GoldKey portal live (bookings, packages, history)

### Section 2 - Logins & Roles ✅

- [ ] Customer login working (signup, login, password reset)
- [ ] Employee login working
- [ ] Manager login working
- [ ] Corporate login working
- [ ] Admin login working
- [ ] Role permissions validated (no cross-role access leaks)

### Section 3 - Ghetto Eats ✅

- [ ] Menus fully seeded (no placeholder items)
- [ ] Active/inactive logic correct
- [ ] Sold out logic correct
- [ ] Time-based visibility working
- [ ] Checkout works end-to-end
- [ ] Order tracking works (all 5 statuses)
- [ ] Loyalty earn/redeem works

### Section 4 - GoldKey ✅

- [ ] Services defined (5 service types)
- [ ] Booking forms complete (all required fields)
- [ ] Package tiers defined (Standard/Premium/Elite)
- [ ] Internal review flow working (PENDING_REVIEW → CONFIRMED)
- [ ] Staff assignment flow working
- [ ] Loyalty/VIP tiers integrated

### Section 5 - Buttons & 404s ✅

- [ ] No dead buttons (every button has action or disabled state)
- [ ] Custom 404 page live
- [ ] All main nav links valid
- [ ] All brand switchers working

### Section 6 - Backend & JSON ✅

- [ ] All documented endpoints exist
- [ ] All responses match JSON contracts
- [ ] Error codes standardized (400, 401, 403, 404, 500)
- [ ] Logs enabled for critical flows (auth, payments, bookings, orders)

### Section 7 - Final Sign-Off ✅

- [ ] Backend lead signed off
- [ ] Frontend lead signed off
- [ ] Mobile lead signed off
- [ ] DevOps lead signed off
- [ ] Compliance lead signed off
- [ ] Founder (Tone) final walkthrough complete

---

## 7. TECHNOLOGY STACK

**Frontend**:
- React 18.3.1
- Tailwind CSS 4.1.12
- React Router (5 portal routing)
- Context API (auth, cart)

**Backend**:
- Supabase Edge Functions (Deno runtime)
- PostgreSQL (Supabase)
- Row-Level Security (RLS)

**Deployment**:
- Vercel (frontend)
- Supabase (backend + database)
- GitHub Actions (CI/CD)

**Payment**:
- Stripe
- PayPal

**Notifications**:
- SendGrid (email)
- Twilio (SMS)
- Push notifications

---

## 8. NEXT ACTIONS

This blueprint is now the **source of truth** for Q4 implementation.

**Implementation Priority**:
1. ✅ Portal architecture and routing
2. ✅ Role-based authentication
3. ✅ Ghetto Eats customer flow
4. ✅ GoldKey booking system
5. ✅ Backend API contracts
6. ✅ 404 cleanup and button states
7. ✅ Q4 checklist completion

**Target**: All checkboxes complete by Q4 2026

---

**This is not a demo. This is the machine.** 🏢
