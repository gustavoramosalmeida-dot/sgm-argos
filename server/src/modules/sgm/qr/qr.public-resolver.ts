import { Request, Response } from "express";
import { env } from "../../../config/env";
import { resolveWebAppOrigin } from "../../../config/web-app-origin";
import { logger } from "../../../utils/logger";
import { findByPublicCode, insertQrResolveAudit } from "./qr.repository";
import { isValidPublicCodeFormat } from "./qr.public-code";
import { canResolveAssetDetail } from "./qr.policy";

function buildLoginRedirect(req: Request, publicCode: string): string {
  const origin = resolveWebAppOrigin(req);
  /** Mesma origem do SPA (ex.: :5173) para o cookie de login ser enviado no GET /q após retorno. */
  const returnUrl = `${origin}/q/${encodeURIComponent(publicCode)}`;
  const loginPath = env.webAppLoginPath.startsWith("/") ? env.webAppLoginPath : `/${env.webAppLoginPath}`;
  const u = new URL(loginPath, `${origin}/`);
  u.searchParams.set("returnUrl", returnUrl);
  return u.toString();
}

function buildAssetDeepLink(req: Request, machineId: string | null, assetId: string): string {
  const origin = resolveWebAppOrigin(req);
  if (machineId) {
    const u = new URL(`/machines/${machineId}`, `${origin}/`);
    u.searchParams.set("assetId", assetId);
    return u.toString();
  }
  const u = new URL("/plants", `${origin}/`);
  u.searchParams.set("assetId", assetId);
  return u.toString();
}

function auditMeta(req: Request): Record<string, unknown> {
  return {
    userAgent: req.get("user-agent") ?? null,
    ip: req.ip,
  };
}

export async function qrPublicResolve(req: Request, res: Response): Promise<void> {
  const raw = String(req.params.publicCode ?? "").trim();
  const publicCode = raw.toUpperCase();

  if (!isValidPublicCodeFormat(publicCode)) {
    await insertQrResolveAudit({
      publicCode: raw || "INVALID",
      assetId: null,
      userId: null,
      outcome: "not_found",
      requestOrigin: req.get("origin") ?? req.get("referer") ?? null,
      selectedContext: null,
      metadata: auditMeta(req),
    });
    res.status(404).json({ message: "Código QR não encontrado", code: "QR_NOT_FOUND" });
    return;
  }

  const row = await findByPublicCode(publicCode);
  if (env.qrResolverDebugLogs) {
    logger.info(`[QR DEBUG] resolver lookup done publicCode=${publicCode} row=${row ? "found" : "null"}`);
  }
  if (!row) {
    await insertQrResolveAudit({
      publicCode,
      assetId: null,
      userId: null,
      outcome: "not_found",
      requestOrigin: req.get("origin") ?? req.get("referer") ?? null,
      selectedContext: null,
      metadata: auditMeta(req),
    });
    res.status(404).json({ message: "Código QR não encontrado", code: "QR_NOT_FOUND" });
    return;
  }

  const userId = req.sgmUser?.id ?? null;

  if (!userId) {
    await insertQrResolveAudit({
      publicCode,
      assetId: row.assetId,
      userId: null,
      outcome: "unauthenticated",
      requestOrigin: req.get("origin") ?? req.get("referer") ?? null,
      selectedContext: null,
      metadata: auditMeta(req),
    });
    const loc = buildLoginRedirect(req, publicCode);
    if (env.qrResolverDebugLogs) {
      logger.info(`[QR DEBUG] redirectTo=${loc} (unauthenticated)`);
    }
    res.redirect(302, loc);
    return;
  }

  if (!canResolveAssetDetail(userId)) {
    await insertQrResolveAudit({
      publicCode,
      assetId: row.assetId,
      userId,
      outcome: "unauthorized",
      requestOrigin: req.get("origin") ?? req.get("referer") ?? null,
      selectedContext: null,
      metadata: auditMeta(req),
    });
    res.status(403).json({ message: "Acesso negado", code: "QR_UNAUTHORIZED" });
    return;
  }

  await insertQrResolveAudit({
    publicCode,
    assetId: row.assetId,
    userId,
    outcome: "resolved",
    requestOrigin: req.get("origin") ?? req.get("referer") ?? null,
    selectedContext: null,
    metadata: auditMeta(req),
  });

  const loc = buildAssetDeepLink(req, row.machineId, row.assetId);
  if (env.qrResolverDebugLogs) {
    logger.info(`[QR DEBUG] publicCode=${publicCode}`);
    logger.info(`[QR DEBUG] assetId=${row.assetId}`);
    logger.info(`[QR DEBUG] machineId=${row.machineId ?? "null"}`);
    logger.info(`[QR DEBUG] redirectTo=${loc}`);
  }
  res.redirect(302, loc);
}
