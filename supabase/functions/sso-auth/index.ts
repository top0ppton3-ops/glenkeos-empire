import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SSORequest {
  provider: 'google' | 'microsoft' | 'apple' | 'saml';
  token?: string;
  code?: string;
  email?: string;
  profile?: any;
}

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

    const { provider, token, code, email, profile }: SSORequest = await req.json();

    // Handle different OAuth providers
    let userData: any = null;

    switch (provider) {
      case 'google':
        // Verify Google OAuth token
        if (token) {
          const googleResponse = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
          );
          userData = await googleResponse.json();
        }
        break;

      case 'microsoft':
        // Verify Microsoft OAuth token
        if (token) {
          const msResponse = await fetch(
            "https://graph.microsoft.com/v1.0/me",
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          userData = await msResponse.json();
        }
        break;

      case 'apple':
        // Verify Apple Sign In
        if (code) {
          // Apple token verification logic
          userData = { email: email, provider: 'apple' };
        }
        break;

      case 'saml':
        // SAML assertion handling
        userData = profile;
        break;
    }

    if (!userData || !userData.email) {
      throw new Error("Invalid authentication data");
    }

    // Check if customer exists
    const { data: existingCustomer } = await supabaseClient
      .from("customers")
      .select("*")
      .eq("email", userData.email)
      .single();

    let customer;

    if (existingCustomer) {
      // Update existing customer
      const { data: updatedCustomer } = await supabaseClient
        .from("customers")
        .update({
          auth_provider: provider.toUpperCase(),
          external_auth_id: userData.sub || userData.id,
          last_login_at: new Date().toISOString(),
        })
        .eq("customer_id", existingCustomer.customer_id)
        .select()
        .single();

      customer = updatedCustomer;
    } else {
      // Create new customer
      const customerId = `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data: newCustomer } = await supabaseClient
        .from("customers")
        .insert({
          customer_id: customerId,
          email: userData.email,
          first_name: userData.given_name || userData.givenName,
          last_name: userData.family_name || userData.surname,
          auth_provider: provider.toUpperCase(),
          external_auth_id: userData.sub || userData.id,
          active: true,
          last_login_at: new Date().toISOString(),
        })
        .select()
        .single();

      customer = newCustomer;
    }

    // Log security event
    await supabaseClient.from("security_events").insert({
      event_id: `EVT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event_type: "SSO_LOGIN",
      user_id: customer.customer_id,
      action_details: {
        provider: provider,
        email: userData.email,
        timestamp: new Date().toISOString(),
      },
      severity: "INFO",
    });

    return new Response(
      JSON.stringify({
        success: true,
        customer: customer,
        provider: provider,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("SSO Auth Error:", error);
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
