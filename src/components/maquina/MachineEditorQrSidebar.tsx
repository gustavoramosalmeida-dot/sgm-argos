import { useRef } from 'react';
import type { QRPoint } from '../../types/QRPoint';
import { isQrPointLinkedToAsset } from '../../utils/qrPointLink';

interface MachineEditorQrSidebarProps {
  points: QRPoint[];
  selectedId: number | string | null;
  onSelect: (pointId: number | string) => void;
  /** Seleciona o ponto e rola até o painel de edição (quando aplicável). */
  onEditFocus: (pointId: number | string) => void;
  onRemove: (pointId: number | string) => void;
  removingId?: number | string | null;
  /** Lista mais compacta e tema escuro (editor imersivo). */
  compact?: boolean;
}

export function MachineEditorQrSidebar({
  points,
  selectedId,
  onSelect,
  onEditFocus,
  onRemove,
  removingId,
  compact = false,
}: MachineEditorQrSidebarProps) {
  const sorted = [...points].sort((a, b) => a.codigo.localeCompare(b.codigo));

  if (!sorted.length) {
    return (
      <div
        className={`rounded-md border border-dashed px-3 py-6 text-center ${
          compact
            ? 'border-slate-700 bg-slate-900/30'
            : 'border-slate-200 bg-slate-50/80'
        }`}
      >
        <p className={`text-xs font-medium ${compact ? 'text-slate-300' : 'text-slate-700'}`}>
          Nenhum QR cadastrado
        </p>
        <p className={`mt-1 text-[11px] ${compact ? 'text-slate-500' : 'text-slate-500'}`}>
          Use o botão no topo
        </p>
      </div>
    );
  }

  return (
    <ul className={compact ? 'space-y-1' : 'space-y-1.5'}>
      {sorted.map((point) => {
        const isSelected = selectedId != null && String(point.id) === String(selectedId);
        const isLinked = isQrPointLinkedToAsset(point);
        const isRemoving = removingId != null && String(removingId) === String(point.id);

        return (
          <li key={point.id}>
            <div
              className={`rounded-md border px-1.5 py-1 transition ${
                compact
                  ? isSelected
                    ? 'border-blue-500/50 bg-blue-950/35 ring-1 ring-blue-500/25'
                    : 'border-slate-700/80 bg-slate-900/30 hover:border-slate-600'
                  : isSelected
                    ? 'border-blue-500 bg-blue-50/90 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(point.id)}
                className="flex w-full items-start gap-1.5 rounded px-0.5 py-0.5 text-left"
              >
                <span
                  className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    isLinked ? 'bg-emerald-500' : compact ? 'bg-slate-500' : 'bg-slate-300'
                  }`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <span
                    className={`block font-mono text-[11px] font-semibold leading-tight ${
                      compact ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    {point.codigo}
                  </span>
                  <span
                    className={`block truncate text-[10px] leading-tight ${
                      compact ? 'text-slate-500' : 'text-slate-600'
                    }`}
                  >
                    {point.descricao}
                  </span>
                  <span
                    className={`mt-0.5 block text-[9px] uppercase tracking-wide leading-tight ${
                      compact ? 'text-slate-500' : 'text-slate-500'
                    }`}
                  >
                    {isLinked
                      ? `Vinculado${point.assetName || point.asset?.name ? ` · ${point.assetName ?? point.asset?.name}` : ''}`
                      : 'Sem vínculo'}
                  </span>
                </div>
              </button>
              <div
                className={`mt-1 flex flex-wrap justify-end gap-1 border-t pt-1 ${
                  compact ? 'border-slate-700/60 opacity-95' : 'border-slate-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onEditFocus(point.id)}
                  className={
                    compact
                      ? 'rounded border border-transparent bg-transparent px-1.5 py-0.5 text-[10px] font-normal text-slate-400 hover:border-slate-600 hover:bg-slate-800/60 hover:text-slate-200'
                      : 'rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50'
                  }
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(point.id)}
                  disabled={isRemoving}
                  className={
                    compact
                      ? 'rounded border border-transparent bg-transparent px-1.5 py-0.5 text-[10px] font-normal text-red-400/90 hover:border-red-900/50 hover:bg-red-950/40 disabled:opacity-50'
                      : 'rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100 disabled:opacity-50'
                  }
                >
                  {isRemoving ? '…' : 'Remover'}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Hook para rolar até o painel de edição ao acionar &quot;Editar&quot; na sidebar. */
export function useScrollToEditorPanel() {
  const editorPanelRef = useRef<HTMLDivElement>(null);
  const scrollToEditor = () => {
    editorPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  return { editorPanelRef, scrollToEditor };
}
