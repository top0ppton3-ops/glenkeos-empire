import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as kv from "../server/kv_store.ts";

const POINTS_PER_DOLLAR = 10; // 10 points per $1 spent

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
    const { customer_id, order_id, amount, action } = await req.json();

    if (!customer_id || !action) {
      return new Response(
        JSON.stringify({ error: { code: "INVALID_INPUT", message: "customer_id and action required" } }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Get or create loyalty account
    let account = await kv.get(`loyalty:${customer_id}`);
    if (!account) {
      account = {
        customer_id,
        points_balance: 0,
        lifetime_points: 0,
        tier: 'BRONZE',
        created_at: new Date().toISOString()
      };
    }

    let pointsChange = 0;
    let reason = '';

    if (action === 'EARN' && amount) {
      pointsChange = Math.floor(amount * POINTS_PER_DOLLAR);
      reason = `Earned from order ${order_id}`;
      account.points_balance += pointsChange;
      account.lifetime_points += pointsChange;
    } else if (action === 'REDEEM' && amount) {
      pointsChange = -amount;
      reason = `Redeemed for order ${order_id}`;
      if (account.points_balance + pointsChange < 0) {
        return new Response(
          JSON.stringify({ error: { code: "INSUFFICIENT_POINTS", message: "Not enough points" } }),
          { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }
      account.points_balance += pointsChange;
    }

    // Update tier based on lifetime points
    if (account.lifetime_points >= 10000) {
      account.tier = 'PLATINUM';
    } else if (account.lifetime_points >= 5000) {
      account.tier = 'GOLD';
    } else if (account.lifetime_points >= 1000) {
      account.tier = 'SILVER';
    }

    account.updated_at = new Date().toISOString();

    // Save account
    await kv.set(`loyalty:${customer_id}`, account);

    // Log transaction
    const transaction = {
      customer_id,
      order_id,
      points_change: pointsChange,
      reason,
      balance_after: account.points_balance,
      created_at: new Date().toISOString()
    };

    // Store transaction
    const transactions = await kv.get(`loyalty_transactions:${customer_id}`) || [];
    transactions.push(transaction);
    await kv.set(`loyalty_transactions:${customer_id}`, transactions);

    return new Response(
      JSON.stringify({ account, transaction }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: { code: "SERVER_ERROR", message: error.message } }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});
