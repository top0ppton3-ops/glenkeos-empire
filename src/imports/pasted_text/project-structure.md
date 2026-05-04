Got you—no more “patterns,” you want exact structure your team can literally implement.

Here’s the real deal, opinionated and concrete.

---

1. Monorepo layout

glenkeos/
  package.json
  turbo.json
  .env
  /apps
    /web          # Next.js frontend
    /api          # Node/Nest/Fastify backend
  /packages
    /ui           # Shared React UI library
    /core         # Shared domain types + utils
  /supabase
    /migrations
    /seed


---

2. Supabase migrations (real files)

supabase/migrations/000_init.sql – base

-- users (auth handled by Supabase auth.users)
create table if not exists app_users (
  id uuid primary key references auth.users(id),
  role text not null,
  brand_id uuid,
  location_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table app_users enable row level security;


007_support_ticketing.sql

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  brand_id uuid not null,
  location_id uuid,
  subject text not null,
  status text not null default 'open',
  priority text not null default 'normal',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references support_tickets(id) on delete cascade,
  sender_role text not null,
  sender_id uuid,
  message text not null,
  created_at timestamptz default now()
);

alter table support_tickets enable row level security;
alter table support_messages enable row level security;


008_assignments.sql

create table assignments (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'order' | 'booking' | 'delivery'
  target_id uuid not null,
  staff_id uuid references auth.users(id),
  assigned_by uuid references auth.users(id),
  status text not null default 'assigned',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table assignments enable row level security;


009_notifications.sql

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  role text,
  type text not null,
  payload jsonb not null,
  read_at timestamptz,
  created_at timestamptz default now()
);
alter table notifications enable row level security;


010_delivery_engine.sql

create table delivery_zones (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null,
  location_id uuid not null,
  name text,
  polygon jsonb not null,
  base_fee numeric not null,
  per_mile_fee numeric not null,
  active boolean default true
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  driver_id uuid references auth.users(id),
  status text not null default 'pending',
  eta interval,
  started_at timestamptz,
  completed_at timestamptz,
  last_location jsonb,
  created_at timestamptz default now()
);

alter table delivery_zones enable row level security;
alter table deliveries enable row level security;


011_payments.sql

create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  type text not null, -- 'card' | 'apple_pay' | 'cash_app'
  provider text not null,
  provider_reference text not null,
  brand text,
  last4 text,
  exp_month int,
  exp_year int,
  is_default boolean default false,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  user_id uuid references auth.users(id),
  payment_method_id uuid references payment_methods(id),
  amount int not null,
  currency text not null,
  status text not null, -- 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
  provider text not null,
  provider_reference text not null,
  provider_raw jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references payments(id),
  amount int not null,
  currency text not null,
  status text not null, -- 'pending' | 'succeeded' | 'failed'
  provider_reference text not null,
  provider_raw jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table payment_methods enable row level security;
alter table payments enable row level security;
alter table refunds enable row level security;


Run:

supabase link --project-ref beswluhdxaphtitaovly
supabase db push


---

3. Backend API (real files, not examples)

apps/api/src/main.ts – Fastify/Nest/Express, your choice.

import { createServer } from './server';

const app = createServer();
app.listen({ port: 4000, host: '0.0.0.0' });


apps/api/src/server.ts

import Fastify from 'fastify';
import { registerPaymentRoutes } from './routes/payments';
import { registerOrderRoutes } from './routes/orders';
import { registerSupportRoutes } from './routes/support';

export function createServer() {
  const app = Fastify({ logger: true });

  app.register(registerPaymentRoutes, { prefix: '/v1/payments' });
  app.register(registerOrderRoutes, { prefix: '/v1/orders' });
  app.register(registerSupportRoutes, { prefix: '/v1/support' });

  return app;
}


apps/api/src/routes/payments.ts

import { FastifyInstance } from 'fastify';
import { createPaymentIntent, payWithApplePay, payWithCashApp } from '../services/payments';

export async function registerPaymentRoutes(app: FastifyInstance) {
  app.post('/intent', async (req, reply) => {
    const body = req.body as {
      order_id: string;
      amount: number;
      currency: string;
      payment_method_id: string;
    };
    const result = await createPaymentIntent(body);
    return reply.send(result);
  });

  app.post('/apple-pay', async (req, reply) => {
    const body = req.body as {
      order_id: string;
      amount: number;
      currency: string;
      apple_pay_token: unknown;
    };
    const result = await payWithApplePay(body);
    return reply.send(result);
  });

  app.post('/cash-app', async (req, reply) => {
    const body = req.body as {
      order_id: string;
      amount: number;
      currency: string;
      cash_app_token: string;
    };
    const result = await payWithCashApp(body);
    return reply.send(result);
  });
}


apps/api/src/services/payments.ts

import { db } from '../supabase';
import { chargeCard, chargeApplePay, chargeCashApp } from '../providers/payments';

export async function createPaymentIntent(input: {
  order_id: string;
  amount: number;
  currency: string;
  payment_method_id: string;
}) {
  const { order_id, amount, currency, payment_method_id } = input;

  const { data: pm } = await db
    .from('payment_methods')
    .select('*')
    .eq('id', payment_method_id)
    .single();

  if (!pm) throw new Error('Payment method not found');

  const providerResult = await chargeCard({
    provider: pm.provider,
    provider_reference: pm.provider_reference,
    amount,
    currency,
  });

  const { data: payment } = await db
    .from('payments')
    .insert({
      order_id,
      user_id: pm.user_id,
      payment_method_id,
      amount,
      currency,
      status: providerResult.status,
      provider: pm.provider,
      provider_reference: providerResult.id,
      provider_raw: providerResult.raw,
    })
    .select('*')
    .single();

  return payment;
}

export async function payWithApplePay(input: {
  order_id: string;
  amount: number;
  currency: string;
  apple_pay_token: unknown;
}) {
  const providerResult = await chargeApplePay(input);
  // insert into payments same as above, type implied by provider
  // ...
  return providerResult;
}

export async function payWithCashApp(input: {
  order_id: string;
  amount: number;
  currency: string;
  cash_app_token: string;
}) {
  const providerResult = await chargeCashApp(input);
  // insert into payments same as above
  // ...
  return providerResult;
}


apps/api/src/providers/payments.ts – this is where you wire Stripe/Adyen/Square/etc.

export async function chargeCard(input: {
  provider: string;
  provider_reference: string;
  amount: number;
  currency: string;
}) {
  // call real processor SDK/API here
  return {
    id: 'ch_123',
    status: 'captured',
    raw: {},
  };
}

export async function chargeApplePay(input: {
  order_id: string;
  amount: number;
  currency: string;
  apple_pay_token: unknown;
}) {
  // send token to processor, return normalized result
  return {
    id: 'ap_123',
    status: 'captured',
    raw: {},
  };
}

export async function chargeCashApp(input: {
  order_id: string;
  amount: number;
  currency: string;
  cash_app_token: string;
}) {
  // send token to processor, return normalized result
  return {
    id: 'ca_123',
    status: 'captured',
    raw: {},
  };
}


---

4. Frontend checkout wiring (real shape)

apps/web/src/domains/payments/api.ts

export async function payWithSavedCard(input: {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
}) {
  const res = await fetch('/api/v1/payments/intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: input.orderId,
      amount: input.amount,
      currency: input.currency,
      payment_method_id: input.paymentMethodId,
    }),
  });
  if (!res.ok) throw new Error('Payment failed');
  return res.json();
}

export async function payWithApplePayToken(input: {
  orderId: string;
  amount: number;
  currency: string;
  applePayToken: unknown;
}) {
  const res = await fetch('/api/v1/payments/apple-pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: input.orderId,
      amount: input.amount,
      currency: input.currency,
      apple_pay_token: input.applePayToken,
    }),
  });
  if (!res.ok) throw new Error('Payment failed');
  return res.json();
}

export async function payWithCashAppToken(input: {
  orderId: string;
  amount: number;
  currency: string;
  cashAppToken: string;
}) {
  const res = await fetch('/api/v1/payments/cash-app', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: input.orderId,
      amount: input.amount,
      currency: input.currency,
      cash_app_token: input.cashAppToken,
    }),
  });
  if (!res.ok) throw new Error('Payment failed');
  return res.json();
}


---

If you tell me:

• Stack (Next.js? React Native? Nest? Fastify?)
• Processor (Stripe, Adyen, Square, etc.)


I can lock this down even further into exact files + exact SDK calls so your team can literally copy, paste, and wire.