/**
 * Smoke test mínimo contra a API em execução.
 * Defina `SMOKE_BASE_URL` (ex.: http://127.0.0.1:3333) ou use PORT no .env.
 */
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT ?? "3333";
const base = (process.env.SMOKE_BASE_URL ?? `http://127.0.0.1:${port}`).replace(/\/$/, "");

type Step = { name: string; ok: boolean; detail: string };

async function getJson(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function main(): Promise<void> {
  const steps: Step[] = [];

  const healthUrl = `${base}/api/health`;
  const hRes = await fetch(healthUrl);
  const hBody = await getJson(hRes);
  const healthOk = hRes.ok && typeof hBody === "object" && hBody !== null && "ok" in hBody;
  steps.push({
    name: `GET /api/health`,
    ok: Boolean(healthOk),
    detail: `${hRes.status} ${JSON.stringify(hBody).slice(0, 200)}`,
  });

  const meRes = await fetch(`${base}/api/auth/me`, { credentials: "include" });
  const meBody = await getJson(meRes);
  const meCoherent = meRes.status === 401;
  steps.push({
    name: `GET /api/auth/me (sem sessão → 401)`,
    ok: meCoherent,
    detail: `${meRes.status} ${JSON.stringify(meBody).slice(0, 200)}`,
  });

  const machRes = await fetch(`${base}/api/sgm/machines`, { credentials: "include" });
  const machBody = await getJson(machRes);
  const machCoherent = machRes.status === 401;
  steps.push({
    name: `GET /api/sgm/machines (sem sessão → 401)`,
    ok: machCoherent,
    detail: `${machRes.status} ${JSON.stringify(machBody).slice(0, 200)}`,
  });

  const legacy = await fetch(`${base}/health`);
  steps.push({
    name: `GET /health`,
    ok: legacy.ok,
    detail: String(legacy.status),
  });

  for (const s of steps) {
    const mark = s.ok ? "OK" : "FAIL";
    console.log(`[${mark}] ${s.name} — ${s.detail}`);
  }

  const allOk = steps.every((s) => s.ok);
  if (!allOk) {
    process.exit(1);
  }
  console.log("Smoke: all steps passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
