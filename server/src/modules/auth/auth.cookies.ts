import type { CookieOptions } from "express";
import { env } from "../../config/env";

/** Cookie HttpOnly com JWT (HS256); enviado automaticamente em GET /q e em /api/sgm via mesmo site (proxy). */
export const SGM_ACCESS_TOKEN_COOKIE = "sgm_access_token";

const ACCESS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function getSgmAccessCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE_MS,
    secure: env.authCookieSecure,
  };
}

/** Opções para `clearCookie` alinhadas ao `res.cookie` (evita cookie residual se `Secure` divergir). */
export function getSgmAccessCookieClearOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: env.authCookieSecure,
  };
}
