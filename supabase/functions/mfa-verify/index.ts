import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as OTPAuth from "https://esm.sh/otpauth@9";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { action, customer_id, code } = await req.json();

    if (action === "setup") {
      // Generate new MFA secret
      const secret = new OTPAuth.Secret({ size: 20 });
      const totp = new OTPAuth.TOTP({
        issuer: "GlenKeos",
        label: customer_id,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret,
      });

      // Store encrypted secret
      const { error } = await supabaseClient
        .from("customers")
        .update({
          mfa_secret: secret.base32,
          mfa_enabled: false, // Will enable after first verification
        })
        .eq("customer_id", customer_id);

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          secret: secret.base32,
          qr_code: totp.toString(), // otpauth:// URL for QR code
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (action === "verify") {
      // Verify MFA code
      const { data: customer } = await supabaseClient
        .from("customers")
        .select("mfa_secret")
        .eq("customer_id", customer_id)
        .single();

      if (!customer || !customer.mfa_secret) {
        throw new Error("MFA not set up for this customer");
      }

      const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(customer.mfa_secret),
      });

      const isValid = totp.validate({ token: code, window: 1 }) !== null;

      if (isValid) {
        // Enable MFA
        await supabaseClient
          .from("customers")
          .update({ mfa_enabled: true })
          .eq("customer_id", customer_id);

        // Log security event
        await supabaseClient.from("security_events").insert({
          event_id: `EVT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          event_type: "MFA_VERIFIED",
          user_id: customer_id,
          action_details: { timestamp: new Date().toISOString() },
          severity: "INFO",
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          valid: isValid,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (action === "disable") {
      // Disable MFA
      await supabaseClient
        .from("customers")
        .update({
          mfa_enabled: false,
          mfa_secret: null,
        })
        .eq("customer_id", customer_id);

      // Log security event
      await supabaseClient.from("security_events").insert({
        event_id: `EVT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        event_type: "MFA_DISABLED",
        user_id: customer_id,
        action_details: { timestamp: new Date().toISOString() },
        severity: "WARNING",
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "MFA disabled",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("MFA Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
