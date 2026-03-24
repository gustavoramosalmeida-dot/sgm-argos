import { query } from "../../config/db";
import { ApiError } from "../../utils/api-error";
import { logger } from "../../utils/logger";
import { mapVisualPointRow } from "./sgm.mapper";
import type { CreateVisualPointBody, UpdateVisualPointBody } from "./sgm.schemas";
import type { VisualPoint } from "./sgm.types";
import type { VisualPointRow as VisualPointRowType } from "./sgm.mapper";

async function getDefaultVisualLayerId(machineId: string): Promise<string> {
  // Premissa atual:
  // utiliza o visual layer padrão associado ao node_kind = 'MACHINE'
  // Futuro: pode ser expandido para múltiplos layers por tipo de asset
  const sql = `
    SELECT vl.id
    FROM asset_visual_layers vl
    JOIN asset_nodes m ON m.id = vl.asset_node_id AND m.deleted_at IS NULL AND m.node_kind = 'MACHINE'
    WHERE vl.deleted_at IS NULL
      AND vl.asset_node_id = $1
    ORDER BY vl.is_default DESC, vl.created_at ASC
    LIMIT 1
  `;
  let rows: { id: string }[];
  try {
    const result = await query<{ id: string }>(sql, [machineId]);
    rows = result.rows;
  } catch (err) {
    logger.exception("E-SGM-VP-001", err);
    throw err;
  }
  const row = rows[0];
  if (!row) throw new ApiError(404, "Visual layer not found");
  return row.id;
}

async function selectVisualPointResponseById(visualPointId: string) {
  const sql = `
    SELECT
      vp.id,
      m.id AS machine_id,
      vp.asset_node_id AS asset_id,
      a.qr_code AS qr_code,
      vp.label,
      vp.point_type,
      vp.x_percent,
      vp.y_percent,
      vl.layer_type,
      a.code AS asset_code,
      a.name AS asset_name,
      a.node_kind AS asset_node_kind,
      a.asset_type
    FROM asset_visual_points vp
    JOIN asset_visual_layers vl ON vl.id = vp.visual_layer_id AND vl.deleted_at IS NULL
    JOIN asset_nodes m ON m.id = vl.asset_node_id AND m.deleted_at IS NULL AND m.node_kind = 'MACHINE'
    LEFT JOIN asset_nodes a ON a.id = vp.asset_node_id AND a.deleted_at IS NULL
    WHERE vp.id = $1 AND vp.deleted_at IS NULL
    LIMIT 1
  `;
  let rows: VisualPointRowType[];
  try {
    const result = await query<VisualPointRowType>(sql, [visualPointId]);
    rows = result.rows;
  } catch (err) {
    logger.exception("E-SGM-VP-002", err);
    throw err;
  }
  const row = rows[0];
  if (!row) return null;
  return mapVisualPointRow(row);
}

export async function listMachineVisualPointsRepo(machineId: string): Promise<VisualPoint[]> {
  // Usa a query existente (já retorna asset/resumo quando houver).
  const { getMachineVisualPoints } = await import("./sgm.read.repository");
  return getMachineVisualPoints(machineId);
}

export async function createMachineVisualPointRepo(
  machineId: string,
  body: CreateVisualPointBody
): Promise<VisualPoint> {
  const visualLayerId = await getDefaultVisualLayerId(machineId);
  const xPercent = body.x / 100;
  const yPercent = body.y / 100;
  const label = body.label ?? null;

  const sql = `
    INSERT INTO asset_visual_points (
      id,
      asset_node_id,
      visual_layer_id,
      label,
      x_percent,
      y_percent
    )
    VALUES (
      gen_random_uuid(),
      NULL,
      $1,
      $2,
      $3,
      $4
    )
    RETURNING id
  `;

  let rows: { id: string }[];
  try {
    const result = await query<{ id: string }>(sql, [
      visualLayerId,
      label,
      xPercent,
      yPercent,
    ]);
    rows = result.rows;
  } catch (err) {
    logger.exception("E-SGM-VP-003", err);
    throw err;
  }
  const id = rows[0]?.id;
  if (!id) throw new ApiError(500, "Failed to create visual point");

  const created = await selectVisualPointResponseById(id);
  if (!created) throw new ApiError(500, "Failed to read created visual point");
  return created;
}

export async function updateVisualPointRepo(
  visualPointId: string,
  body: UpdateVisualPointBody
): Promise<VisualPoint | null> {
  const xPercent = body.x != null ? body.x / 100 : null;
  const yPercent = body.y != null ? body.y / 100 : null;
  const label = body.label != null ? body.label : null;

  const sql = `
    UPDATE asset_visual_points
       SET x_percent = COALESCE($2, x_percent),
           y_percent = COALESCE($3, y_percent),
           -- Observação:
           -- COALESCE impede limpar label com null
           -- Ajustar futuramente se necessário
           label = COALESCE($4, label),
           updated_at = now()
     WHERE id = $1
       AND deleted_at IS NULL
    RETURNING id
  `;

  let rows: { id: string }[];
  try {
    const result = await query<{ id: string }>(sql, [
      visualPointId,
      xPercent,
      yPercent,
      label,
    ]);
    rows = result.rows;
  } catch (err) {
    logger.exception("E-SGM-VP-004", err);
    throw err;
  }

  const updatedId = rows[0]?.id;
  if (!updatedId) return null;

  return selectVisualPointResponseById(updatedId);
}

export async function deleteVisualPointRepo(
  visualPointId: string
): Promise<boolean> {
  const sql = `
    UPDATE asset_visual_points
       SET deleted_at = now()
     WHERE id = $1
       AND deleted_at IS NULL
    RETURNING id
  `;
  let rows: { id: string }[];
  try {
    const result = await query<{ id: string }>(sql, [visualPointId]);
    rows = result.rows;
  } catch (err) {
    logger.exception("E-SGM-VP-005", err);
    throw err;
  }
  return rows.length > 0;
}

