import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEventHandler,
} from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { PageLoading } from '../../components/ui/PageLoading';
import { PageErrorAlert } from '../../components/ui/PageErrorAlert';
import { formatLoadError } from '../../utils/apiErrorMessage';
import type { Maquina } from '../../types/Maquina';
import type { QRPoint } from '../../types/QRPoint';
import type { MachineSummary, AssetSummary } from '@/types/sgm-api';
import type { ComponentEvent, ComponentRadarSummary } from '../../types/ComponentEvent';
import {
  getMachineById,
  getMachineVisualPoints,
  getAssetById,
  updateMachine,
  uploadMachinePhotoFile,
  linkVisualPointToAsset,
  createAssetFromVisualPoint,
  unlinkVisualPointFromAsset,
} from '@/services/sgm';
import {
  getComponentEventsByQRPointId,
  getQRInventoryForMachine,
  type QRInventoryItem,
} from '../../features/componentEvents/componentEvents.service';
import { QRDetailDrawer, type LinkCandidate } from '../../components/maquina/QRDetailDrawer';
import {
  createMachineVisualPoint,
  updateVisualPoint,
  deleteVisualPoint,
} from '@/modules/sgm/services/visualPoints.service';
import { mapVisualPointToQRPoint } from '@/modules/sgm/utils/mapVisualPointToQRPoint';
import { MaquinaCanvas } from '../../components/maquina/MaquinaCanvas';
import { QRPointEditor } from '../../components/maquina/QRPointEditor';
import {
  MachineEditorQrSidebar,
  useScrollToEditorPanel,
} from '../../components/maquina/MachineEditorQrSidebar';
import { isQrPointLinkedToAsset } from '../../utils/qrPointLink';
import { QrInlineActions } from '@/modules/sgm/qr/components/QrInlineActions';

const PLACEHOLDER_PHOTO =
  'https://placehold.co/800x500/1e293b/94a3b8?text=Foto+da+m%C3%A1quina';

/** Alinhado ao placeholder oficial da layer PHOTO no servidor. */
function isPlaceholderMachineImage(url: string | null | undefined): boolean {
  if (url == null || !String(url).trim()) return true;
  const u = String(url).trim();
  if (u === PLACEHOLDER_PHOTO) return true;
  return u.startsWith('https://placehold.co/') && u.includes('1e293b');
}

function isVisualPointIdFromApi(id: number | string): boolean {
  const s = String(id);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
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
    statusVisual: (m.status === 'failure'
      ? 'parada'
      : m.status === 'warning'
        ? 'atencao'
        : 'normal') as Maquina['statusVisual'],
    fotoMaquina: m.imageUrl ?? undefined,
    codigoQrRaiz: m.qrRootCode ?? undefined,
  };
}

export function MachineVisualEditorPage() {
  const { machineId } = useParams<{ machineId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { editorPanelRef, scrollToEditor } = useScrollToEditorPanel();

  const [maquina, setMaquina] = useState<Maquina | null>(null);
  /** Fonte de verdade da imagem: servidor (GET/PUT), sem localStorage. */
  const [serverImageUrl, setServerImageUrl] = useState<string | null>(null);
  /** Preview só nesta sessão (blob:); não persiste; revogar ao limpar. */
  const [localPreviewObjectUrl, setLocalPreviewObjectUrl] = useState<string | null>(null);
  const [qrPoints, setQrPoints] = useState<QRPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [selectedPointId, setSelectedPointId] = useState<number | string | null>(null);
  const [addPointMode, setAddPointMode] = useState(false);
  const [qrPersistError, setQrPersistError] = useState<string | null>(null);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalTab, setImageModalTab] = useState<'file' | 'url'>('url');
  const [imageUrlDraft, setImageUrlDraft] = useState('');
  const [imageSaveLoading, setImageSaveLoading] = useState(false);
  const [imageModalError, setImageModalError] = useState<string | null>(null);
  const [filePickError, setFilePickError] = useState<string | null>(null);
  const [photoUploadLoading, setPhotoUploadLoading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localPreviewRef = useRef<string | null>(null);
  const pendingFileRef = useRef<File | null>(null);

  const [removingId, setRemovingId] = useState<number | string | null>(null);

  const [inventoryItems, setInventoryItems] = useState<QRInventoryItem[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRadar, setDetailRadar] = useState<ComponentRadarSummary | null>(null);
  const [detailEvents, setDetailEvents] = useState<ComponentEvent[]>([]);
  const [detailAsset, setDetailAsset] = useState<AssetSummary | null>(null);
  const [linking, setLinking] = useState(false);
  const [vpParamNotice, setVpParamNotice] = useState<string | null>(null);
  const processedVpRef = useRef<string | null>(null);
  const timelineDeepLinkConsumedRef = useRef<string | null>(null);

  const isLegacyNumericId = useMemo(() => {
    if (!machineId) return false;
    const numericId = parseInt(machineId, 10);
    return String(numericId) === machineId && !Number.isNaN(numericId);
  }, [machineId]);

  const refetchMachineVisualPoints = useCallback(async () => {
    if (!machineId || !maquina || !isVisualPointIdFromApi(maquina.id)) return;
    try {
      const visualPoints = await getMachineVisualPoints(String(maquina.id));
      setQrPoints(visualPoints.items.map(mapVisualPointToQRPoint));
    } catch {
      /* mantém estado local */
    }
  }, [machineId, maquina]);

  useEffect(() => {
    if (!machineId || isLegacyNumericId) {
      setLoading(false);
      setMaquina(null);
      setLoadError(null);
      return;
    }

    setLoading(true);
    setLoadError(null);
    Promise.all([getMachineById(machineId), getMachineVisualPoints(machineId)])
      .then(([m, visualPoints]) => {
        setMaquina(mapApiMachineToMaquina(m));
        setServerImageUrl(m.imageUrl ?? null);
        setQrPoints(visualPoints.items.map(mapVisualPointToQRPoint));
      })
      .catch((e) => {
        setMaquina(null);
        setQrPoints([]);
        setLoadError(e);
      })
      .finally(() => setLoading(false));
  }, [machineId, isLegacyNumericId]);

  useEffect(() => {
    if (!maquina) {
      setInventoryItems([]);
      return;
    }
    void getQRInventoryForMachine(qrPoints).then(setInventoryItems);
  }, [maquina, qrPoints]);

  useEffect(() => {
    setDetailOpen(false);
  }, [machineId]);

  useEffect(() => {
    processedVpRef.current = null;
    timelineDeepLinkConsumedRef.current = null;
  }, [machineId]);

  const revokeLocalPreview = useCallback(() => {
    pendingFileRef.current = null;
    setPhotoUploadError(null);
    setLocalPreviewObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    localPreviewRef.current = null;
  }, []);

  useEffect(() => {
    revokeLocalPreview();
  }, [machineId, revokeLocalPreview]);

  useEffect(() => {
    localPreviewRef.current = localPreviewObjectUrl;
  }, [localPreviewObjectUrl]);

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
        localPreviewRef.current = null;
      }
    };
  }, []);

  const handlePickLocalImage: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setFilePickError('Selecione um arquivo de imagem válido.');
        return;
      }
      setFilePickError(null);
      pendingFileRef.current = file;
      const next = URL.createObjectURL(file);
      setLocalPreviewObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return next;
      });
      localPreviewRef.current = next;
      setImageModalOpen(false);
    },
    []
  );

  const handlePersistLocalPhoto = useCallback(async () => {
    if (!machineId || !maquina || !pendingFileRef.current) return;
    setPhotoUploadLoading(true);
    setPhotoUploadError(null);
    try {
      const res = await uploadMachinePhotoFile(machineId, pendingFileRef.current);
      pendingFileRef.current = null;
      setServerImageUrl(res.imageUrl);
      setMaquina((prev) =>
        prev ? { ...prev, fotoMaquina: res.imageUrl ?? undefined } : prev
      );
      revokeLocalPreview();
    } catch {
      setPhotoUploadError('Não foi possível salvar a imagem no servidor.');
    } finally {
      setPhotoUploadLoading(false);
    }
  }, [machineId, maquina, revokeLocalPreview]);

  const handleSelectFromMapOnly = useCallback((pointId: number | string) => {
    setSelectedPointId(pointId);
  }, []);

  const handleSelectFromSidebar = useCallback((pointId: number | string) => {
    setSelectedPointId(pointId);
  }, []);

  const handleEditFocus = useCallback(
    (pointId: number | string) => {
      setSelectedPointId(pointId);
      requestAnimationFrame(() => scrollToEditor());
    },
    [scrollToEditor]
  );

  const handleAddQRPoint = useCallback(
    (x: number, y: number) => {
      if (!maquina) return;
      const isApiMachine = isVisualPointIdFromApi(maquina.id);
      if (!isApiMachine) return;

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
        tipo: 'outro',
        status: 'ok',
      };

      setQrPoints((prev) => [...prev, optimistic]);
      setSelectedPointId(tempId);
      setQrPersistError(null);
      setAddPointMode(false);

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
          setSelectedPointId((cur) =>
            cur != null && String(cur) === String(tempId) ? null : cur
          );
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
      if (!isVisualPointIdFromApi(maquina.id)) return;

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
        setDetailOpen(false);
        setQrPersistError(null);
      } catch {
        await refetchMachineVisualPoints();
        throw new Error('DELETE_FAILED');
      }
    },
    [maquina, refetchMachineVisualPoints]
  );

  const handleSidebarRemove = useCallback(
    async (pointId: number | string) => {
      if (!window.confirm('Remover este QR point?')) return;
      setRemovingId(pointId);
      try {
        await handleDeletePoint(pointId);
      } catch {
        setQrPersistError('Não foi possível remover o ponto.');
      } finally {
        setRemovingId(null);
      }
    },
    [handleDeletePoint]
  );

  const openImageModal = useCallback(() => {
    const real = !isPlaceholderMachineImage(serverImageUrl);
    setImageUrlDraft(real ? (serverImageUrl?.trim() ?? '') : '');
    setImageModalError(null);
    setFilePickError(null);
    setPhotoUploadError(null);
    setImageModalTab('url');
    setImageModalOpen(true);
  }, [serverImageUrl]);

  const handleOpenDetail = useCallback(
    async (point: QRPoint) => {
      setSelectedPointId(point.id);
      const [events] = await Promise.all([getComponentEventsByQRPointId(point.id)]);
      setDetailEvents(events);
      const inventoryItem = inventoryItems.find(
        (item) => String(item.point.id) === String(point.id)
      );
      setDetailRadar(inventoryItem ? inventoryItem.radar : null);
      const assetKey = point.assetNodeId ?? point.assetId;
      if (assetKey) {
        try {
          const asset = await getAssetById(assetKey);
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

  useEffect(() => {
    if (!machineId || isLegacyNumericId || qrPoints.length === 0) return;
    const vp = searchParams.get('vp');
    if (!vp) {
      processedVpRef.current = null;
      return;
    }

    const match = qrPoints.some((p) => String(p.id) === vp);
    if (!match) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('vp');
          next.delete('timeline');
          return next;
        },
        { replace: true }
      );
      setVpParamNotice('QR não encontrado nesta máquina. Verifique o link.');
      processedVpRef.current = null;
      return;
    }

    if (processedVpRef.current !== vp) {
      setSelectedPointId(vp);
      processedVpRef.current = vp;
      setVpParamNotice(null);
      requestAnimationFrame(() => scrollToEditor());
    }

    if (searchParams.get('timeline') === '1') {
      const consumeKey = `${vp}|timeline`;
      if (timelineDeepLinkConsumedRef.current !== consumeKey) {
        timelineDeepLinkConsumedRef.current = consumeKey;
        const pt = qrPoints.find((p) => String(p.id) === vp);
        if (pt) void handleOpenDetail(pt);
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.delete('timeline');
            return next;
          },
          { replace: true }
        );
      }
    }
  }, [
    machineId,
    isLegacyNumericId,
    qrPoints,
    searchParams,
    setSearchParams,
    scrollToEditor,
    handleOpenDetail,
  ]);

  const handleSaveImageUrl = useCallback(async () => {
    if (!machineId || !maquina) return;
    const trimmed = imageUrlDraft.trim();
    if (!trimmed) {
      setImageModalError('Informe uma URL válida (http ou https).');
      return;
    }
    try {
      const u = new URL(trimmed);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        setImageModalError('Use uma URL http ou https.');
        return;
      }
    } catch {
      setImageModalError('URL inválida.');
      return;
    }

    setImageSaveLoading(true);
    setImageModalError(null);
    try {
      const res = await updateMachine(machineId, { imageUrl: trimmed });
      setServerImageUrl(res.imageUrl);
      setMaquina((prev) =>
        prev ? { ...prev, fotoMaquina: res.imageUrl ?? undefined } : prev
      );
      revokeLocalPreview();
      setImageModalOpen(false);
    } catch {
      setImageModalError('Não foi possível salvar a imagem.');
    } finally {
      setImageSaveLoading(false);
    }
  }, [machineId, maquina, imageUrlDraft, revokeLocalPreview]);

  const selectedPoint =
    selectedPointId != null
      ? qrPoints.find((p) => String(p.id) === String(selectedPointId)) ?? null
      : null;

  const linkCandidates: LinkCandidate[] = useMemo(() => {
    const map = new Map<string, LinkCandidate>();
    qrPoints.forEach((p) => {
      const nodeId = p.assetNodeId ?? p.asset?.id ?? p.assetId;
      if (
        nodeId &&
        isQrPointLinkedToAsset(p) &&
        String(p.id) !== String(selectedPoint?.id)
      ) {
        map.set(nodeId, {
          id: nodeId,
          name: p.asset?.name ?? '—',
          code: p.asset?.code ?? null,
          nodeType: p.assetNodeType ?? p.asset?.nodeKind ?? null,
        });
      }
    });
    return Array.from(map.values());
  }, [qrPoints, selectedPoint?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <PageLoading
          variant="dark"
          title="Carregando editor visual"
          description="Preparando imagem e pontos da máquina."
        />
      </div>
    );
  }

  if (isLegacyNumericId || !machineId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-200">
        <div className="max-w-lg rounded-lg border border-amber-900/50 bg-amber-950/40 p-6 text-amber-100">
          <p className="font-semibold">Editor visual indisponível para este id.</p>
          <p className="mt-2 text-sm text-amber-200/90">
            O editor usa a API com máquina UUID. Abra uma máquina criada pelo fluxo atual.
          </p>
          <Link
            to="/plants"
            className="mt-4 inline-block rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
          >
            ← Voltar às plantas
          </Link>
        </div>
      </div>
    );
  }

  if (!maquina) {
    if (loadError) {
      const { message, detail } = formatLoadError(
        loadError,
        'Não foi possível abrir o editor visual. Verifique o link e se o servidor está disponível.'
      );
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-200">
          <div className="w-full max-w-md">
            <PageErrorAlert
              title="Editor indisponível"
              message={message}
              detail={detail}
              backTo={{ label: '← Voltar às plantas', to: '/plants' }}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-200">
        <div className="max-w-md rounded-lg border border-slate-800 bg-slate-900/80 p-6">
          <p className="font-semibold text-slate-100">Máquina não encontrada</p>
          <p className="mt-2 text-sm text-slate-400">
            O link pode estar incorreto ou a máquina não existe mais.
          </p>
          <Link
            to="/plants"
            className="mt-4 inline-block rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white"
          >
            ← Voltar às plantas
          </Link>
        </div>
      </div>
    );
  }

  const displayImageUrl = serverImageUrl ?? PLACEHOLDER_PHOTO;
  /** Preview local tem prioridade só na sessão; não substitui imagem oficial após refresh. */
  const canvasImageUrl = localPreviewObjectUrl ?? displayImageUrl;
  const hasRealMachinePhoto = !isPlaceholderMachineImage(serverImageUrl);
  const imageActionLabel = hasRealMachinePhoto ? 'Trocar imagem' : 'Inserir imagem';

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-950 text-slate-100">
      <header className="shrink-0 border-b border-slate-800/90 bg-slate-950">
        <div className="flex flex-wrap items-start gap-x-3 gap-y-2 px-3 py-3 sm:px-5 sm:py-4">
          <Link
            to={`/machines/${machineId}`}
            className="shrink-0 rounded-md px-2 py-1.5 text-sm text-slate-500 transition hover:bg-slate-900 hover:text-slate-300"
          >
            ← Voltar à máquina
          </Link>
          <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
            <h1 className="truncate text-xl font-semibold leading-tight tracking-tight text-white sm:text-2xl">
              {maquina.nome}
            </h1>
            {maquina.codigo ? (
              <p className="mt-1 truncate font-mono text-xs text-slate-500">{String(maquina.codigo)}</p>
            ) : null}
          </div>
          <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:ml-auto sm:w-auto">
            <button
              type="button"
              onClick={openImageModal}
              disabled={imageSaveLoading || photoUploadLoading}
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-50"
            >
              {imageActionLabel}
            </button>
            <button
              type="button"
              onClick={() => setAddPointMode((v) => !v)}
              aria-pressed={addPointMode}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                addPointMode
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/70 hover:bg-emerald-500'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              {addPointMode ? 'Clique na imagem…' : 'Novo QR Point'}
            </button>
            <button
              type="button"
              onClick={() => void (async () => {
                await logout();
                navigate('/login', { replace: true });
              })()}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {qrPersistError ? (
        <div
          className="flex shrink-0 items-start justify-between gap-2 border-b border-amber-900/40 bg-amber-950/50 px-3 py-2 text-sm text-amber-100"
          role="alert"
        >
          <span>{qrPersistError}</span>
          <button
            type="button"
            onClick={() => setQrPersistError(null)}
            className="shrink-0 rounded px-1.5 text-amber-300 hover:bg-amber-900/50"
            aria-label="Fechar aviso"
          >
            ×
          </button>
        </div>
      ) : null}

      {vpParamNotice ? (
        <div
          className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-slate-300"
          role="status"
        >
          <span>{vpParamNotice}</span>
          <button
            type="button"
            onClick={() => setVpParamNotice(null)}
            className="shrink-0 rounded px-1.5 text-slate-500 hover:bg-slate-800"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      ) : null}

      {localPreviewObjectUrl ? (
        <div
          className="flex shrink-0 flex-col gap-2 border-b border-sky-900/50 bg-sky-950/35 px-3 py-2 text-xs text-sky-100 sm:flex-row sm:items-center sm:justify-between sm:text-sm"
          role="status"
        >
          <span className="min-w-0">
            Pré-visualização local. Salve no servidor para gravar na layer PHOTO/default ou descarte para voltar à
            imagem oficial.
          </span>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {photoUploadError ? (
              <span className="text-xs text-red-300 sm:mr-auto">{photoUploadError}</span>
            ) : null}
            <button
              type="button"
              onClick={() => void handlePersistLocalPhoto()}
              disabled={photoUploadLoading}
              className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-slate-900 hover:bg-slate-100 disabled:opacity-50 sm:text-sm"
            >
              {photoUploadLoading ? 'Salvando…' : 'Salvar no servidor'}
            </button>
            <button
              type="button"
              onClick={revokeLocalPreview}
              disabled={photoUploadLoading}
              className="rounded-md border border-sky-700/80 bg-sky-950/50 px-2.5 py-1 text-xs font-medium text-sky-200 hover:bg-sky-900/80 disabled:opacity-50"
            >
              Descartar
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 lg:flex-row lg:gap-3 lg:p-3">
        <div className="relative flex min-h-[min(58vh,560px)] min-w-0 flex-1 flex-col lg:min-h-0">
          <MaquinaCanvas
            maquina={maquina}
            qrPoints={qrPoints}
            mode="edit"
            viewMode="photo"
            onAddPoint={handleAddQRPoint}
            onMovePoint={handleMoveQRPoint}
            onMovePointEnd={handleCommitMoveQRPoint}
            selectedPointId={selectedPointId}
            onSelectPoint={handleSelectFromMapOnly}
            imageUrlOverride={canvasImageUrl}
            addPointMode={addPointMode}
            onAddPointModeChange={setAddPointMode}
            hideCanvasAddButton
            immersive
            containerClassName="min-h-0 h-full w-full flex-1"
          />
        </div>

        <aside className="flex max-h-[38vh] w-full shrink-0 flex-col gap-2 overflow-hidden border-t border-slate-800/80 pt-2 lg:max-h-none lg:w-[260px] lg:border-l lg:border-t-0 lg:pt-0 xl:w-[288px]">
          <h2 className="shrink-0 px-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            QR Points
          </h2>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-slate-800 bg-slate-900/50 p-1">
            <MachineEditorQrSidebar
              points={qrPoints}
              selectedId={selectedPointId}
              onSelect={handleSelectFromSidebar}
              onEditFocus={handleEditFocus}
              onRemove={handleSidebarRemove}
              removingId={removingId}
              compact
            />
          </div>

          <div
            ref={editorPanelRef}
            className="flex max-h-[40vh] min-h-[7rem] shrink-0 flex-col gap-2 overflow-y-auto rounded-lg border border-slate-800/90 bg-slate-900/35 p-2 lg:max-h-[44vh]"
          >
            {selectedPoint ? (
              <>
                <p className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Ponto selecionado
                </p>
                <div className="shrink-0 rounded-md border border-slate-700/80 bg-slate-900/60 px-2.5 py-2">
                  <p className="truncate text-sm font-medium text-slate-100">
                    {selectedPoint.descricao || selectedPoint.codigo}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-slate-500">{selectedPoint.codigo}</p>
                  {isQrPointLinkedToAsset(selectedPoint) ? (
                    <>
                      <p className="mt-1.5 text-[10px] font-medium text-emerald-400/95">Vinculado a ativo</p>
                      {(selectedPoint.assetName || selectedPoint.asset?.name) ? (
                        <p className="mt-0.5 truncate text-[11px] text-slate-200">
                          {selectedPoint.assetName ?? selectedPoint.asset?.name}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-1.5 text-[10px] text-amber-200/90">Sem vínculo com ativo</p>
                  )}
                </div>
                <div className="shrink-0">
                  <QrInlineActions
                    assetId={
                      selectedPoint.assetNodeId ??
                      selectedPoint.assetId ??
                      selectedPoint.asset?.id ??
                      null
                    }
                    assetName={selectedPoint.assetName ?? selectedPoint.asset?.name ?? null}
                    machineName={maquina.nome}
                    hasAsset={isQrPointLinkedToAsset(selectedPoint)}
                  />
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleOpenDetail(selectedPoint)}
                    className="rounded-md border border-slate-600 bg-slate-800/90 px-2.5 py-1.5 text-[11px] font-medium text-slate-100 hover:bg-slate-800"
                  >
                    Vínculo e timeline
                  </button>
                  <Link
                    to={`/machines/${machineId}?tab=inventory`}
                    className="inline-flex items-center rounded-md border border-slate-600 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-slate-800/80"
                  >
                    Inventário na máquina
                  </Link>
                </div>
                <div className="min-h-0 flex-1">
                  <QRPointEditor
                    key={String(selectedPoint.id)}
                    embedded
                    point={selectedPoint}
                    allPoints={qrPoints}
                    onSave={handleSavePoint}
                    onDelete={handleDeletePoint}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col justify-center rounded-md border border-slate-700/60 bg-slate-900/50 px-3 py-6 text-center">
                <p className="text-sm leading-snug text-slate-300">
                  Selecione um QR no mapa ou na lista.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Depois, edite aqui ou use Editar / Remover em cada item.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={handlePickLocalImage}
      />

      {imageModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="machine-image-modal-title"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <h2 id="machine-image-modal-title" className="text-lg font-semibold text-white">
              {hasRealMachinePhoto ? 'Trocar imagem' : 'Inserir imagem'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Arquivo: pré-visualização imediata; use &quot;Salvar no servidor&quot; na faixa azul para gravar
              PHOTO/default. URL https: salva direto no servidor.
            </p>

            <div className="mt-4 flex rounded-lg border border-slate-700 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setImageModalTab('file');
                  setFilePickError(null);
                  setImageModalError(null);
                }}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                  imageModalTab === 'file'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Arquivo
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageModalTab('url');
                  setFilePickError(null);
                  setImageModalError(null);
                }}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                  imageModalTab === 'url'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                URL
              </button>
            </div>

            {imageModalTab === 'file' ? (
              <div className="mt-4 space-y-3">
                <p className="text-xs leading-relaxed text-slate-500">
                  A imagem aparece na hora no mapa. Depois, use &quot;Salvar no servidor&quot; na faixa azul para
                  persistir como PHOTO/default.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilePickError(null);
                    fileInputRef.current?.click();
                  }}
                  className="w-full rounded-lg border border-slate-600 bg-slate-950 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-800"
                >
                  Escolher imagem…
                </button>
                {filePickError ? (
                  <p className="text-sm text-red-400">{filePickError}</p>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <label className="block text-xs font-medium text-slate-400" htmlFor="editor-image-url">
                  URL da imagem (https)
                </label>
                <input
                  id="editor-image-url"
                  type="url"
                  value={imageUrlDraft}
                  onChange={(e) => setImageUrlDraft(e.target.value)}
                  className="block w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://…"
                  disabled={imageSaveLoading}
                />
                {imageModalError ? (
                  <p className="text-sm text-red-400">{imageModalError}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleSaveImageUrl()}
                  disabled={imageSaveLoading}
                  className="w-full rounded-lg bg-white py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100 disabled:opacity-50"
                >
                  {imageSaveLoading ? 'Salvando…' : 'Salvar URL no servidor'}
                </button>
              </div>
            )}

            <div className="mt-5 flex justify-end border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                disabled={imageSaveLoading}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <QRDetailDrawer
        open={detailOpen && selectedPoint != null}
        point={selectedPoint}
        summary={detailRadar}
        events={detailEvents}
        onClose={() => setDetailOpen(false)}
        machineId={machineId}
        machineName={maquina.nome}
        asset={detailAsset}
        linkCandidates={linkCandidates}
        linking={linking}
        canUseLinkOrCreateApi={
          selectedPoint !== null && isVisualPointIdFromApi(selectedPoint.id)
        }
        onLinkExisting={async (assetNodeId) => {
          if (!selectedPoint || !maquina || linking) return;
          if (!isVisualPointIdFromApi(selectedPoint.id)) return;
          const visualPointId = String(selectedPoint.id);
          try {
            setLinking(true);
            await linkVisualPointToAsset(visualPointId, assetNodeId);
            const visualPoints = await getMachineVisualPoints(String(maquina.id));
            setQrPoints(visualPoints.items.map(mapVisualPointToQRPoint));
            const asset = await getAssetById(assetNodeId);
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
