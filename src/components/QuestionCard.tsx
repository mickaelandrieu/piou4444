type Choice = { value: number; label: string };

export function QuestionCard({
  text,
  value,
  onChange,
  choices,
}: {
  text: string;
  value: number | undefined;
  onChange: (v: number) => void;
  choices: Choice[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-medium leading-snug text-slate-900 sm:text-xl">
        {text}
      </h2>
      <div className="mt-6 grid gap-2">
        {choices.map((c) => {
          const active = value === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange(c.value)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                active
                  ? "border-brand-500 bg-brand-50 text-brand-900"
                  : "border-slate-200 bg-white hover:border-brand-500 hover:bg-brand-50"
              }`}
            >
              <span className="font-medium">{c.label}</span>
              <span
                className={`ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  active
                    ? "bg-brand-500 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {c.value}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
