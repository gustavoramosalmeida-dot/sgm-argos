import { apiGet } from "@/lib/api";
import type { VisualPoint, VisualPointsResponse } from "@/types/sgm-api";

export type CreateVisualPointPayload = {
  x: number;
  y: number;
  label?: string;
};

export type UpdateVisualPointPayload = {
  x?: number;
  y?: number;
  label?: string;
};

export function listMachineVisualPoints(machineId: string) {
  return apiGet<VisualPointsResponse>(`/api/sgm/machines/${machineId}/visual-points`);
}

export async function createMachineVisualPoint(
  machineId: string,
  payload: CreateVisualPointPayload
): Promise<VisualPoint> {
  const response = await fetch(`/api/sgm/machines/${machineId}/visual-points`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return (await response.json()) as VisualPoint;
}

export async function updateVisualPoint(
  visualPointId: string,
  payload: UpdateVisualPointPayload
): Promise<VisualPoint> {
  const response = await fetch(`/api/sgm/visual-points/${visualPointId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return (await response.json()) as VisualPoint;
}

export async function deleteVisualPoint(visualPointId: string): Promise<{ id: string }> {
  const response = await fetch(`/api/sgm/visual-points/${visualPointId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return (await response.json()) as { id: string };
}

