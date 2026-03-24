import { Router } from "express";
import {
  getAssetQr,
  getAssetQrPng,
  getAssetQrSvg,
  postEnsureAssetQr,
} from "./qr.controller";

/** Rotas de gestão do QR por ativo (mesmo padrão do restante do SGM: sem JWT obrigatório). */
export const qrAssetRouter = Router();

qrAssetRouter.post("/assets/:assetId/qr/ensure", postEnsureAssetQr);
qrAssetRouter.get("/assets/:assetId/qr", getAssetQr);
qrAssetRouter.get("/assets/:assetId/qr.svg", getAssetQrSvg);
qrAssetRouter.get("/assets/:assetId/qr.png", getAssetQrPng);
