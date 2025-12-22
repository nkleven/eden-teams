const tones = {
  base: "bg-white text-ink shadow-soft",
  warn: "bg-amber-50 text-amber-900 ring-1 ring-amber-200",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "base",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: keyof typeof tones;
}) {
  return (
    <div className={`rounded-lg p-4 ${tones[tone]}`}>
      <p className="text-sm text-ink/70">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {hint && <p className="text-xs text-ink/60">{hint}</p>}
    </div>
  );
}
