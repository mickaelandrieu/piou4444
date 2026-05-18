export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 text-amber-900 ${
        compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
      }`}
    >
      <strong className="font-semibold">Avertissement&nbsp;:</strong> outil
      d'auto-évaluation basé sur l'ASRS v1.1, non médical. Ne constitue ni un
      diagnostic, ni une recommandation thérapeutique.
    </div>
  );
}
