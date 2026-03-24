import type { Request } from "express";
import { env } from "./env";

/** URL base pública para links retornados ao cliente (uploads, etc.). */
export function getPublicBaseUrl(req: Request): string {
  if (env.publicBaseUrl) return env.publicBaseUrl;
  return `${req.protocol}://${req.get("host") ?? "localhost"}`;
}
