import type { Request } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { SGM_ACCESS_TOKEN_COOKIE } from "./auth.cookies";

function getCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  const parts = raw.split(";").map((s) => s.trim());
  const prefix = `${name}=`;
  for (const p of parts) {
    if (p.startsWith(prefix)) {
      const v = p.slice(prefix.length);
      try {
        return decodeURIComponent(v);
      } catch {
        return v;
      }
    }
  }
  return undefined;
}

/**
 * Preenche `req.sgmUser` a partir de Bearer ou cookie JWT, ou (só dev sem JWT_SECRET) header X-SGM-User-Id.
 */
export function applySgmUserFromRequest(req: Request): void {
  if (env.jwtSecret) {
    const h = req.headers.authorization;
    if (h?.startsWith("Bearer ")) {
      try {
        const payload = jwt.verify(h.slice(7), env.jwtSecret) as { sub?: string };
        if (payload.sub) req.sgmUser = { id: String(payload.sub) };
      } catch {
        /* inválido */
      }
    }
    if (!req.sgmUser) {
      const fromCookie = getCookie(req, SGM_ACCESS_TOKEN_COOKIE);
      if (fromCookie) {
        try {
          const payload = jwt.verify(fromCookie, env.jwtSecret) as { sub?: string };
          if (payload.sub) req.sgmUser = { id: String(payload.sub) };
        } catch {
          /* inválido */
        }
      }
    }
    return;
  }
  if (env.isDevelopment) {
    const devId = req.get("x-sgm-user-id")?.trim();
    if (devId) req.sgmUser = { id: devId };
  }
}
