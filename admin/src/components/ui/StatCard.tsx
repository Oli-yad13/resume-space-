// Flat stat card with the brand gradient as a top hairline — the admin's
// signature color accent (sampled from the logo's blue → purple → pink).
export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
      <div className="brand-hairline h-0.5" />
      <div className="px-5 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{label}</p>
        <p className="text-xl font-semibold text-zinc-900">{value}</p>
      </div>
    </div>
  );
}
