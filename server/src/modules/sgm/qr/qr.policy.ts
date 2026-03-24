import { env } from "../../../config/env";

/** Autorização mínima para ver o detalhe operacional do ativo após scan (evolutivo para RBAC). */
export function canResolveAssetDetail(userId: string | null): boolean {
  if (!userId) return false;
  if (env.qrResolverAllowedUserIds.length === 0) return true;
  return env.qrResolverAllowedUserIds.includes(userId);
}
