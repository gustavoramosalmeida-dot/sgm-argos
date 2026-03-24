export interface SgmUserRow {
  id: string;
  username: string;
  email: string | null;
  password_hash: string;
  display_name: string;
  is_active: boolean;
  role: string;
  collaborator_id: string | null;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
  deleted_at: Date | null;
}

/** Resposta pública (sem password_hash). */
export interface AuthUserPublic {
  id: string;
  username: string;
  email: string | null;
  displayName: string;
  role: string;
}

export function toAuthUserPublic(row: SgmUserRow): AuthUserPublic {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
  };
}
