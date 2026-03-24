import { ApiError } from "../../utils/api-error";
import {
  getSiteHealth,
  getSites,
  getSiteById,
  listMachines,
  getMachineById,
  getMachineDefaultPhotoImageUrl,
  getMachineQrInventory,
  getMachineTimeline,
  getAssetBreadcrumbs,
  getAssetTree,
  getAssetLastEvent,
  getAssetTimeline,
  getMachineVisualPoints,
  getAssetSummaryById,
  getVisualPointById,
  linkVisualPointToAssetRepo,
  createAssetForVisualPointAndLinkRepo,
  unlinkVisualPointFromAssetRepo,
} from "./sgm.read.repository";
import {
  insertMachineNode,
  updateMachineNode,
  upsertDefaultPhotoLayer,
  DEFAULT_MACHINE_PHOTO_PLACEHOLDER_URL,
} from "./sgm.write.repository";
import {
  insertAssetEvent,
  updateAssetEvent,
  softDeleteAssetEvent,
  selectAssetEventById,
  type AssetEventRow,
} from "./sgm.asset-events.repository";
import type {
  ListMachinesQuery,
  QrInventoryQuery,
  TimelineQuery,
  LinkVisualPointBody,
  CreateAssetFromVisualPointBody,
  CreateMachineBody,
  UpdateMachineBody,
  CreateAssetEventBody,
  UpdateAssetEventBody,
} from "./sgm.schemas";
import type {
  SiteHealthItem,
  SiteListItem,
  MachineSummary,
  QrInventoryItem,
  TimelineItem,
  BreadcrumbItem,
  AssetTreeNode,
  AssetLastEvent,
  VisualPoint,
  AssetSummary,
  AssetTimelineResponse,
  CreateAssetFromVisualPointResponse,
  MachineWriteResponse,
  AssetEventWriteResponse,
} from "./sgm.types";

export async function getSiteHealthService(): Promise<SiteHealthItem[]> {
  return getSiteHealth();
}

export async function getSitesService(): Promise<SiteListItem[]> {
  return getSites();
}

export async function getSiteByIdService(siteId: string): Promise<SiteListItem> {
  const site = await getSiteById(siteId);
  if (!site) throw new ApiError(404, "Site not found");
  return site;
}

export async function listMachinesService(filters: ListMachinesQuery): Promise<MachineSummary[]> {
  return listMachines(filters);
}

export async function getMachineByIdService(machineId: string): Promise<MachineSummary> {
  const machine = await getMachineById(machineId);
  if (!machine) throw new ApiError(404, "Machine not found");
  const imageUrl = await getMachineDefaultPhotoImageUrl(machineId);
  return { ...machine, imageUrl };
}

async function buildMachineWriteResponse(machineId: string): Promise<MachineWriteResponse> {
  const m = await getMachineById(machineId);
  if (!m) throw new ApiError(500, "Machine not found after write");
  const siteId = m.site.id;
  if (!siteId) throw new ApiError(500, "Machine has no site");
  const imageUrl = await getMachineDefaultPhotoImageUrl(machineId);
  return {
    id: m.id,
    siteId,
    name: m.name,
    code: m.code,
    description: m.description,
    imageUrl,
  };
}

export async function createMachineService(
  siteId: string,
  body: CreateMachineBody
): Promise<MachineWriteResponse> {
  await getSiteByIdService(siteId);

  const code = body.code ?? null;
  const description = body.description ?? null;

  const machineId = await insertMachineNode({
    siteId,
    name: body.name,
    code,
    description,
  });

  const photoUrl =
    body.imageUrl != null && body.imageUrl.trim().length > 0
      ? body.imageUrl.trim()
      : DEFAULT_MACHINE_PHOTO_PLACEHOLDER_URL;
  await upsertDefaultPhotoLayer(machineId, photoUrl);

  return buildMachineWriteResponse(machineId);
}

export async function updateMachineService(
  machineId: string,
  body: UpdateMachineBody
): Promise<MachineWriteResponse> {
  const current = await getMachineById(machineId);
  if (!current) throw new ApiError(404, "Machine not found");

  const name = body.name !== undefined ? body.name : current.name;
  const code = body.code !== undefined ? body.code : current.code;
  const description = body.description !== undefined ? body.description : current.description;

  const updated = await updateMachineNode(machineId, { name, code, description });
  if (!updated) throw new ApiError(404, "Machine not found");

  if (body.imageUrl !== undefined && body.imageUrl != null && body.imageUrl.length > 0) {
    await upsertDefaultPhotoLayer(machineId, body.imageUrl);
  }

  return buildMachineWriteResponse(machineId);
}

/** Persiste URL da foto (após upload do arquivo para disco/CDN). */
export async function uploadMachinePhotoService(
  machineId: string,
  imageUrl: string
): Promise<MachineWriteResponse> {
  const current = await getMachineById(machineId);
  if (!current) throw new ApiError(404, "Machine not found");
  await upsertDefaultPhotoLayer(machineId, imageUrl);
  return buildMachineWriteResponse(machineId);
}

export async function getMachineQrInventoryService(
  machineId: string,
  filters: QrInventoryQuery
): Promise<{ machineId: string; items: QrInventoryItem[] }> {
  const items = await getMachineQrInventory(machineId, filters);
  return { machineId, items };
}

export async function getMachineTimelineService(
  machineId: string,
  filters: TimelineQuery
): Promise<{ machineId: string; items: TimelineItem[] }> {
  const items = await getMachineTimeline(machineId, filters);
  return { machineId, items };
}

export async function getAssetBreadcrumbsService(
  assetId: string
): Promise<{ items: BreadcrumbItem[] }> {
  const items = await getAssetBreadcrumbs(assetId);
  return { items };
}

export async function getAssetTreeService(
  assetId: string
): Promise<{ items: AssetTreeNode[] }> {
  const items = await getAssetTree(assetId);
  return { items };
}

export async function getAssetLastEventService(
  assetId: string
): Promise<{ item: AssetLastEvent | null }> {
  const item = await getAssetLastEvent(assetId);
  return { item };
}

export async function getAssetTimelineService(
  assetId: string
): Promise<AssetTimelineResponse> {
  const timeline = await getAssetTimeline(assetId);
  if (!timeline) throw new ApiError(404, "Asset not found");
  return timeline;
}

function mapAssetEventRowToWriteResponse(row: AssetEventRow): AssetEventWriteResponse {
  return {
    id: String(row.id),
    assetId: String(row.asset_node_id),
    eventType: row.event_type,
    eventDate: row.event_date_ymd,
    observation: row.description,
    usefulLifeDays: row.useful_life_days,
  };
}

function buildEventTitle(eventType: string, calendarDateYmd: string): string {
  const base = `${eventType} — ${calendarDateYmd}`;
  return base.length <= 255 ? base : `${base.slice(0, 252)}...`;
}

export async function createAssetEventService(
  assetId: string,
  body: CreateAssetEventBody
): Promise<AssetEventWriteResponse> {
  await getAssetSummaryService(assetId);
  const row = await insertAssetEvent({
    assetId,
    eventType: body.eventType,
    calendarDateYmd: body.eventDate,
    description: body.observation ?? null,
    usefulLifeDays: body.usefulLifeDays ?? null,
  });
  return mapAssetEventRowToWriteResponse(row);
}

export async function updateAssetEventService(
  eventId: string,
  body: UpdateAssetEventBody
): Promise<AssetEventWriteResponse> {
  const current = await selectAssetEventById(eventId);
  if (!current) throw new ApiError(404, "Event not found");

  const eventType = body.eventType ?? current.event_type;
  const calendarDateYmd = body.eventDate ?? current.event_date_ymd;
  const description =
    body.observation !== undefined ? body.observation : current.description;
  const usefulLifeDays =
    body.usefulLifeDays !== undefined ? body.usefulLifeDays : current.useful_life_days;

  const title = buildEventTitle(eventType, calendarDateYmd);

  const updated = await updateAssetEvent({
    eventId,
    eventType,
    calendarDateYmd,
    title,
    description,
    usefulLifeDays,
  });
  if (!updated) throw new ApiError(404, "Event not found");
  return mapAssetEventRowToWriteResponse(updated);
}

export async function deleteAssetEventService(eventId: string): Promise<{ success: true }> {
  const current = await selectAssetEventById(eventId);
  if (!current) throw new ApiError(404, "Event not found");
  const ok = await softDeleteAssetEvent(eventId);
  if (!ok) throw new ApiError(404, "Event not found");
  return { success: true };
}

export async function getMachineVisualPointsService(
  machineId: string
): Promise<{ machineId: string; items: VisualPoint[] }> {
  const items = await getMachineVisualPoints(machineId);
  return { machineId, items };
}

export async function getAssetSummaryService(assetId: string): Promise<AssetSummary> {
  const asset = await getAssetSummaryById(assetId);
  if (!asset) throw new ApiError(404, "Asset not found");
  return asset;
}

export async function linkVisualPointToAssetService(
  visualPointId: string,
  body: LinkVisualPointBody
): Promise<VisualPoint> {
  const vp = await getVisualPointById(visualPointId);
  if (!vp) throw new ApiError(404, "Visual point not found");

  const asset = await getAssetSummaryById(body.assetNodeId);
  if (!asset) throw new ApiError(404, "Asset not found");

  // Opcional: validar compatibilidade com máquina (mesma machineId) se necessário
  await linkVisualPointToAssetRepo(visualPointId, body.assetNodeId);

  const updated = await getVisualPointById(visualPointId);
  if (!updated) throw new ApiError(500, "Failed to update visual point");
  return updated;
}

export async function createAssetFromVisualPointService(
  visualPointId: string,
  body: CreateAssetFromVisualPointBody
): Promise<CreateAssetFromVisualPointResponse> {
  const vp = await getVisualPointById(visualPointId);
  if (!vp) throw new ApiError(404, "Visual point not found");

  const created = await createAssetForVisualPointAndLinkRepo(visualPointId, body);
  if (!created) throw new ApiError(500, "Failed to create asset for visual point");

  return {
    visualPoint: { id: created.visualPointId, assetNodeId: created.assetNodeId },
    assetNode: {
      id: created.assetNodeId,
      name: created.assetNodeName,
      nodeType: created.assetNodeType,
    },
  };
}

export async function unlinkVisualPointFromAssetService(
  visualPointId: string
): Promise<VisualPoint> {
  const vp = await getVisualPointById(visualPointId);
  if (!vp) throw new ApiError(404, "Visual point not found");

  const ok = await unlinkVisualPointFromAssetRepo(visualPointId);
  if (!ok) throw new ApiError(404, "Visual point not found");

  const updated = await getVisualPointById(visualPointId);
  if (!updated) throw new ApiError(500, "Failed to unlink visual point");
  return updated;
}
