// ============================================
// PAYPAL WEBHOOK FUNCTION
// Copy this ENTIRE file into Supabase Dashboard
// Function name: paypal-webhook
// ============================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// ============================================
// KV Store (inline)
// ============================================
const kvClient = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

const kv = {
  get: async (key: string): Promise<any> => {
    const supabase = kvClient();
    const { data, error } = await supabase
      .from("kv_store_89a553ba")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.value;
  },

  set: async (key: string, value: any): Promise<void> => {
    const supabase = kvClient();
    const { error } = await supabase
      .from("kv_store_89a553ba")
      .upsert({ key, value });
    if (error) throw new Error(error.message);
  },

  getByPrefix: async (prefix: string): Promise<any[]> => {
    const supabase = kvClient();
    const { data, error } = await supabase
      .from("kv_store_89a553ba")
      .select("key, value")
      .like("key", `${prefix}%`);
    if (error) throw new Error(error.message);
    return data?.map((d) => d.value) ?? [];
  }
};

// ============================================
// PayPal Configuration
// ============================================
const CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET")!;
const ENV = Deno.env.get("PAYPAL_ENVIRONMENT") ?? "sandbox";
const WEBHOOK_ID = Deno.env.get("PAYPAL_WEBHOOK_ID");

const PAYPAL_BASE = ENV === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!res.ok) {
    throw new Error(`PayPal token error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

async function verifyWebhook(body: string, headers: Headers): Promise<boolean> {
  // Skip verification if WEBHOOK_ID not configured
  if (!WEBHOOK_ID) {
    console.warn("PAYPAL_WEBHOOK_ID not set - skipping signature verification");
    return true;
  }

  try {
    const accessToken = await getAccessToken();

    const verificationBody = {
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: WEBHOOK_ID,
      webhook_event: JSON.parse(body)
    };

    const res = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(verificationBody)
    });

    if (!res.ok) {
      console.error("Webhook verify error:", res.status, await res.text());
      return false;
    }

    const data = await res.json();
    return data.verification_status === "SUCCESS";
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return false;
  }
}

// ============================================
// Main Handler
// ============================================
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, paypal-auth-algo, paypal-cert-url, paypal-transmission-id, paypal-transmission-sig, paypal-transmission-time"
      }
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const bodyText = await req.text();

    // Verify webhook signature
    const valid = await verifyWebhook(bodyText, req.headers);
    if (!valid) {
      console.error("Invalid webhook signature");
      return new Response("Invalid webhook signature", { status: 400 });
    }

    const event = JSON.parse(bodyText);
    const eventType = event.event_type as string;

    console.log("Processing PayPal webhook:", eventType);

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id;
        const captureId = event.resource?.id;
        const amount = event.resource?.amount?.value;

        console.log("Payment captured:", { paypalOrderId, captureId, amount });

        // Find order by paypal_order_id and update
        try {
          const orders = await kv.getByPrefix("order:");
          for (const order of orders) {
            if (order.paypal_order_id === paypalOrderId) {
              order.payment_status = "PAID";
              order.status = "PAID";
              order.transaction_id = captureId;
              order.updated_at = new Date().toISOString();
              await kv.set(`order:${order.order_id}`, order);

              console.log("Order updated to PAID:", order.order_id);
              break;
            }
          }
        } catch (kvError) {
          console.warn("KV store update failed (non-critical):", kvError);
        }
        break;
      }

      case "PAYMENT.CAPTURE.DENIED": {
        const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id;

        console.log("Payment denied:", paypalOrderId);

        try {
          const orders = await kv.getByPrefix("order:");
          for (const order of orders) {
            if (order.paypal_order_id === paypalOrderId) {
              order.payment_status = "FAILED";
              order.updated_at = new Date().toISOString();
              await kv.set(`order:${order.order_id}`, order);

              console.log("Order marked as FAILED:", order.order_id);
              break;
            }
          }
        } catch (kvError) {
          console.warn("KV store update failed (non-critical):", kvError);
        }
        break;
      }

      default:
        console.log("Unhandled PayPal event:", eventType);
    }

    return new Response("OK", {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", message: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
