import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9";

const ALLOWED_ORIGINS = [
  "https://scented-identity-project-main.vercel.app",
  "https://scented-identity-project.vercel.app",
  "http://localhost:8080",
];

const VALID_FORMATS = ["eau_de_parfum", "parfum", "oil", "candle", "diffuser"] as const;

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
    return json({ error: "Missing auth" }, 401, origin, corsHeaders);
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (authError || !user) return json({ error: "Unauthorized" }, 401, origin, corsHeaders);

  let body: { composition_id?: unknown; format?: unknown; idempotency_key?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, origin, corsHeaders);
  }

  const { composition_id, format, idempotency_key } = body;

  // Input validation
  if (
    typeof composition_id !== "string" ||
    !/^[0-9a-f-]{36}$/.test(composition_id)
  ) {
    return json({ error: "Invalid composition_id" }, 400, origin, corsHeaders);
  }

  if (typeof format !== "string" || !VALID_FORMATS.includes(format as typeof VALID_FORMATS[number])) {
    return json({ error: `Invalid format. Must be one of: ${VALID_FORMATS.join(", ")}` }, 400, origin, corsHeaders);
  }

  const idemKey = typeof idempotency_key === "string" ? idempotency_key : uuidv4();

  // Call atomic RPC
  const { data, error } = await supabase.rpc("create_order_atomic", {
    p_user_id: user.id,
    p_composition_id: composition_id,
    p_format: format,
    p_idempotency_key: idemKey,
  });

  if (error) {
    if (error.message.includes("COMPOSITION_NOT_FOUND_OR_INCOMPLETE")) {
      return json({ error: "Composition not found or not complete" }, 404, origin, corsHeaders);
    }
    if (error.message.includes("INVALID_FORMAT")) {
      return json({ error: "Invalid format" }, 400, origin, corsHeaders);
    }
    console.error("RPC error:", error);
    return json({ error: "Order creation failed" }, 500, origin, corsHeaders);
  }

  return json(data, 200, origin, corsHeaders);
});

function json(
  payload: unknown,
  status: number,
  origin: string,
  headers: (o: string) => Record<string, string>
) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...headers(origin), "Content-Type": "application/json" },
  });
}
