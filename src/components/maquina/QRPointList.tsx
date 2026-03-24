import type { QRPoint, QRPointStatus } from '../../types/QRPoint';

interface QRPointListProps {
  points: QRPoint[];
  selectedId: number | string | null;
  onSelect: (pointId: number | string) => void;
  /** Ao clicar no item, abre o detalhe/ativo (drawer). */
  onOpenDetail?: (point: QRPoint) => void;
}

const statusDot: Record<QRPointStatus, string> = {
  ok: 'bg-emerald-500',
  atencao: 'bg-amber-400',
  falha: 'bg-red-500',
};

export function QRPointList({ points, selectedId, onSelect, onOpenDetail }: QRPointListProps) {
  if (!points.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-center">
        <p className="text-sm font-medium text-slate-800">Nenhum QR nesta máquina</p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          No modo <span className="font-medium text-slate-700">Edição</span>, use &quot;Adicionar QR Point&quot; no mapa para criar o primeiro ponto.
        </p>
      </div>
    );
  }

  const sorted = [...points].sort((a, b) => a.codigo.localeCompare(b.codigo));

  return (
    <ul className="space-y-1">
      {sorted.map((point) => {
        const isSelected = selectedId != null && String(point.id) === String(selectedId);
        const status: QRPointStatus = point.status ?? 'ok';
        const isLinked = !!point.assetNodeId || !!point.assetId || !!point.asset;
        return (
          <li key={point.id}>
            <button
              type="button"
              onClick={() => {
                onSelect(point.id);
                onOpenDetail?.(point);
              }}
              className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                }`}
            >
              <span
                className={`shrink-0 h-2 w-2 rounded-full ${statusDot[status]}`}
                title={status}
                aria-hidden
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-mono text-xs font-semibold">{point.codigo}</span>
                <span className="text-xs text-slate-600 truncate">{point.descricao}</span>
                <span className="mt-0.5 text-[10px] text-slate-500">
                  {isLinked
                    ? `Ativo: ${point.assetName ?? point.asset?.name ?? 'vinculado'}${
                        point.assetNodeType ? ` — ${point.assetNodeType}` : ''
                      }`
                    : 'Sem ativo vinculado'}
                </span>
              </div>
              {point.tipo && (
                <span className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 capitalize">
                  {point.tipo}
                </span>
              )}
              {isSelected && (
                <span className="shrink-0 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                  Selecionado
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

