import type { APIRoute } from "astro";
import { scoreFull } from "@/lib/scoring";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.asrsAnswers !== "object" ||
    typeof body.contextualAnswers !== "object"
  ) {
    return new Response(
      JSON.stringify({ error: "asrsAnswers et contextualAnswers requis" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
  const asrs: Record<number, number> = {};
  for (const [k, v] of Object.entries(body.asrsAnswers)) {
    const id = Number(k);
    const n = Number(v);
    if (!Number.isInteger(id) || !Number.isFinite(n) || n < 0 || n > 4) continue;
    asrs[id] = n;
  }
  const ctx: Record<string, number> = {};
  for (const [k, v] of Object.entries(body.contextualAnswers)) {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > 4) continue;
    ctx[k] = n;
  }
  const result = scoreFull(asrs, ctx);
  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
};
