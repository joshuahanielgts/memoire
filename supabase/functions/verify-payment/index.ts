import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const ALLOWED_ORIGINS = [
  "https://scented-identity-project-main.vercel.app",
  "https://scented-identity-project.vercel.app",
  "http://localhost:8080",
];

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing auth" }), {
      status: 401,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  const { data: { user } } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  // Verify HMAC signature
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return new Response(JSON.stringify({ error: "SIGNATURE_MISMATCH" }), {
      status: 400,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  // Update order status to confirmed
  const { error } = await supabase
    .from("orders")
    .update({
      status: "confirmed",
      razorpay_payment_id,
      razorpay_signature,
      payment_verified_at: new Date().toISOString(),
    })
    .eq("id", order_id)
    .eq("user_id", user.id);

  if (error) {
    return new Response(JSON.stringify({ error: "DB update failed" }), {
      status: 500,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
});
