/**
 * Cria o primeiro utilizador web (admin) se ainda não existir.
 *
 * Uso (na pasta server):
 *   SGM_BOOTSTRAP_ADMIN_PASSWORD=... npx ts-node --transpile-only src/scripts/bootstrap-admin.ts
 *
 * Opcional: SGM_BOOTSTRAP_ADMIN_USERNAME (default admin), SGM_BOOTSTRAP_ADMIN_DISPLAY_NAME
 */
import dotenv from "dotenv";

dotenv.config();

import { insertUser, findActiveUserByUsernameNormalized } from "../modules/auth/auth.repository";
import { hashPassword } from "../modules/auth/auth.service";
import { pool } from "../config/db";

async function main(): Promise<void> {
  const username = (process.env.SGM_BOOTSTRAP_ADMIN_USERNAME ?? "admin").trim();
  const password = process.env.SGM_BOOTSTRAP_ADMIN_PASSWORD;
  const displayName = (process.env.SGM_BOOTSTRAP_ADMIN_DISPLAY_NAME ?? "Administrador").trim();

  console.log(`Utilizador "${username}" .`);

  if (!password || password.length < 8) {
    console.error(
      "Defina SGM_BOOTSTRAP_ADMIN_PASSWORD no  ambiente (mínimo 8 caracteres) antes de executar o bootstrap."
    );
    throw new Error("SGM_BOOTSTRAP_ADMIN_PASSWORD inválida");
  }

  const existing = await findActiveUserByUsernameNormalized(username);
  if (existing) {
    console.log(`Utilizador "${username}" já existe. Nada a fazer.`);
    return;
  }

  const passwordHash = await hashPassword(password);
  const { id } = await insertUser({
    username,
    email: null,
    passwordHash,
    displayName,
    role: "admin",
  });

  console.log(`Utilizador criado: ${username} (id ${id})`);
}

async function run(): Promise<void> {
  try {
    await main();
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
