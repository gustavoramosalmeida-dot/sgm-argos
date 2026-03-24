import { Pool, PoolClient, PoolConfig, QueryResultRow } from "pg";
import { env } from "./env";
import { logger } from "../utils/logger";

/** Tabelas e views esperadas pelo schema SGM (checagem mínima). */
export const SGM_SCHEMA_OBJECTS = [
  "sgm_users",
  "asset_nodes",
  "asset_events",
  "asset_visual_layers",
  "asset_visual_points",
  "asset_files",
  "vw_machine_overview",
  "vw_machine_qr_inventory",
  "vw_machine_timeline",
] as const;

function getSafeConnectionLabel(): string {
  const d = env.databaseUrl;
  if (d) {
    try {
      const normalized = d.replace(/^postgres(ql)?:\/\//i, "http://");
      const u = new URL(normalized);
      const db = u.pathname.replace(/^\//, "").split("/")[0] ?? "";
      return `${u.hostname}:${u.port || "5432"}/${db} (DATABASE_URL)`;
    } catch {
      return "DATABASE_URL (formato não reconhecido para log)";
    }
  }
  return `${env.pg.host}:${env.pg.port}/${env.pg.database} (user=${env.pg.user})`;
}

const poolConfig: PoolConfig = {
  max: env.pg.poolMax,
  connectionTimeoutMillis: 15_000,
  idleTimeoutMillis: 30_000,
};

if (env.databaseUrl) {
  poolConfig.connectionString = env.databaseUrl;
} else {
  poolConfig.host = env.pg.host;
  poolConfig.port = env.pg.port;
  poolConfig.database = env.pg.database;
  poolConfig.user = env.pg.user;
  poolConfig.password = env.pg.password;
}

export const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  logger.error("Unexpected error on PostgreSQL client", err);
});

export function getDbConnectionLabel(): string {
  return getSafeConnectionLabel();
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[] }> {
  try {
    const result = await pool.query(text, params);
    return { rows: result.rows as T[] };
  } catch (err) {
    logger.error({ target: getSafeConnectionLabel() }, "Database query error");
    logger.error(err);
    throw err;
  }
}

export async function checkDbConnection(): Promise<boolean> {
  const r = await pingDatabase();
  return r.ok;
}

export async function pingDatabase(): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = await pool.query<{ ok: number }>("SELECT 1 as ok");
    const ok = result.rows[0]?.ok === 1;
    if (!ok) return { ok: false, error: "SELECT 1 não retornou ok" };
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(
      { target: getSafeConnectionLabel(), message },
      "PostgreSQL ping failed"
    );
    return { ok: false, error: message };
  }
}

export type SchemaCheckResult = {
  ok: boolean;
  present: string[];
  missing: string[];
};

export async function checkSchemaObjects(
  expected: readonly string[] = SGM_SCHEMA_OBJECTS
): Promise<SchemaCheckResult> {
  const ping = await pingDatabase();
  if (!ping.ok) {
    return { ok: false, present: [], missing: [...expected] };
  }

  const { rows } = await query<{ table_name: string }>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])`,
    [expected]
  );

  const present = rows.map((r) => r.table_name);
  const set = new Set(present);
  const missing = expected.filter((name) => !set.has(name));
  return {
    ok: missing.length === 0,
    present,
    missing,
  };
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
