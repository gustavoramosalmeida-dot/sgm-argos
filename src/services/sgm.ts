import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type {
  MachinesListResponse,
  SiteHealthResponse,
  SitesListResponse,
  SiteListItem,
  VisualPointsResponse,
  AssetSummary,
  AssetTimelineResponse,
  MachineWriteResponse,
  AssetEventWriteResponse,
} from '@/types/sgm-api';

export function getSites() {
  return apiGet<SitesListResponse>('/api/sgm/sites');
}

export function getSiteById(siteId: string) {
  return apiGet<SiteListItem>(`/api/sgm/sites/${siteId}`);
}

export function getMachines(params?: { siteId?: string }) {
  const search = new URLSearchParams();
  if (params?.siteId) search.set('siteId', params.siteId);
  const qs = search.toString();
  return apiGet<MachinesListResponse>(
    qs ? `/api/sgm/machines?${qs}` : '/api/sgm/machines'
  );
}

export function getMachineById(machineId: string) {
  return apiGet<MachinesListResponse['items'][number]>(`/api/sgm/machines/${machineId}`);
}

export type CreateMachinePayload = {
  name: string;
  code?: string | null;
  description?: string | null;
  imageUrl?: string | null;
};

export function createMachine(siteId: string, body: CreateMachinePayload) {
  return apiPost<MachineWriteResponse>(`/api/sgm/sites/${siteId}/machines`, body);
}

export type UpdateMachinePayload = {
  name?: string;
  code?: string | null;
  description?: string | null;
  imageUrl?: string | null;
};

export function updateMachine(machineId: string, body: UpdateMachinePayload) {
  return apiPut<MachineWriteResponse>(`/api/sgm/machines/${machineId}`, body);
}

/** POST multipart: persiste arquivo como layer PHOTO/default e retorna a máquina atualizada. */
export async function uploadMachinePhotoFile(machineId: string, file: File): Promise<MachineWriteResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`/api/sgm/machines/${machineId}/photo`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return response.json();
}

export function getMachineQrInventory(machineId: string) {
  return apiGet<unknown>(`/api/sgm/machines/${machineId}/qr-inventory`);
}

export function getMachineTimeline(machineId: string) {
  return apiGet<unknown>(`/api/sgm/machines/${machineId}/timeline`);
}

export function getMachineVisualPoints(machineId: string) {
  return apiGet<VisualPointsResponse>(`/api/sgm/machines/${machineId}/visual-points`);
}

export function getAssetById(assetId: string) {
  return apiGet<AssetSummary>(`/api/sgm/assets/${assetId}`);
}

export function getAssetTimeline(assetId: string) {
  return apiGet<AssetTimelineResponse>(`/api/sgm/assets/${assetId}/timeline`);
}

const ASSET_EVENT_TYPES = [
  'INSTALL',
  'REPLACE',
  'INSPECTION',
  'ADJUSTMENT',
  'CLEANING',
  'FAILURE',
  'NOTE',
] as const;

export type AssetEventType = (typeof ASSET_EVENT_TYPES)[number];

export { ASSET_EVENT_TYPES };

export type CreateAssetEventPayload = {
  eventType: AssetEventType;
  eventDate: string;
  observation?: string | null;
  usefulLifeDays?: number | null;
};

export function createAssetEvent(assetId: string, body: CreateAssetEventPayload) {
  return apiPost<AssetEventWriteResponse>(`/api/sgm/assets/${assetId}/events`, body);
}

export type UpdateAssetEventPayload = {
  eventType?: AssetEventType;
  eventDate?: string;
  observation?: string | null;
  usefulLifeDays?: number | null;
};

export function updateAssetEvent(eventId: string, body: UpdateAssetEventPayload) {
  return apiPut<AssetEventWriteResponse>(`/api/sgm/asset-events/${eventId}`, body);
}

export function deleteAssetEvent(eventId: string) {
  return apiDelete<{ success: boolean }>(`/api/sgm/asset-events/${eventId}`);
}

export async function linkVisualPointToAsset(visualPointId: string, assetNodeId: string) {
  const response = await fetch(`/api/sgm/visual-points/${visualPointId}/link-asset`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetNodeId }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return (await response.json()) as import('@/types/sgm-api').VisualPoint;
}

export async function createAssetFromVisualPoint(
  visualPointId: string,
  payload: {
    name: string;
    nodeType: string;
    description?: string | null;
    parentId?: string | null;
  }
) {
  const response = await fetch(`/api/sgm/visual-points/${visualPointId}/create-asset`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return (await response.json()) as import('@/types/sgm-api').CreateAssetFromVisualPointResponse;
}

export async function unlinkVisualPointFromAsset(visualPointId: string) {
  const response = await fetch(`/api/sgm/visual-points/${visualPointId}/unlink-asset`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return (await response.json()) as import('@/types/sgm-api').VisualPoint;
}

export function getSiteHealth() {
  return apiGet<SiteHealthResponse>('/api/sgm/sites/health');
}
