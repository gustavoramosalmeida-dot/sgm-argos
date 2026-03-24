/**
 * Verifica ping no PostgreSQL e presença mínima de tabelas/views do schema SGM.
 * Uso: `npm run db:check` (pasta `server/`).
 */
import {
  checkSchemaObjects,
  getDbConnectionLabel,
  pingDatabase,
  pool,
  SGM_SCHEMA_OBJECTS,
} from "../config/db";

async function main(): Promise<void> {
  console.log("Target:", getDbConnectionLabel());
  console.log("Expected objects:", SGM_SCHEMA_OBJECTS.join(", "));

  const ping = await pingDatabase();
  if (!ping.ok) {
    console.error("Falha ao conectar:", ping.error ?? "unknown");
    process.exitCode = 1;
    return;
  }
  console.log("Ping: OK");

  const schema = await checkSchemaObjects();
  if (!schema.ok) {
    console.error("Objetos em falta:", schema.missing.join(", "));
    console.error("Presentes:", schema.present.join(", ") || "(nenhum)");
    process.exitCode = 1;
    return;
  }
  console.log("Schema: OK (" + schema.present.length + " objetos)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end().then(() => {
      process.exit(process.exitCode ?? 0);
    });
  });
