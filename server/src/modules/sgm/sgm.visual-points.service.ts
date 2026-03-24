import { ApiError } from "../../utils/api-error";
import type { CreateVisualPointBody, UpdateVisualPointBody } from "./sgm.schemas";
import type { VisualPoint } from "./sgm.types";
import {
  createMachineVisualPointRepo,
  deleteVisualPointRepo,
  listMachineVisualPointsRepo,
  updateVisualPointRepo,
} from "./sgm.visual-points.repository";

export async function listMachineVisualPointsService(
  machineId: string
): Promise<{ machineId: string; items: VisualPoint[] }> {
  const items = await listMachineVisualPointsRepo(machineId);
  return { machineId, items };
}

export async function createMachineVisualPointService(
  machineId: string,
  body: CreateVisualPointBody
): Promise<VisualPoint> {
  return createMachineVisualPointRepo(machineId, body);
}

export async function updateVisualPointService(
  visualPointId: string,
  body: UpdateVisualPointBody
): Promise<VisualPoint> {
  const updated = await updateVisualPointRepo(visualPointId, body);
  if (!updated) throw new ApiError(404, "Visual point not found");
  return updated;
}

export async function deleteVisualPointService(
  visualPointId: string
): Promise<{ id: string }> {
  const ok = await deleteVisualPointRepo(visualPointId);
  if (!ok) throw new ApiError(404, "Visual point not found");
  return { id: visualPointId };
}

