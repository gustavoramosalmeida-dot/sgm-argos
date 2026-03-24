import { Router } from "express";
import { parseMachineIdParam } from "./sgm.schemas";
import { machinePhotoUpload } from "./sgm.upload";
import {
  getSiteHealth,
  listSites,
  getSiteById,
  createMachine,
  listMachines,
  getMachineById,
  updateMachine,
  uploadMachinePhoto,
  getMachineQrInventory,
  getMachineTimeline,
  getAssetBreadcrumbs,
  getAssetTree,
  getAssetLastEvent,
  getAssetSummary,
  getAssetTimeline,
  createAssetEvent,
  updateAssetEvent,
  deleteAssetEvent,
  linkVisualPointToAsset,
  createAssetFromVisualPoint,
  unlinkVisualPointFromAsset,
} from "./sgm.controller";
import {
  getMachineVisualPoints as getMachineVisualPointsValidated,
  createMachineVisualPoint,
  updateVisualPoint,
  deleteVisualPoint,
} from "./sgm.visual-points.controller";
import { requireSgmApiAuth } from "../auth/auth.middleware";
import { qrAssetRouter } from "./qr/qr.routes";

export const sgmRouter = Router();

sgmRouter.use(requireSgmApiAuth);

sgmRouter.use(qrAssetRouter);

sgmRouter.get("/sites/health", getSiteHealth);
sgmRouter.get("/sites", listSites);
sgmRouter.get("/sites/:siteId", getSiteById);
sgmRouter.post("/sites/:siteId/machines", createMachine);
sgmRouter.get("/machines", listMachines);
sgmRouter.put("/machines/:machineId", updateMachine);
sgmRouter.post(
  "/machines/:machineId/photo",
  (req, res, next) => {
    const parsed = parseMachineIdParam(req.params.machineId as string);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    next();
  },
  machinePhotoUpload.single("file"),
  uploadMachinePhoto
);
sgmRouter.get("/machines/:machineId", getMachineById);
sgmRouter.get("/machines/:machineId/qr-inventory", getMachineQrInventory);
sgmRouter.get("/machines/:machineId/timeline", getMachineTimeline);
sgmRouter.get("/machines/:machineId/visual-points", getMachineVisualPointsValidated);
sgmRouter.post("/machines/:machineId/visual-points", createMachineVisualPoint);
sgmRouter.put("/visual-points/:id", updateVisualPoint);
sgmRouter.delete("/visual-points/:id", deleteVisualPoint);
sgmRouter.put("/visual-points/:id/link-asset", linkVisualPointToAsset);
sgmRouter.put("/visual-points/:id/unlink-asset", unlinkVisualPointFromAsset);
sgmRouter.post("/visual-points/:id/create-asset", createAssetFromVisualPoint);
sgmRouter.get("/assets/:assetId/breadcrumbs", getAssetBreadcrumbs);
sgmRouter.get("/assets/:assetId/tree", getAssetTree);
sgmRouter.get("/assets/:assetId/last-event", getAssetLastEvent);
sgmRouter.get("/assets/:assetId", getAssetSummary);
sgmRouter.get("/assets/:assetId/timeline", getAssetTimeline);
sgmRouter.post("/assets/:assetId/events", createAssetEvent);
sgmRouter.put("/asset-events/:eventId", updateAssetEvent);
sgmRouter.delete("/asset-events/:eventId", deleteAssetEvent);
