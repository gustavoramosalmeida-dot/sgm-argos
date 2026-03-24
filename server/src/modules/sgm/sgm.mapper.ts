import type {
  SiteHealthItem,
  SiteListItem,
  MachineSummary,
  QrInventoryItem,
  TimelineItem,
  BreadcrumbItem,
  AssetTreeNode,
  AssetLastEvent,
  AssetTimelineEvent,
  AssetTimelineSummary,
  VisualPoint,
  VisualPointAssetSummary,
  AssetSummary,
} from "./sgm.types";

export interface SiteListRow {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  status: string | null;
  machines_count: string | number;
}

export function mapSiteListRow(row: SiteListRow): SiteListItem {
  return {
    id: String(row.id),
    code: row.code ?? null,
    name: row.name,
    description: row.description ?? null,
    status: row.status ?? null,
    machinesCount: Number(row.machines_count ?? 0),
  };
}

export interface SiteHealthRow {
  site_id: string;
  site_name: string;
  total_machines: string | number;
  machines_ok: string | number;
  machines_atencao: string | number;
  machines_critico: string | number;
}

export function mapSiteHealthRow(row: SiteHealthRow): SiteHealthItem {
  return {
    siteId: String(row.site_id),
    siteName: row.site_name,
    machinesTotal: Number(row.total_machines ?? 0),
    okCount: Number(row.machines_ok ?? 0),
    warningCount: Number(row.machines_atencao ?? 0),
    failureCount: Number(row.machines_critico ?? 0),
  };
}

export interface MachineSummaryRow {
  machine_id: string;
  machine_code: string | null;
  machine_name: string;
  description: string | null;
  status: string | null;
  qr_root_code: string | null;
  site_id: string | null;
  site_name: string | null;
  total_qr_points: string | number;
  total_components: string | number;
  total_events: string | number;
}

export function mapMachineSummaryRow(row: MachineSummaryRow): MachineSummary {
  return {
    id: String(row.machine_id),
    code: row.machine_code ?? null,
    name: row.machine_name,
    description: row.description ?? null,
    status: row.status ?? null,
    qrRootCode: row.qr_root_code ?? null,
    site: {
      id: row.site_id != null ? String(row.site_id) : null,
      name: row.site_name ?? null,
    },
    totals: {
      qrPoints: Number(row.total_qr_points ?? 0),
      components: Number(row.total_components ?? 0),
      events: Number(row.total_events ?? 0),
    },
  };
}

export interface QrInventoryRow {
  qr_code: string | null;
  asset_node_id: string;
  asset_name: string;
  asset_type: string | null;
  radar_status: string;
  last_event_type: string | null;
  last_event_date: Date | string | null;
  next_due_date: Date | string | null;
}

export function mapQrInventoryRow(row: QrInventoryRow): QrInventoryItem {
  return {
    qrCode: row.qr_code ?? null,
    assetId: String(row.asset_node_id),
    assetName: row.asset_name,
    assetType: row.asset_type ?? null,
    status: row.radar_status,
    lastEventType: row.last_event_type ?? null,
    lastEventAt: row.last_event_date
      ? new Date(row.last_event_date).toISOString().slice(0, 10)
      : null,
    nextDueDate: row.next_due_date
      ? new Date(row.next_due_date).toISOString().slice(0, 10)
      : null,
    mapPoint: { x: null, y: null },
  };
}

export interface TimelineRow {
  asset_node_id: string;
  asset_name: string;
  event_type: string;
  event_date: Date | string;
  event_status: string | null;
  event_description: string | null;
  useful_life_days: number | null;
  next_due_date: Date | string | null;
}

export function mapTimelineRow(row: TimelineRow): TimelineItem {
  return {
    assetId: String(row.asset_node_id),
    assetName: row.asset_name,
    eventType: row.event_type,
    eventDate: new Date(row.event_date).toISOString().slice(0, 10),
    status: row.event_status ?? null,
    notes: row.event_description ?? null,
    usefulLifeDays: row.useful_life_days ?? null,
    nextDueDate: row.next_due_date
      ? new Date(row.next_due_date).toISOString().slice(0, 10)
      : null,
  };
}

export interface BreadcrumbRow {
  asset_node_id: string;
  asset_name: string;
  asset_type: string | null;
  depth_from_root: string | number;
  site_id: string | null;
  site_name: string | null;
  machine_id: string | null;
  machine_name: string | null;
}

export function mapBreadcrumbRow(row: BreadcrumbRow): BreadcrumbItem {
  return {
    assetId: String(row.asset_node_id),
    assetName: row.asset_name,
    assetType: row.asset_type ?? null,
    depthFromRoot: Number(row.depth_from_root ?? 0),
    siteId: row.site_id != null ? String(row.site_id) : null,
    siteName: row.site_name ?? null,
    machineId: row.machine_id != null ? String(row.machine_id) : null,
    machineName: row.machine_name ?? null,
  };
}

export interface AssetTreeRow {
  asset_node_id: string;
  parent_id: string | null;
  asset_name: string;
  asset_type: string | null;
  depth_from_machine: string | number;
  is_machine_root: boolean;
}

export function mapAssetTreeRow(row: AssetTreeRow): AssetTreeNode {
  return {
    assetId: String(row.asset_node_id),
    parentAssetId: row.parent_id != null ? String(row.parent_id) : null,
    assetName: row.asset_name,
    assetType: row.asset_type ?? null,
    depthFromMachine: Number(row.depth_from_machine ?? 0),
    isMachineRoot: Boolean(row.is_machine_root),
  };
}

export interface AssetLastEventRow {
  asset_node_id: string;
  asset_name: string;
  last_event_type: string;
  last_event_date: Date | string;
  last_event_status: string | null;
  last_event_description: string | null;
  last_useful_life_days: number | null;
  last_next_due_date: Date | string | null;
}

export function mapAssetLastEventRow(row: AssetLastEventRow): AssetLastEvent {
  return {
    assetId: String(row.asset_node_id),
    assetName: row.asset_name,
    eventType: row.last_event_type,
    eventDate: new Date(row.last_event_date).toISOString().slice(0, 10),
    status: row.last_event_status ?? null,
    notes: row.last_event_description ?? null,
    usefulLifeDays: row.last_useful_life_days ?? null,
    nextDueDate: row.last_next_due_date
      ? new Date(row.last_next_due_date).toISOString().slice(0, 10)
      : null,
  };
}

export interface AssetTimelineSummaryRow {
  asset_node_id: string;
  asset_name: string;
  asset_node_type: string | null;
  last_event_type: string | null;
  last_event_date: Date | string | null;
  useful_life_days: number | null;
  next_due_date: Date | string | null;
  status: AssetTimelineSummary["status"];
}

/** Data civil YYYY-MM-DD vinda do SQL ou legado Date — sem shift de fuso na API. */
function formatTimelineCalendarDay(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value as Date | string);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function mapAssetTimelineSummaryRow(
  row: AssetTimelineSummaryRow
): AssetTimelineSummary {
  return {
    lastEventType: row.last_event_type ?? null,
    lastEventDate: formatTimelineCalendarDay(row.last_event_date),
    usefulLifeDays: row.useful_life_days ?? null,
    nextDueDate: formatTimelineCalendarDay(row.next_due_date),
    status: row.status,
  };
}

export interface AssetTimelineEventRow {
  id: string;
  event_type: string;
  event_date: Date | string;
  event_description: string | null;
  useful_life_days: string | number | null;
}

export function mapAssetTimelineEventRow(
  row: AssetTimelineEventRow
): AssetTimelineEvent {
  const uld = row.useful_life_days;
  const usefulLifeDays =
    uld == null || uld === ""
      ? null
      : typeof uld === "number"
        ? uld
        : Number(uld);
  return {
    id: String(row.id),
    eventType: row.event_type,
    eventDate: formatTimelineCalendarDay(row.event_date) ?? "",
    observation: row.event_description ?? null,
    usefulLifeDays: usefulLifeDays != null && !Number.isNaN(usefulLifeDays) ? usefulLifeDays : null,
  };
}

export interface VisualPointRow {
  id: string;
  machine_id: string;
  asset_id: string | null;
  qr_code: string | null;
  label: string | null;
  x_percent: number | string;
  y_percent: number | string;
  point_type: string | null;
  layer_type: string | null;
  asset_code: string | null;
  asset_name: string | null;
  asset_node_kind: string | null;
  asset_type: string | null;
}

const QR_PAYLOAD_PREFIX = "SGM:ASSET:";

export function mapVisualPointRow(row: VisualPointRow): VisualPoint {
  const asset: VisualPointAssetSummary | null =
    row.asset_id && row.asset_name
      ? {
          id: String(row.asset_id),
          code: row.asset_code,
          name: row.asset_name,
          nodeKind: row.asset_node_kind,
          assetType: row.asset_type,
          qrPayload: `${QR_PAYLOAD_PREFIX}${row.asset_id}`,
        }
      : null;

  return {
    id: String(row.id),
    machineId: String(row.machine_id),
    assetId: row.asset_id ? String(row.asset_id) : null,
    assetNodeId: row.asset_id ? String(row.asset_id) : null,
    assetName: row.asset_name ?? null,
    assetNodeType: row.asset_node_kind ?? null,
    // Quando o visual point ainda não está vinculado, não existe qr_code.
    // Neste caso, usamos o `label` como código de exibição.
    qrCode: row.qr_code ?? row.label ?? "",
    label: row.label,
    x: Number(row.x_percent),
    y: Number(row.y_percent),
    pointType: row.point_type,
    layer: row.layer_type,
    asset,
  };
}

export interface AssetSummaryRow {
  id: string;
  code: string | null;
  name: string;
  node_kind: string | null;
  asset_type: string | null;
  status: string | null;
  machine_id: string | null;
}

export function mapAssetSummaryRow(row: AssetSummaryRow): AssetSummary {
  const id = String(row.id);
  return {
    id,
    code: row.code ?? null,
    name: row.name,
    nodeKind: row.node_kind ?? null,
    assetType: row.asset_type ?? null,
    status: row.status ?? null,
    machineId: row.machine_id != null ? String(row.machine_id) : null,
    qrPayload: `${QR_PAYLOAD_PREFIX}${id}`,
  };
}
