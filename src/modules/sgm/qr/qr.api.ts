import { apiGet, apiPost } from '@/lib/api';
import type { AssetQrDto, EnsureAssetQrDto } from './qr.types';

export function getAssetQr(assetId: string) {
  return apiGet<AssetQrDto>(`/api/sgm/assets/${encodeURIComponent(assetId)}/qr`);
}

export function ensureAssetQr(assetId: string) {
  return apiPost<EnsureAssetQrDto>(`/api/sgm/assets/${encodeURIComponent(assetId)}/qr/ensure`, {});
}

/** URLs relativas para download/preview (mesma origem que a API). */
export function getAssetQrSvgUrl(assetId: string) {
  return `/api/sgm/assets/${encodeURIComponent(assetId)}/qr.svg`;
}

export function getAssetQrPngUrl(assetId: string) {
  return `/api/sgm/assets/${encodeURIComponent(assetId)}/qr.png`;
}
