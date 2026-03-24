import type { QRPoint } from '../types/QRPoint';

/** Critério único de vínculo QR Point → asset (API + mock). */
export function isQrPointLinkedToAsset(point: QRPoint): boolean {
  if (point.assetNodeId != null && String(point.assetNodeId).trim() !== '') return true;
  if (point.assetId != null && String(point.assetId).trim() !== '') return true;
  if (point.asset?.id != null && String(point.asset.id).trim() !== '') return true;
  return false;
}
