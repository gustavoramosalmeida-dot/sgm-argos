import { Request, Response, NextFunction } from "express";
import {
  createVisualPointSchema,
  parseMachineIdParam,
  parseVisualPointIdParam,
  updateVisualPointSchema,
} from "./sgm.schemas";
import {
  createMachineVisualPointService,
  deleteVisualPointService,
  listMachineVisualPointsService,
  updateVisualPointService,
} from "./sgm.visual-points.service";

export async function getMachineVisualPoints(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const machineId = req.params.machineId as string;
    const parsed = parseMachineIdParam(machineId);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    const result = await listMachineVisualPointsService(parsed.machineId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createMachineVisualPoint(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const machineId = req.params.machineId as string;
    const parsed = parseMachineIdParam(machineId);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    const body = createVisualPointSchema.parse(req.body);
    const item = await createMachineVisualPointService(parsed.machineId, body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateVisualPoint(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = parseVisualPointIdParam(req.params.id as string);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    const body = updateVisualPointSchema.parse(req.body);
    const item = await updateVisualPointService(parsed.visualPointId, body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteVisualPoint(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = parseVisualPointIdParam(req.params.id as string);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    const item = await deleteVisualPointService(parsed.visualPointId);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

