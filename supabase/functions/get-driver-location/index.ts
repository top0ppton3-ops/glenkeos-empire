import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as kv from "../server/kv_store.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  try {
    const url = new URL(req.url);
    const driver_id = url.searchParams.get("driver_id");

    if (!driver_id) {
      return new Response(
        JSON.stringify({ error: { code: "INVALID_INPUT", message: "driver_id required" } }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const location = await kv.get(`driver_location:${driver_id}`);

    if (!location) {
      return new Response(
        JSON.stringify({ error: { code: "NOT_FOUND", message: "Driver location not found" } }),
        { status: 404, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    return new Response(
      JSON.stringify({ location }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: { code: "SERVER_ERROR", message: error.message } }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});
