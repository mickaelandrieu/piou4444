import { NextRequest, NextResponse } from "next/server";
import { scoreFull } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.asrsAnswers !== "object" ||
    typeof body.contextualAnswers !== "object"
  ) {
    return NextResponse.json(
      { error: "asrsAnswers et contextualAnswers requis" },
      { status: 400 },
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
  return NextResponse.json(result);
}
