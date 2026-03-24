import { query } from "../../config/db";
import { logger } from "../../utils/logger";
import type {
  ListMachinesQuery,
  QrInventoryQuery,
  TimelineQuery,
  CreateAssetFromVisualPointBody,
} from "./sgm.schemas";
import {
  mapSiteHealthRow,
  mapSiteListRow,
  mapMachineSummaryRow,
  mapQrInventoryRow,
  mapTimelineRow,
  mapBreadcrumbRow,
  mapAssetTreeRow,
  mapAssetLastEventRow,
  mapAssetTimelineSummaryRow,
  mapAssetTimelineEventRow,
  mapVisualPointRow,
  mapAssetSummaryRow,
} from "./sgm.mapper";
import type {
  SiteHealthRow,
  SiteListRow,
  MachineSummaryRow,
  QrInventoryRow,
  TimelineRow,
  BreadcrumbRow,
  AssetTreeRow,
  AssetLastEventRow,
  AssetTimelineSummaryRow,
  AssetTimelineEventRow,
  VisualPointRow,
  AssetSummaryRow,
} from "./sgm.mapper";
import type {
  SiteHealthItem,
  SiteListItem,
  MachineSummary,
  QrInventoryItem,
  TimelineItem,
  BreadcrumbItem,
  AssetTreeNode,
  AssetLastEvent,
  AssetTimelineResponse,
  VisualPoint,
  AssetSummary,
} from "./sgm.types";

export async function getSiteHealth(): Promise<SiteHealthItem[]> {
  const sql = `
    SELECT site_id, site_name, total_machines, machines_ok, machines_atencao, machines_critico
    FROM vw_site_health
    ORDER BY site_name
  `;
  const { rows } = await query<SiteHealthRow>(sql);
  return rows.map(mapSiteHealthRow);
}

export async function getSites(): Promise<SiteListItem[]> {
  const sql = `
    SELECT
      n.id,
      n.code,
      n.name,
      n.description,
      n.status,
      COALESCE(c.machines_count, 0)::int AS machines_count
    FROM asset_nodes n
    LEFT JOIN (
      SELECT site_id, count(*)::int AS machines_count
      FROM vw_machine_summary
      GROUP BY site_id
    ) c ON c.site_id = n.id
    WHERE n.node_kind = 'SITE' AND n.deleted_at IS NULL
    ORDER BY n.name
  `;
  const { rows } = await query<SiteListRow>(sql);
  return rows.map(mapSiteListRow);
}

export async function getSiteById(siteId: string): Promise<SiteListItem | null> {
  const sql = `
    SELECT
      n.id,
      n.code,
      n.name,
      n.description,
      n.status,
      COALESCE(c.machines_count, 0)::int AS machines_count
    FROM asset_nodes n
    LEFT JOIN (
      SELECT site_id, count(*)::int AS machines_count
      FROM vw_machine_summary
      GROUP BY site_id
    ) c ON c.site_id = n.id
    WHERE n.node_kind = 'SITE' AND n.deleted_at IS NULL AND n.id = $1
    LIMIT 1
  `;
  const { rows } = await query<SiteListRow>(sql, [siteId]);
  const row = rows[0];
  if (!row) return null;
  return mapSiteListRow(row);
}

export async function listMachines(filters: ListMachinesQuery): Promise<MachineSummary[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 0;

  if (filters.siteId) {
    idx++;
    values.push(filters.siteId);
    conditions.push(`site_id = $${idx}`);
  }
  if (filters.status) {
    idx++;
    values.push(filters.status);
    conditions.push(`status = $${idx}`);
  }
  if (filters.search) {
    idx++;
    values.push(`%${filters.search}%`);
    conditions.push(`(machine_name ILIKE $${idx} OR machine_code ILIKE $${idx})`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT machine_id, machine_code, machine_name, description, status, qr_root_code,
           site_id, site_name, total_qr_points, total_components, total_events
    FROM vw_machine_overview
    ${where}
    ORDER BY machine_name
  `;
  const { rows } = await query<MachineSummaryRow>(sql, values);
  return rows.map(mapMachineSummaryRow);
}

export async function getMachineById(machineId: string): Promise<MachineSummary | null> {
  const sql = `
    SELECT machine_id, machine_code, machine_name, description, status, qr_root_code,
           site_id, site_name, total_qr_points, total_components, total_events
    FROM vw_machine_overview
    WHERE machine_id = $1
    LIMIT 1
  `;
  const { rows } = await query<MachineSummaryRow>(sql, [machineId]);
  const row = rows[0];
  if (!row) return null;
  return mapMachineSummaryRow(row);
}

export async function getMachineDefaultPhotoImageUrl(machineId: string): Promise<string | null> {
  const sql = `
    SELECT image_url
    FROM asset_visual_layers
    WHERE asset_node_id = $1
      AND deleted_at IS NULL
      AND layer_type = 'PHOTO'
    ORDER BY is_default DESC, created_at ASC
    LIMIT 1
  `;
  try {
    const { rows } = await query<{ image_url: string | null }>(sql, [machineId]);
    const url = rows[0]?.image_url;
    return url != null && String(url).trim() !== "" ? String(url) : null;
  } catch (err) {
    logger.exception("E-SGM-MACH-004", err);
    throw err;
  }
}

export async function getMachineQrInventory(
  machineId: string,
  filters: QrInventoryQuery
): Promise<QrInventoryItem[]> {
  const conditions: string[] = ["machine_id = $1"];
  const values: unknown[] = [machineId];
  let idx = 1;

  if (filters.status) {
    idx++;
    values.push(filters.status);
    conditions.push(`radar_status = $${idx}`);
  }
  if (filters.assetType) {
    idx++;
    values.push(filters.assetType);
    conditions.push(`asset_type = $${idx}`);
  }
  if (filters.search) {
    idx++;
    values.push(`%${filters.search}%`);
    conditions.push(`(qr_code ILIKE $${idx} OR asset_name ILIKE $${idx})`);
  }

  const sql = `
    SELECT machine_id, asset_node_id, asset_code, asset_name, asset_type, qr_code,
           last_event_type, last_event_date, next_due_date, radar_status
    FROM vw_machine_qr_inventory
    WHERE ${conditions.join(" AND ")}
    ORDER BY qr_code
  `;
  const { rows } = await query<QrInventoryRow>(sql, values);
  return rows.map(mapQrInventoryRow);
}

export async function getMachineTimeline(
  machineId: string,
  filters: TimelineQuery
): Promise<TimelineItem[]> {
  const conditions: string[] = ["machine_id = $1"];
  const values: unknown[] = [machineId];
  let idx = 1;

  if (filters.eventType) {
    idx++;
    values.push(filters.eventType);
    conditions.push(`event_type = $${idx}`);
  }
  if (filters.status) {
    idx++;
    values.push(filters.status);
    conditions.push(`event_status = $${idx}`);
  }
  if (filters.from) {
    idx++;
    values.push(filters.from);
    conditions.push(`event_date >= $${idx}`);
  }
  if (filters.to) {
    idx++;
    values.push(filters.to);
    conditions.push(`event_date <= $${idx}`);
  }

  const sql = `
    SELECT asset_node_id, asset_name, event_type, event_date, event_status,
           event_description, useful_life_days, next_due_date
    FROM vw_machine_timeline
    WHERE ${conditions.join(" AND ")}
    ORDER BY event_date DESC, asset_name
  `;
  const { rows } = await query<TimelineRow>(sql, values);
  return rows.map(mapTimelineRow);
}

export async function getAssetBreadcrumbs(assetId: string): Promise<BreadcrumbItem[]> {
  const sql = `
    SELECT asset_node_id, asset_name, asset_type, depth_from_root,
           site_id, site_name, machine_id, machine_name
    FROM vw_asset_breadcrumbs
    WHERE asset_node_id = $1
    ORDER BY depth_from_root ASC
  `;
  const { rows } = await query<BreadcrumbRow>(sql, [assetId]);
  return rows.map(mapBreadcrumbRow);
}

export async function getAssetTree(assetId: string): Promise<AssetTreeNode[]> {
  const sql = `
    SELECT asset_node_id, parent_id, asset_name, asset_type,
           depth_from_machine, is_machine_root
    FROM vw_machine_tree_nodes
    WHERE machine_id = $1
    ORDER BY depth_from_machine ASC, asset_name
  `;
  const { rows } = await query<AssetTreeRow>(sql, [assetId]);
  return rows.map(mapAssetTreeRow);
}

export async function getAssetLastEvent(assetId: string): Promise<AssetLastEvent | null> {
  const sql = `
    SELECT asset_node_id, asset_name, last_event_type, last_event_date,
           last_event_status, last_event_description, last_useful_life_days, last_next_due_date
    FROM vw_asset_last_event
    WHERE asset_node_id = $1
    LIMIT 1
  `;
  const { rows } = await query<AssetLastEventRow>(sql, [assetId]);
  const row = rows[0];
  if (!row) return null;
  return mapAssetLastEventRow(row);
}

export async function getAssetTimeline(assetId: string): Promise<AssetTimelineResponse | null> {
  const summarySql = `
    WITH asset AS (
      SELECT id, name, node_kind, useful_life_days_default
      FROM asset_nodes
      WHERE id = $1 AND deleted_at IS NULL
    ),
    events_count AS (
      SELECT COUNT(*)::int AS cnt
      FROM asset_events e
      WHERE e.asset_node_id = $1 AND e.deleted_at IS NULL
    ),
    last_event AS (
      SELECT
        e.event_type AS last_event_type,
        to_char((e.event_date AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD') AS last_event_date
      FROM asset_events e
      WHERE e.asset_node_id = $1 AND e.deleted_at IS NULL
      ORDER BY e.event_date DESC, e.created_at DESC, e.id DESC
      LIMIT 1
    ),
    base_event AS (
      SELECT
        ((e.event_date AT TIME ZONE 'UTC')::date) AS base_event_date,
        e.useful_life_days AS base_useful_life_days
      FROM asset_events e
      WHERE e.asset_node_id = $1
        AND e.deleted_at IS NULL
        AND e.event_type = ANY (ARRAY['INSTALL'::varchar, 'REPLACE'::varchar, 'INSPECTION'::varchar])
      ORDER BY e.event_date DESC, e.created_at DESC, e.id DESC
      LIMIT 1
    ),
    useful AS (
      SELECT
        (SELECT be.base_event_date FROM base_event be) AS base_event_date,
        CASE
          WHEN (SELECT be.base_event_date FROM base_event be) IS NULL THEN NULL
          ELSE COALESCE(
            (SELECT be.base_useful_life_days FROM base_event be),
            a.useful_life_days_default
          )
        END AS useful_life_days
      FROM asset a
    ),
    next_due AS (
      SELECT
        useful_life_days,
        CASE
          WHEN base_event_date IS NULL OR useful_life_days IS NULL THEN NULL
          ELSE base_event_date + useful_life_days
        END AS next_due_date
      FROM useful
    ),
    status_calc AS (
      SELECT
        CASE
          WHEN ec.cnt = 0 THEN 'SEM_HISTORICO'::varchar
          WHEN nd.next_due_date IS NULL THEN 'SEM_HISTORICO'::varchar
          WHEN CURRENT_DATE > nd.next_due_date THEN 'VENCIDO'::varchar
          WHEN nd.next_due_date <= (CURRENT_DATE + 7) THEN 'ATENCAO'::varchar
          ELSE 'OK'::varchar
        END AS status
      FROM events_count ec
      CROSS JOIN next_due nd
    )
    SELECT
      a.id AS asset_node_id,
      a.name AS asset_name,
      a.node_kind AS asset_node_type,
      le.last_event_type,
      le.last_event_date,
      u.useful_life_days,
      CASE
        WHEN nd.next_due_date IS NULL THEN NULL
        ELSE to_char(nd.next_due_date, 'YYYY-MM-DD')
      END AS next_due_date,
      sc.status
    FROM asset a
    LEFT JOIN last_event le ON true
    LEFT JOIN useful u ON true
    LEFT JOIN next_due nd ON true
    LEFT JOIN status_calc sc ON true;
  `;

  let summaryRows: AssetTimelineSummaryRow[];
  try {
    const result = await query<AssetTimelineSummaryRow>(summarySql, [assetId]);
    summaryRows = result.rows;
  } catch (err) {
    logger.exception("E-SGM-AT-001", err);
    throw err;
  }

  const row = summaryRows[0];
  if (!row) return null;

  const eventsSql = `
    SELECT
      id,
      event_type,
      to_char((event_date AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD') AS event_date,
      description AS event_description,
      useful_life_days
    FROM asset_events
    WHERE asset_node_id = $1 AND deleted_at IS NULL
    ORDER BY event_date DESC, created_at DESC, id DESC;
  `;

  let eventRows: AssetTimelineEventRow[];
  try {
    const result = await query<AssetTimelineEventRow>(eventsSql, [assetId]);
    eventRows = result.rows;
  } catch (err) {
    logger.exception("E-SGM-AT-002", err);
    throw err;
  }

  return {
    asset: {
      id: String(row.asset_node_id),
      name: row.asset_name,
      nodeType: row.asset_node_type,
    },
    summary: mapAssetTimelineSummaryRow(row),
    events: eventRows.map(mapAssetTimelineEventRow),
  };
}

export async function getMachineVisualPoints(machineId: string): Promise<VisualPoint[]> {
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
    WHERE m.id = $1 AND vp.deleted_at IS NULL
    ORDER BY vp.created_at, vp.id
  `;
  let rows: VisualPointRow[];
  try {
    const result = await query<VisualPointRow>(sql, [machineId]);
    rows = result.rows;
  } catch (err) {
    logger.exception("E-SGM-VP-006", err);
    throw err;
  }
  return rows.map(mapVisualPointRow);
}

export async function getAssetSummaryById(assetId: string): Promise<AssetSummary | null> {
  const sql = `
    SELECT
      n.id,
      n.code,
      n.name,
      n.node_kind,
      n.asset_type,
      n.status,
      COALESCE(ms.machine_id, vp_machine.machine_id) AS machine_id
    FROM asset_nodes n
    LEFT JOIN vw_machine_summary ms ON ms.machine_id = n.id
    LEFT JOIN LATERAL (
      SELECT vl.asset_node_id AS machine_id
      FROM asset_visual_points vp
      JOIN asset_visual_layers vl ON vl.id = vp.visual_layer_id AND vl.deleted_at IS NULL
      WHERE vp.asset_node_id = n.id AND vp.deleted_at IS NULL
      LIMIT 1
    ) vp_machine ON true
    WHERE n.id = $1 AND n.deleted_at IS NULL
    LIMIT 1
  `;
  let rows: AssetSummaryRow[];
  try {
    const result = await query<AssetSummaryRow>(sql, [assetId]);
    rows = result.rows;
  } catch (err) {
    logger.exception("E-SGM-VP-007", err);
    throw err;
  }
  const row = rows[0];
  if (!row) return null;
  return mapAssetSummaryRow(row);
}

export async function getVisualPointById(id: string): Promise<VisualPoint | null> {
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
  let rows: VisualPointRow[];
  try {
    const result = await query<VisualPointRow>(sql, [id]);
    rows = result.rows;
  } catch (err) {
    logger.exception("E-SGM-VP-008", err);
    throw err;
  }
  const row = rows[0];
  if (!row) return null;
  return mapVisualPointRow(row);
}

export async function linkVisualPointToAssetRepo(
  visualPointId: string,
  assetId: string
): Promise<void> {
  const sql = `
    UPDATE asset_visual_points
       SET asset_node_id = $2,
           updated_at = now()
     WHERE id = $1
       AND deleted_at IS NULL
  `;
  try {
    await query(sql, [visualPointId, assetId]);
  } catch (err) {
    logger.exception("E-SGM-VP-009", err);
    throw err;
  }
}

export async function createAssetForVisualPoint(
  _vp: VisualPoint,
  payload: CreateAssetFromVisualPointBody
): Promise<string> {
  const sql = `
    INSERT INTO asset_nodes (id, parent_id, code, name, node_kind, description, asset_type, status, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, NULL, $2, $3, $4, NULL, 'ACTIVE', now(), now())
    RETURNING id
  `;

  const parentId = payload.parentId ?? null;
  const description = payload.description ?? null;

  try {
    const result = await query<{ id: string }>(sql, [
      parentId,
      payload.name,
      payload.nodeType,
      description,
    ]);
    return result.rows[0].id;
  } catch (err) {
    logger.exception("E-SGM-VP-010", err);
    throw err;
  }
}

export async function createAssetForVisualPointAndLinkRepo(
  visualPointId: string,
  payload: CreateAssetFromVisualPointBody
): Promise<{
  visualPointId: string;
  assetNodeId: string;
  assetNodeName: string;
  assetNodeType: string;
} | null> {
  const sql = `
    WITH vp AS (
      SELECT id
      FROM asset_visual_points
      WHERE id = $5 AND deleted_at IS NULL
      LIMIT 1
    ),
    created AS (
      INSERT INTO asset_nodes (
        id, parent_id, code, name, node_kind, description, asset_type, status, created_at, updated_at
      )
      SELECT
        gen_random_uuid(),
        $1,
        NULL,
        $2,
        $3,
        $4,
        NULL,
        'ACTIVE',
        now(),
        now()
      FROM vp
      RETURNING id, name, node_kind
    ),
    updated AS (
      UPDATE asset_visual_points
      SET asset_node_id = (SELECT id FROM created),
          updated_at = now()
      WHERE id = $5 AND deleted_at IS NULL
      RETURNING id, asset_node_id
    )
    SELECT
      updated.id AS visual_point_id,
      updated.asset_node_id AS asset_node_id,
      created.name AS asset_node_name,
      created.node_kind AS asset_node_type
    FROM updated
    JOIN created ON true
  `;

  const parentId = payload.parentId ?? null;
  const description = payload.description ?? null;

  try {
    const result = await query<{
      visual_point_id: string;
      asset_node_id: string;
      asset_node_name: string;
      asset_node_type: string;
    }>(sql, [parentId, payload.name, payload.nodeType, description, visualPointId]);

    const row = result.rows[0];
    if (!row) return null;

    return {
      visualPointId: row.visual_point_id,
      assetNodeId: row.asset_node_id,
      assetNodeName: row.asset_node_name,
      assetNodeType: row.asset_node_type,
    };
  } catch (err) {
    logger.exception("E-SGM-VP-011", err);
    throw err;
  }
}

export async function unlinkVisualPointFromAssetRepo(
  visualPointId: string
): Promise<boolean> {
  try {
    const sql = `
      UPDATE asset_visual_points
         SET asset_node_id = NULL,
             updated_at = now()
       WHERE id = $1
         AND deleted_at IS NULL
      RETURNING id
    `;
    const result = await query<{ id: string }>(sql, [visualPointId]);
    return result.rows.length > 0;
  } catch (err) {
    logger.exception("E-SGM-VP-012", err);
    throw err;
  }
}
