import { query } from "../../config/db";
import { logger } from "../../utils/logger";

/**
 * Placeholder oficial quando a máquina nasce sem imageUrl.
 * Manter alinhado a `PLACEHOLDER_PHOTO` em `src/pages/machines/MaquinaPage.tsx`.
 */
export const DEFAULT_MACHINE_PHOTO_PLACEHOLDER_URL =
  "https://placehold.co/800x500/1e293b/94a3b8?text=Foto+da+m%C3%A1quina";

export async function insertMachineNode(params: {
  siteId: string;
  name: string;
  code: string | null;
  description: string | null;
}): Promise<string> {
  const sql = `
    INSERT INTO asset_nodes (
      id,
      parent_id,
      code,
      name,
      description,
      node_kind,
      asset_type,
      status,
      has_qr,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      $1,
      $2,
      $3,
      $4,
      'MACHINE',
      NULL,
      'ACTIVE',
      false,
      now(),
      now()
    )
    RETURNING id
  `;
  try {
    const result = await query<{ id: string }>(sql, [
      params.siteId,
      params.code,
      params.name,
      params.description,
    ]);
    return String(result.rows[0].id);
  } catch (err) {
    logger.exception("E-SGM-MACH-001", err);
    throw err;
  }
}

export async function updateMachineNode(
  machineId: string,
  fields: { name: string; code: string | null; description: string | null }
): Promise<boolean> {
  const sql = `
    UPDATE asset_nodes
    SET
      code = $2,
      name = $3,
      description = $4,
      updated_at = now()
    WHERE id = $1
      AND node_kind = 'MACHINE'
      AND deleted_at IS NULL
    RETURNING id
  `;
  try {
    const result = await query<{ id: string }>(sql, [
      machineId,
      fields.code,
      fields.name,
      fields.description,
    ]);
    return result.rows.length > 0;
  } catch (err) {
    logger.exception("E-SGM-MACH-002", err);
    throw err;
  }
}

/** Atualiza ou cria camada PHOTO default com a URL informada. */
export async function upsertDefaultPhotoLayer(machineId: string, imageUrl: string): Promise<void> {
  const updateSql = `
    WITH target AS (
      SELECT id
      FROM asset_visual_layers
      WHERE asset_node_id = $1
        AND deleted_at IS NULL
        AND layer_type = 'PHOTO'
      ORDER BY is_default DESC, created_at ASC
      LIMIT 1
    )
    UPDATE asset_visual_layers l
    SET image_url = $2,
        updated_at = now()
    FROM target t
    WHERE l.id = t.id
    RETURNING l.id
  `;
  const insertSql = `
    INSERT INTO asset_visual_layers (
      id,
      asset_node_id,
      layer_type,
      name,
      image_url,
      is_default,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      $1,
      'PHOTO',
      'Foto',
      $2,
      true,
      now(),
      now()
    )
  `;
  try {
    const updated = await query<{ id: string }>(updateSql, [machineId, imageUrl]);
    if (updated.rows.length > 0) return;
    await query(insertSql, [machineId, imageUrl]);
  } catch (err) {
    logger.exception("E-SGM-MACH-003", err);
    throw err;
  }
}
