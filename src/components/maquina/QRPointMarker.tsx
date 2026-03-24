import { useCallback, useEffect, useRef, useState } from 'react';
import type { QRPoint } from '../../types/QRPoint';

type ImageRect = { left: number; top: number; width: number; height: number } | null;

interface QRPointMarkerProps {
  point: QRPoint;
  imageRect: ImageRect;
  onMovePoint?: (pointId: number | string, x: number, y: number) => void;
  onMovePointEnd?: (pointId: number | string, x: number, y: number) => void;
  selected?: boolean;
  onSelectPoint?: (pointId: number | string) => void;
  mode?: 'view' | 'edit';
}

function getMarkerColorClasses(tipo?: string, status?: QRPoint['status']) {
  // Status operacional tem prioridade nas cores
  if (status === 'ok') {
    return {
      base: 'bg-emerald-500 border-emerald-600',
      dragging: 'border-emerald-700 bg-emerald-600',
      hover: 'hover:border-emerald-700 hover:bg-emerald-600',
      ring: 'ring-emerald-300',
      extra: '',
    };
  }

  if (status === 'atencao') {
    return {
      base: 'bg-amber-400 border-amber-500',
      dragging: 'border-amber-600 bg-amber-500',
      hover: 'hover:border-amber-600 hover:bg-amber-500',
      ring: 'ring-amber-200',
      extra: '',
    };
  }

  if (status === 'falha') {
    return {
      base: 'bg-red-500 border-red-600',
      dragging: 'border-red-700 bg-red-600',
      hover: 'hover:border-red-700 hover:bg-red-600',
      ring: 'ring-red-300',
      extra: 'animate-pulse',
    };
  }

  // Fallback: usa o tipo visual do componente
  switch (tipo) {
    case 'motor':
      return {
      base: 'bg-orange-500 border-orange-600',
      dragging: 'border-orange-700 bg-orange-600',
      hover: 'hover:border-orange-700 hover:bg-orange-600',
      ring: 'ring-orange-300',
      extra: '',
    };
    case 'sensor':
      return {
      base: 'bg-sky-500 border-sky-600',
      dragging: 'border-sky-700 bg-sky-600',
      hover: 'hover:border-sky-700 hover:bg-sky-600',
      ring: 'ring-sky-300',
      extra: '',
    };
    case 'painel':
      return {
      base: 'bg-purple-500 border-purple-600',
      dragging: 'border-purple-700 bg-purple-600',
      hover: 'hover:border-purple-700 hover:bg-purple-600',
      ring: 'ring-purple-300',
      extra: '',
    };
    case 'estrutura':
      return {
        base: 'bg-slate-500 border-slate-600',
        dragging: 'border-slate-700 bg-slate-600',
        hover: 'hover:border-slate-700 hover:bg-slate-600',
        ring: 'ring-slate-300',
        extra: '',
      };
    case 'correia':
      return {
        base: 'bg-yellow-400 border-yellow-500',
        dragging: 'border-yellow-600 bg-yellow-500',
        hover: 'hover:border-yellow-600 hover:bg-yellow-500',
        ring: 'ring-yellow-300',
        extra: '',
      };
    case 'atuador':
      return {
        base: 'bg-green-500 border-green-600',
        dragging: 'border-green-700 bg-green-600',
        hover: 'hover:border-green-700 hover:bg-green-600',
      ring: 'ring-green-300',
        extra: '',
      };
    default:
      return {
        base: 'bg-slate-500 border-slate-600',
        dragging: 'border-slate-700 bg-slate-600',
        hover: 'hover:border-slate-700 hover:bg-slate-600',
        ring: 'ring-slate-400',
        extra: '',
      };
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Marcador estilo mapa: círculo pequeno, ícone de QR, cor azul.
 * Arrastar reposiciona o ponto; clique seleciona para edição no painel lateral.
 */
export function QRPointMarker({
  point,
  imageRect,
  onMovePoint,
  onMovePointEnd,
  selected = false,
  onSelectPoint,
  mode = 'edit',
}: QRPointMarkerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const hasDraggedRef = useRef(false);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const colorClasses = getMarkerColorClasses(point.tipo, point.status);

  const computePercent = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      if (!imageRect || imageRect.width <= 0 || imageRect.height <= 0) {
        return { x: point.x, y: point.y };
      }
      const x = ((clientX - imageRect.left) / imageRect.width) * 100;
      const y = ((clientY - imageRect.top) / imageRect.height) * 100;
      return {
        x: clamp(x, 0, 100),
        y: clamp(y, 0, 100),
      };
    },
    [imageRect, point.x, point.y]
  );

  useEffect(() => {
    if (!isDragging || !imageRect || !onMovePoint) return;

    const handleMouseMove = (e: MouseEvent) => {
      hasDraggedRef.current = true;
      const { x, y } = computePercent(e.clientX, e.clientY);
      lastPositionRef.current = { x, y };
      onMovePoint(point.id, x, y);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (hasDraggedRef.current && onMovePointEnd && lastPositionRef.current) {
        const last = lastPositionRef.current;
        onMovePointEnd(point.id, last.x, last.y);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, imageRect, onMovePoint, onMovePointEnd, point.id, computePercent]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (mode !== 'edit') return;
      if (!onMovePoint || !imageRect) return;
      hasDraggedRef.current = false;
      lastPositionRef.current = { x: point.x, y: point.y };
      setIsDragging(true);
    },
    [mode, onMovePoint, imageRect]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasDraggedRef.current) return;
      if (onSelectPoint) {
        onSelectPoint(point.id);
      }
    },
    [onSelectPoint, point.id]
  );

  return (
    <>
      <div
        className={`absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-white shadow-md transition-all pointer-events-auto
          ${colorClasses.base}
          ${
            isDragging
              ? `scale-125 cursor-grabbing ${colorClasses.dragging} shadow-lg`
              : `${
                  mode === 'edit'
                    ? 'cursor-grab hover:scale-110'
                    : 'cursor-pointer'
                } ${colorClasses.hover} hover:shadow-lg`
          }
          ${
            selected
              ? `scale-125 border-white ring-2 ring-offset-2 ${colorClasses.ring} shadow-lg animate-pulse`
              : ''
          }
          ${colorClasses.extra}
        `}
        style={{ left: `${point.x}%`, top: `${point.y}%` }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onSelectPoint) {
              onSelectPoint(point.id);
            }
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`QR ${point.codigo}: ${point.descricao}${point.tipo ? `, tipo ${point.tipo}` : ''}${point.assetName || point.asset?.name ? `, ativo ${point.assetName ?? point.asset?.name}` : ''}`}
        title={`${point.codigo} — ${point.descricao}${point.assetName || point.asset?.name ? ` (ativo: ${point.assetName ?? point.asset?.name})` : ''}`}
      >
        <QRIcon className="h-4 w-4" />
      </div>
    </>
  );
}

function QRIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="4" height="4" rx="0.5" />
      <rect x="9" y="14" width="4" height="4" rx="0.5" />
      <rect x="15" y="14" width="4" height="4" rx="0.5" />
      <path d="M8 14v-1M8 18v-1M12 14v-1M12 18v-1M16 14v-1" />
    </svg>
  );
}
