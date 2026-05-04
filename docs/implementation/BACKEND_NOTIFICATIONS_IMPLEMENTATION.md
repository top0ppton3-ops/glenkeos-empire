# Backend Implementation Guide: Notifications (SMS & Email)

**Version**: 1.0.0  
**Last Updated**: April 24, 2026  
**Owner**: Backend Engineering Team  
**Status**: Implementation Guide

---

## 1. Overview

This guide covers implementation of the complete notification system for GlenKeos:
- **SMS notifications** via Twilio (order updates, driver notifications)
- **Transactional emails** via SendGrid (order confirmations, password resets)
- **In-app notifications** (WebSocket push via Supabase Realtime)
- **Notification preferences** (customer opt-in/opt-out)
- **Notification templates** (consistent messaging across channels)
- **Compliance** (GDPR consent, CAN-SPAM, TCPA)

---

## 2. Notification Types & Triggers

### 2.1 SMS Notifications (Twilio)

| Trigger | Recipient | Template | Priority |
|---------|-----------|----------|----------|
| **Order Placed** | Customer | "Your order #{{order_id}} has been placed. Track: {{link}}" | Medium |
| **Order Confirmed** | Customer | "Your order is confirmed! Estimated delivery: {{eta}}" | High |
| **Order Ready** | Customer | "Your order is ready for pickup at {{store_name}}" | High |
| **Driver Assigned** | Customer | "{{driver_name}} is on the way with your order. Track: {{link}}" | High |
| **Order Delivered** | Customer | "Your order has been delivered. Enjoy!" | Medium |
| **New Order Alert** | Store Manager | "New order #{{order_id}} received. Total: ${{amount}}" | High |
| **Delivery Assignment** | Driver | "New delivery assigned. Pickup at {{store_name}}. Details: {{link}}" | Critical |
| **Low Stock Alert** | Store Manager | "Low stock: {{item_name}} ({{quantity}} left)" | Medium |

### 2.2 Email Notifications (SendGrid)

| Trigger | Recipient | Template | Priority |
|---------|-----------|----------|----------|
| **Order Confirmation** | Customer | Full order details, receipt, ETA | High |
| **Order Cancelled** | Customer | Cancellation notice, refund details | High |
| **Password Reset** | User | Password reset link (expires 1 hour) | Critical |
| **Account Created** | User | Welcome email, account verification link | High |
| **Promotion** | Customer (opted-in) | Marketing emails, discounts | Low |
| **Weekly Sales Report** | Store Manager | Sales summary, top items, revenue | Medium |

### 2.3 In-App Notifications (Realtime)

| Trigger | Recipient | Message | Auto-dismiss |
|---------|-----------|---------|--------------|
| **Order Status Change** | Customer | "Your order is now: {{status}}" | No |
| **New Order** | Store Manager | "New order received" | Yes (5 sec) |
| **New Message** | Customer Support | "New support ticket" | No |
| **System Alert** | All users | "Scheduled maintenance in 1 hour" | No |

---

## 3. Twilio SMS Integration

### 3.1 Setup

**Create Twilio Account**:
1. Sign up at https://www.twilio.com/
2. Verify phone number
3. Purchase phone number (e.g., +1-555-123-4567, $1/month)
4. Get Account SID and Auth Token from dashboard

**Environment Variables**:
```bash
# Vercel Dashboard → Settings → Environment Variables
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567  # Your Twilio phone number
```

**Install Twilio SDK** (Edge Function):
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Twilio client (use Deno-compatible fetch-based client)
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

async function sendSMS(to: string, body: string): Promise<any> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append('To', to);
  formData.append('From', TWILIO_PHONE_NUMBER);
  formData.append('Body', body);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twilio API error: ${error}`);
  }

  return await response.json();
}
```

### 3.2 Send SMS (Edge Function)

**supabase/functions/send-sms/index.ts**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

async function sendSMS(to: string, body: string): Promise<any> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append('To', to);
  formData.append('From', TWILIO_PHONE_NUMBER);
  formData.append('Body', body);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twilio API error: ${error}`);
  }

  return await response.json();
}

serve(async (req) => {
  try {
    const { phone_number, message, template, template_data } = await req.json();

    // Validate phone number format (E.164)
    if (!phone_number || !/^\+[1-9]\d{1,14}$/.test(phone_number)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number (must be E.164 format: +1234567890)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check user notification preferences (GDPR compliance)
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('sms_notifications_enabled')
      .eq('phone', phone_number)
      .single();

    if (user && !user.sms_notifications_enabled) {
      console.log(`SMS not sent: User opted out (${phone_number})`);
      return new Response(
        JSON.stringify({ success: false, reason: 'User opted out of SMS notifications' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Apply template if specified
    let finalMessage = message;
    if (template && template_data) {
      finalMessage = applyTemplate(template, template_data);
    }

    // Enforce character limit (160 chars for single SMS, 1600 for concatenated)
    if (finalMessage.length > 1600) {
      return new Response(
        JSON.stringify({ error: 'Message too long (max 1600 characters)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS via Twilio
    const result = await sendSMS(phone_number, finalMessage);

    // Log notification
    await supabaseClient
      .from('compliance_audit_log')
      .insert({
        event_type: 'SMS_SENT',
        event_data: {
          phone_number,
          message_sid: result.sid,
          message_length: finalMessage.length,
          template
        }
      });

    return new Response(
      JSON.stringify({ success: true, message_sid: result.sid }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('SMS send error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Template engine (simple string replacement)
function applyTemplate(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}
```

**Deploy**:
```bash
supabase functions deploy send-sms --no-verify-jwt

# Set environment variables
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token_here
supabase secrets set TWILIO_PHONE_NUMBER=+15551234567

# Test
curl -X POST https://beswluhdxaphtitaovly.supabase.co/functions/v1/send-sms \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+15555551234","message":"Test SMS from GlenKeos"}'

# Expected: {"success":true,"message_sid":"SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
```

### 3.3 SMS Templates

**Create Template Table**:
```sql
CREATE TABLE sms_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(50) UNIQUE NOT NULL,
  template_body TEXT NOT NULL,
  variables VARCHAR(100)[], -- Array of variable names: {{order_id}}, {{driver_name}}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert templates
INSERT INTO sms_templates (template_name, template_body, variables) VALUES
  ('order_placed', 'Your order #{{order_id}} has been placed. Track: {{track_link}}', ARRAY['order_id', 'track_link']),
  ('order_confirmed', 'Your order is confirmed! Estimated delivery: {{eta}}', ARRAY['eta']),
  ('driver_assigned', '{{driver_name}} is on the way with your order. Track: {{track_link}}', ARRAY['driver_name', 'track_link']),
  ('order_delivered', 'Your order has been delivered. Enjoy your meal!', ARRAY[]::VARCHAR[]),
  ('new_order_alert', 'New order #{{order_id}} received. Total: ${{amount}}. View: {{link}}', ARRAY['order_id', 'amount', 'link']),
  ('delivery_assignment', 'New delivery assigned. Pickup at {{store_name}}. Details: {{link}}', ARRAY['store_name', 'link']);
```

**Usage**:
```typescript
// Send SMS with template
const { error } = await supabase.functions.invoke('send-sms', {
  body: {
    phone_number: customer.phone,
    template: 'order_confirmed',
    template_data: {
      eta: '30 minutes'
    }
  }
});
```

---

## 4. SendGrid Email Integration

### 4.1 Setup

**Create SendGrid Account**:
1. Sign up at https://sendgrid.com/
2. Verify sender email (e.g., noreply@glenkeos.com)
3. Create API key with "Mail Send" permission

**Environment Variables**:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@glenkeos.com
SENDGRID_FROM_NAME=GlenKeos
```

### 4.2 Send Email (Edge Function)

**supabase/functions/send-email/index.ts**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL');
const SENDGRID_FROM_NAME = Deno.env.get('SENDGRID_FROM_NAME') || 'GlenKeos';

async function sendEmail(to: string, subject: string, html: string): Promise<any> {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }],
        subject
      }],
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: SENDGRID_FROM_NAME
      },
      content: [{
        type: 'text/html',
        value: html
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${error}`);
  }

  return { success: true };
}

serve(async (req) => {
  try {
    const { to, subject, html, template, template_data } = await req.json();

    // Validate email address
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check user notification preferences
    const { data: user } = await supabaseClient
      .from('users')
      .select('email_notifications_enabled')
      .eq('email', to)
      .single();

    if (user && !user.email_notifications_enabled) {
      console.log(`Email not sent: User opted out (${to})`);
      return new Response(
        JSON.stringify({ success: false, reason: 'User opted out of email notifications' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Apply template if specified
    let finalHtml = html;
    let finalSubject = subject;
    if (template && template_data) {
      const { data: emailTemplate } = await supabaseClient
        .from('email_templates')
        .select('*')
        .eq('template_name', template)
        .single();

      if (emailTemplate) {
        finalSubject = applyTemplate(emailTemplate.subject, template_data);
        finalHtml = applyTemplate(emailTemplate.html_body, template_data);
      }
    }

    // Send email via SendGrid
    await sendEmail(to, finalSubject, finalHtml);

    // Log notification
    await supabaseClient
      .from('compliance_audit_log')
      .insert({
        event_type: 'EMAIL_SENT',
        event_data: {
          to,
          subject: finalSubject,
          template
        }
      });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Email send error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function applyTemplate(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}
```

**Deploy**:
```bash
supabase functions deploy send-email --no-verify-jwt

# Set environment variables
supabase secrets set SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set SENDGRID_FROM_EMAIL=noreply@glenkeos.com
supabase secrets set SENDGRID_FROM_NAME="GlenKeos"

# Test
curl -X POST https://beswluhdxaphtitaovly.supabase.co/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to":"test@example.com",
    "subject":"Test Email",
    "html":"<h1>Hello from GlenKeos!</h1>"
  }'

# Expected: {"success":true}
```

### 4.3 Email Templates

**Create Template Table**:
```sql
CREATE TABLE email_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(50) UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  plain_text_body TEXT, -- Fallback for email clients that don't support HTML
  variables VARCHAR(100)[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert templates
INSERT INTO email_templates (template_name, subject, html_body, variables) VALUES
  (
    'order_confirmation',
    'Order Confirmation #{{order_id}}',
    '<html>
      <body style="font-family: Arial, sans-serif;">
        <h1>Thank you for your order!</h1>
        <p>Your order <strong>#{{order_id}}</strong> has been confirmed.</p>
        <p><strong>Total:</strong> ${{total_amount}}</p>
        <p><strong>Estimated Delivery:</strong> {{eta}}</p>
        <p><a href="{{track_link}}">Track your order</a></p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          GlenKeos | <a href="{{unsubscribe_link}}">Unsubscribe</a>
        </p>
      </body>
    </html>',
    ARRAY['order_id', 'total_amount', 'eta', 'track_link', 'unsubscribe_link']
  ),
  (
    'password_reset',
    'Reset Your Password',
    '<html>
      <body style="font-family: Arial, sans-serif;">
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <p><a href="{{reset_link}}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      </body>
    </html>',
    ARRAY['reset_link']
  );
```

---

## 5. Database Trigger: Automated Notifications

### 5.1 Trigger Function (Send SMS on Order Status Change)

```sql
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  customer_phone VARCHAR(15);
  customer_email VARCHAR(255);
  notification_message TEXT;
BEGIN
  -- Only trigger for specific status changes
  IF NEW.status != OLD.status AND NEW.status IN ('CONFIRMED', 'PREPARING', 'IN_DELIVERY', 'DELIVERED') THEN
    
    -- Get customer contact info
    SELECT phone, email INTO customer_phone, customer_email
    FROM users u
    JOIN customers c ON c.customer_id = u.user_id
    WHERE c.customer_id = NEW.customer_id;

    -- Send SMS notification
    IF customer_phone IS NOT NULL THEN
      PERFORM
        net.http_post(
          url := 'https://beswluhdxaphtitaovly.supabase.co/functions/v1/send-sms',
          headers := '{"Content-Type": "application/json"}'::jsonb,
          body := jsonb_build_object(
            'phone_number', customer_phone,
            'template', 
              CASE NEW.status
                WHEN 'CONFIRMED' THEN 'order_confirmed'
                WHEN 'IN_DELIVERY' THEN 'driver_assigned'
                WHEN 'DELIVERED' THEN 'order_delivered'
                ELSE NULL
              END,
            'template_data', jsonb_build_object(
              'order_id', NEW.order_id,
              'eta', '30 minutes', -- TODO: Calculate actual ETA
              'driver_name', 'John Doe', -- TODO: Fetch driver name
              'track_link', 'https://glenkeos.com/orders/' || NEW.order_id
            )
          )
        );
    END IF;

    -- Send email notification
    IF customer_email IS NOT NULL THEN
      PERFORM
        net.http_post(
          url := 'https://beswluhdxaphtitaovly.supabase.co/functions/v1/send-email',
          headers := '{"Content-Type": "application/json"}'::jsonb,
          body := jsonb_build_object(
            'to', customer_email,
            'template', 'order_status_update',
            'template_data', jsonb_build_object(
              'order_id', NEW.order_id,
              'status', NEW.status,
              'track_link', 'https://glenkeos.com/orders/' || NEW.order_id
            )
          )
        );
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to orders table
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();
```

**Enable HTTP Extension** (required for `net.http_post`):
```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS http;
```

---

## 6. In-App Notifications (Realtime)

### 6.1 Notifications Table

```sql
CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ERROR')),
  read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500), -- Optional link (e.g., /orders/123)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only see their own notifications
CREATE POLICY notifications_isolation ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Index for performance
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### 6.2 Send In-App Notification (Function)

```typescript
// From Edge Function or application code
const { error } = await supabase
  .from('notifications')
  .insert({
    user_id: customer_id,
    tenant_id: 'chic-on-chain-001',
    title: 'Order Confirmed',
    message: 'Your order #12345 has been confirmed!',
    type: 'SUCCESS',
    action_url: '/orders/12345'
  });

// Realtime automatically broadcasts to subscribed clients
```

### 6.3 Frontend: Subscribe to Notifications

**src/app/components/NotificationBell.tsx**:
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch existing notifications
    fetchNotifications();

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user_id}` // Replace with actual user ID
        },
        (payload) => {
          console.log('New notification:', payload.new);
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
          
          // Show browser notification (if permission granted)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(payload.new.title, {
              body: payload.new.message,
              icon: '/logo.png'
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    }
  }

  async function markAsRead(notificationId: string) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('notification_id', notificationId);

    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  return (
    <div className="relative">
      <button className="relative">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification dropdown (implementation omitted) */}
    </div>
  );
}
```

---

## 7. Notification Preferences (GDPR Compliance)

### 7.1 Add Preference Columns to Users Table

```sql
ALTER TABLE users ADD COLUMN sms_notifications_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN push_notifications_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN marketing_emails_enabled BOOLEAN DEFAULT FALSE; -- Opt-in required
```

### 7.2 Frontend: Notification Preferences UI

**src/app/pages/NotificationSettings.tsx**:
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function NotificationSettings() {
  const [preferences, setPreferences] = useState({
    sms_notifications_enabled: true,
    email_notifications_enabled: true,
    push_notifications_enabled: true,
    marketing_emails_enabled: false
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('users')
      .select('sms_notifications_enabled, email_notifications_enabled, push_notifications_enabled, marketing_emails_enabled')
      .eq('user_id', user.user.id)
      .single();

    if (data) {
      setPreferences(data);
    }
  }

  async function savePreferences() {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update(preferences)
      .eq('user_id', user.user.id);

    if (!error) {
      alert('Preferences saved!');
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Notification Preferences</h2>
      
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={preferences.sms_notifications_enabled}
          onChange={(e) => setPreferences({ ...preferences, sms_notifications_enabled: e.target.checked })}
        />
        <span>SMS notifications (order updates)</span>
      </label>
      
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={preferences.email_notifications_enabled}
          onChange={(e) => setPreferences({ ...preferences, email_notifications_enabled: e.target.checked })}
        />
        <span>Email notifications (receipts, confirmations)</span>
      </label>
      
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={preferences.push_notifications_enabled}
          onChange={(e) => setPreferences({ ...preferences, push_notifications_enabled: e.target.checked })}
        />
        <span>In-app notifications</span>
      </label>
      
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={preferences.marketing_emails_enabled}
          onChange={(e) => setPreferences({ ...preferences, marketing_emails_enabled: e.target.checked })}
        />
        <span>Marketing emails (promotions, newsletters)</span>
      </label>
      
      <button
        onClick={savePreferences}
        className="bg-blue-600 text-white py-2 px-4 rounded"
      >
        Save Preferences
      </button>
    </div>
  );
}
```

---

## 8. Testing

### 8.1 SMS Testing

**Twilio Test Mode**:
- Use Twilio "verified caller IDs" in sandbox mode
- SMS sent to verified numbers only (free testing)

**Test**:
```bash
curl -X POST https://beswluhdxaphtitaovly.supabase.co/functions/v1/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number":"+15555551234",
    "message":"Test SMS from GlenKeos"
  }'
```

### 8.2 Email Testing

**SendGrid Test Mode**:
- Use "sandbox mode" in SendGrid dashboard
- Emails not delivered, but API calls succeed

**Test**:
```bash
curl -X POST https://beswluhdxaphtitaovly.supabase.co/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to":"test@example.com",
    "subject":"Test Email",
    "html":"<h1>Hello!</h1>"
  }'
```

---

## 9. Production Checklist

- [ ] Configure Twilio production credentials
- [ ] Verify sender email domain in SendGrid (SPF/DKIM/DMARC)
- [ ] Set up email unsubscribe link (CAN-SPAM compliance)
- [ ] Implement SMS opt-in confirmation (TCPA compliance)
- [ ] Test all notification triggers end-to-end
- [ ] Monitor delivery rates (SendGrid/Twilio dashboards)
- [ ] Set up alerts for high failure rates
- [ ] Test notification preferences UI
- [ ] Verify GDPR consent checkboxes during signup

---

**Notifications are customer-facing. Test thoroughly before production.**
