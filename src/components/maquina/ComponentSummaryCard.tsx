import type { QRPoint } from '../../types/QRPoint';
import type { ComponentRadarSummary } from '../../types/ComponentEvent';

interface ComponentSummaryCardProps {
  point: QRPoint;
  summary: ComponentRadarSummary;
}

function formatDate(date?: string): string {
  if (!date) return '—';
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR');
  } catch {
    return '—';
  }
}

function radarLabel(status: ComponentRadarSummary['radarStatus']): string {
  switch (status) {
    case 'OK':
      return 'OK';
    case 'ATENCAO':
      return 'Atenção';
    case 'VENCIDO':
      return 'Vencido';
    case 'SEM_HISTORICO':
    default:
      return 'Sem histórico';
  }
}

function radarBadgeClasses(status: ComponentRadarSummary['radarStatus']): string {
  switch (status) {
    case 'OK':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'ATENCAO':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'VENCIDO':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'SEM_HISTORICO':
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export function ComponentSummaryCard({ point, summary }: ComponentSummaryCardProps) {
  const lastEventLabel = summary.lastEvent
    ? `${formatDate(summary.lastEvent.eventDate)} — ${summary.lastEvent.title}`
    : 'Sem eventos registrados';

  const lastReplaceDate = summary.lastReplaceDate
    ? formatDate(summary.lastReplaceDate)
    : '—';

  const nextDue = formatDate(summary.nextDueDate);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-50">
              {point.codigo}
            </span>
            {point.tipo && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                {point.tipo}
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {point.descricao || 'Componente sem nome'}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Localização resumida: {point.descricao}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${radarBadgeClasses(summary.radarStatus)}`}
          >
            {radarLabel(summary.radarStatus)}
            {summary.daysRemaining != null &&
              summary.radarStatus !== 'SEM_HISTORICO' && (
                <span className="ml-1 text-[9px] text-slate-500">
                  {summary.daysRemaining}d
                </span>
              )}
          </span>
          {summary.usefulLifeDays && (
            <span className="text-[10px] text-slate-500">
              Vida útil estimada:{' '}
              <span className="font-semibold text-slate-700">
                {summary.usefulLifeDays} dias
              </span>
            </span>
          )}
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-slate-600">
        <div>
          <dt className="font-medium text-slate-500">Último evento</dt>
          <dd>{lastEventLabel}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Última troca</dt>
          <dd>{lastReplaceDate}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Próxima troca prevista</dt>
          <dd>{nextDue}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Dias restantes</dt>
          <dd>
            {summary.daysRemaining != null
              ? `${summary.daysRemaining} dia${summary.daysRemaining === 1 ? '' : 's'}`
              : '—'}
          </dd>
        </div>
      </dl>
    </section>
  );
}

