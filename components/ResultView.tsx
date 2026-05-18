"use client";

import { Dimension } from "@/lib/questions";
import { FullResult } from "@/lib/scoring";
import {
  buildBullets,
  DIMENSION_DESCRIPTION,
  DIMENSION_LABEL,
  dimensionInsight,
  globalInterpretation,
  LEVEL_COLOR,
  LEVEL_LABEL,
  recommendations,
} from "@/lib/interpretation";

export function ResultView({
  full,
  onRestart,
}: {
  full: FullResult;
  onRestart: () => void;
}) {
  const bullets = buildBullets(full);
  const recs = recommendations(full);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Résultat global
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Profil attentionnel — signal {LEVEL_LABEL[full.level]}
            </h2>
          </div>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${LEVEL_COLOR[full.level]}`}
          >
            {LEVEL_LABEL[full.level]}
          </span>
        </div>
        <p className="mt-4 text-slate-700">{globalInterpretation(full)}</p>
        <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-slate-700">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Lecture par axe</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(Object.keys(full.dimensions) as Dimension[]).map((d) => {
            const dim = full.dimensions[d];
            const pct = Math.round((dim.raw / dim.max) * 100);
            return (
              <div
                key={d}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">
                    {DIMENSION_LABEL[d]}
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${LEVEL_COLOR[dim.level]}`}
                  >
                    {LEVEL_LABEL[dim.level]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {DIMENSION_DESCRIPTION[d]}
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full ${LEVEL_COLOR[dim.level]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-700">
                  {dimensionInsight(d, dim.level)}
                </p>
              </div>
            );
          })}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-slate-900">
                Impact fonctionnel global
              </h4>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${LEVEL_COLOR[full.contextual.level]}`}
              >
                {LEVEL_LABEL[full.contextual.level]}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Niveau de retentissement perçu au travail / études, dans la vie
              quotidienne, sur l'organisation, les oublis et le stress.
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full ${LEVEL_COLOR[full.contextual.level]}`}
                style={{
                  width: `${Math.round((full.contextual.raw / full.contextual.max) * 100)}%`,
                }}
              />
            </div>
            <ul className="mt-3 text-xs text-slate-600">
              {Object.entries(full.contextual.perAxis).map(([k, v]) => (
                <li key={k} className="flex justify-between">
                  <span className="capitalize">{k}</span>
                  <span className="font-mono">{v}/4</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Recommandations</h3>
        <div className="mt-4 space-y-3">
          {recs.map((r) => (
            <div
              key={r.title}
              className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
            >
              <h4 className="font-medium text-slate-900">{r.title}</h4>
              <p className="mt-1 text-sm text-slate-700">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
        <p>
          <strong>Rappel important.</strong> Ce résultat ne constitue pas un
          diagnostic. Il ne mentionne ni TDAH, ni autre condition clinique.
          Seule une évaluation par un professionnel de santé qualifié permet
          d'établir un diagnostic.
        </p>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Recommencer
        </button>
      </div>
    </div>
  );
}
