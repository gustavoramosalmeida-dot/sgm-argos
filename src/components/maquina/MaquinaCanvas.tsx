import { useCallback, useEffect, useRef, useState } from 'react';
import type { Maquina } from '../../types/Maquina';
import type { QRPoint } from '../../types/QRPoint';
import type { ViewMode } from './ViewModeSelector';
import { QRPointMarker } from './QRPointMarker';
import { ImageUploadButton } from './ImageUploadButton';

const PLACEHOLDER_IMAGE =
  'https://placehold.co/800x500/1e293b/94a3b8?text=Imagem+da+m%C3%A1quina';

interface MaquinaCanvasProps {
  maquina: Maquina;
  qrPoints: QRPoint[];
  mode: 'view' | 'edit';
  /** Modo de visualização: qual camada (foto ou blueprint) está ativa. */
  viewMode?: ViewMode;
  onAddPoint: (x: number, y: number) => void;
  onMovePoint?: (pointId: number | string, x: number, y: number) => void;
  onMovePointEnd?: (pointId: number | string, x: number, y: number) => void;
  selectedPointId?: number | string | null;
  onSelectPoint?: (pointId: number | string) => void;
  /** URL da imagem a exibir (já resolvida pela página conforme viewMode). */
  imageUrlOverride?: string | null;
  onImageChange?: (file: File) => void;
  onBlueprintImageChange?: (file: File) => void;
  onExplodedImageChange?: (file: File) => void;
  imageUploadLoading?: boolean;
  /** Quando definidos, o modo “adicionar ponto” é controlado pelo pai (ex.: botão no cabeçalho do editor). */
  addPointMode?: boolean;
  onAddPointModeChange?: (active: boolean) => void;
  /** Sobrescreve a altura do container (padrão: h-[70vh]). */
  containerClassName?: string;
  /** Oculta o botão “Adicionar QR Point” no canto do canvas (ação só no cabeçalho da página). */
  hideCanvasAddButton?: boolean;
  /** Layout imersivo: menos padding, imagem mais larga, cromo discreto. */
  immersive?: boolean;
}

type ImageClientRect = { left: number; top: number; width: number; height: number } | null;

/**
 * Canvas "Google Maps da máquina": imagem da máquina com camada interativa
 * e marcadores de QR points. No modo edição, clique na imagem para posicionar novos pontos.
 */
export function MaquinaCanvas({
  maquina,
  qrPoints,
  mode,
  viewMode = 'photo',
  onAddPoint,
  onMovePoint,
  onMovePointEnd,
  selectedPointId,
  onSelectPoint,
  imageUrlOverride,
  onImageChange,
  onBlueprintImageChange,
  onExplodedImageChange,
  imageUploadLoading = false,
  addPointMode: addPointModeProp,
  onAddPointModeChange,
  containerClassName,
  hideCanvasAddButton = false,
  immersive = false,
}: MaquinaCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageClientRect, setImageClientRect] = useState<ImageClientRect>(null);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);
  const [internalAddPointMode, setInternalAddPointMode] = useState(false);
  const addPointControlled =
    addPointModeProp !== undefined && onAddPointModeChange !== undefined;
  const isAddingPoint = addPointControlled ? addPointModeProp! : internalAddPointMode;
  const setIsAddingPoint = useCallback(
    (active: boolean) => {
      if (addPointControlled) onAddPointModeChange!(active);
      else setInternalAddPointMode(active);
    },
    [addPointControlled, onAddPointModeChange]
  );

  const updateImageClientRect = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;
    const imgRect = img.getBoundingClientRect();
    setImageClientRect({
      left: imgRect.left,
      top: imgRect.top,
      width: imgRect.width,
      height: imgRect.height,
    });
  }, []);

  useEffect(() => {
    updateImageClientRect();
    const img = imageRef.current;
    if (!img) return;
    const ro = new ResizeObserver(updateImageClientRect);
    ro.observe(img);
    window.addEventListener('resize', updateImageClientRect);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateImageClientRect);
    };
  }, [updateImageClientRect, imageUrlOverride]);

  useEffect(() => {
    setIsAddingPoint(false);
  }, [mode, setIsAddingPoint]);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (mode !== 'edit' || !isAddingPoint) {
        return;
      }
      const img = e.currentTarget;
      const rect = img.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onAddPoint(x, y);
      setIsAddingPoint(false);
    },
    [mode, onAddPoint, isAddingPoint]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      const delta = -e.deltaY;
      const zoomFactor = delta > 0 ? 1.1 : 0.9;
      setScale((prev) => {
        const next = Math.min(3, Math.max(0.5, prev * zoomFactor));
        return next;
      });
    },
    []
  );

  const handlePanMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const container = containerRef.current;
    if (!container) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };
    container.style.cursor = 'grabbing';
  }, []);

  useEffect(() => {
    if (!isPanning) return;
    const container = containerRef.current;
    if (!container || !panStartRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const start = panStartRef.current;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      container.scrollLeft = start.scrollLeft - dx;
      container.scrollTop = start.scrollTop - dy;
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      panStartRef.current = null;
      container.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.style.cursor = '';
    };
  }, [isPanning]);

  useEffect(() => {
    if (!selectedPointId || !imageClientRect || !containerRef.current) return;
    const container = containerRef.current;
    const point = qrPoints.find((p) => String(p.id) === String(selectedPointId));
    if (!point) return;

    const imgRect = imageClientRect;
    const pointX = imgRect.left + (point.x / 100) * imgRect.width;
    const pointY = imgRect.top + (point.y / 100) * imgRect.height;

    const containerRect = container.getBoundingClientRect();
    const targetX = pointX - (containerRect.left + containerRect.width / 2);
    const targetY = pointY - (containerRect.top + containerRect.height / 2);

    container.scrollLeft += targetX;
    container.scrollTop += targetY;
  }, [selectedPointId, imageClientRect, qrPoints]);

  const imageSrc = imageUrlOverride ?? maquina.fotoMaquina ?? PLACEHOLDER_IMAGE;
  const canUploadPhoto = Boolean(onImageChange);
  const canUploadBlueprint = Boolean(onBlueprintImageChange);
  const canUploadExploded = Boolean(onExplodedImageChange);
  const showUpload =
    (viewMode === 'photo' && canUploadPhoto) ||
    (viewMode === 'blueprint' && canUploadBlueprint) ||
    (viewMode === 'exploded' && canUploadExploded);
  const handleUpload =
    viewMode === 'photo'
      ? onImageChange
      : viewMode === 'blueprint'
        ? onBlueprintImageChange
        : onExplodedImageChange;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-auto ${
        immersive
          ? 'rounded-md border border-slate-800/80 bg-slate-900/60'
          : 'rounded-lg border border-slate-200 bg-slate-950/5'
      } ${containerClassName ?? 'h-[70vh]'}`}
      onWheel={handleWheel}
    >
      {showUpload && handleUpload && (
        <ImageUploadButton
          onFileSelect={handleUpload}
          loading={imageUploadLoading}
        />
      )}
      {!hideCanvasAddButton ? (
        <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
          {mode === 'edit' && (
            <button
              type="button"
              onClick={() => setIsAddingPoint(!isAddingPoint)}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm transition
              ${
                isAddingPoint
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-white/95 text-slate-800 hover:bg-slate-100'
              } border border-slate-200`}
            >
              <span className="mr-1 text-base leading-none">+</span>
              Adicionar QR Point
            </button>
          )}
          {mode === 'edit' && (
            <span className="hidden md:inline text-[11px] text-slate-500 bg-white/80 px-2 py-1 rounded-full border border-slate-200">
              {isAddingPoint
                ? 'Clique na imagem para posicionar o ponto'
                : 'Use o botão para adicionar um novo ponto'}
            </span>
          )}
        </div>
      ) : null}

      <div
        className={`relative inline-block ${immersive ? 'p-1' : 'p-6'} ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}
        onMouseDown={handlePanMouseDown}
      >
        <div
          className={`relative inline-block ${immersive ? 'rounded-md bg-slate-950/40' : 'rounded-lg bg-slate-100 shadow-md'}`}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt={maquina.nome}
            className={`block h-auto object-contain ${
              immersive
                ? `max-w-full min-w-0 w-auto max-h-[min(88dvh,calc(100dvh-5.5rem))] lg:max-h-[min(90dvh,calc(100dvh-4.5rem))] ${mode === 'edit' && isAddingPoint ? 'cursor-crosshair' : 'cursor-default'} rounded-sm`
                : `max-w-[1200px] rounded ${mode === 'edit' && isAddingPoint ? 'cursor-crosshair' : 'cursor-default'}`
            }`}
            onClick={handleImageClick}
            onLoad={updateImageClientRect}
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = PLACEHOLDER_IMAGE;
            }}
          />
          {imageClientRect && (
            <div className="pointer-events-none absolute inset-0">
              {qrPoints.map((point) => (
                <QRPointMarker
                  key={point.id}
                  point={point}
                  imageRect={imageClientRect}
                  onMovePoint={onMovePoint}
                  onMovePointEnd={onMovePointEnd}
                  selected={selectedPointId != null && String(selectedPointId) === String(point.id)}
                  onSelectPoint={onSelectPoint}
                  mode={mode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={`pointer-events-none absolute z-20 flex flex-col items-end gap-1 ${
          immersive ? 'bottom-2 right-2' : 'bottom-3 right-3'
        }`}
      >
        <div
          className={`pointer-events-auto inline-flex items-center overflow-hidden text-xs ${
            immersive
              ? 'rounded-full border border-slate-700 bg-slate-900/90 text-slate-200'
              : 'rounded-full border border-slate-200 bg-white/95 shadow-md'
          }`}
        >
          <button
            type="button"
            className={`px-2 py-1 ${immersive ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
            onClick={() => setScale((prev) => Math.min(3, prev + 0.2))}
          >
            +
          </button>
          <div className={`h-4 w-px ${immersive ? 'bg-slate-600' : 'bg-slate-200'}`} />
          <button
            type="button"
            className={`px-2 py-1 ${immersive ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
            onClick={() => setScale((prev) => Math.max(0.5, prev - 0.2))}
          >
            −
          </button>
          <div className={`h-4 w-px ${immersive ? 'bg-slate-600' : 'bg-slate-200'}`} />
          <button
            type="button"
            className={`px-2 py-1 ${immersive ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
            onClick={() => {
              setScale(1);
              const container = containerRef.current;
              if (container) {
                container.scrollLeft = 0;
                container.scrollTop = 0;
              }
            }}
          >
            reset
          </button>
        </div>
        <span
          className={`pointer-events-none mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-mono ${
            immersive
              ? 'bg-black/50 text-slate-300'
              : 'bg-slate-900/80 text-slate-100'
          }`}
        >
          {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  );
}
