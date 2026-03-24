import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { ApiError } from "../../utils/api-error";
import { SGM_ACCESS_TOKEN_COOKIE } from "./auth.cookies";
import { findActiveUserById } from "./auth.repository";
import { applySgmUserFromRequest } from "./auth.session";
import { loginWithUsernamePassword, signAccessToken } from "./auth.service";
import { toAuthUserPublic } from "./auth.types";

const accessCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  secure: env.isProduction,
};

export async function postLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as { username?: unknown; password?: unknown };
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!username.trim() || !password) {
      res.status(400).json({ message: "Utilizador e senha são obrigatórios" });
      return;
    }
    const user = await loginWithUsernamePassword(username, password);
    const token = signAccessToken(user.id);
    res.cookie(SGM_ACCESS_TOKEN_COOKIE, token, accessCookieOptions);
    res.json({ user });
  } catch (e) {
    if (e instanceof ApiError) {
      res.status(e.statusCode).json({ message: e.message });
      return;
    }
    next(e);
  }
}

export function postLogout(_req: Request, res: Response): void {
  res.clearCookie(SGM_ACCESS_TOKEN_COOKIE, { path: "/" });
  res.json({ ok: true });
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    applySgmUserFromRequest(req);
    if (!req.sgmUser?.id) {
      res.status(401).json({ message: "Não autenticado", code: "UNAUTHORIZED" });
      return;
    }
    const row = await findActiveUserById(req.sgmUser.id);
    if (!row) {
      res.clearCookie(SGM_ACCESS_TOKEN_COOKIE, { path: "/" });
      res.status(401).json({ message: "Sessão expirada", code: "UNAUTHORIZED" });
      return;
    }
    res.json({ user: toAuthUserPublic(row) });
  } catch (e) {
    next(e);
  }
}
