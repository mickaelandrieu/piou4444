import { NextRequest, NextResponse } from "next/server";
import { scoreScreener } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.answers !== "object") {
    return NextResponse.json(
      { error: "answers (object: questionId -> 0..4) requis" },
      { status: 400 },
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
  return NextResponse.json(result);
}
