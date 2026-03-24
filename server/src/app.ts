import path from "path";
import { readFileSync } from "fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { notFoundMiddleware } from "./middlewares/not-found";
import { errorHandlerMiddleware } from "./middlewares/error-handler";
import { checkDbConnection, pingDatabase } from "./config/db";
import { authRouter } from "./modules/auth/auth.routes";
import { sgmRouter } from "./modules/sgm/sgm.routes";
import { optionalSgmJwt } from "./modules/sgm/qr/qr.auth";
import { qrPublicResolve } from "./modules/sgm/qr/qr.public-resolver";

const app = express();

app.set("trust proxy", env.trustProxy);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

function getAppVersion(): string {
  try {
    const raw = readFileSync(path.join(process.cwd(), "package.json"), "utf8");
    return (JSON.parse(raw) as { version?: string }).version ?? "unknown";
  } catch {
    return "unknown";
  }
}

app.use(
  "/api/sgm/uploads",
  express.static(path.join(process.cwd(), "uploads"), { index: false })
);

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "sgm-api",
    mode: env.nodeEnv,
  });
});

app.get("/health/db", async (_req, res) => {
  const ok = await checkDbConnection();
  res.status(ok ? 200 : 500).json({
    ok,
    database: ok ? "up" : "down",
  });
});

/**
 * Saúde agregada (API + DB). Mantém `/health` como liveness simples.
 * DB indisponível: HTTP 503, corpo indica `status: "degraded"`.
 */
app.get("/api/health", async (_req, res) => {
  const ping = await pingDatabase();
  const version = getAppVersion();
  const payload = {
    ok: ping.ok,
    status: ping.ok ? "ok" : "degraded",
    service: "sgm-api",
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    version,
    database: ping.ok
      ? { status: "up" as const }
      : { status: "down" as const, error: ping.error ?? "unknown" },
  };
  res.status(ping.ok ? 200 : 503).json(payload);
});

app.get("/q/:publicCode", optionalSgmJwt, qrPublicResolve);

app.use("/api/auth", authRouter);
app.use("/api/sgm", sgmRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export { app };
