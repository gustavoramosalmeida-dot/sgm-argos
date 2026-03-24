import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QRPoint } from '../../types/QRPoint';
import type { RadarStatus } from '../../types/ComponentEvent';
import type { QRInventoryItem } from '../../features/componentEvents/componentEvents.service';
import type { InventoryRadarFilter } from '../../utils/machineHealthAggregate';
import { isQrPointLinkedToAsset } from '../../utils/qrPointLink';

interface QRInventoryTableProps {
  rows: QRInventoryItem[];
  machineId: string;
  loading?: boolean;
  onViewOnMap: (point: QRPoint) => void;
  /** Filtro radar controlado (ex.: mini radar na página da máquina). */
  radarFilter?: InventoryRadarFilter;
  onRadarFilterChange?: (filter: InventoryRadarFilter) => void;
}

type LinkFilter = 'all' | 'linked' | 'unlinked';
type RadarFilter = InventoryRadarFilter;

function formatLastActivity(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR');
  } catch {
    return '—';
  }
}

function radarLabel(status: RadarStatus): string {
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

function radarChipClasses(status: RadarStatus): string {
  switch (status) {
    case 'OK':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'ATENCAO':
      return 'border-amber-200 bg-amber-50 text-amber-900';
    case 'VENCIDO':
      return 'border-red-200 bg-red-50 text-red-900';
    case 'SEM_HISTORICO':
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600';
  }
}

export function QRInventoryTable({
  rows,
  machineId,
  loading = false,
  onViewOnMap,
  radarFilter: radarFilterProp,
  onRadarFilterChange,
}: QRInventoryTableProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [linkFilter, setLinkFilter] = useState<LinkFilter>('all');
  const [internalRadarFilter, setInternalRadarFilter] = useState<RadarFilter>('all');
  const radarFilterControlled = radarFilterProp !== undefined;
  const radarFilter = radarFilterControlled ? radarFilterProp! : internalRadarFilter;
  const setRadarFilter = (f: RadarFilter) => {
    onRadarFilterChange?.(f);
    if (!radarFilterControlled) setInternalRadarFilter(f);
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return rows.filter(({ point, radar }) => {
      const linked = isQrPointLinkedToAsset(point);
      if (linkFilter === 'linked' && !linked) return false;
      if (linkFilter === 'unlinked' && linked) return false;

      if (radarFilter !== 'all' && radar.radarStatus !== radarFilter) return false;

      if (!query) return true;

      const codigo = String(point.codigo ?? '').toLowerCase();
      const label = String(point.descricao ?? '').toLowerCase();
      const assetName = String(point.assetName ?? point.asset?.name ?? '').toLowerCase();
      return (
        codigo.includes(query) ||
        label.includes(query) ||
        assetName.includes(query)
      );
    });
  }, [rows, search, linkFilter, radarFilter]);

  return (
    <div className="flex h-full flex-col gap-3">
      {loading && rows.length > 0 ? (
        <p className="text-xs text-slate-500" aria-live="polite">
          Atualizando inventário…
        </p>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-slate-800">Inventário de QR da máquina</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Vínculo com ativo, indicadores do inventário atual e acesso rápido ao editor e à timeline.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col">
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Buscar
            </label>
            <input
              type="text"
              placeholder="código, label ou ativo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-56 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Vínculo
            </label>
            <select
              value={linkFilter}
              onChange={(e) => setLinkFilter(e.target.value as LinkFilter)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
            >
              <option value="all">Todos</option>
              <option value="linked">Vinculados</option>
              <option value="unlinked">Sem vínculo</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Radar
            </label>
            <select
              value={radarFilter}
              onChange={(e) => setRadarFilter(e.target.value as RadarFilter)}
              className="h-8 min-w-[9rem] rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
            >
              <option value="all">Todos</option>
              <option value="OK">OK</option>
              <option value="ATENCAO">Atenção</option>
              <option value="VENCIDO">Vencido</option>
              <option value="SEM_HISTORICO">Sem histórico</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        {rows.length === 0 && loading ? (
          <div className="px-3 py-10 text-center text-sm text-slate-500">
            Carregando inventário…
          </div>
        ) : rows.length === 0 ? (
          <div className="px-3 py-12 text-center text-sm text-slate-600">
            <p className="font-medium text-slate-800">Nenhum QR nesta máquina</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Abra a aba <span className="font-medium text-slate-700">Edição</span> no mapa ou use o{' '}
              <span className="font-medium text-slate-700">editor visual</span> para adicionar o primeiro ponto.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-12 text-center text-sm text-slate-600">
            <p className="font-medium text-slate-800">Nenhum resultado com estes filtros</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Limpe a busca ou amplie os filtros — os pontos existem, mas não correspondem aos critérios atuais.
            </p>
          </div>
        ) : (
          <table className="min-w-full border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">Código</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">Label</th>
                <th className="hidden border-b border-slate-200 px-3 py-2 text-left font-medium md:table-cell">
                  Posição
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">Ativo</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">Vínculo</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">Radar</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-medium">
                  Última atividade
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ point, radar }) => {
                const linked = isQrPointLinkedToAsset(point);
                const last = radar.lastEvent?.eventDate;
                return (
                  <tr key={point.id} className="hover:bg-slate-50/80">
                    <td className="border-b border-slate-100 px-3 py-2 font-mono text-[11px] font-semibold text-slate-800">
                      {point.codigo || '—'}
                    </td>
                    <td className="max-w-[10rem] border-b border-slate-100 px-3 py-2 text-slate-700">
                      <span className="line-clamp-2">{point.descricao?.trim() || '—'}</span>
                    </td>
                    <td className="hidden border-b border-slate-100 px-3 py-2 text-slate-600 md:table-cell">
                      ({point.x.toFixed(1)}%, {point.y.toFixed(1)}%)
                    </td>
                    <td className="max-w-[9rem] border-b border-slate-100 px-3 py-2 text-slate-700">
                      <span className="line-clamp-2">{point.assetName ?? point.asset?.name ?? '—'}</span>
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium ${
                          linked
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        {linked ? 'Vinculado' : 'Sem vínculo'}
                      </span>
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium ${radarChipClasses(radar.radarStatus)}`}
                      >
                        {radarLabel(radar.radarStatus)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2 text-slate-600">
                      {formatLastActivity(last)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/machines/${machineId}/editor?vp=${encodeURIComponent(String(point.id))}`
                            )
                          }
                          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[10px] font-medium text-slate-800 hover:bg-slate-50"
                        >
                          Abrir no editor
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/machines/${machineId}/editor?vp=${encodeURIComponent(String(point.id))}&timeline=1`
                            )
                          }
                          className="rounded-md border border-emerald-200/90 bg-emerald-50/90 px-2 py-1.5 text-[10px] font-medium text-emerald-900 hover:bg-emerald-100"
                        >
                          Timeline
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewOnMap(point)}
                          className="rounded-md bg-slate-900 px-2 py-1.5 text-[10px] font-medium text-white hover:bg-slate-800"
                        >
                          Ver no mapa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
