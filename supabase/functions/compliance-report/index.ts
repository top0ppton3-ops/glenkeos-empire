import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { action, type, data } = await req.json();

    if (action === "create") {
      // Create new compliance record
      const recordId = `COMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data: record, error } = await supabaseClient
        .from("compliance_records")
        .insert({
          record_id: recordId,
          compliance_type: type,
          compliance_status: data.status || "PENDING",
          certification_date: data.certification_date,
          expiry_date: data.expiry_date,
          auditor: data.auditor,
          audit_report_url: data.audit_report_url,
          findings: data.findings || {},
          remediation_plan: data.remediation_plan || {},
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          record: record,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (action === "list") {
      // List compliance records
      let query = supabaseClient
        .from("compliance_records")
        .select("*")
        .order("created_at", { ascending: false });

      if (type) {
        query = query.eq("compliance_type", type);
      }

      const { data: records, error } = await query;

      if (error) throw error;

      // Calculate compliance score
      const compliantCount = records.filter(r => r.compliance_status === "COMPLIANT").length;
      const totalCount = records.length;
      const complianceScore = totalCount > 0 ? (compliantCount / totalCount) * 100 : 0;

      // Check expiring certifications
      const expiringRecords = records.filter(r => {
        if (!r.expiry_date) return false;
        const daysUntilExpiry = Math.floor(
          (new Date(r.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
      });

      return new Response(
        JSON.stringify({
          success: true,
          records: records,
          summary: {
            total: totalCount,
            compliant: compliantCount,
            non_compliant: records.filter(r => r.compliance_status === "NON_COMPLIANT").length,
            in_review: records.filter(r => r.compliance_status === "IN_REVIEW").length,
            pending: records.filter(r => r.compliance_status === "PENDING").length,
            compliance_score: Math.round(complianceScore),
            expiring_soon: expiringRecords.length,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (action === "update") {
      // Update compliance record
      const { data: updated, error } = await supabaseClient
        .from("compliance_records")
        .update(data)
        .eq("record_id", data.record_id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          record: updated,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (action === "audit-trail") {
      // Generate compliance audit trail
      const { data: events } = await supabaseClient
        .from("security_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      return new Response(
        JSON.stringify({
          success: true,
          audit_trail: events,
          generated_at: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Compliance Error:", error);
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
