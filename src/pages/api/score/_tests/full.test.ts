import { describe, it, expect } from "vitest";
import { POST } from "../full";

type Ctx = Parameters<typeof POST>[0];

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/score/full", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const allAsrs = (v: number) =>
  Object.fromEntries(Array.from({ length: 18 }, (_, i) => [i + 1, v]));
const allCtx = (v: number) => ({
  travail: v,
  quotidien: v,
  temps: v,
  oubli: v,
  stress: v,
});

describe("POST /api/score/full", () => {
  it("returns 200 with global + dimensions + contextual on valid payload", async () => {
    const req = makeRequest({
      asrsAnswers: allAsrs(4),
      contextualAnswers: allCtx(4),
    });
    const res = await POST({ request: req } as Ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.level).toBe("eleve");
    expect(data.dimensions.attention.level).toBe("eleve");
    expect(data.contextual.level).toBe("eleve");
  });

  it("returns 400 when asrsAnswers is missing", async () => {
    const req = makeRequest({ contextualAnswers: allCtx(0) });
    const res = await POST({ request: req } as Ctx);
    expect(res.status).toBe(400);
  });

  it("returns 400 when contextualAnswers is missing", async () => {
    const req = makeRequest({ asrsAnswers: allAsrs(0) });
    const res = await POST({ request: req } as Ctx);
    expect(res.status).toBe(400);
  });

  it("returns 400 on malformed JSON", async () => {
    const req = makeRequest("not-json");
    const res = await POST({ request: req } as Ctx);
    expect(res.status).toBe(400);
  });

  it("silently drops out-of-range ASRS values and contextual values", async () => {
    const req = makeRequest({
      asrsAnswers: { 1: 4, 2: 99, 3: -1, 4: 4 },
      contextualAnswers: { travail: 4, quotidien: 99, temps: -1, oubli: 4, stress: 4 },
    });
    const res = await POST({ request: req } as Ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.raw).toBe(8); // only id 1 and 4 retained
    expect(data.contextual.perAxis.quotidien).toBe(0);
    expect(data.contextual.perAxis.temps).toBe(0);
  });
});
