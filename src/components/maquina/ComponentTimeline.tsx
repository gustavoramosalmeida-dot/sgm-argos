import type { ComponentEvent } from '../../types/ComponentEvent';
import { getEventNextDueDate } from '../../utils/componentRadar';

interface ComponentTimelineProps {
  events: ComponentEvent[];
}

function formatDate(date: string): string {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return date;
  }
}

function eventTypeLabel(type: ComponentEvent['eventType']): string {
  switch (type) {
    case 'INSTALL':
      return 'Instalação';
    case 'REPLACE':
      return 'Troca';
    case 'INSPECTION':
      return 'Inspeção';
    case 'ADJUSTMENT':
      return 'Ajuste';
    case 'CLEANING':
      return 'Limpeza';
    case 'FAILURE':
      return 'Falha';
    case 'NOTE':
    default:
      return 'Observação';
  }
}

function eventTypeClasses(type: ComponentEvent['eventType']): string {
  switch (type) {
    case 'INSTALL':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'REPLACE':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'INSPECTION':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'ADJUSTMENT':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CLEANING':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'FAILURE':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'NOTE':
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function ComponentTimeline({ events }: ComponentTimelineProps) {
  const ordered = [...events].sort((a, b) =>
    a.eventDate.localeCompare(b.eventDate)
  ).reverse();

  if (!ordered.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Nenhum evento registrado para este componente ainda. Assim que instalações, trocas ou inspeções forem lançadas, a linha do tempo aparecerá aqui.
      </div>
    );
  }

  return (
    <ol className="relative space-y-3 border-l border-slate-200 pl-4">
      {ordered.map((event, index) => {
        const isMostRecent = index === 0;
        const nextDue = getEventNextDueDate(event);
        const nextDueLabel = nextDue ? formatDate(nextDue) : null;

        return (
          <li key={event.id} className="relative">
            <span
              className={`absolute -left-[9px] top-1 h-3 w-3 rounded-full border-2 border-white shadow-sm ${
                isMostRecent ? 'bg-sky-500' : 'bg-slate-300'
              }`}
            />
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-700">
                      {formatDate(event.eventDate)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${eventTypeClasses(event.eventType)}`}
                    >
                      {eventTypeLabel(event.eventType)}
                    </span>
                  </div>
                  <h4 className="mt-0.5 text-xs font-semibold text-slate-900">
                    {event.title}
                  </h4>
                  {event.notes && (
                    <p className="mt-0.5 text-xs text-slate-600">{event.notes}</p>
                  )}
                </div>
                {event.performedBy && (
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      Responsável
                    </p>
                    <p className="text-[11px] text-slate-700">{event.performedBy}</p>
                  </div>
                )}
              </div>

              <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-slate-500">
                {event.usefulLifeDays && (
                  <span>
                    Vida útil aplicada:{' '}
                    <span className="font-semibold text-slate-700">
                      {event.usefulLifeDays} dias
                    </span>
                  </span>
                )}
                {nextDueLabel && (
                  <span>
                    Próxima troca prevista:{' '}
                    <span className="font-semibold text-slate-700">
                      {nextDueLabel}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

