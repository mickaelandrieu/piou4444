import { describe, it, expect } from "vitest";
import {
  buildBullets,
  DIMENSION_DESCRIPTION,
  DIMENSION_LABEL,
  dimensionInsight,
  globalInterpretation,
  LEVEL_COLOR,
  LEVEL_LABEL,
  recommendations,
  screenerSummary,
} from "./interpretation";
import type { FullResult, ScreenerResult } from "./scoring";

function makeFull(
  level: FullResult["level"],
  contextualLevel: FullResult["contextual"]["level"] = level,
  dims: Partial<Record<keyof FullResult["dimensions"], FullResult["dimensions"][keyof FullResult["dimensions"]]["level"]>> = {},
): FullResult {
  const dimLevel = (k: keyof FullResult["dimensions"]) => dims[k] ?? level;
  return {
    raw: 0,
    max: 72,
    level,
    dimensions: {
      attention: { raw: 0, max: 20, level: dimLevel("attention") },
      organisation: { raw: 0, max: 16, level: dimLevel("organisation") },
      impulsivite: { raw: 0, max: 36, level: dimLevel("impulsivite") },
    },
    contextual: {
      raw: 0,
      max: 20,
      level: contextualLevel,
      perAxis: { travail: 0, quotidien: 0, temps: 0, oubli: 0, stress: 0 },
    },
  };
}

describe("constants", () => {
  it("exports a label for each level", () => {
    expect(LEVEL_LABEL.faible).toBeTruthy();
    expect(LEVEL_LABEL.modere).toBeTruthy();
    expect(LEVEL_LABEL.eleve).toBeTruthy();
  });

  it("exports a color class for each level", () => {
    expect(LEVEL_COLOR.faible).toMatch(/signal-low/);
    expect(LEVEL_COLOR.modere).toMatch(/signal-mid/);
    expect(LEVEL_COLOR.eleve).toMatch(/signal-high/);
  });

  it("exports a label and description for each dimension", () => {
    for (const d of ["attention", "organisation", "impulsivite"] as const) {
      expect(DIMENSION_LABEL[d]).toBeTruthy();
      expect(DIMENSION_DESCRIPTION[d]).toBeTruthy();
    }
  });
});

describe("screenerSummary", () => {
  const mk = (level: ScreenerResult["level"]): ScreenerResult => ({
    raw: 0,
    max: 24,
    level,
  });

  it("returns a non-empty string per level", () => {
    expect(screenerSummary(mk("faible"))).toMatch(/screening/i);
    expect(screenerSummary(mk("modere"))).toMatch(/modéré/i);
    expect(screenerSummary(mk("eleve"))).toMatch(/élevé/i);
  });
});

describe("dimensionInsight", () => {
  it("returns distinct text per level for attention", () => {
    expect(dimensionInsight("attention", "faible")).not.toEqual(
      dimensionInsight("attention", "modere"),
    );
    expect(dimensionInsight("attention", "modere")).not.toEqual(
      dimensionInsight("attention", "eleve"),
    );
  });

  it("returns distinct text per dimension for the same level", () => {
    expect(dimensionInsight("attention", "eleve")).not.toEqual(
      dimensionInsight("organisation", "eleve"),
    );
    expect(dimensionInsight("organisation", "eleve")).not.toEqual(
      dimensionInsight("impulsivite", "eleve"),
    );
  });
});

describe("globalInterpretation", () => {
  it("flags faible + faible context as not-significant", () => {
    expect(globalInterpretation(makeFull("faible", "faible"))).toMatch(
      /n'indique pas/i,
    );
  });

  it("flags eleve + eleve as significant + high impact", () => {
    expect(globalInterpretation(makeFull("eleve", "eleve"))).toMatch(/élevé/i);
  });

  it("handles eleve with lower context (compensation)", () => {
    expect(globalInterpretation(makeFull("eleve", "modere"))).toMatch(
      /compensation/i,
    );
  });

  it("handles modéré scores with high context impact", () => {
    expect(globalInterpretation(makeFull("modere", "eleve"))).toMatch(
      /impact fonctionnel rapporté est important/i,
    );
  });

  it("returns a default sentence for any other combination", () => {
    expect(globalInterpretation(makeFull("modere", "modere"))).toMatch(
      /modérées?/i,
    );
  });
});

describe("recommendations", () => {
  it("returns at least one recommendation for faible", () => {
    const r = recommendations(makeFull("faible"));
    expect(r.length).toBeGreaterThanOrEqual(1);
  });

  it("returns multiple recommendations for modéré", () => {
    const r = recommendations(makeFull("modere"));
    expect(r.length).toBeGreaterThanOrEqual(2);
  });

  it("recommends professional consultation for élevé", () => {
    const r = recommendations(makeFull("eleve"));
    expect(r.some((x) => /professionnel/i.test(x.body))).toBe(true);
  });

  it("adds a contextual overlay reco when context is high but score isn't", () => {
    const r = recommendations(makeFull("modere", "eleve"));
    expect(r.some((x) => /charge fonctionnelle/i.test(x.title))).toBe(true);
  });
});

describe("buildBullets", () => {
  it("returns at least one bullet even when nothing is flagged", () => {
    expect(buildBullets(makeFull("faible", "faible")).length).toBeGreaterThanOrEqual(1);
  });

  it("flags attention when its dimension is not faible", () => {
    const f = makeFull("modere", "faible", { attention: "eleve" });
    const bullets = buildBullets(f);
    expect(bullets.some((b) => /attention/i.test(b))).toBe(true);
  });

  it("flags organisation when its dimension is not faible", () => {
    const f = makeFull("modere", "faible", { organisation: "eleve" });
    const bullets = buildBullets(f);
    expect(bullets.some((b) => /planification|organisation/i.test(b))).toBe(true);
  });

  it("flags impulsivite when its dimension is not faible", () => {
    const f = makeFull("modere", "faible", { impulsivite: "eleve" });
    const bullets = buildBullets(f);
    expect(bullets.some((b) => /agitation|impulsi/i.test(b))).toBe(true);
  });

  it("flags high contextual impact distinctly from modéré contextual impact", () => {
    const fHigh = makeFull("faible", "eleve", {
      attention: "faible",
      organisation: "faible",
      impulsivite: "faible",
    });
    const fMid = makeFull("faible", "modere", {
      attention: "faible",
      organisation: "faible",
      impulsivite: "faible",
    });
    expect(buildBullets(fHigh).some((b) => /impact fonctionnel élevé/i.test(b))).toBe(true);
    expect(buildBullets(fMid).some((b) => /impact fonctionnel modéré/i.test(b))).toBe(true);
  });
});
