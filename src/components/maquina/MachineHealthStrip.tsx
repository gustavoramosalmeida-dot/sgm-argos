import { Link } from 'react-router-dom';
import type { RadarStatus } from '../../types/ComponentEvent';
import type { InventoryRadarFilter, MachineHealthSnapshot } from '../../utils/machineHealthAggregate';
import { MACHINE_HEALTH_SEVERITY_ORDER } from '../../utils/machineHealthAggregate';

function worstLabel(worst: RadarStatus): string {
  switch (worst) {
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

function chipClasses(status: RadarStatus, active: boolean): string {
  const base =
    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition';
  if (active) {
    switch (status) {
      case 'OK':
        return `${base} border-emerald-600 bg-emerald-700 text-white shadow-sm`;
      case 'ATENCAO':
        return `${base} border-amber-600 bg-amber-600 text-white shadow-sm`;
      case 'VENCIDO':
        return `${base} border-red-600 bg-red-700 text-white shadow-sm`;
      case 'SEM_HISTORICO':
      default:
        return `${base} border-slate-600 bg-slate-700 text-white shadow-sm`;
    }
  }
  switch (status) {
    case 'OK':
      return `${base} border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100/90`;
    case 'ATENCAO':
      return `${base} border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100/90`;
    case 'VENCIDO':
      return `${base} border-red-200 bg-red-50 text-red-950 hover:bg-red-100/90`;
    case 'SEM_HISTORICO':
    default:
      return `${base} border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100`;
  }
}

interface MachineHealthStripProps {
  snapshot: MachineHealthSnapshot;
  loading?: boolean;
  radarFilter: InventoryRadarFilter;
  onRadarFilterChange: (filter: InventoryRadarFilter) => void;
  onOpenInventory?: () => void;
  machineId: string;
}

export function MachineHealthStrip({
  snapshot,
  loading = false,
  radarFilter,
  onRadarFilterChange,
  onOpenInventory,
  machineId,
}: MachineHealthStripProps) {
  const { counts, worst, qrWithoutAsset, totalQr, mostCriticalPointId } = snapshot;

  const headline =
    totalQr === 0
      ? 'Nenhum QR cadastrado — adicione pontos no mapa ou no editor visual.'
      : `Leitura geral: ${worstLabel(worst)} — com base nos indicadores atuais do inventário por QR.`;

  return (
    <div className="rounded-xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Mini radar da máquina
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {loading ? 'Atualizando indicadores…' : headline}
          </p>
          {totalQr > 0 && mostCriticalPointId ? (
            <p className="mt-1 text-[11px] text-slate-600">
              Prioridade:{' '}
              <Link
                to={`/machines/${machineId}/editor?vp=${encodeURIComponent(mostCriticalPointId)}`}
                className="font-mono font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:text-emerald-800"
              >
                abrir no editor
              </Link>
            </p>
          ) : null}
        </div>
        {totalQr > 0 ? (
          <p className="text-[11px] text-slate-500">
            {qrWithoutAsset > 0 ? (
              <span className="whitespace-nowrap">
                <span className="font-medium text-slate-700">{qrWithoutAsset}</span> QR sem ativo
              </span>
            ) : (
              <span className="text-emerald-800/90">Todos os QR com vínculo</span>
            )}
          </p>
        ) : null}
      </div>

      {totalQr > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onRadarFilterChange('all');
              onOpenInventory?.();
            }}
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
              radarFilter === 'all'
                ? 'border-slate-800 bg-slate-900 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Todos
            <span className="ml-1 tabular-nums opacity-90">({totalQr})</span>
          </button>
          {MACHINE_HEALTH_SEVERITY_ORDER.map((status) => {
            const n = counts[status];
            const active = radarFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => {
                  onRadarFilterChange(status);
                  onOpenInventory?.();
                }}
                className={chipClasses(status, active)}
              >
                {worstLabel(status)}
                <span className="tabular-nums opacity-95">({n})</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] leading-relaxed text-slate-500">
        Os indicadores por QR refletem o inventário atual (incluindo cenários de demonstração quando não há
        histórico alinhado). O detalhe operacional do ativo permanece na timeline do painel lateral.
      </p>
    </div>
  );
}
