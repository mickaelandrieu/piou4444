import type { APIRoute } from "astro";
import { scoreScreener } from "@/lib/scoring";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.answers !== "object") {
    return new Response(
      JSON.stringify({ error: "answers (object: questionId -> 0..4) requis" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
  const answers: Record<number, number> = {};
  for (const [k, v] of Object.entries(body.answers)) {
    const id = Number(k);
    const n = Number(v);
    if (!Number.isInteger(id) || !Number.isFinite(n) || n < 0 || n > 4) continue;
    answers[id] = n;
  }
  const result = scoreScreener(answers);
  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
};
