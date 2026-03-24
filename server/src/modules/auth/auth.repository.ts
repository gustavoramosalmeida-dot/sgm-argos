import { query } from "../../config/db";
import type { SgmUserRow } from "./auth.types";

export async function findActiveUserByUsernameNormalized(
  username: string
): Promise<SgmUserRow | null> {
  const sql = `
    SELECT
      id,
      username,
      email,
      password_hash AS "password_hash",
      display_name AS "display_name",
      is_active AS "is_active",
      role,
      collaborator_id AS "collaborator_id",
      created_at AS "created_at",
      updated_at AS "updated_at",
      last_login_at AS "last_login_at",
      deleted_at AS "deleted_at"
    FROM sgm_users
    WHERE deleted_at IS NULL
      AND is_active = true
      AND lower(username) = lower($1)
    LIMIT 1
  `;
  const { rows } = await query<SgmUserRow>(sql, [username.trim()]);
  return rows[0] ?? null;
}

export async function findActiveUserById(id: string): Promise<SgmUserRow | null> {
  const sql = `
    SELECT
      id,
      username,
      email,
      password_hash AS "password_hash",
      display_name AS "display_name",
      is_active AS "is_active",
      role,
      collaborator_id AS "collaborator_id",
      created_at AS "created_at",
      updated_at AS "updated_at",
      last_login_at AS "last_login_at",
      deleted_at AS "deleted_at"
    FROM sgm_users
    WHERE id = $1 AND deleted_at IS NULL AND is_active = true
    LIMIT 1
  `;
  const { rows } = await query<SgmUserRow>(sql, [id]);
  return rows[0] ?? null;
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  await query(`UPDATE sgm_users SET last_login_at = now(), updated_at = now() WHERE id = $1`, [
    userId,
  ]);
}

export async function insertUser(params: {
  username: string;
  email: string | null;
  passwordHash: string;
  displayName: string;
  role?: string;
}): Promise<{ id: string }> {
  const sql = `
    INSERT INTO sgm_users (username, email, password_hash, display_name, role)
    VALUES ($1, $2, $3, $4, COALESCE($5, 'admin'))
    RETURNING id
  `;
  const { rows } = await query<{ id: string }>(sql, [
    params.username.trim(),
    params.email,
    params.passwordHash,
    params.displayName.trim(),
    params.role ?? "admin",
  ]);
  const id = rows[0]?.id;
  if (!id) throw new Error("Falha ao criar utilizador");
  return { id };
}

export async function countUsers(): Promise<number> {
  const { rows } = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM sgm_users WHERE deleted_at IS NULL`
  );
  return Number(rows[0]?.n ?? 0);
}
