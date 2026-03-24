import { query } from "../../config/db";
import { logger } from "../../utils/logger";

/** Data civil (YYYY-MM-DD) → instante fixo ao meio-dia UTC (sem deslocamento ao exibir como data). */
export function calendarDateToUtcNoonIso(calendarDateYmd: string): string {
  return `${calendarDateYmd}T12:00:00.000Z`;
}

export interface AssetEventRow {
  id: string;
  asset_node_id: string;
  event_type: string;
  event_date_ymd: string;
  description: string | null;
  useful_life_days: number | null;
}

export async function selectAssetEventById(eventId: string): Promise<AssetEventRow | null> {
  const sql = `
    SELECT
      e.id,
      e.asset_node_id,
      e.event_type,
      to_char((e.event_date AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD') AS event_date_ymd,
      e.description,
      e.useful_life_days
    FROM asset_events e
    WHERE e.id = $1 AND e.deleted_at IS NULL
    LIMIT 1
  `;
  try {
    const result = await query<AssetEventRow>(sql, [eventId]);
    return result.rows[0] ?? null;
  } catch (err) {
    logger.exception("E-SGM-AE-001", err);
    throw err;
  }
}

function buildTitle(eventType: string, calendarDateYmd: string): string {
  const base = `${eventType} — ${calendarDateYmd}`;
  return base.length <= 255 ? base : base.slice(0, 252) + "...";
}

export async function insertAssetEvent(params: {
  assetId: string;
  eventType: string;
  calendarDateYmd: string;
  description: string | null;
  usefulLifeDays: number | null;
}): Promise<AssetEventRow> {
  const title = buildTitle(params.eventType, params.calendarDateYmd);
  const eventDateIso = calendarDateToUtcNoonIso(params.calendarDateYmd);
  const sql = `
    INSERT INTO asset_events (
      asset_node_id,
      event_type,
      event_date,
      title,
      description,
      useful_life_days,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3::timestamptz, $4, $5, $6, now(), now())
    RETURNING
      id,
      asset_node_id,
      event_type,
      to_char((event_date AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD') AS event_date_ymd,
      description,
      useful_life_days
  `;
  try {
    const result = await query<AssetEventRow>(sql, [
      params.assetId,
      params.eventType,
      eventDateIso,
      title,
      params.description,
      params.usefulLifeDays,
    ]);
    const row = result.rows[0];
    if (!row) throw new Error("insert returned no row");
    return row;
  } catch (err) {
    logger.exception("E-SGM-AE-002", err);
    throw err;
  }
}

export async function updateAssetEvent(params: {
  eventId: string;
  eventType: string;
  calendarDateYmd: string;
  title: string;
  description: string | null;
  usefulLifeDays: number | null;
}): Promise<AssetEventRow | null> {
  const eventDateIso = calendarDateToUtcNoonIso(params.calendarDateYmd);
  const sql = `
    UPDATE asset_events
    SET
      event_type = $2,
      event_date = $3::timestamptz,
      title = $4,
      description = $5,
      useful_life_days = $6,
      updated_at = now()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING
      id,
      asset_node_id,
      event_type,
      to_char((event_date AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD') AS event_date_ymd,
      description,
      useful_life_days
  `;
  try {
    const result = await query<AssetEventRow>(sql, [
      params.eventId,
      params.eventType,
      eventDateIso,
      params.title.length > 255 ? params.title.slice(0, 252) + "..." : params.title,
      params.description,
      params.usefulLifeDays,
    ]);
    return result.rows[0] ?? null;
  } catch (err) {
    logger.exception("E-SGM-AE-003", err);
    throw err;
  }
}

export async function softDeleteAssetEvent(eventId: string): Promise<boolean> {
  const sql = `
    UPDATE asset_events
    SET deleted_at = now(), updated_at = now()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id
  `;
  try {
    const result = await query<{ id: string }>(sql, [eventId]);
    return result.rows.length > 0;
  } catch (err) {
    logger.exception("E-SGM-AE-004", err);
    throw err;
  }
}
