import { describe, it, expect } from "vitest";
import { scoreFull, scoreScreener } from "./scoring";

function allAnswered(value: number, ids: number[]): Record<number, number> {
  return Object.fromEntries(ids.map((id) => [id, value]));
}

const SCREENER_IDS = [1, 2, 3, 4, 5, 6];
const FULL_IDS = Array.from({ length: 18 }, (_, i) => i + 1);
const CTX_AXES = ["travail", "quotidien", "temps", "oubli", "stress"];

describe("scoreScreener", () => {
  it("classes all-zero answers as faible", () => {
    expect(scoreScreener({})).toEqual({ raw: 0, max: 24, level: "faible" });
  });

  it("classes raw=6 (just below modéré threshold) as faible", () => {
    const answers = allAnswered(1, SCREENER_IDS);
    expect(scoreScreener(answers)).toEqual({ raw: 6, max: 24, level: "faible" });
  });

  it("classes raw=7 (exact modéré threshold) as modere", () => {
    const answers = { ...allAnswered(1, SCREENER_IDS), 1: 2 };
    expect(scoreScreener(answers)).toEqual({ raw: 7, max: 24, level: "modere" });
  });

  it("classes raw=12 (just below élevé threshold) as modere", () => {
    const answers = allAnswered(2, SCREENER_IDS);
    expect(scoreScreener(answers)).toEqual({ raw: 12, max: 24, level: "modere" });
  });

  it("classes raw=13 (exact élevé threshold) as eleve", () => {
    const answers = { ...allAnswered(2, SCREENER_IDS), 1: 3 };
    expect(scoreScreener(answers)).toEqual({ raw: 13, max: 24, level: "eleve" });
  });

  it("classes max raw (24) as eleve", () => {
    const answers = allAnswered(4, SCREENER_IDS);
    expect(scoreScreener(answers)).toEqual({ raw: 24, max: 24, level: "eleve" });
  });

  it("treats missing answers as 0", () => {
    const answers = { 1: 4, 2: 4 };
    expect(scoreScreener(answers)).toEqual({ raw: 8, max: 24, level: "modere" });
  });
});

describe("scoreFull — global score and level", () => {
  it("classes all-zero answers as faible globally and per dimension", () => {
    const result = scoreFull({}, {});
    expect(result.raw).toBe(0);
    expect(result.max).toBe(72);
    expect(result.level).toBe("faible");
    expect(result.dimensions.attention.level).toBe("faible");
    expect(result.dimensions.organisation.level).toBe("faible");
    expect(result.dimensions.impulsivite.level).toBe("faible");
    expect(result.contextual.level).toBe("faible");
  });

  it("classes max raw (72) as eleve globally and per dimension", () => {
    const asrs = allAnswered(4, FULL_IDS);
    const ctx = Object.fromEntries(CTX_AXES.map((a) => [a, 4]));
    const result = scoreFull(asrs, ctx);
    expect(result.raw).toBe(72);
    expect(result.level).toBe("eleve");
    expect(result.dimensions.attention.level).toBe("eleve");
    expect(result.dimensions.organisation.level).toBe("eleve");
    expect(result.dimensions.impulsivite.level).toBe("eleve");
    expect(result.contextual.level).toBe("eleve");
  });

  it("crosses the modéré threshold (ratio >= 0.30) on global score", () => {
    // 22 / 72 = 30.5% → just over modéré
    const asrs: Record<number, number> = { ...allAnswered(1, FULL_IDS), 1: 5 };
    asrs[1] = 4;
    asrs[2] = 4;
    asrs[3] = 4;
    asrs[4] = 4;
    asrs[5] = 4;
    asrs[6] = 2;
    const result = scoreFull(asrs, {});
    expect(result.raw).toBeGreaterThanOrEqual(22);
    expect(result.level).toBe("modere");
  });

  it("crosses the élevé threshold (ratio >= 0.55) on global score", () => {
    // need raw >= 40 (40 / 72 = 55.5%)
    const asrs = allAnswered(3, FULL_IDS);
    const result = scoreFull(asrs, {});
    expect(result.raw).toBe(54);
    expect(result.level).toBe("eleve");
  });

  it("isolates dimensions correctly (attention high, others low)", () => {
    const asrs: Record<number, number> = {};
    for (const id of [7, 8, 9, 10, 11]) asrs[id] = 4;
    const result = scoreFull(asrs, {});
    expect(result.dimensions.attention.raw).toBe(20);
    expect(result.dimensions.attention.max).toBe(20);
    expect(result.dimensions.attention.level).toBe("eleve");
    expect(result.dimensions.organisation.raw).toBe(0);
    expect(result.dimensions.organisation.level).toBe("faible");
    expect(result.dimensions.impulsivite.raw).toBe(0);
    expect(result.dimensions.impulsivite.level).toBe("faible");
  });

  it("isolates dimensions correctly (organisation high)", () => {
    const asrs: Record<number, number> = {};
    for (const id of [1, 2, 3, 4]) asrs[id] = 4;
    const result = scoreFull(asrs, {});
    expect(result.dimensions.organisation.raw).toBe(16);
    expect(result.dimensions.organisation.max).toBe(16);
    expect(result.dimensions.organisation.level).toBe("eleve");
  });

  it("computes contextual perAxis exactly", () => {
    const ctx = { travail: 4, quotidien: 3, temps: 2, oubli: 1, stress: 0 };
    const result = scoreFull({}, ctx);
    expect(result.contextual.perAxis).toEqual({
      travail: 4,
      quotidien: 3,
      temps: 2,
      oubli: 1,
      stress: 0,
    });
    expect(result.contextual.raw).toBe(10);
    expect(result.contextual.max).toBe(20);
  });

  it("treats missing contextual answers as 0", () => {
    const result = scoreFull({}, { travail: 4 });
    expect(result.contextual.raw).toBe(4);
    expect(result.contextual.perAxis.travail).toBe(4);
    expect(result.contextual.perAxis.quotidien).toBe(0);
  });
});
