import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing auth" }), {
      status: 401,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  // Rate limiting check
  const withinQuota = await checkUserQuota(supabase, user.id);
  if (!withinQuota) {
    return new Response(JSON.stringify({ error: "RATE_LIMIT_EXCEEDED" }), {
      status: 429,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  // Input validation
  let body: { composition_id?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  const { composition_id } = body;
  if (
    typeof composition_id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(composition_id)
  ) {
    return new Response(JSON.stringify({ error: "Invalid composition_id" }), {
      status: 400,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  // Fetch and validate composition
  const { data: comp, error: fetchError } = await supabase
    .from("compositions")
    .select("*")
    .eq("id", composition_id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !comp) {
    return new Response(JSON.stringify({ error: "Composition not found" }), {
      status: 404,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  if (comp.status === "complete") {
    return new Response(
      JSON.stringify({ result: comp.generated_result }),
      { status: 200, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } }
    );
  }

  // Set processing
  await supabase
    .from("compositions")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", composition_id);

  // Call Gemini with timeout
  let generatedResult: unknown = null;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

      const geminiRes = await fetch(
        `${GEMINI_API_URL}?key=${Deno.env.get("GEMINI_API_KEY")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: buildFragrancePrompt(comp.memory_input, comp.refinements),
                  },
                ],
              },
            ],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      clearTimeout(timeout);

      if (!geminiRes.ok) {
        throw new Error(`Gemini HTTP ${geminiRes.status}`);
      }

      const geminiData = await geminiRes.json();
      const rawText =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      generatedResult = JSON.parse(rawText);
      break;
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      if (attempt === 0) await new Promise((r) => setTimeout(r, 1000)); // backoff
    }
  }

  if (!generatedResult) {
    // Failure: revert to draft with error metadata
    await supabase
      .from("compositions")
      .update({
        status: "draft",
        error_metadata: { reason: "generation_failed", detail: lastError, failed_at: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      })
      .eq("id", composition_id);

    return new Response(
      JSON.stringify({ error: "GENERATION_FAILED", detail: lastError }),
      {
        status: 500,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      }
    );
  }

  // Success
  await supabase
    .from("compositions")
    .update({
      status: "complete",
      generated_result: generatedResult,
      error_metadata: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", composition_id);

  // Record quota usage
  await recordQuotaUsage(supabase, user.id);

  return new Response(JSON.stringify({ result: generatedResult }), {
    status: 200,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildFragrancePrompt(memoryInput: string, refinements: unknown): string {
  const safeMemory = String(memoryInput ?? "").slice(0, 2000);
  const safeRefinements = JSON.stringify(refinements ?? {}).slice(0, 500);
  return `
You are a master perfumer. Based on the user's memory and refinements, compose a luxury fragrance profile.

Memory: ${safeMemory}
Refinements: ${safeRefinements}

Return ONLY valid JSON matching this exact schema (no markdown, no preamble):
{
  "name": "string",
  "tagline": "string",
  "story": "string (2-3 sentences)",
  "notes": {
    "top": ["string", "string", "string"],
    "heart": ["string", "string", "string"],
    "base": ["string", "string", "string"]
  },
  "mood": "string",
  "season": "string",
  "intensity": "light | moderate | intense | overwhelming",
  "accords": ["string", "string", "string"]
}
`.trim();
}

async function checkUserQuota(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<boolean> {
  const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour window
  const { count } = await supabase
    .from("generation_quota")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", windowStart);

  return (count ?? 0) < 10; // 10 generations per hour per user
}

async function recordQuotaUsage(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<void> {
  await supabase.from("generation_quota").insert({ user_id: userId });
}
