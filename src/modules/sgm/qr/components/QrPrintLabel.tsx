import { printQrLabel, type QrLabelPrintPayload } from '../utils/qr.print';

export type { QrLabelPrintPayload };

/** Dispara impressão de etiqueta simples (janela dedicada + print). */
export function triggerQrLabelPrint(payload: QrLabelPrintPayload): void {
  printQrLabel(payload);
}
