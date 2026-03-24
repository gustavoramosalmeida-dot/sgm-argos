type Status = 'not_generated' | 'active';

const LABEL: Record<Status, string> = {
  not_generated: 'Não gerado',
  active: 'Ativo',
};

export function QrStatusBadge({
  status,
  variant = 'light',
}: {
  status: Status;
  variant?: 'light' | 'dark';
}) {
  const isActive = status === 'active';
  const base =
    variant === 'dark'
      ? isActive
        ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200'
        : 'border-slate-600 bg-slate-900/80 text-slate-400'
      : isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
        : 'border-slate-200 bg-slate-100 text-slate-600';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${base}`}
    >
      {LABEL[status]}
    </span>
  );
}
