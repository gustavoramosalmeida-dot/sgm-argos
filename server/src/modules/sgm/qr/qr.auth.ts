import type { NextFunction, Request, Response } from "express";
import { applySgmUserFromRequest } from "../../auth/auth.session";

/** Middleware do resolver público /q: preenche req.sgmUser se houver JWT (cookie ou Bearer). */
export function optionalSgmJwt(req: Request, _res: Response, next: NextFunction): void {
  applySgmUserFromRequest(req);
  next();
}
