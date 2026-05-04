// ============================================
// PAYPAL CAPTURE ORDER FUNCTION
// Copy this ENTIRE file into Supabase Dashboard
// Function name: capture-paypal-order
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
    const { paypal_order_id, order_id } = await req.json();

    // Validate input
    if (!paypal_order_id) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_INPUT",
            message: "paypal_order_id required"
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

    // Capture the PayPal order
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypal_order_id}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("PayPal capture error:", errorData);
      return new Response(
        JSON.stringify({
          error: {
            code: "PAYPAL_ERROR",
            message: errorData.message || "PayPal capture failed"
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
    const status = data.status as string;
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0] ?? null;
    const transactionId = capture?.id ?? null;
    const captureStatus = capture?.status ?? null;

    // Update order in KV store
    if (order_id) {
      try {
        const order = await kv.get(`order:${order_id}`);
        if (order) {
          order.payment_status = captureStatus === "COMPLETED" ? "PAID" : "FAILED";
          order.status = captureStatus === "COMPLETED" ? "PAID" : order.status;
          order.transaction_id = transactionId;
          order.updated_at = new Date().toISOString();
          await kv.set(`order:${order_id}`, order);

          console.log("Order payment captured:", order_id, "Status:", captureStatus);
        }
      } catch (kvError) {
        console.warn("KV store update failed (non-critical):", kvError);
      }
    }

    return new Response(
      JSON.stringify({
        paypal_order_id: data.id,
        capture_id: transactionId,
        status: captureStatus,
        order_id,
        payment_status: captureStatus === "COMPLETED" ? "PAID" : "FAILED"
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
    console.error("Capture PayPal order error:", error);
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
