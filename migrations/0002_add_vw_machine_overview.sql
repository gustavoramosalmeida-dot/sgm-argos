-- Migration: add vw_machine_overview (visão executiva/operacional por máquina)
-- Depende de: db-schema-v1 (vw_machine_summary já aplicado na Cloud)

CREATE OR REPLACE VIEW public.vw_machine_overview
AS WITH RECURSIVE machines AS (
         SELECT an.id AS machine_id,
            an.parent_id
           FROM asset_nodes an
          WHERE an.node_kind::text = 'MACHINE'::text AND an.deleted_at IS NULL
        ), subtree AS (
         SELECT m_1.machine_id,
            an.id AS node_id
           FROM machines m_1
             JOIN asset_nodes an ON an.id = m_1.machine_id AND an.deleted_at IS NULL
        UNION ALL
         SELECT s.machine_id,
            an.id AS node_id
           FROM subtree s
             JOIN asset_nodes an ON an.parent_id = s.node_id AND an.deleted_at IS NULL
        ), event_count AS (
         SELECT s.machine_id,
            count(e.id)::bigint AS total_events
           FROM subtree s
             JOIN asset_events e ON e.asset_node_id = s.node_id AND e.deleted_at IS NULL
          GROUP BY s.machine_id
        )
 SELECT ms.machine_id,
    ms.machine_code,
    ms.machine_name,
    m.description,
    ms.machine_health_status AS status,
    m.qr_code AS qr_root_code,
    ms.site_id,
    ms.site_name,
    COALESCE(ms.total_qr_assets, 0::bigint) AS total_qr_points,
    COALESCE(ms.total_assets, 0::bigint) AS total_components,
    COALESCE(ec.total_events, 0::bigint) AS total_events
   FROM vw_machine_summary ms
     JOIN asset_nodes m ON m.id = ms.machine_id AND m.deleted_at IS NULL AND m.node_kind::text = 'MACHINE'::text
     LEFT JOIN event_count ec ON ec.machine_id = ms.machine_id;
