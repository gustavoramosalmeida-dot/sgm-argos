import path from "path";
import { unlink } from "fs/promises";
import { Request, Response, NextFunction } from "express";
import { getPublicBaseUrl } from "../../config/public-url";
import {
  listMachinesQuerySchema,
  qrInventoryQuerySchema,
  timelineQuerySchema,
  linkVisualPointSchema,
  createAssetFromVisualPointSchema,
  parseVisualPointIdParam,
  parseAssetIdParam,
  parseSiteIdParam,
  createMachineBodySchema,
  updateMachineBodySchema,
  parseMachineIdParam,
  parseEventIdParam,
  createAssetEventBodySchema,
  updateAssetEventBodySchema,
} from "./sgm.schemas";
import {
  getSiteHealthService,
  getSitesService,
  getSiteByIdService,
  listMachinesService,
  getMachineByIdService,
  getMachineQrInventoryService,
  getMachineTimelineService,
  getAssetBreadcrumbsService,
  getAssetTreeService,
  getAssetLastEventService,
  getMachineVisualPointsService,
  getAssetSummaryService,
  linkVisualPointToAssetService,
  createAssetFromVisualPointService,
  unlinkVisualPointFromAssetService,
  getAssetTimelineService,
  createMachineService,
  updateMachineService,
  uploadMachinePhotoService,
  createAssetEventService,
  updateAssetEventService,
  deleteAssetEventService,
} from "./sgm.service";

export async function getSiteHealth(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const items = await getSiteHealthService();
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function listSites(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const items = await getSitesService();
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function getSiteById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const siteId = req.params.siteId as string;
    const item = await getSiteByIdService(siteId);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function listMachines(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = listMachinesQuerySchema.parse(req.query);
    const items = await listMachinesService(parsed);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function getMachineById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const machineId = req.params.machineId as string;
    const item = await getMachineByIdService(machineId);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createMachine(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsedSite = parseSiteIdParam(req.params.siteId as string);
    if (!parsedSite.ok) {
      res.status(400).json({ message: parsedSite.message });
      return;
    }
    const body = createMachineBodySchema.parse(req.body);
    const item = await createMachineService(parsedSite.siteId, body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateMachine(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = parseMachineIdParam(req.params.machineId as string);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    const body = updateMachineBodySchema.parse(req.body);
    const item = await updateMachineService(parsed.machineId, body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function uploadMachinePhoto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = parseMachineIdParam(req.params.machineId as string);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: "file is required (field name: file)" });
      return;
    }
    const filename = path.basename(req.file.path);
    const base = getPublicBaseUrl(req);
    const imageUrl = `${base}/api/sgm/uploads/machine-photos/${parsed.machineId}/${filename}`;
    try {
      const item = await uploadMachinePhotoService(parsed.machineId, imageUrl);
      res.json(item);
    } catch (err) {
      await unlink(req.file.path).catch(() => {});
      next(err);
    }
  } catch (err) {
    next(err);
  }
}

export async function getMachineQrInventory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const machineId = req.params.machineId as string;
    const parsed = qrInventoryQuerySchema.parse(req.query);
    const result = await getMachineQrInventoryService(machineId, parsed);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMachineTimeline(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const machineId = req.params.machineId as string;
    const parsed = timelineQuerySchema.parse(req.query);
    const result = await getMachineTimelineService(machineId, parsed);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAssetBreadcrumbs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const assetId = req.params.assetId as string;
    const result = await getAssetBreadcrumbsService(assetId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAssetTree(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const assetId = req.params.assetId as string;
    const result = await getAssetTreeService(assetId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAssetLastEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const assetId = req.params.assetId as string;
    const result = await getAssetLastEventService(assetId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMachineVisualPoints(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const machineId = req.params.machineId as string;
    const result = await getMachineVisualPointsService(machineId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAssetSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const assetId = req.params.assetId as string;
    const item = await getAssetSummaryService(assetId);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function getAssetTimeline(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = parseAssetIdParam(req.params.assetId as string);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    const result = await getAssetTimelineService(parsed.assetId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createAssetEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = parseAssetIdParam(req.params.assetId as string);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    const body = createAssetEventBodySchema.parse(req.body);
    const item = await createAssetEventService(parsed.assetId, body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateAssetEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = parseEventIdParam(req.params.eventId as string);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    const body = updateAssetEventBodySchema.parse(req.body);
    const item = await updateAssetEventService(parsed.eventId, body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteAssetEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = parseEventIdParam(req.params.eventId as string);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    const result = await deleteAssetEventService(parsed.eventId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function linkVisualPointToAsset(
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
    const body = linkVisualPointSchema.parse(req.body);
    const item = await linkVisualPointToAssetService(parsed.visualPointId, body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createAssetFromVisualPoint(
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
    const body = createAssetFromVisualPointSchema.parse(req.body);
    const item = await createAssetFromVisualPointService(parsed.visualPointId, body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function unlinkVisualPointFromAsset(
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
    const item = await unlinkVisualPointFromAssetService(parsed.visualPointId);
    res.json(item);
  } catch (err) {
    next(err);
  }
}
