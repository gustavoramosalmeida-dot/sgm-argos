import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PageLoading } from '../../components/ui/PageLoading';
import { PageErrorAlert } from '../../components/ui/PageErrorAlert';
import { formatLoadError } from '../../utils/apiErrorMessage';
import type { Maquina } from '../../types/Maquina';
import type { QRPoint } from '../../types/QRPoint';
import { getMaquinaById } from '../../features/maquinas/maquinas.service';
import { getQRPointsByMaquinaId } from '../../features/qrpoints/qrpoints.service';
import {
  getMachineById,
  getMachineVisualPoints,
  linkVisualPointToAsset,
  createAssetFromVisualPoint,
  getAssetById,
  unlinkVisualPointFromAsset,
} from '@/services/sgm';
import {
  createMachineVisualPoint,
  updateVisualPoint,
  deleteVisualPoint,
} from '@/modules/sgm/services/visualPoints.service';
import type { MachineSummary, AssetSummary } from '@/types/sgm-api';
import { MaquinaHeader } from '../../components/maquina/MaquinaHeader';
import { MaquinaInfoCard } from '../../components/maquina/MaquinaInfoCard';
import { MaquinaCanvas } from '../../components/maquina/MaquinaCanvas';
import { ViewModeSelector, type ViewMode } from '../../components/maquina/ViewModeSelector';
import { QRPointList } from '../../components/maquina/QRPointList';
import { QRPointEditor } from '../../components/maquina/QRPointEditor';
import { MachineInventoryPage } from './MachineInventoryPage';
import { QRDetailDrawer, type LinkCandidate } from '../../components/maquina/QRDetailDrawer';
import type { ComponentEvent, ComponentRadarSummary } from '../../types/ComponentEvent';
import {
  getComponentEventsByQRPointId,
  getQRInventoryForMachine,
  type QRInventoryItem,
} from '../../features/componentEvents/componentEvents.service';
import { mapVisualPointToQRPoint } from '@/modules/sgm/utils/mapVisualPointToQRPoint';
import { MachineHealthStrip } from '../../components/maquina/MachineHealthStrip';
import {
  aggregateMachineHealth,
  type InventoryRadarFilter,
} from '../../utils/machineHealthAggregate';

const PLACEHOLDER_PHOTO =
  'https://placehold.co/800x500/1e293b/94a3b8?text=Foto+da+m%C3%A1quina';
const PLACEHOLDER_BLUEPRINT =
  'https://placehold.co/800x500/0f172a/64748b?text=Blueprint+t%C3%A9cnico';
const PLACEHOLDER_EXPLODED =
  'https://placehold.co/800x500/334155/94a3b8?text=Vis%C3%A3o+explodida';

type MaquinaPersistedState = {
  imageUrl: string | null;
  blueprintImageUrl?: string | null;
  explodedImageUrl?: string | null;
  qrPoints: QRPoint[];
};

const MACHINE_STATE_KEY = (id: number | string) => `sgm-maquina-state-${id}`;
const LEGACY_IMAGE_KEY = (id: number | string) => `sgm-maquina-image-${id}`;

/** True quando o id tem formato UUID (8-4-4-4-12 hex). Aceita qualquer UUID, não só RFC 4122. */
function isVisualPointIdFromApi(id: number | string): boolean {
  const s = String(id);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function getInitialTabFromLocation(): 'map' | 'edit' | 'inventory' {
  if (typeof window === 'undefined') return 'map';
  const t = new URLSearchParams(window.location.search).get('tab');
  if (t === 'inventory') return 'inventory';
  if (t === 'edit') return 'edit';
  if (t === 'map') return 'map';
  return 'map';
}

function mapApiMachineToMaquina(m: MachineSummary): Maquina {
  return {
    id: m.id,
    plantaId: m.site?.id ?? '',
    nome: m.name,
    codigo: m.code ?? m.id,
    descricao: m.description ?? '',
    posX: 0,
    posY: 0,
    statusVisual: (m.status === 'failure' ? 'parada' : m.status === 'warning' ? 'atencao' : 'normal') as Maquina['statusVisual'],
  };
}

export function MaquinaPage() {
  const { machineId } = useParams<{ machineId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [maquina, setMaquina] = useState<Maquina | null>(null);
  const [qrPoints, setQrPoints] = useState<QRPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [blueprintImageUrl, setBlueprintImageUrl] = useState<string | null>(null);
  const [explodedImageUrl, setExplodedImageUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('photo');
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState<number | string | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>(() =>
    getInitialTabFromLocation() === 'edit' ? 'edit' : 'view'
  );
  const [activeTab, setActiveTab] = useState<'map' | 'edit' | 'inventory'>(getInitialTabFromLocation);
  const [inventoryItems, setInventoryItems] = useState<QRInventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [qrPersistError, setQrPersistError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRadar, setDetailRadar] = useState<ComponentRadarSummary | null>(null);
  const [detailEvents, setDetailEvents] = useState<ComponentEvent[]>([]);
  const [detailAsset, setDetailAsset] = useState<AssetSummary | null>(null);
  const [linking, setLinking] = useState(false);
  const [inventoryRadarFilter, setInventoryRadarFilter] =
    useState<InventoryRadarFilter>('all');

  const assetDeepLinkAppliedRef = useRef(false);

  useEffect(() => {
    assetDeepLinkAppliedRef.current = false;
  }, [machineId]);

  useEffect(() => {
    if (!machineId) {
      setLoading(false);
      return;
    }
    setLoadError(null);
    const numericId = parseInt(machineId, 10);
    const isNumeric = String(numericId) === machineId && !Number.isNaN(numericId);

    if (isNumeric) {
      Promise.all([getMaquinaById(numericId), getQRPointsByMaquinaId(numericId)])
        .then(([m, points]) => {
          const baseMaquina = m ?? null;
          setMaquina(baseMaquina);
          if (!baseMaquina) {
            setQrPoints([]);
            return;
          }
          try {
            const storedRaw = localStorage.getItem(MACHINE_STATE_KEY(numericId));
            if (storedRaw) {
              const stored: MaquinaPersistedState = JSON.parse(storedRaw);
              setQrPoints(stored.qrPoints ?? points ?? []);
              setCustomImageUrl(stored.imageUrl ?? null);
              setBlueprintImageUrl(stored.blueprintImageUrl ?? null);
              setExplodedImageUrl(stored.explodedImageUrl ?? null);
              return;
            }
          } catch {
            // ignore
          }
          setQrPoints(points ?? []);
        })
        .catch((e) => {
          setMaquina(null);
          setQrPoints([]);
          setLoadError(e);
        })
        .finally(() => setLoading(false));
      return;
    }

    Promise.all([getMachineById(machineId), getMachineVisualPoints(machineId)])
      .then(([m, visualPoints]) => {
        setLoadError(null);
        const baseMaquina = m ? mapApiMachineToMaquina(m) : null;
        setMaquina(baseMaquina);
        const fromApi: QRPoint[] = visualPoints.items.map(mapVisualPointToQRPoint);
        setQrPoints(fromApi);
        if (baseMaquina) {
          try {
            const storedRaw = localStorage.getItem(MACHINE_STATE_KEY(machineId));
            if (storedRaw) {
              const stored: MaquinaPersistedState = JSON.parse(storedRaw);
              if (stored.imageUrl != null) setCustomImageUrl(stored.imageUrl);
              if (stored.blueprintImageUrl != null) {
                setBlueprintImageUrl(stored.blueprintImageUrl);
              }
              if (stored.explodedImageUrl != null) {
                setExplodedImageUrl(stored.explodedImageUrl);
              }
            }
          } catch {
            // ignore
          }
        }
      })
      .catch((e) => {
        setMaquina(null);
        setQrPoints([]);
        setLoadError(e);
      })
      .finally(() => setLoading(false));
  }, [machineId]);

  useEffect(() => {
    if (!machineId || !maquina) return;
    const id = maquina.id;
    try {
      const storedRaw = localStorage.getItem(MACHINE_STATE_KEY(id));
      if (storedRaw) {
        const stored: MaquinaPersistedState = JSON.parse(storedRaw);
        if (stored.imageUrl) setCustomImageUrl(stored.imageUrl);
        if (stored.blueprintImageUrl != null) setBlueprintImageUrl(stored.blueprintImageUrl);
        if (stored.explodedImageUrl != null) setExplodedImageUrl(stored.explodedImageUrl);
        return;
      }
      if (typeof id === 'number') {
        const legacy = localStorage.getItem(LEGACY_IMAGE_KEY(id));
        if (legacy) setCustomImageUrl(legacy);
      }
    } catch {
      // ignore
    }
  }, [machineId, maquina]);

  // Persistência única de imagem + QR points
  useEffect(() => {
    if (!maquina) return;
    const id = maquina.id;
    try {
      const state: MaquinaPersistedState = {
        imageUrl: customImageUrl ?? null,
        blueprintImageUrl: blueprintImageUrl ?? null,
        explodedImageUrl: explodedImageUrl ?? null,
        qrPoints,
      };
      localStorage.setItem(MACHINE_STATE_KEY(id), JSON.stringify(state));
    } catch {
      // quota ou storage desabilitado
    }
  }, [maquina, qrPoints, customImageUrl, blueprintImageUrl, explodedImageUrl]);

  useEffect(() => {
    if (!maquina) {
      setInventoryItems([]);
      return;
    }
    setInventoryLoading(true);
    getQRInventoryForMachine(qrPoints)
      .then((items) => setInventoryItems(items))
      .finally(() => setInventoryLoading(false));
  }, [maquina, qrPoints]);

  useEffect(() => {
    const raw = searchParams.get('tab');
    if (raw === 'inventory') {
      setActiveTab('inventory');
      return;
    }
    if (raw === 'edit') {
      setMode('edit');
      setActiveTab('edit');
      return;
    }
    if (raw === 'map') {
      setMode('view');
      setActiveTab('map');
      return;
    }
    if (raw && !['map', 'edit', 'inventory'].includes(raw)) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('tab');
          return next;
        },
        { replace: true }
      );
      return;
    }
    // Sem `tab` na URL: mapa como padrão (ex.: após remover ?tab=inventory)
    setMode('view');
    setActiveTab('map');
  }, [searchParams, setSearchParams]);

  const applyTab = useCallback(
    (tab: 'map' | 'edit' | 'inventory') => {
      if (tab === 'map') {
        setMode('view');
        setActiveTab('map');
      } else if (tab === 'edit') {
        setMode('edit');
        setActiveTab('edit');
      } else {
        setActiveTab('inventory');
      }
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (tab === 'map') {
            next.delete('tab');
          } else {
            next.set('tab', tab);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    setInventoryRadarFilter('all');
  }, [machineId]);

  const machineHealth = useMemo(
    () => aggregateMachineHealth(inventoryItems),
    [inventoryItems]
  );

  const refetchMachineVisualPoints = useCallback(async () => {
    if (!machineId || !maquina || !isVisualPointIdFromApi(maquina.id)) return;
    try {
      const visualPoints = await getMachineVisualPoints(String(maquina.id));
      setQrPoints(visualPoints.items.map(mapVisualPointToQRPoint));
    } catch {
      /* mantém estado local; falha já sinalizada ao usuário */
    }
  }, [machineId, maquina]);

  const handleAddQRPoint = useCallback(
    (x: number, y: number) => {
      if (!maquina) return;
      const isApiMachine = isVisualPointIdFromApi(maquina.id);

      // Fluxo legado (mock / id numérico): mantém como antes
      if (!isApiMachine) {
        const numericIds = qrPoints
          .map((p) =>
            typeof p.id === "number" && !Number.isNaN(p.id) ? p.id : null
          )
          .filter((n): n is number => n !== null);
        const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
        const codigo = `QR-${String(nextId).padStart(3, "0")}`;

        const newPoint: QRPoint = {
          id: nextId,
          maquinaId: maquina.id,
          x,
          y,
          codigo,
          descricao: "Novo ponto",
          tipo: "outro",
          status: "ok",
        };
        setQrPoints((prev) => [...prev, newPoint]);
        setSelectedPointId(newPoint.id);
        return;
      }

      // Fluxo real (API UUID): persiste no backend
      const labelBase = `Novo ponto`;
      const novoCount =
        qrPoints.filter((p) => p.descricao === labelBase).length + 1;
      const label = novoCount === 1 ? labelBase : `${labelBase} ${novoCount}`;

      const tempId = `temp-${Date.now()}`;
      const optimistic: QRPoint = {
        id: tempId,
        maquinaId: maquina.id,
        x,
        y,
        codigo: label,
        descricao: label,
        tipo: "outro",
        status: "ok",
      };

      setQrPoints((prev) => [...prev, optimistic]);
      setSelectedPointId(tempId);
      setQrPersistError(null);

      void createMachineVisualPoint(String(maquina.id), { x, y, label })
        .then((created) => {
          const mapped = mapVisualPointToQRPoint(created);
          setQrPoints((prev) =>
            prev.map((p) => (String(p.id) === String(tempId) ? mapped : p))
          );
          setSelectedPointId(mapped.id);
        })
        .catch(() => {
          setQrPoints((prev) => prev.filter((p) => String(p.id) !== String(tempId)));
          setSelectedPointId((cur) => (cur != null && String(cur) === String(tempId) ? null : cur));
          void refetchMachineVisualPoints();
          setQrPersistError('Não foi possível criar o ponto.');
        });
    },
    [maquina, qrPoints, refetchMachineVisualPoints]
  );

  const handleMoveQRPoint = useCallback((pointId: number | string, x: number, y: number) => {
    setQrPoints((prev) =>
      prev.map((p) => (String(p.id) === String(pointId) ? { ...p, x, y } : p))
    );
  }, []);

  const handleCommitMoveQRPoint = useCallback(
    async (pointId: number | string, x: number, y: number) => {
      if (!maquina) return;
      const isApiMachine = isVisualPointIdFromApi(maquina.id);
      if (!isApiMachine) return;

      const idStr = String(pointId);
      if (!isVisualPointIdFromApi(idStr)) return;

      try {
        const updated = await updateVisualPoint(idStr, { x, y });
        const mapped = mapVisualPointToQRPoint(updated);
        setQrPoints((prev) =>
          prev.map((p) => (String(p.id) === idStr ? mapped : p))
        );
        setQrPersistError(null);
      } catch {
        setQrPersistError('Não foi possível salvar a posição do ponto.');
        await refetchMachineVisualPoints();
      }
    },
    [maquina, refetchMachineVisualPoints]
  );

  const handleImageChange = useCallback((file: File) => {
    setImageUploadLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setCustomImageUrl(reader.result as string);
      setImageUploadLoading(false);
    };
    reader.onerror = () => setImageUploadLoading(false);
    reader.readAsDataURL(file);
  }, []);

  const handleBlueprintImageChange = useCallback((file: File) => {
    setImageUploadLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setBlueprintImageUrl(reader.result as string);
      setImageUploadLoading(false);
    };
    reader.onerror = () => setImageUploadLoading(false);
    reader.readAsDataURL(file);
  }, []);

  const handleExplodedImageChange = useCallback((file: File) => {
    setImageUploadLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setExplodedImageUrl(reader.result as string);
      setImageUploadLoading(false);
    };
    reader.onerror = () => setImageUploadLoading(false);
    reader.readAsDataURL(file);
  }, []);

  const handleOpenDetail = useCallback(
    async (point: QRPoint) => {
      setSelectedPointId(point.id);
      const [events] = await Promise.all([
        getComponentEventsByQRPointId(point.id),
      ]);
      setDetailEvents(events);
      const inventoryItem = inventoryItems.find(
        (item) => String(item.point.id) === String(point.id)
      );
      setDetailRadar(inventoryItem ? inventoryItem.radar : null);
      if (point.assetId) {
        try {
          const asset = await getAssetById(point.assetId);
          setDetailAsset(asset);
        } catch {
          setDetailAsset(null);
        }
      } else {
        setDetailAsset(null);
      }
      setDetailOpen(true);
    },
    [inventoryItems]
  );

  const handleSelectPoint = useCallback(
    (pointId: number | string) => {
      const id = typeof pointId === 'number' ? pointId : pointId;
      setSelectedPointId(id);
      const point = qrPoints.find((p) => String(p.id) === String(pointId));
      if (point) handleOpenDetail(point);
    },
    [qrPoints, handleOpenDetail]
  );

  /** Pós-scan QR / deep link: ?assetId= foca o ponto visual com esse ativo (ex.: redirect do resolver /q). */
  useEffect(() => {
    if (loading) return;
    const raw = searchParams.get('assetId');
    if (!raw || qrPoints.length === 0) return;
    if (assetDeepLinkAppliedRef.current) return;

    const point = qrPoints.find(
      (p) =>
        (p.assetId != null && String(p.assetId) === raw) ||
        (p.assetNodeId != null && String(p.assetNodeId) === raw) ||
        (p.asset?.id != null && String(p.asset.id) === raw)
    );

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('assetId');
        return next;
      },
      { replace: true }
    );

    if (!point) return;

    assetDeepLinkAppliedRef.current = true;
    handleSelectPoint(point.id);
  }, [loading, qrPoints, searchParams, handleSelectPoint, setSearchParams]);

  const handleSavePoint = useCallback(
    async (updated: QRPoint) => {
      if (!maquina) return;
      const isApiMachine = isVisualPointIdFromApi(maquina.id);
      const idStr = String(updated.id);

      if (!isApiMachine || !isVisualPointIdFromApi(idStr)) {
        setQrPoints((prev) =>
          prev.map((p) => (String(p.id) === idStr ? updated : p))
        );
        return;
      }

      try {
        const vp = await updateVisualPoint(idStr, {
          label: updated.descricao ?? updated.codigo,
        });
        const mapped = mapVisualPointToQRPoint(vp);
        setQrPoints((prev) =>
          prev.map((p) => (String(p.id) === idStr ? mapped : p))
        );
      } catch {
        throw new Error('SAVE_FAILED');
      }
    },
    [maquina]
  );

  const handleDeletePoint = useCallback(
    async (id: number | string) => {
      if (!maquina) return;
      const idStr = String(id);
      const isApiMachine = isVisualPointIdFromApi(maquina.id);

      if (!isApiMachine || !isVisualPointIdFromApi(idStr)) {
        setQrPoints((prev) => prev.filter((p) => String(p.id) !== idStr));
        setSelectedPointId((current) =>
          current != null && String(current) === idStr ? null : current
        );
        return;
      }

      try {
        await deleteVisualPoint(idStr);
        setQrPoints((prev) => prev.filter((p) => String(p.id) !== idStr));
        setSelectedPointId((current) =>
          current != null && String(current) === idStr ? null : current
        );
        setQrPersistError(null);
      } catch {
        await refetchMachineVisualPoints();
        throw new Error('DELETE_FAILED');
      }
    },
    [maquina, refetchMachineVisualPoints]
  );

  const selectedPoint =
    selectedPointId != null
      ? qrPoints.find((p) => String(p.id) === String(selectedPointId)) ?? null
      : null;

  const linkCandidates: LinkCandidate[] = useMemo(() => {
    const map = new Map<string, LinkCandidate>();
    qrPoints.forEach((p) => {
      if (p.assetId && p.asset && p.id !== selectedPoint?.id)
        map.set(p.assetId, {
          id: p.assetId,
          name: p.asset.name,
          code: p.asset.code,
          nodeType: p.assetNodeType ?? p.asset.nodeKind ?? null,
        });
    });
    return Array.from(map.values());
  }, [qrPoints, selectedPoint?.id]);

  if (loading) {
    return (
      <PageLoading
        title="Carregando máquina"
        description="Buscando dados, imagem e pontos visuais."
      />
    );
  }

  if (loadError && !maquina) {
    const { message, detail } = formatLoadError(
      loadError,
      'Não foi possível carregar esta máquina. Verifique o link e se o servidor está disponível.'
    );
    return (
      <PageErrorAlert
        title="Não foi possível abrir a máquina"
        message={message}
        detail={detail}
        backTo={{ label: '← Voltar às plantas', to: '/plants' }}
      />
    );
  }

  if (!maquina) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900 max-w-md">
        <p className="font-semibold">Máquina não encontrada</p>
        <p className="text-sm mt-2">
          Isso pode ocorrer se:
        </p>
        <ul className="list-disc list-inside text-sm mt-1 space-y-0.5">
          <li>o link estiver incorreto</li>
          <li>a máquina foi removida</li>
          <li>a planta ainda não carregou os dados</li>
        </ul>
        <Link
          to="/plants"
          className="mt-4 inline-block rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors"
        >
          ← Voltar às plantas
        </Link>
      </div>
    );
  }

  const isApiMachine = isVisualPointIdFromApi(maquina.id);
  const MACHINE_TEST_UUID = 'e1b35c6d-4f7a-5b8e-2c9d-0a1e3f4b5c6d'; // 0006_seed_second_machine

  return (
    <div className="space-y-6">
      {!isApiMachine && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-amber-900">
          <p className="font-semibold">Fluxo legado (id numérico)</p>
          <p className="text-sm mt-1">
            Criar ou vincular ativo só está disponível para máquinas com identificador UUID (fluxo atual da API).
            Esta URL usa id numérico.
          </p>
          {import.meta.env.DEV ? (
            <Link
              to={`/machines/${MACHINE_TEST_UUID}`}
              className="mt-3 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Dev: abrir máquina de exemplo (UUID) →
            </Link>
          ) : null}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <MaquinaHeader maquina={maquina} />
        {machineId && isApiMachine ? (
          <Link
            to={`/machines/${machineId}/editor`}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 transition-colors"
          >
            Editor visual
          </Link>
        ) : null}
      </div>

      <MaquinaInfoCard maquina={maquina} />

      <MachineHealthStrip
        snapshot={machineHealth}
        loading={inventoryLoading}
        radarFilter={inventoryRadarFilter}
        onRadarFilterChange={setInventoryRadarFilter}
        onOpenInventory={() => applyTab('inventory')}
        machineId={machineId ?? ''}
      />

      <section className="mt-4">
        {qrPersistError ? (
          <div
            className="mb-3 flex items-start justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            role="alert"
          >
            <span>{qrPersistError}</span>
            <button
              type="button"
              onClick={() => setQrPersistError(null)}
              className="shrink-0 rounded px-1.5 text-amber-700 hover:bg-amber-100"
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        ) : null}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => applyTab('map')}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                activeTab === 'map'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-transparent text-slate-700 hover:bg-slate-200'
              }`}
            >
              Mapa
            </button>
            <button
              type="button"
              onClick={() => applyTab('edit')}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                activeTab === 'edit'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-transparent text-slate-700 hover:bg-slate-200'
              }`}
            >
              Edição
            </button>
            <button
              type="button"
              onClick={() => applyTab('inventory')}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                activeTab === 'inventory'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-transparent text-slate-700 hover:bg-slate-200'
              }`}
            >
              Inventário
            </button>
          </div>
        </div>

        {activeTab !== 'inventory' ? (
          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="flex min-h-[60vh] flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <div>
                  <h2 className="text-lg font-medium text-slate-800">
                    Mapa da máquina (QR Points)
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Explore a imagem com zoom e pan, adicione e reposicione QR points.
                  </p>
                  {(() => {
                    const photoUrl = customImageUrl ?? maquina.fotoMaquina ?? PLACEHOLDER_PHOTO;
                    const showPhotoPlaceholderHint =
                      viewMode === 'photo' &&
                      !String(customImageUrl ?? '').startsWith('data:') &&
                      photoUrl.includes('placehold.co');
                    return showPhotoPlaceholderHint ? (
                      <p className="mt-1.5 text-[11px] text-slate-500">
                        Imagem de referência: defina a foto oficial no editor visual para substituir o placeholder.
                      </p>
                    ) : null;
                  })()}
                </div>
                <div className="ml-auto">
                  <ViewModeSelector value={viewMode} onChange={setViewMode} />
                </div>
              </div>
              <MaquinaCanvas
                maquina={maquina}
                qrPoints={qrPoints}
                mode={mode}
                viewMode={viewMode}
                onAddPoint={mode === 'edit' ? handleAddQRPoint : () => {}}
                onMovePoint={mode === 'edit' ? handleMoveQRPoint : undefined}
                onMovePointEnd={mode === 'edit' ? handleCommitMoveQRPoint : undefined}
                selectedPointId={selectedPointId}
                onSelectPoint={handleSelectPoint}
                imageUrlOverride={
                  viewMode === 'photo'
                    ? (customImageUrl ?? maquina.fotoMaquina ?? PLACEHOLDER_PHOTO)
                    : viewMode === 'blueprint'
                      ? (blueprintImageUrl ?? PLACEHOLDER_BLUEPRINT)
                      : (explodedImageUrl ?? PLACEHOLDER_EXPLODED)
                }
                onImageChange={handleImageChange}
                onBlueprintImageChange={handleBlueprintImageChange}
                onExplodedImageChange={handleExplodedImageChange}
                imageUploadLoading={imageUploadLoading}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h3 className="text-base font-medium text-slate-800">
                    QR Points da máquina
                  </h3>
                  <p className="text-xs text-slate-500">
                    Clique em um item para localizar e editar no mapa.
                  </p>
                </div>
                <div className="max-h-[42vh] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <QRPointList
                    points={qrPoints}
                    selectedId={selectedPointId}
                    onSelect={handleSelectPoint}
                    onOpenDetail={handleOpenDetail}
                  />
                </div>
              </div>

              <div className="flex-1">
                {selectedPoint ? (
                  <QRPointEditor
                    point={selectedPoint}
                    allPoints={qrPoints}
                    onSave={handleSavePoint}
                    onDelete={handleDeletePoint}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Selecione um QR point na lista ou use &quot;Adicionar QR Point&quot; no mapa para criar um novo.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-[60vh]">
            <MachineInventoryPage
              rows={inventoryItems}
              machineId={machineId ?? ''}
              loading={inventoryLoading}
              radarFilter={inventoryRadarFilter}
              onRadarFilterChange={setInventoryRadarFilter}
              onViewOnMap={(point) => {
                setSelectedPointId(point.id);
                applyTab('map');
              }}
            />
          </div>
        )}
      </section>

      {maquina.plantaId && (
        <div className="pt-4 border-t border-slate-200">
          <Link
            to={`/plants/${maquina.plantaId}`}
            className="text-slate-600 hover:text-slate-800 text-sm font-medium"
          >
            ← Voltar à planta
          </Link>
        </div>
      )}

      <QRDetailDrawer
        open={detailOpen}
        point={selectedPoint}
        summary={detailRadar}
        events={detailEvents}
        machineId={machineId ?? ''}
        machineName={maquina.nome}
        asset={detailAsset}
        linkCandidates={linkCandidates}
        linking={linking}
        onClose={() => setDetailOpen(false)}
        canUseLinkOrCreateApi={selectedPoint ? isVisualPointIdFromApi(selectedPoint.id) : false}
        onLinkExisting={async (assetId) => {
          if (!selectedPoint || !maquina || linking) return;
          if (!isVisualPointIdFromApi(selectedPoint.id)) return;
          const visualPointId = String(selectedPoint.id);
          try {
            setLinking(true);
            await linkVisualPointToAsset(visualPointId, assetId);
            const visualPoints = await getMachineVisualPoints(String(maquina.id));
            setQrPoints(visualPoints.items.map(mapVisualPointToQRPoint));
            const asset = await getAssetById(assetId);
            setDetailAsset(asset);
          } finally {
            setLinking(false);
          }
        }}
        onCreateNew={async ({ name, nodeType, description }) => {
          if (!selectedPoint || !maquina || linking) return;
          if (!isVisualPointIdFromApi(selectedPoint.id)) return;
          const visualPointId = String(selectedPoint.id);
          try {
            setLinking(true);
            await createAssetFromVisualPoint(visualPointId, {
              name,
              nodeType,
              description: description ?? null,
              parentId: null,
            });
            const visualPoints = await getMachineVisualPoints(String(maquina.id));
            setQrPoints(visualPoints.items.map(mapVisualPointToQRPoint));
            const updated = visualPoints.items.find((vp) => vp.id === selectedPoint.id);
            const assetNodeId = updated?.assetNodeId ?? updated?.assetId ?? null;
            if (assetNodeId) {
              const asset = await getAssetById(assetNodeId);
              setDetailAsset(asset);
            }
          } finally {
            setLinking(false);
          }
        }}
        onUnlink={async () => {
          if (!selectedPoint || !maquina || linking) return;
          if (!isVisualPointIdFromApi(selectedPoint.id)) return;
          const visualPointId = String(selectedPoint.id);
          try {
            setLinking(true);
            await unlinkVisualPointFromAsset(visualPointId);
            const visualPoints = await getMachineVisualPoints(String(maquina.id));
            setQrPoints(visualPoints.items.map(mapVisualPointToQRPoint));
            setDetailAsset(null);
          } finally {
            setLinking(false);
          }
        }}
      />
    </div>
  );
}
