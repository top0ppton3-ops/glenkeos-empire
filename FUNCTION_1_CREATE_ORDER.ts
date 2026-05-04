// ============================================
// PAYPAL CREATE ORDER FUNCTION
// Copy this ENTIRE file into Supabase Dashboard
// Function name: create-paypal-order
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
  }
};

// ============================================
// PayPal Configuration
// ============================================
const CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET")!;
const ENV = Deno.env.get("PAYPAL_ENVIRONMENT") ?? "sandbox";

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
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  try {
    const { order_id, amount, currency = "USD" } = await req.json();

    // Validate input
    if (!order_id || !amount) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_INPUT",
            message: "order_id and amount required"
          }
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    // Get PayPal access token
    const accessToken = await getAccessToken();

    // Create PayPal order
    const body = {
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: order_id,
        amount: {
          currency_code: currency,
          value: amount.toString()
        }
      }]
    };

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("PayPal create order error:", errorData);
      return new Response(
        JSON.stringify({
          error: {
            code: "PAYPAL_ERROR",
            message: errorData.message || "PayPal order creation failed"
          }
        }),
        {
          status: res.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    const data = await res.json();
    const paypalOrderId = data.id as string;

    // Update order in KV store
    try {
      const order = await kv.get(`order:${order_id}`);
      if (order) {
        order.paypal_order_id = paypalOrderId;
        order.payment_amount = amount;
        order.payment_currency = currency;
        order.payment_status = "PENDING";
        order.updated_at = new Date().toISOString();
        await kv.set(`order:${order_id}`, order);
      }
    } catch (kvError) {
      console.warn("KV store update failed (non-critical):", kvError);
    }

    console.log("PayPal order created:", paypalOrderId, "for order:", order_id);

    return new Response(
      JSON.stringify({
        paypal_order_id: paypalOrderId,
        status: data.status,
        links: data.links
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );

  } catch (error) {
    console.error("Create PayPal order error:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "SERVER_ERROR",
          message: error.message
        }
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
});
