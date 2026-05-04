import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as kv from "../server/kv_store.ts";

serve(async (req) => {
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
    const { driver_id, lat, lng, heading, speed, accuracy } = await req.json();

    if (!driver_id || lat === undefined || lng === undefined) {
      return new Response(
        JSON.stringify({ error: { code: "INVALID_INPUT", message: "driver_id, lat, lng required" } }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const locationData = {
      driver_id,
      lat,
      lng,
      heading: heading || null,
      speed: speed || null,
      accuracy: accuracy || null,
      updated_at: new Date().toISOString()
    };

    // Store in KV for real-time access
    await kv.set(`driver_location:${driver_id}`, locationData);

    return new Response(
      JSON.stringify({ success: true, location: locationData }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: { code: "SERVER_ERROR", message: error.message } }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});
