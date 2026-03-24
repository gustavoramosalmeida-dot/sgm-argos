import type { NextFunction, Request, Response } from "express";
import { applySgmUserFromRequest } from "./auth.session";

/** Exige sessão válida (JWT em cookie ou Bearer) para rotas /api/sgm. */
export function requireSgmApiAuth(req: Request, res: Response, next: NextFunction): void {
  applySgmUserFromRequest(req);
  if (!req.sgmUser?.id) {
    res.status(401).json({
      message: "Faça login para continuar",
      code: "UNAUTHORIZED",
    });
    return;
  }
  next();
}
