import {
  ASRS_QUESTIONS,
  CONTEXTUAL_QUESTIONS,
  SCREENER_QUESTIONS,
} from "./questions";
import type { Dimension } from "./questions";

export type Level = "faible" | "modere" | "eleve";

export type ScreenerResult = {
  raw: number;
  max: number;
  level: Level;
};

export type FullResult = {
  raw: number;
  max: number;
  level: Level;
  dimensions: Record<Dimension, { raw: number; max: number; level: Level }>;
  contextual: {
    raw: number;
    max: number;
    level: Level;
    perAxis: Record<string, number>;
  };
};

export function scoreScreener(answers: Record<number, number>): ScreenerResult {
  const raw = SCREENER_QUESTIONS.reduce(
    (acc, q) => acc + (answers[q.id] ?? 0),
    0,
  );
  const max = SCREENER_QUESTIONS.length * 4;
  let level: Level = "faible";
  if (raw >= 13) level = "eleve";
  else if (raw >= 7) level = "modere";
  return { raw, max, level };
}

function levelFromRatio(ratio: number): Level {
  if (ratio >= 0.55) return "eleve";
  if (ratio >= 0.3) return "modere";
  return "faible";
}

export function scoreFull(
  asrsAnswers: Record<number, number>,
  contextualAnswers: Record<string, number>,
): FullResult {
  const raw = ASRS_QUESTIONS.reduce(
    (acc, q) => acc + (asrsAnswers[q.id] ?? 0),
    0,
  );
  const max = ASRS_QUESTIONS.length * 4;
  const level = levelFromRatio(raw / max);

  const dims: Dimension[] = ["attention", "organisation", "impulsivite"];
  const dimensions = dims.reduce(
    (acc, d) => {
      const qs = ASRS_QUESTIONS.filter((q) => q.dimension === d);
      const rawD = qs.reduce((s, q) => s + (asrsAnswers[q.id] ?? 0), 0);
      const maxD = qs.length * 4;
      acc[d] = { raw: rawD, max: maxD, level: levelFromRatio(rawD / maxD) };
      return acc;
    },
    {} as Record<Dimension, { raw: number; max: number; level: Level }>,
  );

  const perAxis: Record<string, number> = {};
  let ctxRaw = 0;
  for (const q of CONTEXTUAL_QUESTIONS) {
    const v = contextualAnswers[q.id] ?? 0;
    perAxis[q.axis] = v;
    ctxRaw += v;
  }
  const ctxMax = CONTEXTUAL_QUESTIONS.length * 4;
  const contextual = {
    raw: ctxRaw,
    max: ctxMax,
    level: levelFromRatio(ctxRaw / ctxMax),
    perAxis,
  };

  return { raw, max, level, dimensions, contextual };
}
