import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_BASE = "https://api.razorpay.com/v1";

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

  const { order_id } = await req.json();

  // Fetch order to get price
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  if (order.razorpay_order_id) {
    // Already initiated — return existing
    return new Response(
      JSON.stringify({ razorpay_order_id: order.razorpay_order_id, amount: order.price_cents }),
      {
        status: 200,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      }
    );
  }

  // Create Razorpay order
  const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
  const credentials = btoa(`${keyId}:${keySecret}`);

  const rzpRes = await fetch(`${RAZORPAY_BASE}/orders`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: order.price_cents,  // Razorpay uses paise
      currency: "INR",
      receipt: order_id,
      notes: { memoire_order_id: order_id },
    }),
  });

  if (!rzpRes.ok) {
    const err = await rzpRes.json();
    return new Response(JSON.stringify({ error: "Razorpay error", detail: err }), {
      status: 502,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  const rzpOrder = await rzpRes.json();

  // Store Razorpay order ID
  await supabase
    .from("orders")
    .update({ razorpay_order_id: rzpOrder.id })
    .eq("id", order_id);

  return new Response(
    JSON.stringify({ razorpay_order_id: rzpOrder.id, amount: order.price_cents, key_id: keyId }),
    {
      status: 200,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    }
  );
});
