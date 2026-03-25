import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3333"),
  NODE_ENV: z.string().default("development"),
  /** Uma origem ou lista separada por vírgula (ex.: https://app.exemplo.com,https://www.exemplo.com) */
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  /**
   * Confiança no proxy (Nginx/ALB) para `req.ip`, cookies `secure`, etc.
   * Ex.: `1` = um hop; `true` = mesmo que 1; vazio = sem trust proxy.
   */
  TRUST_PROXY: z.string().optional(),
  /**
   * Se `1`/`true`, o processo encerra na subida se o PostgreSQL não responder (recomendado em produção).
   */
  REQUIRE_DB_ON_STARTUP: z.string().optional(),
  /** URL completa do Postgres (opcional). Se definida, tem prioridade sobre PGHOST/PGPORT/... */
  DATABASE_URL: z.string().optional(),
  /** Máximo de clientes no pool (default 20). */
  PG_POOL_MAX: z.string().optional(),
  /** Base pública da API (ex.: https://api.exemplo.com). Se vazio, usa Host da requisição. */
  PUBLIC_BASE_URL: z.string().optional(),
  /** Base do app web para redirects do resolver /q/:code (ex.: http://localhost:5173). Default: CORS_ORIGIN. */
  WEB_APP_BASE_URL: z.string().optional(),
  /** Caminho de login no app (redirect pós-scan). Default: /login */
  WEB_APP_LOGIN_PATH: z.string().default("/login"),
  /** Secret JWT (HS256) para cookie HttpOnly de sessão web e /q. Obrigatório em produção. */
  JWT_SECRET: z.string().optional(),
  /**
   * Lista opcional de user ids (claim `sub`) autorizados a ver detalhe do ativo via /q.
   * Vazio = qualquer usuário autenticado.
   */
  QR_RESOLVER_ALLOWED_USER_IDS: z.string().optional(),
  /** "1" ativa logs [QR DEBUG] no /q; em development liga por omissão (use "0" para silenciar). */
  SGM_QR_DEBUG: z.string().optional(),
  /**
   * Cookie `sgm_access_token`: flag `Secure` (só enviado em HTTPS).
   * Em HTTP (ex.: acesso por IP) use `0` ou omita. Com HTTPS na frente, defina `1`.
   */
  SGM_AUTH_COOKIE_SECURE: z.string().optional(),

  /** Em EC2 com Postgres local, use 127.0.0.1 ou defina DATABASE_URL. */
  PGHOST: z.string().default("127.0.0.1"),
  PGPORT: z.string().default("5432"),
  PGDATABASE: z.string().default("sgm"),
  PGUSER: z.string().default("postgres"),
  PGPASSWORD: z.string().default("postgres"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

const rawEnv = parsed.data;

const publicBase =
  rawEnv.PUBLIC_BASE_URL != null && String(rawEnv.PUBLIC_BASE_URL).trim() !== ""
    ? String(rawEnv.PUBLIC_BASE_URL).trim().replace(/\/$/, "")
    : undefined;

const webAppBase =
  rawEnv.WEB_APP_BASE_URL != null && String(rawEnv.WEB_APP_BASE_URL).trim() !== ""
    ? String(rawEnv.WEB_APP_BASE_URL).trim().replace(/\/$/, "")
    : undefined;

const jwtSecret =
  rawEnv.JWT_SECRET != null && String(rawEnv.JWT_SECRET).trim() !== ""
    ? String(rawEnv.JWT_SECRET).trim()
    : undefined;

const qrResolverAllowedUserIds =
  rawEnv.QR_RESOLVER_ALLOWED_USER_IDS != null && String(rawEnv.QR_RESOLVER_ALLOWED_USER_IDS).trim() !== ""
    ? String(rawEnv.QR_RESOLVER_ALLOWED_USER_IDS)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

const qrResolverDebugLogs =
  rawEnv.SGM_QR_DEBUG === "1" ||
  (rawEnv.NODE_ENV === "development" && rawEnv.SGM_QR_DEBUG !== "0");

const corsOrigins = rawEnv.CORS_ORIGIN.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const databaseUrl =
  rawEnv.DATABASE_URL != null && String(rawEnv.DATABASE_URL).trim() !== ""
    ? String(rawEnv.DATABASE_URL).trim()
    : undefined;

const pgPoolMax = (() => {
  const raw = rawEnv.PG_POOL_MAX;
  if (raw == null || String(raw).trim() === "") return 20;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 20;
})();

const trustProxy: boolean | number | string =
  rawEnv.TRUST_PROXY == null || String(rawEnv.TRUST_PROXY).trim() === ""
    ? false
    : (() => {
        const t = String(rawEnv.TRUST_PROXY).trim().toLowerCase();
        if (t === "true" || t === "1" || t === "yes") return 1;
        const n = Number(t);
        return Number.isFinite(n) && n >= 0 ? n : 1;
      })();

const requireDbOnStartup =
  rawEnv.REQUIRE_DB_ON_STARTUP === "1" ||
  String(rawEnv.REQUIRE_DB_ON_STARTUP ?? "")
    .trim()
    .toLowerCase() === "true";

/** `Secure` no cookie JWT; omitido/`0` = HTTP; `1` = HTTPS. */
const authCookieSecure = (() => {
  const raw = rawEnv.SGM_AUTH_COOKIE_SECURE;
  if (raw == null || String(raw).trim() === "") return false;
  const t = String(raw).trim().toLowerCase();
  if (t === "1" || t === "true" || t === "yes") return true;
  return false;
})();

export const env = {
  port: Number(rawEnv.PORT),
  nodeEnv: rawEnv.NODE_ENV,
  publicBaseUrl: publicBase,
  webAppBaseUrl: webAppBase,
  webAppLoginPath: rawEnv.WEB_APP_LOGIN_PATH.startsWith("/")
    ? rawEnv.WEB_APP_LOGIN_PATH
    : `/${rawEnv.WEB_APP_LOGIN_PATH}`,
  jwtSecret,
  qrResolverAllowedUserIds,
  /** Logs temporários do resolver QR; desligar com SGM_QR_DEBUG=0 em dev ou remover após diagnóstico. */
  qrResolverDebugLogs,
  isProduction: rawEnv.NODE_ENV === "production",
  isDevelopment: rawEnv.NODE_ENV === "development",
  /** Cookie `sgm_access_token`: usar `Secure` (definir `SGM_AUTH_COOKIE_SECURE=1` atrás de HTTPS). */
  authCookieSecure,
  /** Primeira origem CORS (compat); preferir `corsOrigins`. */
  corsOrigin: corsOrigins[0] ?? "http://localhost:5173",
  corsOrigins,
  trustProxy,
  requireDbOnStartup,
  databaseUrl,
  pg: {
    host: rawEnv.PGHOST,
    port: Number(rawEnv.PGPORT),
    database: rawEnv.PGDATABASE,
    user: rawEnv.PGUSER,
    password: rawEnv.PGPASSWORD,
    poolMax: pgPoolMax,
  },
};
