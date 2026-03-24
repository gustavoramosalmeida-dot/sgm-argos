import { env } from "../../../config/env";
import { query, withTransaction } from "../../../config/db";
import { logger } from "../../../utils/logger";
import { ApiError } from "../../../utils/api-error";
import { formatPublicCodeFromSequence } from "./qr.public-code";
import type { AssetNodeQrRow, PublicCodeLookupRow, QrResolveOutcome } from "./qr.types";

const INELIGIBLE_NODE_KINDS = new Set(["SITE"]);

export function isAssetEligibleForOfficialQr(nodeKind: string): boolean {
  return !INELIGIBLE_NODE_KINDS.has(nodeKind);
}

export async function getAssetQrRow(assetId: string): Promise<AssetNodeQrRow | null> {
  const sql = `
    SELECT id, node_kind AS "nodeKind", public_code AS "publicCode", qr_generated_at AS "qrGeneratedAt"
    FROM asset_nodes
    WHERE id = $1 AND deleted_at IS NULL
    LIMIT 1
  `;
  const { rows } = await query<AssetNodeQrRow>(sql, [assetId]);
  return rows[0] ?? null;
}

export async function findByPublicCode(publicCode: string): Promise<PublicCodeLookupRow | null> {
  /** Mesma lógica de contexto de máquina que getAssetSummaryById + breadcrumb. */
  const sql = `
    SELECT
      n.id AS "assetId",
      n.public_code AS "publicCode",
      COALESCE(
        br.machine_id,
        ms.machine_id,
        vp_machine.machine_id
      ) AS "machineId"
    FROM asset_nodes n
    LEFT JOIN vw_asset_breadcrumbs br ON br.asset_node_id = n.id
    LEFT JOIN vw_machine_summary ms ON ms.machine_id = n.id
    LEFT JOIN LATERAL (
      SELECT vl.asset_node_id AS machine_id
      FROM asset_visual_points vp
      JOIN asset_visual_layers vl ON vl.id = vp.visual_layer_id AND vl.deleted_at IS NULL
      WHERE vp.asset_node_id = n.id AND vp.deleted_at IS NULL
      LIMIT 1
    ) vp_machine ON true
    WHERE n.public_code = $1 AND n.deleted_at IS NULL
    LIMIT 1
  `;
  const { rows } = await query<PublicCodeLookupRow>(sql, [publicCode]);
  const row = rows[0] ?? null;
  if (env.qrResolverDebugLogs) {
    logger.info(
      `[QR DEBUG] findByPublicCode publicCode=${publicCode} assetId=${row?.assetId ?? "null"} machineId=${row?.machineId ?? "null"}`
    );
  }
  return row;
}

export async function ensureAssetPublicCode(assetId: string): Promise<{
  publicCode: string;
  qrGeneratedAt: Date;
  wasCreated: boolean;
}> {
  return withTransaction(async (client) => {
    const lockSql = `
      SELECT id, node_kind, public_code, qr_generated_at, deleted_at
      FROM asset_nodes
      WHERE id = $1
      FOR UPDATE
    `;
    const locked = await client.query<{
      id: string;
      node_kind: string;
      public_code: string | null;
      qr_generated_at: Date | null;
      deleted_at: Date | null;
    }>(lockSql, [assetId]);

    const row = locked.rows[0];
    if (!row || row.deleted_at) {
      throw ApiError.notFound("Ativo não encontrado");
    }
    if (!isAssetEligibleForOfficialQr(row.node_kind)) {
      throw ApiError.badRequest("Ativo não elegível para QR oficial");
    }

    if (row.public_code) {
      return {
        publicCode: row.public_code,
        qrGeneratedAt: row.qr_generated_at ?? new Date(),
        wasCreated: false,
      };
    }

    const seqRes = await client.query<{ n: string }>(
      "SELECT nextval('sgm_asset_public_code_seq')::text AS n"
    );
    const n = Number(seqRes.rows[0].n);
    const code = formatPublicCodeFromSequence(n);

    const upd = await client.query<{
      public_code: string;
      qr_generated_at: Date;
    }>(
      `
      UPDATE asset_nodes
      SET
        public_code = $2,
        qr_generated_at = COALESCE(qr_generated_at, now()),
        updated_at = now()
      WHERE id = $1 AND public_code IS NULL AND deleted_at IS NULL
      RETURNING public_code, qr_generated_at
    `,
      [assetId, code]
    );

    if (upd.rows.length === 0) {
      const again = await client.query<{
        public_code: string;
        qr_generated_at: Date;
      }>(
        `SELECT public_code, qr_generated_at FROM asset_nodes WHERE id = $1`,
        [assetId]
      );
      const r = again.rows[0];
      if (!r?.public_code) {
        throw ApiError.internal("Falha ao garantir public_code");
      }
      return { publicCode: r.public_code, qrGeneratedAt: r.qr_generated_at, wasCreated: false };
    }

    return {
      publicCode: upd.rows[0].public_code,
      qrGeneratedAt: upd.rows[0].qr_generated_at,
      wasCreated: true,
    };
  });
}

export async function insertQrResolveAudit(params: {
  publicCode: string;
  assetId: string | null;
  userId: string | null;
  outcome: QrResolveOutcome;
  requestOrigin: string | null;
  selectedContext: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}): Promise<void> {
  const sql = `
    INSERT INTO qr_resolve_audits (
      public_code, asset_id, user_id, outcome, request_origin, selected_context, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  try {
    await query(sql, [
      params.publicCode,
      params.assetId,
      params.userId,
      params.outcome,
      params.requestOrigin,
      params.selectedContext,
      params.metadata,
    ]);
  } catch {
    /* auditoria não deve derrubar o fluxo principal */
  }
}
