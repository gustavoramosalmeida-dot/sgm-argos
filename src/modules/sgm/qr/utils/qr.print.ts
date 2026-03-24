import { getAssetQrSvgUrl } from '../qr.api';

function toAbsoluteAssetUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${window.location.origin}${path}`;
}

export type QrLabelPrintPayload = {
  publicCode: string;
  assetName: string;
  /** Linha curta de contexto (ex.: máquina ou breadcrumb). */
  contextLine: string | null;
  /** URL do SVG do QR (preferência para nitidez na impressão). */
  qrSvgUrl: string;
};

/**
 * Abre janela de impressão com layout mínimo para etiqueta (sem PDF).
 */
export function printQrLabel(payload: QrLabelPrintPayload): void {
  const w = window.open('', '_blank', 'noopener,noreferrer,width=520,height=720');
  if (!w) {
    window.alert('Permita pop-ups para imprimir a etiqueta.');
    return;
  }

  const safeCode = escapeHtml(payload.publicCode);
  const safeName = escapeHtml(payload.assetName);
  const safeCtx = payload.contextLine ? escapeHtml(payload.contextLine) : '';

  w.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Etiqueta ${safeCode}</title>
  <style>
    @page { margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 16px;
    }
    .wrap {
      max-width: 320px;
      margin: 0 auto;
      text-align: center;
    }
    .qr {
      display: block;
      margin: 0 auto 12px;
      width: 200px;
      height: 200px;
    }
    .code {
      font-family: ui-monospace, monospace;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.02em;
      margin: 0 0 8px;
    }
    .name {
      font-size: 13px;
      font-weight: 600;
      margin: 0 0 4px;
      line-height: 1.35;
    }
    .ctx {
      font-size: 11px;
      color: #475569;
      margin: 0;
      line-height: 1.35;
    }
    .hint {
      margin-top: 14px;
      font-size: 9px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <img class="qr" src="${escapeAttr(toAbsoluteAssetUrl(payload.qrSvgUrl))}" alt="" crossorigin="anonymous" />
    <p class="code">${safeCode}</p>
    <p class="name">${safeName}</p>
    ${safeCtx ? `<p class="ctx">${safeCtx}</p>` : ''}
    <p class="hint">SGM · QR oficial do ativo</p>
  </div>
</body>
</html>`);
  w.document.close();

  const img = w.document.querySelector('img');
  if (img) {
    img.onload = () => {
      w.focus();
      w.print();
    };
    img.onerror = () => {
      w.focus();
      w.print();
    };
  } else {
    w.focus();
    w.print();
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

/** Monta URL SVG para impressão a partir do assetId. */
export function buildDefaultQrSvgUrlForAsset(assetId: string): string {
  return getAssetQrSvgUrl(assetId);
}
