import type { AssetQrDto } from '../qr.types';

type Variant = 'light' | 'dark';

export function QrActions({
  data,
  ensuring,
  onEnsure,
  onDownloadSvg,
  onDownloadPng,
  onPrintLabel,
  onOpenDestination,
  disabled,
  variant = 'light',
}: {
  data: AssetQrDto | null;
  ensuring: boolean;
  onEnsure: () => void;
  onDownloadSvg: () => void;
  onDownloadPng: () => void;
  onPrintLabel: () => void;
  onOpenDestination: () => void;
  disabled?: boolean;
  variant?: Variant;
}) {
  const active = data?.status === 'active';
  const btnBase =
    variant === 'dark'
      ? 'rounded-md border border-slate-600 bg-slate-800/90 px-2.5 py-1.5 text-[11px] font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-50'
      : 'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50';

  const secondary =
    variant === 'dark'
      ? 'rounded-md border border-slate-600/80 bg-transparent px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-slate-800/80 disabled:opacity-50'
      : 'rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50';

  return (
    <div className="flex flex-wrap gap-2">
      {!active ? (
        <button type="button" className={btnBase} onClick={() => void onEnsure()} disabled={disabled || ensuring}>
          {ensuring ? 'Gerando…' : 'Gerar QR'}
        </button>
      ) : (
        <>
          <button type="button" className={secondary} onClick={() => void onDownloadSvg()} disabled={disabled}>
            Baixar SVG
          </button>
          <button type="button" className={secondary} onClick={() => void onDownloadPng()} disabled={disabled}>
            Baixar PNG
          </button>
          <button type="button" className={secondary} onClick={() => void onPrintLabel()} disabled={disabled}>
            Imprimir etiqueta
          </button>
          <button type="button" className={btnBase} onClick={() => void onOpenDestination()} disabled={disabled}>
            Abrir destino
          </button>
        </>
      )}
    </div>
  );
}
