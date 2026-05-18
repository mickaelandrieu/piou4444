import { describe, it, expect } from "vitest";
import { POST } from "../screener";

type Ctx = Parameters<typeof POST>[0];

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/score/screener", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/score/screener", () => {
  it("returns 200 with scored result on valid payload", async () => {
    const req = makeRequest({
      answers: { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4 },
    });
    const res = await POST({ request: req } as Ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({ raw: 24, max: 24, level: "eleve" });
  });

  it("returns 400 when body is missing", async () => {
    const req = makeRequest("not json at all");
    const res = await POST({ request: req } as Ctx);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/answers/i);
  });

  it("returns 400 when answers is not an object", async () => {
    const req = makeRequest({ answers: "nope" });
    const res = await POST({ request: req } as Ctx);
    expect(res.status).toBe(400);
  });

  it("silently drops out-of-range and non-numeric values", async () => {
    const req = makeRequest({
      answers: { 1: 4, 2: -1, 3: 5, 4: 99, 5: "x", 6: 2 },
    });
    const res = await POST({ request: req } as Ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    // only ids 1 (4) and 6 (2) are retained → raw = 6, level "faible"
    expect(data.raw).toBe(6);
    expect(data.level).toBe("faible");
  });

  it("currently accepts fractional values within range (documented behaviour)", async () => {
    // L'échelle ASRS est entière (0..4) mais l'endpoint accepte tout
    // nombre fini dans la borne. À durcir dans une spec future si besoin.
    const req = makeRequest({ answers: { 1: 1.5, 2: 2.5 } });
    const res = await POST({ request: req } as Ctx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.raw).toBe(4);
  });
});
