import { useMemo, useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { ResultView } from "@/components/ResultView";
import {
  ASRS_SCALE,
  CONTEXTUAL_QUESTIONS,
  CONTEXTUAL_SCALE,
  FULL_QUESTIONS,
  SCREENER_QUESTIONS,
} from "@/lib/questions";
import type { FullResult, ScreenerResult } from "@/lib/scoring";
import { LEVEL_COLOR, LEVEL_LABEL, screenerSummary } from "@/lib/interpretation";

type Stage =
  | "intro"
  | "screener"
  | "screener-result"
  | "full"
  | "contextual"
  | "result";

const PART_B_QUESTIONS = FULL_QUESTIONS.filter((q) => !q.partA);

export function ScreeningFlow() {
  const [stage, setStage] = useState<Stage>("intro");
  const [asrsAnswers, setAsrsAnswers] = useState<Record<number, number>>({});
  const [ctxAnswers, setCtxAnswers] = useState<Record<string, number>>({});
  const [screenerIdx, setScreenerIdx] = useState(0);
  const [partBIdx, setPartBIdx] = useState(0);
  const [ctxIdx, setCtxIdx] = useState(0);
  const [screenerResult, setScreenerResult] = useState<ScreenerResult | null>(
    null,
  );
  const [fullResult, setFullResult] = useState<FullResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allScreenerAnswered = useMemo(
    () => SCREENER_QUESTIONS.every((q) => asrsAnswers[q.id] !== undefined),
    [asrsAnswers],
  );

  const allPartBAnswered = useMemo(
    () => PART_B_QUESTIONS.every((q) => asrsAnswers[q.id] !== undefined),
    [asrsAnswers],
  );

  const allCtxAnswered = useMemo(
    () => CONTEXTUAL_QUESTIONS.every((q) => ctxAnswers[q.id] !== undefined),
    [ctxAnswers],
  );

  function reset() {
    setStage("intro");
    setAsrsAnswers({});
    setCtxAnswers({});
    setScreenerIdx(0);
    setPartBIdx(0);
    setCtxIdx(0);
    setScreenerResult(null);
    setFullResult(null);
    setError(null);
  }

  async function submitScreener() {
    setSubmitting(true);
    setError(null);
    try {
      const screenerAnswers: Record<number, number> = {};
      for (const q of SCREENER_QUESTIONS) {
        screenerAnswers[q.id] = asrsAnswers[q.id] ?? 0;
      }
      const res = await fetch("/api/score/screener", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: screenerAnswers }),
      });
      if (!res.ok) throw new Error("Scoring du screener indisponible");
      const data: ScreenerResult = await res.json();
      setScreenerResult(data);
      setStage("screener-result");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitFull() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/score/full", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          asrsAnswers,
          contextualAnswers: ctxAnswers,
        }),
      });
      if (!res.ok) throw new Error("Scoring complet indisponible");
      const data: FullResult = await res.json();
      setFullResult(data);
      setStage("result");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {stage === "intro" && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Comprendre votre fonctionnement attentionnel
            </h1>
            <p className="mt-3 text-slate-700">
              Un screening en deux étapes pour mettre des mots sur votre
              fonctionnement cognitif : 6 questions rapides, puis — si
              pertinent — un questionnaire complet et une lecture
              contextualisée.
            </p>
            <ol className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  1
                </span>
                <span>
                  <strong>Screening rapide</strong> — 6 questions issues de
                  l'ASRS v1.1. ~ 2 minutes.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  2
                </span>
                <span>
                  <strong>Questionnaire complet</strong> — 12 questions
                  supplémentaires et 5 questions de contexte. ~ 5 minutes.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  3
                </span>
                <span>
                  <strong>Lecture structurée</strong> — attention, organisation,
                  impulsivité, impact fonctionnel. Pas de diagnostic.
                </span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setStage("screener")}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 sm:w-auto"
            >
              Commencer le screening
            </button>
          </div>
          <Disclaimer />
        </section>
      )}

      {stage === "screener" && (
        <ScreenerFlow
          idx={screenerIdx}
          setIdx={setScreenerIdx}
          answers={asrsAnswers}
          setAnswer={(id, v) =>
            setAsrsAnswers((prev) => ({ ...prev, [id]: v }))
          }
          allAnswered={allScreenerAnswered}
          submitting={submitting}
          error={error}
          onSubmit={submitScreener}
          onBack={() => setStage("intro")}
        />
      )}

      {stage === "screener-result" && screenerResult && (
        <ScreenerResultStage
          result={screenerResult}
          onContinue={() => setStage("full")}
          onStop={reset}
        />
      )}

      {stage === "full" && (
        <PartBFlow
          idx={partBIdx}
          setIdx={setPartBIdx}
          answers={asrsAnswers}
          setAnswer={(id, v) =>
            setAsrsAnswers((prev) => ({ ...prev, [id]: v }))
          }
          allAnswered={allPartBAnswered}
          onNext={() => {
            setStage("contextual");
            setCtxIdx(0);
          }}
          onBack={() => setStage("screener-result")}
        />
      )}

      {stage === "contextual" && (
        <ContextualFlow
          idx={ctxIdx}
          setIdx={setCtxIdx}
          answers={ctxAnswers}
          setAnswer={(id, v) =>
            setCtxAnswers((prev) => ({ ...prev, [id]: v }))
          }
          allAnswered={allCtxAnswered}
          submitting={submitting}
          error={error}
          onSubmit={submitFull}
          onBack={() => setStage("full")}
        />
      )}

      {stage === "result" && fullResult && (
        <ResultView full={fullResult} onRestart={reset} />
      )}
    </div>
  );
}

function ScreenerFlow({
  idx,
  setIdx,
  answers,
  setAnswer,
  allAnswered,
  submitting,
  error,
  onSubmit,
  onBack,
}: {
  idx: number;
  setIdx: (n: number) => void;
  answers: Record<number, number>;
  setAnswer: (id: number, v: number) => void;
  allAnswered: boolean;
  submitting: boolean;
  error: string | null;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const total = SCREENER_QUESTIONS.length;
  const q = SCREENER_QUESTIONS[idx];
  const value = answers[q.id];
  const isLast = idx === total - 1;
  return (
    <section className="space-y-4">
      <Disclaimer compact />
      <ProgressBar current={idx + 1} total={total} label="Screening rapide" />
      <QuestionCard
        text={q.text}
        value={value}
        onChange={(v) => setAnswer(q.id, v)}
        choices={ASRS_SCALE}
      />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (idx === 0 ? onBack() : setIdx(idx - 1))}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Retour
        </button>
        {!isLast ? (
          <button
            type="button"
            onClick={() => setIdx(idx + 1)}
            disabled={value === undefined}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Suivant →
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allAnswered || submitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Calcul en cours…" : "Voir mon résultat"}
          </button>
        )}
      </div>
    </section>
  );
}

function ScreenerResultStage({
  result,
  onContinue,
  onStop,
}: {
  result: ScreenerResult;
  onContinue: () => void;
  onStop: () => void;
}) {
  const canContinue = result.level !== "faible";
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Résultat du screening
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Signal {LEVEL_LABEL[result.level]}
            </h2>
          </div>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${LEVEL_COLOR[result.level]}`}
          >
            {result.raw} / {result.max}
          </span>
        </div>
        <p className="mt-4 text-slate-700">{screenerSummary(result)}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          {canContinue ? "Aller plus loin" : "Et maintenant ?"}
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          {canContinue
            ? "Le questionnaire complet (12 questions supplémentaires + 5 questions de contexte) affine le profil par axe — attention, organisation, impulsivité — et mesure l'impact fonctionnel ressenti."
            : "Vous pouvez quand même poursuivre le questionnaire complet si vous souhaitez une lecture détaillée par axe."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            {canContinue
              ? "Compléter le questionnaire"
              : "Poursuivre quand même"}
          </button>
          <button
            type="button"
            onClick={onStop}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            S'arrêter ici
          </button>
        </div>
      </div>
      <Disclaimer />
    </section>
  );
}

function PartBFlow({
  idx,
  setIdx,
  answers,
  setAnswer,
  allAnswered,
  onNext,
  onBack,
}: {
  idx: number;
  setIdx: (n: number) => void;
  answers: Record<number, number>;
  setAnswer: (id: number, v: number) => void;
  allAnswered: boolean;
  onNext: () => void;
  onBack: () => void;
}) {
  const total = PART_B_QUESTIONS.length;
  const q = PART_B_QUESTIONS[idx];
  const value = answers[q.id];
  const isLast = idx === total - 1;
  return (
    <section className="space-y-4">
      <Disclaimer compact />
      <ProgressBar
        current={idx + 1}
        total={total}
        label="Questionnaire complet — partie 2"
      />
      <QuestionCard
        text={q.text}
        value={value}
        onChange={(v) => setAnswer(q.id, v)}
        choices={ASRS_SCALE}
      />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (idx === 0 ? onBack() : setIdx(idx - 1))}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Retour
        </button>
        {!isLast ? (
          <button
            type="button"
            onClick={() => setIdx(idx + 1)}
            disabled={value === undefined}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Suivant →
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!allAnswered}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continuer →
          </button>
        )}
      </div>
    </section>
  );
}

function ContextualFlow({
  idx,
  setIdx,
  answers,
  setAnswer,
  allAnswered,
  submitting,
  error,
  onSubmit,
  onBack,
}: {
  idx: number;
  setIdx: (n: number) => void;
  answers: Record<string, number>;
  setAnswer: (id: string, v: number) => void;
  allAnswered: boolean;
  submitting: boolean;
  error: string | null;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const total = CONTEXTUAL_QUESTIONS.length;
  const q = CONTEXTUAL_QUESTIONS[idx];
  const value = answers[q.id];
  const isLast = idx === total - 1;
  return (
    <section className="space-y-4">
      <Disclaimer compact />
      <ProgressBar
        current={idx + 1}
        total={total}
        label="Impact fonctionnel"
      />
      <QuestionCard
        text={q.text}
        value={value}
        onChange={(v) => setAnswer(q.id, v)}
        choices={CONTEXTUAL_SCALE}
      />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (idx === 0 ? onBack() : setIdx(idx - 1))}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Retour
        </button>
        {!isLast ? (
          <button
            type="button"
            onClick={() => setIdx(idx + 1)}
            disabled={value === undefined}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Suivant →
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allAnswered || submitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Calcul en cours…" : "Voir mon profil"}
          </button>
        )}
      </div>
    </section>
  );
}
