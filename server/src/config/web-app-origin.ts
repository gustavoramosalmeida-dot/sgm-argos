import type { Request } from "express";
import { env } from "./env";
import { getPublicBaseUrl } from "./public-url";

/**
 * Origem do SPA para links públicos (QR /q, redirects pós-login).
 * Prioriza WEB_APP_BASE_URL e CORS_ORIGIN sobre o Host da API.
 */
export function resolveWebAppOrigin(req: Request): string {
  if (env.webAppBaseUrl) {
    return env.webAppBaseUrl.replace(/\/$/, "");
  }
  const co = env.corsOrigin.trim();
  if (co && co !== "*" && !co.includes(",")) {
    return co.replace(/\/$/, "");
  }
  return getPublicBaseUrl(req).replace(/\/$/, "");
}
