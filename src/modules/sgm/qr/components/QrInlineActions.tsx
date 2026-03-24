import { useCallback, useState } from 'react';
import { useAssetQr } from '../qr.hooks';
import { downloadFromUrl } from '../utils/qr.download';
import { triggerQrLabelPrint } from './QrPrintLabel';
import { getAssetQrPngUrl, getAssetQrSvgUrl } from '../qr.api';
import { QrPreview } from './QrPreview';
import { QrStatusBadge } from './QrStatusBadge';

/**
 * Bloco compacto para o Editor Visual: ações sobre o **ativo** vinculado ao ponto.
 */
export function QrInlineActions({
  assetId,
  assetName,
  machineName,
  hasAsset,
}: {
  assetId: string | null;
  assetName?: string | null;
  machineName?: string | null;
  /** Quando false, o ponto não tem asset vinculado. */
  hasAsset: boolean;
}) {
  const { data, loading, ensuring, error, reload, ensure } = useAssetQr(hasAsset ? assetId : null);
  const [localErr, setLocalErr] = useState<string | null>(null);

  const onDownloadSvg = useCallback(async () => {
    if (!assetId || !data?.publicCode) return;
    setLocalErr(null);
    try {
      await downloadFromUrl(getAssetQrSvgUrl(assetId), `qr-${data.publicCode}.svg`);
    } catch {
      setLocalErr('SVG indisponível.');
    }
  }, [assetId, data?.publicCode]);

  const onDownloadPng = useCallback(async () => {
    if (!assetId || !data?.publicCode) return;
    setLocalErr(null);
    try {
      await downloadFromUrl(getAssetQrPngUrl(assetId), `qr-${data.publicCode}.png`);
    } catch {
      setLocalErr('PNG indisponível.');
    }
  }, [assetId, data?.publicCode]);

  const onPrint = useCallback(() => {
    if (!assetId || !data?.publicCode) return;
    setLocalErr(null);
    try {
      triggerQrLabelPrint({
        publicCode: data.publicCode,
        assetName: assetName ?? 'Ativo',
        contextLine: machineName ?? null,
        qrSvgUrl: getAssetQrSvgUrl(assetId),
      });
    } catch {
      setLocalErr('Impressão indisponível.');
    }
  }, [assetId, data?.publicCode, assetName, machineName]);

  const onOpen = useCallback(() => {
    const url = data?.resolvedUrl ?? data?.qrValue;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [data?.qrValue, data?.resolvedUrl]);

  const onEnsure = useCallback(async () => {
    setLocalErr(null);
    try {
      await ensure();
    } catch {
      /* hook */
    }
  }, [ensure]);

  if (!hasAsset) {
    return (
      <div className="rounded-md border border-slate-700/80 bg-slate-950/40 px-2 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">QR Oficial</p>
        <p className="mt-1 text-[11px] leading-snug text-slate-400">
          O QR oficial pertence ao ativo vinculado. Este ponto visual ainda não possui ativo associado.
        </p>
      </div>
    );
  }

  if (!assetId) {
    return (
      <div className="rounded-md border border-amber-900/40 bg-amber-950/25 px-2 py-2">
        <p className="text-[11px] text-amber-100/90">Resolvendo ativo…</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-700/80 bg-slate-950/35 px-2 py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">QR Oficial</p>
        {data && !loading ? <QrStatusBadge status={data.status} variant="dark" /> : null}
      </div>

      {loading ? (
        <div className="mt-2 h-8 w-full animate-pulse rounded bg-slate-800/80" />
      ) : null}

      {error ? (
        <div className="mt-2 text-[11px] text-amber-200/90">
          {error}{' '}
          <button type="button" className="underline" onClick={() => void reload()}>
            Tentar novamente
          </button>
        </div>
      ) : null}

      {data && !loading && !error ? (
        <>
          {data.status === 'active' && data.publicCode ? (
            <p className="mt-1 font-mono text-[11px] font-semibold text-emerald-200/95">{data.publicCode}</p>
          ) : null}

          {data.status === 'active' ? (
            <div className="mt-2 flex justify-center">
              <QrPreview svgUrl={data.svgUrl} pngUrl={data.pngUrl} size={120} variant="dark" />
            </div>
          ) : null}

          {localErr ? <p className="mt-1 text-[10px] text-red-400">{localErr}</p> : null}

          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.status !== 'active' ? (
              <button
                type="button"
                onClick={() => void onEnsure()}
                disabled={ensuring}
                className="rounded border border-emerald-600/60 bg-emerald-950/50 px-2 py-1 text-[10px] font-medium text-emerald-100 hover:bg-emerald-900/50 disabled:opacity-50"
              >
                {ensuring ? 'Gerando…' : 'Gerar QR'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void onDownloadSvg()}
                  className="rounded border border-slate-600 bg-slate-900/80 px-2 py-1 text-[10px] font-medium text-slate-200 hover:bg-slate-800"
                >
                  SVG
                </button>
                <button
                  type="button"
                  onClick={() => void onDownloadPng()}
                  className="rounded border border-slate-600 bg-slate-900/80 px-2 py-1 text-[10px] font-medium text-slate-200 hover:bg-slate-800"
                >
                  PNG
                </button>
                <button
                  type="button"
                  onClick={() => void onPrint()}
                  className="rounded border border-slate-600 bg-slate-900/80 px-2 py-1 text-[10px] font-medium text-slate-200 hover:bg-slate-800"
                >
                  Imprimir
                </button>
                <button
                  type="button"
                  onClick={() => void onOpen()}
                  className="rounded border border-slate-500 bg-slate-800/90 px-2 py-1 text-[10px] font-medium text-white hover:bg-slate-700"
                >
                  Abrir
                </button>
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
