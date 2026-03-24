import { app } from "./app";
import { env } from "./config/env";
import { checkSchemaObjects, getDbConnectionLabel, pingDatabase } from "./config/db";
import { logger } from "./utils/logger";

if (env.isProduction && !env.jwtSecret) {
  throw new Error("JWT_SECRET é obrigatório em produção para autenticação web e /q");
}

async function start(): Promise<void> {
  logger.info(
    {
      env: env.nodeEnv,
      port: env.port,
      database: getDbConnectionLabel(),
    },
    "SGM API starting"
  );

  const ping = await pingDatabase();
  if (!ping.ok) {
    logger.error(
      { error: ping.error, requireDbOnStartup: env.requireDbOnStartup },
      "PostgreSQL unavailable at startup"
    );
    if (env.requireDbOnStartup) {
      process.exit(1);
    }
  } else {
    logger.info("PostgreSQL connection OK");
    const schema = await checkSchemaObjects();
    if (schema.ok) {
      logger.info(
        { count: schema.present.length },
        "Schema check: all expected objects present"
      );
    } else {
      logger.warn(
        { missing: schema.missing, presentCount: schema.present.length },
        "Schema check: some objects are missing"
      );
    }
  }

  app.listen(env.port, () => {
    logger.info(
      {
        port: env.port,
        env: env.nodeEnv,
      },
      "SGM API server is listening"
    );
  });
}

start().catch((err) => {
  logger.error(err);
  process.exit(1);
});
