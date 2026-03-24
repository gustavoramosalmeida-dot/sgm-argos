import { useCallback, useState } from 'react';
import { useAssetQr } from '../qr.hooks';
import { downloadFromUrl } from '../utils/qr.download';
import { triggerQrLabelPrint } from './QrPrintLabel';
import { getAssetQrPngUrl, getAssetQrSvgUrl } from '../qr.api';
import { QrActions } from './QrActions';
import { QrPreview } from './QrPreview';
import { QrStatusBadge } from './QrStatusBadge';

export function QrOfficialCard({
  assetId,
  assetName,
  machineName,
  contextLine,
  variant = 'light',
}: {
  assetId: string | null;
  assetName?: string | null;
  machineName?: string | null;
  /** Texto curto extra (ex.: breadcrumb ou planta). */
  contextLine?: string | null;
  variant?: 'light' | 'dark';
}) {
  const { data, loading, ensuring, error, reload, ensure } = useAssetQr(assetId);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const onCopyCode = useCallback(async () => {
    if (!data?.publicCode) return;
    try {
      await navigator.clipboard.writeText(data.publicCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setActionError('Não foi possível copiar.');
    }
  }, [data?.publicCode]);

  const onDownloadSvg = useCallback(async () => {
    if (!assetId || !data?.publicCode) return;
    setActionError(null);
    try {
      await downloadFromUrl(getAssetQrSvgUrl(assetId), `qr-${data.publicCode}.svg`);
    } catch (e) {
      setActionError('Não foi possível baixar o SVG.');
    }
  }, [assetId, data?.publicCode]);

  const onDownloadPng = useCallback(async () => {
    if (!assetId || !data?.publicCode) return;
    setActionError(null);
    try {
      await downloadFromUrl(getAssetQrPngUrl(assetId), `qr-${data.publicCode}.png`);
    } catch (e) {
      setActionError('Não foi possível baixar o PNG.');
    }
  }, [assetId, data?.publicCode]);

  const onPrintLabel = useCallback(() => {
    if (!assetId || !data?.publicCode) return;
    setActionError(null);
    try {
      triggerQrLabelPrint({
        publicCode: data.publicCode,
        assetName: assetName ?? 'Ativo',
        contextLine: contextLine ?? machineName ?? null,
        qrSvgUrl: getAssetQrSvgUrl(assetId),
      });
    } catch {
      setActionError('Não foi possível abrir a impressão.');
    }
  }, [assetId, data?.publicCode, assetName, contextLine, machineName]);

  const onOpenDestination = useCallback(() => {
    const url = data?.resolvedUrl ?? data?.qrValue;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [data?.qrValue, data?.resolvedUrl]);

  const onEnsure = useCallback(async () => {
    setActionError(null);
    try {
      await ensure();
    } catch {
      /* erro já definido no hook */
    }
  }, [ensure]);

  const shell =
    variant === 'dark'
      ? 'rounded-lg border border-slate-800/90 bg-slate-900/40 p-3'
      : 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm';

  const titleCls = variant === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const subCls = variant === 'dark' ? 'text-slate-500' : 'text-slate-500';

  if (!assetId) {
    return (
      <div className={shell}>
        <h3 className={`text-xs font-semibold uppercase tracking-wide ${titleCls}`}>QR Oficial</h3>
        <p className={`mt-2 text-xs leading-relaxed ${subCls}`}>
          Este item ainda não possui ativo vinculado.
        </p>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className={`text-xs font-semibold uppercase tracking-wide ${titleCls}`}>QR Oficial</h3>
          <p className={`mt-1 text-[11px] leading-relaxed ${subCls}`}>
            Identidade pública do ativo para leitura operacional. O ponto no mapa só indica a posição visual.
          </p>
        </div>
        {data && !loading ? <QrStatusBadge status={data.status} variant={variant} /> : null}
      </div>

      {loading ? (
        <div className="mt-4 space-y-3" aria-busy>
          <div className="h-36 w-full max-w-[200px] animate-pulse rounded-lg bg-slate-200/80" />
          <div className="h-3 w-40 animate-pulse rounded bg-slate-200/80" />
          <div className="h-8 w-full animate-pulse rounded bg-slate-100" />
        </div>
      ) : null}

      {error && !loading ? (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <p>{error}</p>
          <button
            type="button"
            className="mt-2 text-xs font-medium text-amber-950 underline underline-offset-2"
            onClick={() => void reload()}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {data && !loading && !error ? (
        <>
          {data.status === 'active' && data.publicCode ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div
                className={`rounded-md px-2 py-1 font-mono text-sm font-semibold tracking-tight ${
                  variant === 'dark' ? 'bg-slate-950/80 text-slate-100' : 'bg-slate-100 text-slate-900'
                }`}
              >
                {data.publicCode}
              </div>
              <button
                type="button"
                onClick={() => void onCopyCode()}
                className={`text-[11px] font-medium uppercase tracking-wide ${
                  variant === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          ) : null}

          {data.status === 'active' ? (
            <div className="mt-4">
              <QrPreview
                svgUrl={data.svgUrl}
                pngUrl={data.pngUrl}
                variant={variant === 'dark' ? 'dark' : 'light'}
              />
            </div>
          ) : (
            <p className={`mt-4 text-xs ${subCls}`}>Gere o QR para obter o código de identificação e o preview.</p>
          )}

          {actionError ? <p className="mt-2 text-xs text-red-600">{actionError}</p> : null}

          <div className="mt-4">
            <QrActions
              data={data}
              ensuring={ensuring}
              onEnsure={onEnsure}
              onDownloadSvg={onDownloadSvg}
              onDownloadPng={onDownloadPng}
              onPrintLabel={onPrintLabel}
              onOpenDestination={onOpenDestination}
              disabled={!!error}
              variant={variant}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
