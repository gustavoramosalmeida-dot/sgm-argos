export interface SiteHealthItem {
  siteId: string;
  siteName: string;
  machinesTotal: number;
  okCount: number;
  warningCount: number;
  failureCount: number;
}

/** Item da lista GET /api/sgm/sites */
export interface SiteListItem {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  status: string | null;
  machinesCount: number;
}

export interface MachineSummary {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  status: string | null;
  qrRootCode: string | null;
  site: { id: string | null; name: string | null };
  totals: { qrPoints: number; components: number; events: number };
  /** PHOTO/default oficial; preenchido em GET /machines/:machineId */
  imageUrl?: string | null;
}

/** Resposta de POST /sites/:siteId/machines e PUT /machines/:machineId */
export interface MachineWriteResponse {
  id: string;
  siteId: string;
  name: string;
  code: string | null;
  description: string | null;
  imageUrl: string | null;
}

export interface QrInventoryItem {
  qrCode: string | null;
  assetId: string;
  assetName: string;
  assetType: string | null;
  status: string;
  lastEventType: string | null;
  lastEventAt: string | null;
  nextDueDate: string | null;
  mapPoint: { x: number | null; y: number | null };
}

export interface TimelineItem {
  assetId: string;
  assetName: string;
  eventType: string;
  eventDate: string;
  status: string | null;
  notes: string | null;
  usefulLifeDays: number | null;
  nextDueDate: string | null;
}

export interface BreadcrumbItem {
  assetId: string;
  assetName: string;
  assetType: string | null;
  depthFromRoot: number;
  siteId: string | null;
  siteName: string | null;
  machineId: string | null;
  machineName: string | null;
}

export interface AssetTreeNode {
  assetId: string;
  parentAssetId: string | null;
  assetName: string;
  assetType: string | null;
  depthFromMachine: number;
  isMachineRoot: boolean;
}

export interface AssetLastEvent {
  assetId: string;
  assetName: string;
  eventType: string;
  eventDate: string;
  status: string | null;
  notes: string | null;
  usefulLifeDays: number | null;
  nextDueDate: string | null;
}

export interface AssetTimelineEvent {
  id: string;
  eventType: string;
  eventDate: string;
  observation: string | null;
  usefulLifeDays: number | null;
}

/** Resposta de POST/PUT em eventos do asset. */
export interface AssetEventWriteResponse {
  id: string;
  assetId: string;
  eventType: string;
  eventDate: string;
  observation: string | null;
  usefulLifeDays: number | null;
}

export interface AssetTimelineSummary {
  lastEventType: string | null;
  lastEventDate: string | null;
  usefulLifeDays: number | null;
  nextDueDate: string | null;
  status: "OK" | "ATENCAO" | "VENCIDO" | "SEM_HISTORICO";
}

export interface AssetTimelineResponse {
  asset: {
    id: string;
    name: string;
    nodeType: string | null;
  };
  summary: AssetTimelineSummary;
  events: AssetTimelineEvent[];
}

/** Ponto visual (QR point) no mapa da máquina, com vínculo opcional a um asset_node. */
export interface VisualPointAssetSummary {
  id: string;
  code: string | null;
  name: string;
  nodeKind: string | null;
  assetType: string | null;
  /** Payload lógico do QR: SGM:ASSET:<uuid> — identifica o ativo, não o visual point. */
  qrPayload: string | null;
}

export interface VisualPoint {
  id: string;
  machineId: string;
  assetId: string | null;
  /** Padrão novo: id do asset_node vinculado (mesmo que assetId, mas com nomes consistentes). */
  assetNodeId: string | null;
  assetName: string | null;
  /** Padrão novo: node_kind do asset_node vinculado. */
  assetNodeType: string | null;
  qrCode: string;
  label: string | null;
  x: number;
  y: number;
  pointType: string | null;
  layer: string | null;
  asset: VisualPointAssetSummary | null;
}

/** Resumo mínimo de um asset para telas futuras de detalhe. */
export interface AssetSummary {
  id: string;
  code: string | null;
  name: string;
  nodeKind: string | null;
  assetType: string | null;
  status: string | null;
  machineId: string | null;
  /** Payload lógico do QR físico: SGM:ASSET:<uuid>. */
  qrPayload: string | null;
}

export interface CreateAssetFromVisualPointResponse {
  visualPoint: {
    id: string;
    assetNodeId: string;
  };
  assetNode: {
    id: string;
    name: string;
    nodeType: string;
  };
}
