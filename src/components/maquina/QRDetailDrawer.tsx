import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { QRPoint } from '../../types/QRPoint';
import type { AssetSummary, AssetTimelineResponse } from '@/types/sgm-api';
import type { ComponentRadarSummary, ComponentEvent } from '../../types/ComponentEvent';
import { getAssetTimeline } from '@/services/sgm';
import { isQrPointLinkedToAsset } from '../../utils/qrPointLink';
import { ComponentSummaryCard } from './ComponentSummaryCard';
import { ComponentTimeline } from './ComponentTimeline';
import { AssetTimelinePanel } from './AssetTimelinePanel';
import { AssetEventCreateForm } from './AssetEventCreateForm';
import { QrOfficialCard } from '@/modules/sgm/qr/components/QrOfficialCard';

export interface LinkCandidate {
  id: string;
  name: string;
  code: string | null;
  nodeType: string | null;
}

interface QRDetailDrawerProps {
  open: boolean;
  point: QRPoint | null;
  summary: ComponentRadarSummary | null;
  events: ComponentEvent[];
  onClose: () => void;
  machineId: string;
  machineName: string;
  asset?: AssetSummary | null;
  /** Ativos elegíveis para vincular (outros ativos da mesma máquina). */
  linkCandidates?: LinkCandidate[];
  /** False quando o ponto é mock/legado (id numérico); não chama API de criar/vincular. */
  canUseLinkOrCreateApi?: boolean;
  onLinkExisting?: (assetNodeId: string) => Promise<void> | void;
  onCreateNew?: (payload: {
    name: string;
    nodeType: string;
    description?: string | null;
  }) => Promise<void> | void;
  onUnlink?: () => Promise<void> | void;
  linking?: boolean;
}

function statusLabelPt(status: AssetTimelineResponse['summary']['status']): string {
  switch (status) {
    case 'OK':
      return 'OK';
    case 'ATENCAO':
      return 'Atenção';
    case 'VENCIDO':
      return 'Vencido';
    case 'SEM_HISTORICO':
    default:
      return 'Sem histórico operacional';
  }
}

export function QRDetailDrawer({
  open,
  point,
  summary,
  events,
  onClose,
  machineId,
  machineName,
  asset,
  linkCandidates = [],
  canUseLinkOrCreateApi = true,
  onLinkExisting,
  onCreateNew,
  onUnlink,
  linking = false,
}: QRDetailDrawerProps) {
  const ASSET_NODE_TYPES = useMemo(
    () =>
      [
        { value: 'machine', label: 'Máquina' },
        { value: 'subsystem', label: 'Subsistema' },
        { value: 'component', label: 'Componente' },
        { value: 'part', label: 'Peça' },
      ] as const,
    []
  );

  const [panel, setPanel] = useState<'link' | 'create' | null>(null);
  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [assetTimeline, setAssetTimeline] = useState<AssetTimelineResponse | null>(null);
  const [assetTimelineLoading, setAssetTimelineLoading] = useState(false);
  const [assetTimelineError, setAssetTimelineError] = useState<string | null>(null);
  const [quickEventOpen, setQuickEventOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{
    name: string;
    nodeType: string;
    description?: string | null;
  }>({
    name: '',
    nodeType: 'component',
    description: null,
  });

  const linkedToAsset = point != null && isQrPointLinkedToAsset(point);
  const showApiTimeline = Boolean(linkedToAsset && asset?.id);

  const reloadAssetTimeline = useCallback(async () => {
    if (!asset?.id) return;
    setAssetTimelineLoading(true);
    setAssetTimelineError(null);
    try {
      const data = await getAssetTimeline(asset.id);
      setAssetTimeline(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setAssetTimelineError(
        msg.includes('404') ? 'Ativo não encontrado.' : 'Não foi possível carregar a timeline.'
      );
    } finally {
      setAssetTimelineLoading(false);
    }
  }, [asset]);

  useEffect(() => {
    if (!open || !point) return;
    setPanel(null);
    setConfirmUnlink(false);
    setActionError(null);
    setAssetTimeline(null);
    setAssetTimelineError(null);
    setAssetTimelineLoading(false);
    setQuickEventOpen(false);
    setCreateForm({
      name: point.descricao ?? '',
      nodeType: 'component',
      description: null,
    });
  }, [open, point?.id]);

  useEffect(() => {
    setAssetTimeline(null);
    setAssetTimelineError(null);
    setAssetTimelineLoading(false);
    setQuickEventOpen(false);
  }, [asset?.id]);

  useEffect(() => {
    if (!open || !showApiTimeline || !asset?.id) return;
    void reloadAssetTimeline();
  }, [open, showApiTimeline, asset?.id, reloadAssetTimeline]);

  const assetNodeTypeText = asset?.nodeKind ?? asset?.assetType ?? null;

  const operationalStatusLine = useMemo(() => {
    if (!linkedToAsset) {
      return 'Sem ativo vinculado — use o bloco abaixo para vincular e ver histórico real.';
    }
    if (!asset?.id) {
      return 'Vínculo indicado no ponto; aguardando dados do ativo…';
    }
    if (assetTimelineLoading && !assetTimeline) {
      return 'Carregando status operacional…';
    }
    if (assetTimelineError) {
      return 'Não foi possível carregar o status operacional.';
    }
    if (assetTimeline?.summary) {
      const s = assetTimeline.summary;
      const st = statusLabelPt(s.status);
      const last = s.lastEventDate ? ` · Último registro: ${s.lastEventDate}` : '';
      return `${st}${last}`;
    }
    return '—';
  }, [
    linkedToAsset,
    asset?.id,
    assetTimelineLoading,
    assetTimeline,
    assetTimelineError,
  ]);

  if (!open || !point) {
    return null;
  }

  const vpQs = encodeURIComponent(String(point.id));
  const editorHref = `/machines/${machineId}/editor?vp=${vpQs}`;
  const inventoryHref = `/machines/${machineId}?tab=inventory`;
  const mapHref = `/machines/${machineId}`;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer"
        aria-label="Fechar detalhe do componente"
        onClick={onClose}
      />
      <aside className="relative z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-slate-50 shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Contexto operacional
            </p>
            <p className="text-sm font-semibold text-slate-900">QR e timeline</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-auto p-4">
          <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Máquina</p>
            <p className="mt-0.5 text-sm font-medium text-slate-900">{machineName}</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">QR</p>
            <p className="mt-0.5 text-sm text-slate-800">
              <span className="font-mono font-semibold">{point.codigo}</span>
              <span className="text-slate-400"> · </span>
              <span>{point.descricao}</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Posição no mapa: {point.x.toFixed(1)}%, {point.y.toFixed(1)}%
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Ativo</p>
            {asset ? (
              <p className="mt-0.5 text-sm text-emerald-900">
                {asset.name}
                {asset.code ? (
                  <span className="ml-1 font-mono text-xs text-emerald-800/90">({asset.code})</span>
                ) : null}
                {assetNodeTypeText ? (
                  <span className="mt-0.5 block text-[11px] font-normal text-emerald-800/80">
                    {assetNodeTypeText}
                  </span>
                ) : null}
              </p>
            ) : linkedToAsset ? (
              <p className="mt-0.5 text-xs text-amber-800">Carregando ou resolvendo ativo…</p>
            ) : (
              <p className="mt-0.5 text-xs text-slate-600">Sem ativo vinculado</p>
            )}
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Status operacional
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-700">{operationalStatusLine}</p>
          </section>

          {linkedToAsset && asset?.id ? (
            <QrOfficialCard
              assetId={asset.id}
              assetName={asset.name}
              machineName={machineName}
              variant="light"
            />
          ) : null}

          <nav className="flex flex-wrap gap-2">
            <Link
              to={editorHref}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Editor
            </Link>
            <Link
              to={inventoryHref}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Inventário
            </Link>
            <Link
              to={mapHref}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200/80"
            >
              Mapa
            </Link>
          </nav>

          {showApiTimeline && asset ? (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-emerald-500" aria-hidden />
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-emerald-900">
                  Timeline operacional
                </h2>
              </div>
              <p className="text-[11px] text-slate-600">
                Histórico oficial do ativo{' '}
                <span className="font-mono text-slate-700">{asset.id}</span>.
              </p>
              <AssetTimelinePanel
                assetId={asset.id}
                timeline={assetTimeline}
                loading={assetTimelineLoading}
                error={assetTimelineError}
                onReload={() => void reloadAssetTimeline()}
                showAssetHeader={false}
                showSummaryGrid={false}
              />
            </section>
          ) : null}

          {summary ? (
            <section
              className={`rounded-xl border bg-white p-3 shadow-sm ${
                showApiTimeline ? 'border-slate-200/80 opacity-95' : 'border-slate-200'
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {showApiTimeline ? 'Indicadores de referência (inventário)' : 'Resumo de indicadores'}
              </p>
              <ComponentSummaryCard point={point} summary={summary} />
            </section>
          ) : (
            <p className="text-xs text-slate-500">
              {showApiTimeline
                ? 'Indicadores de radar locais indisponíveis para este ponto.'
                : 'Resumo de radar indisponível para este ponto.'}
            </p>
          )}

          <section
            className={`rounded-xl border border-dashed p-3 ${
              showApiTimeline
                ? 'border-slate-200/90 bg-slate-100/50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <h3
              className={`text-xs font-semibold ${
                showApiTimeline ? 'text-slate-500' : 'text-slate-900'
              }`}
            >
              {showApiTimeline
                ? 'Linha do tempo de referência (por QR)'
                : 'Linha do tempo de referência'}
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              {showApiTimeline
                ? 'Indicadores por ponto visual — o histórico oficial do ativo permanece na seção acima.'
                : linkedToAsset
                  ? 'Complete o vínculo com o ativo para ver o histórico operacional consolidado.'
                  : 'Indicadores em evolução enquanto não houver ativo vinculado a este ponto.'}
            </p>
            <div className="mt-2">
              <ComponentTimeline events={events} />
            </div>
          </section>

          <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 space-y-2">
            <p className="font-semibold text-slate-800">Vínculo com ativo real</p>
            {!asset ? (
              <>
                {!canUseLinkOrCreateApi ? (
                  <p className="text-[11px] text-amber-700">
                    Vincular/criar ativo está disponível apenas para pontos carregados da API (máquina real com UUID). Este ponto é do fluxo legado.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={linking}
                        onClick={() => setPanel('create')}
                        className="rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {linking && panel === 'create' ? 'Criando…' : 'Criar ativo'}
                      </button>
                      <button
                        type="button"
                        disabled={linking}
                        onClick={() => setPanel('link')}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                      >
                        {linking && panel === 'link' ? 'Vinculando…' : 'Vincular ativo existente'}
                      </button>
                      {panel && (
                        <button
                          type="button"
                          disabled={linking}
                          onClick={() => setPanel(null)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>

                    {panel === 'link' && (
                      <div className="space-y-2 pt-1">
                        {linkCandidates.length > 0 ? (
                          <div className="space-y-1">
                            <p className="text-[11px] text-slate-500 mb-1">Selecione um ativo:</p>
                            <ul className="space-y-0.5">
                              {linkCandidates.map((c) => (
                                <li key={c.id}>
                                  <button
                                    type="button"
                                    disabled={linking}
                                    onClick={async () => {
                                      setActionError(null);
                                      try {
                                        await onLinkExisting?.(c.id);
                                        setPanel(null);
                                      } catch {
                                        setActionError('Não foi possível vincular o ativo.');
                                      }
                                    }}
                                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-left text-[11px] text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                                  >
                                    {c.name}
                                    {c.nodeType ? ` — ${c.nodeType}` : ''}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500">
                            Nenhum ativo disponível para vincular nesta máquina.
                          </p>
                        )}
                      </div>
                    )}

                    {panel === 'create' && (
                      <div className="space-y-2 pt-1">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-medium text-slate-700" htmlFor="asset-name">
                            Nome do ativo
                          </label>
                          <input
                            id="asset-name"
                            type="text"
                            disabled={linking}
                            value={createForm.name}
                            onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-medium text-slate-700" htmlFor="asset-node-type">
                            Tipo do ativo
                          </label>
                          <select
                            id="asset-node-type"
                            disabled={linking}
                            value={createForm.nodeType}
                            onChange={(e) => setCreateForm((prev) => ({ ...prev, nodeType: e.target.value }))}
                            className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {ASSET_NODE_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label
                            className="block text-[11px] font-medium text-slate-700"
                            htmlFor="asset-description"
                          >
                            Descrição (opcional)
                          </label>
                          <textarea
                            id="asset-description"
                            disabled={linking}
                            value={createForm.description ?? ''}
                            onChange={(e) =>
                              setCreateForm((prev) => ({
                                ...prev,
                                description: e.target.value ? e.target.value : null,
                              }))
                            }
                            rows={3}
                            className="block w-full resize-none rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {actionError && <p className="text-[11px] text-red-700">{actionError}</p>}

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            disabled={linking}
                            onClick={async () => {
                              setActionError(null);
                              try {
                                await onCreateNew?.({
                                  name: createForm.name,
                                  nodeType: createForm.nodeType,
                                  description: createForm.description ?? null,
                                });
                                setPanel(null);
                              } catch {
                                setActionError('Não foi possível criar o ativo.');
                              }
                            }}
                            className="flex-1 rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            {linking ? 'Criando…' : 'Criar e vincular'}
                          </button>
                        </div>
                      </div>
                    )}

                    {actionError && panel !== 'create' && (
                      <p className="text-[11px] text-red-700">{actionError}</p>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] text-slate-500">
                    Ativo vinculado ao QR lógico. O ponto representa o ativo (SGM:ASSET:…).
                  </p>
                </div>

                <div className="pt-1 space-y-2">
                  {!quickEventOpen ? (
                    <button
                      type="button"
                      onClick={() => setQuickEventOpen(true)}
                      className="w-full rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-left text-[11px] font-medium text-emerald-900 hover:bg-emerald-100"
                    >
                      Registrar evento rápido
                    </button>
                  ) : (
                    <AssetEventCreateForm
                      assetId={asset.id}
                      heading="Registrar evento rápido"
                      onCancel={() => setQuickEventOpen(false)}
                      onSuccess={async () => {
                        setQuickEventOpen(false);
                        await reloadAssetTimeline();
                      }}
                    />
                  )}
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    disabled={linking || !canUseLinkOrCreateApi}
                    onClick={() => setConfirmUnlink(true)}
                    className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-left text-[11px] font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    Remover vínculo
                  </button>
                </div>

                {confirmUnlink && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] text-slate-600">
                      Confirmar? O ponto continuará existindo, mas deixará de estar vinculado.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={linking}
                        onClick={() => setConfirmUnlink(false)}
                        className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={linking || !canUseLinkOrCreateApi}
                        onClick={async () => {
                          setActionError(null);
                          try {
                            await onUnlink?.();
                            setConfirmUnlink(false);
                          } catch {
                            setActionError('Não foi possível remover o vínculo.');
                          }
                        }}
                        className="flex-1 rounded-md bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {linking ? 'Removendo…' : 'Remover'}
                      </button>
                    </div>
                    {actionError && <p className="text-[11px] text-red-700">{actionError}</p>}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
