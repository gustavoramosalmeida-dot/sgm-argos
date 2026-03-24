import { Request, Response, NextFunction } from "express";
import { parseAssetIdParam } from "../sgm.schemas";
import {
  ensureAssetQrService,
  getAssetQrMetadataService,
  getQrPngService,
  getQrSvgService,
} from "./qr.service";

export async function postEnsureAssetQr(
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
    const body = await ensureAssetQrService(parsed.assetId, req);
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function getAssetQr(
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
    const body = await getAssetQrMetadataService(parsed.assetId, req);
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

export async function getAssetQrSvg(
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
    const svg = await getQrSvgService(parsed.assetId, req);
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.status(200).send(svg);
  } catch (err) {
    next(err);
  }
}

export async function getAssetQrPng(
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
    const buf = await getQrPngService(parsed.assetId, req);
    res.setHeader("Content-Type", "image/png");
    res.status(200).send(buf);
  } catch (err) {
    next(err);
  }
}
