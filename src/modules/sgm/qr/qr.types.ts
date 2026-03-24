/** Resposta GET /api/sgm/assets/:assetId/qr */
export type AssetQrDto = {
  assetId: string;
  publicCode: string | null;
  qrValue?: string | null;
  resolvedUrl?: string | null;
  svgUrl?: string | null;
  pngUrl?: string | null;
  generatedAt?: string | null;
  status: 'not_generated' | 'active';
};

/** Resposta POST /api/sgm/assets/:assetId/qr/ensure */
export type EnsureAssetQrDto = {
  assetId: string;
  publicCode: string;
  qrValue: string;
  resolvedUrl: string;
  svgUrl: string;
  pngUrl: string;
  generatedAt: string;
};
