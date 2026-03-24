/** Resposta do backend para GET /api/sgm/machines */
export interface MachineSummary {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  status: string | null;
  qrRootCode: string | null;
  site: { id: string | null; name: string | null };
  totals: { qrPoints: number; components: number; events: number };
  /** Layer PHOTO/default; preenchido em GET /machines/:machineId */
  imageUrl?: string | null;
}

/** POST /api/sgm/sites/:siteId/machines e PUT /api/sgm/machines/:machineId */
export interface MachineWriteResponse {
  id: string;
  siteId: string;
  name: string;
  code: string | null;
  description: string | null;
  imageUrl: string | null;
}

export interface MachinesListResponse {
  items: MachineSummary[];
}

export interface SiteHealthItem {
  siteId: string;
  siteName: string;
  machinesTotal: number;
  okCount: number;
  warningCount: number;
  failureCount: number;
}

export interface SiteHealthResponse {
  items: SiteHealthItem[];
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

export interface SitesListResponse {
  items: SiteListItem[];
}

export interface VisualPointAssetSummary {
  id: string;
  code: string | null;
  name: string;
  nodeKind: string | null;
  assetType: string | null;
  /** Payload lógico do QR: SGM:ASSET:<uuid> */
  qrPayload: string | null;
}

export interface VisualPoint {
  id: string;
  machineId: string;
  assetId: string | null;
  /** Novo padrão: id do asset_node vinculado. */
  assetNodeId: string | null;
  /** Novo padrão: nome do asset_node vinculado. */
  assetName: string | null;
  /** Novo padrão: node_kind do asset_node vinculado. */
  assetNodeType: string | null;
  qrCode: string;
  label: string | null;
  x: number;
  y: number;
  pointType: string | null;
  layer: string | null;
  asset: VisualPointAssetSummary | null;
}

export interface VisualPointsResponse {
  machineId: string;
  items: VisualPoint[];
}

export interface AssetSummary {
  id: string;
  code: string | null;
  name: string;
  nodeKind: string | null;
  assetType: string | null;
  status: string | null;
  machineId: string | null;
  /** Payload lógico do QR físico: SGM:ASSET:<uuid> */
  qrPayload: string | null;
}

export interface AssetTimelineEvent {
  id: string;
  eventType: string;
  eventDate: string;
  observation: string | null;
  usefulLifeDays: number | null;
}

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
