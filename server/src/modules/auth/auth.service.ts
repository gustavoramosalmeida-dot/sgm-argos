import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { ApiError } from "../../utils/api-error";
import { findActiveUserByUsernameNormalized, updateUserLastLogin } from "./auth.repository";
import type { AuthUserPublic } from "./auth.types";
import { toAuthUserPublic } from "./auth.types";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(userId: string): string {
  if (!env.jwtSecret) {
    throw ApiError.internal("JWT_SECRET não configurado");
  }
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "7d" });
}

export async function loginWithUsernamePassword(
  username: string,
  password: string
): Promise<AuthUserPublic> {
  if (!env.jwtSecret) {
    throw ApiError.internal("Autenticação web indisponível: defina JWT_SECRET");
  }
  const trimmedUser = username.trim();
  if (!trimmedUser || !password) {
    throw ApiError.badRequest("Utilizador e senha são obrigatórios");
  }
  const row = await findActiveUserByUsernameNormalized(trimmedUser);
  if (!row) {
    throw ApiError.unauthorized("Utilizador ou senha inválidos");
  }
  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) {
    throw ApiError.unauthorized("Utilizador ou senha inválidos");
  }
  await updateUserLastLogin(row.id);
  return toAuthUserPublic(row);
}
