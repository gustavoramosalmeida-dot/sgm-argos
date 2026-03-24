import type { Request } from "express";
import { resolveWebAppOrigin } from "../../../config/web-app-origin";
import { ApiError } from "../../../utils/api-error";
import {
  ensureAssetPublicCode,
  getAssetQrRow,
  isAssetEligibleForOfficialQr,
} from "./qr.repository";
import { renderQrPngBuffer, renderQrSvg } from "./qr.render";
import type { AssetQrMetadata, EnsureAssetQrResult } from "./qr.types";

export function buildPublicQrUrls(
  req: Request,
  assetId: string,
  publicCode: string
): { qrValue: string; resolvedUrl: string; svgUrl: string; pngUrl: string } {
  const base = resolveWebAppOrigin(req).replace(/\/$/, "");
  const resolvedUrl = `${base}/q/${publicCode}`;
  return {
    qrValue: resolvedUrl,
    resolvedUrl,
    svgUrl: `${base}/api/sgm/assets/${assetId}/qr.svg`,
    pngUrl: `${base}/api/sgm/assets/${assetId}/qr.png`,
  };
}

export async function ensureAssetQrService(assetId: string, req: Request): Promise<EnsureAssetQrResult> {
  const ensured = await ensureAssetPublicCode(assetId);
  const urls = buildPublicQrUrls(req, assetId, ensured.publicCode);
  return {
    assetId,
    publicCode: ensured.publicCode,
    qrValue: urls.qrValue,
    resolvedUrl: urls.resolvedUrl,
    svgUrl: urls.svgUrl,
    pngUrl: urls.pngUrl,
    generatedAt: ensured.qrGeneratedAt.toISOString(),
  };
}

export async function getAssetQrMetadataService(assetId: string, req: Request): Promise<AssetQrMetadata> {
  const row = await getAssetQrRow(assetId);
  if (!row) {
    throw ApiError.notFound("Ativo não encontrado");
  }
  if (!isAssetEligibleForOfficialQr(row.nodeKind)) {
    throw ApiError.badRequest("Ativo não elegível para QR oficial");
  }
  if (!row.publicCode) {
    return {
      assetId,
      publicCode: null,
      qrValue: null,
      resolvedUrl: null,
      svgUrl: null,
      pngUrl: null,
      generatedAt: null,
      status: "not_generated",
    };
  }
  const urls = buildPublicQrUrls(req, assetId, row.publicCode);
  return {
    assetId,
    publicCode: row.publicCode,
    qrValue: urls.qrValue,
    resolvedUrl: urls.resolvedUrl,
    svgUrl: urls.svgUrl,
    pngUrl: urls.pngUrl,
    generatedAt: row.qrGeneratedAt ? row.qrGeneratedAt.toISOString() : null,
    status: "active",
  };
}

export async function getQrSvgService(assetId: string, req: Request): Promise<string> {
  const meta = await getAssetQrMetadataService(assetId, req);
  if (meta.status !== "active" || !meta.qrValue) {
    throw ApiError.notFound("QR não gerado para este ativo");
  }
  return renderQrSvg(meta.qrValue);
}

export async function getQrPngService(assetId: string, req: Request): Promise<Buffer> {
  const meta = await getAssetQrMetadataService(assetId, req);
  if (meta.status !== "active" || !meta.qrValue) {
    throw ApiError.notFound("QR não gerado para este ativo");
  }
  return renderQrPngBuffer(meta.qrValue);
}
