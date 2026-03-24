/** Resultado da tentativa de resolução pública do QR (auditoria). */
export type QrResolveOutcome = "resolved" | "not_found" | "unauthenticated" | "unauthorized";

export interface QrAuthUser {
  id: string;
}

/** Extensível para validação futura por contexto (scan + planta/máquina). */
export interface QrScanContext {
  currentSiteId?: string | null;
  currentPlantId?: string | null;
  currentMachineId?: string | null;
  expectedSlotCode?: string | null;
  requestSource?: string | null;
  scanContext?: Record<string, unknown> | null;
}

export type AssetQrStatus = "not_generated" | "active";

export interface AssetQrMetadata {
  assetId: string;
  publicCode: string | null;
  qrValue: string | null;
  resolvedUrl: string | null;
  svgUrl: string | null;
  pngUrl: string | null;
  generatedAt: string | null;
  status: AssetQrStatus;
}

export interface EnsureAssetQrResult {
  assetId: string;
  publicCode: string;
  qrValue: string;
  resolvedUrl: string;
  svgUrl: string;
  pngUrl: string;
  generatedAt: string;
}

export interface AssetNodeQrRow {
  id: string;
  nodeKind: string;
  publicCode: string | null;
  qrGeneratedAt: Date | null;
}

export interface PublicCodeLookupRow {
  assetId: string;
  publicCode: string;
  machineId: string | null;
}
