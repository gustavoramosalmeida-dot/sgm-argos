-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;
-- public.asset_nodes definição

-- Drop table

-- DROP TABLE public.asset_nodes;

CREATE TABLE public.asset_nodes (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	parent_id uuid NULL,
	code varchar(100) NULL,
	"name" varchar(255) NOT NULL,
	description text NULL,
	node_kind varchar(50) NOT NULL,
	asset_type varchar(100) NULL,
	status varchar(50) NULL,
	qr_code varchar(150) NULL,
	has_qr bool DEFAULT false NOT NULL,
	location_label varchar(255) NULL,
	useful_life_days_default int4 NULL,
	serial_number varchar(150) NULL,
	part_number varchar(150) NULL,
	manufacturer varchar(150) NULL,
	installed_at timestamptz NULL,
	sort_order int4 NULL,
	path_cache text NULL,
	depth_cache int4 NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT asset_nodes_depth_cache_check CHECK (((depth_cache IS NULL) OR (depth_cache >= 0))),
	CONSTRAINT asset_nodes_pkey PRIMARY KEY (id),
	CONSTRAINT asset_nodes_useful_life_days_default_check CHECK (((useful_life_days_default IS NULL) OR (useful_life_days_default >= 0))),
	CONSTRAINT asset_nodes_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.asset_nodes(id) ON DELETE RESTRICT
);
CREATE INDEX ix_asset_nodes_asset_type ON public.asset_nodes USING btree (asset_type);
CREATE INDEX ix_asset_nodes_deleted_at ON public.asset_nodes USING btree (deleted_at);
CREATE INDEX ix_asset_nodes_has_qr ON public.asset_nodes USING btree (has_qr);
CREATE INDEX ix_asset_nodes_node_kind ON public.asset_nodes USING btree (node_kind);
CREATE INDEX ix_asset_nodes_parent_id ON public.asset_nodes USING btree (parent_id);
CREATE INDEX ix_asset_nodes_status ON public.asset_nodes USING btree (status);
CREATE UNIQUE INDEX uq_asset_nodes_code_active ON public.asset_nodes USING btree (code) WHERE ((deleted_at IS NULL) AND (code IS NOT NULL));
CREATE UNIQUE INDEX uq_asset_nodes_qr_code_active ON public.asset_nodes USING btree (qr_code) WHERE ((deleted_at IS NULL) AND (qr_code IS NOT NULL));

-- Table Triggers

create trigger trg_asset_nodes_set_updated_at before
update
    on
    public.asset_nodes for each row execute function set_updated_at();


-- public.asset_visual_layers definição

-- Drop table

-- DROP TABLE public.asset_visual_layers;

CREATE TABLE public.asset_visual_layers (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	asset_node_id uuid NOT NULL,
	layer_type varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	image_url text NOT NULL,
	width_px int4 NULL,
	height_px int4 NULL,
	is_default bool DEFAULT false NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT asset_visual_layers_height_px_check CHECK (((height_px IS NULL) OR (height_px > 0))),
	CONSTRAINT asset_visual_layers_pkey PRIMARY KEY (id),
	CONSTRAINT asset_visual_layers_width_px_check CHECK (((width_px IS NULL) OR (width_px > 0))),
	CONSTRAINT chk_asset_visual_layers_layer_type CHECK (((layer_type)::text = ANY ((ARRAY['PHOTO'::character varying, 'BLUEPRINT'::character varying, 'EXPLODED'::character varying])::text[]))),
	CONSTRAINT asset_visual_layers_asset_node_id_fkey FOREIGN KEY (asset_node_id) REFERENCES public.asset_nodes(id) ON DELETE CASCADE
);
CREATE INDEX ix_asset_visual_layers_asset_node_id ON public.asset_visual_layers USING btree (asset_node_id);
CREATE INDEX ix_asset_visual_layers_deleted_at ON public.asset_visual_layers USING btree (deleted_at);
CREATE INDEX ix_asset_visual_layers_layer_type ON public.asset_visual_layers USING btree (layer_type);
CREATE UNIQUE INDEX uq_asset_visual_layers_default_active ON public.asset_visual_layers USING btree (asset_node_id) WHERE ((is_default = true) AND (deleted_at IS NULL));

-- Table Triggers

create trigger trg_asset_visual_layers_set_updated_at before
update
    on
    public.asset_visual_layers for each row execute function set_updated_at();


-- public.asset_visual_points definição

-- Drop table

-- DROP TABLE public.asset_visual_points;

CREATE TABLE public.asset_visual_points (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	asset_node_id uuid NOT NULL,
	visual_layer_id uuid NOT NULL,
	"label" varchar(255) NULL,
	point_type varchar(100) NULL,
	x_percent numeric(7, 4) NOT NULL,
	y_percent numeric(7, 4) NOT NULL,
	marker_color varchar(50) NULL,
	marker_icon varchar(100) NULL,
	is_primary bool DEFAULT true NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT asset_visual_points_pkey PRIMARY KEY (id),
	CONSTRAINT chk_asset_visual_points_x_percent CHECK (((x_percent >= (0)::numeric) AND (x_percent <= (1)::numeric))),
	CONSTRAINT chk_asset_visual_points_y_percent CHECK (((y_percent >= (0)::numeric) AND (y_percent <= (1)::numeric))),
	CONSTRAINT asset_visual_points_asset_node_id_fkey FOREIGN KEY (asset_node_id) REFERENCES public.asset_nodes(id) ON DELETE CASCADE,
	CONSTRAINT asset_visual_points_visual_layer_id_fkey FOREIGN KEY (visual_layer_id) REFERENCES public.asset_visual_layers(id) ON DELETE CASCADE
);
CREATE INDEX ix_asset_visual_points_asset_node_id ON public.asset_visual_points USING btree (asset_node_id);
CREATE INDEX ix_asset_visual_points_deleted_at ON public.asset_visual_points USING btree (deleted_at);
CREATE INDEX ix_asset_visual_points_visual_layer_id_is_primary ON public.asset_visual_points USING btree (visual_layer_id, is_primary);
CREATE UNIQUE INDEX uq_asset_visual_points_primary_active ON public.asset_visual_points USING btree (asset_node_id, visual_layer_id) WHERE ((is_primary = true) AND (deleted_at IS NULL));

-- Table Triggers

create trigger trg_asset_visual_points_set_updated_at before
update
    on
    public.asset_visual_points for each row execute function set_updated_at();


-- public.asset_events definição

-- Drop table

-- DROP TABLE public.asset_events;

CREATE TABLE public.asset_events (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	asset_node_id uuid NOT NULL,
	event_type varchar(50) NOT NULL,
	event_date timestamptz NOT NULL,
	title varchar(255) NOT NULL,
	description text NULL,
	performed_by varchar(150) NULL,
	useful_life_days int4 NULL,
	next_due_date timestamptz NULL,
	severity varchar(50) NULL,
	status varchar(50) NULL,
	"source" varchar(100) NULL,
	reference_type varchar(100) NULL,
	reference_id varchar(150) NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT asset_events_pkey PRIMARY KEY (id),
	CONSTRAINT asset_events_useful_life_days_check CHECK (((useful_life_days IS NULL) OR (useful_life_days >= 0))),
	CONSTRAINT chk_asset_events_event_type CHECK (((event_type)::text = ANY ((ARRAY['INSTALL'::character varying, 'REPLACE'::character varying, 'INSPECTION'::character varying, 'ADJUSTMENT'::character varying, 'CLEANING'::character varying, 'FAILURE'::character varying, 'NOTE'::character varying])::text[]))),
	CONSTRAINT asset_events_asset_node_id_fkey FOREIGN KEY (asset_node_id) REFERENCES public.asset_nodes(id) ON DELETE CASCADE
);
CREATE INDEX ix_asset_events_asset_node_id_event_date ON public.asset_events USING btree (asset_node_id, event_date DESC);
CREATE INDEX ix_asset_events_deleted_at ON public.asset_events USING btree (deleted_at);
CREATE INDEX ix_asset_events_event_type ON public.asset_events USING btree (event_type);
CREATE INDEX ix_asset_events_next_due_date ON public.asset_events USING btree (next_due_date);

-- Table Triggers

create trigger trg_asset_events_set_updated_at before
update
    on
    public.asset_events for each row execute function set_updated_at();


-- public.asset_files definição

-- Drop table

-- DROP TABLE public.asset_files;

CREATE TABLE public.asset_files (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	asset_node_id uuid NOT NULL,
	file_type varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	url text NOT NULL,
	mime_type varchar(150) NULL,
	description text NULL,
	uploaded_by varchar(150) NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT asset_files_pkey PRIMARY KEY (id),
	CONSTRAINT asset_files_asset_node_id_fkey FOREIGN KEY (asset_node_id) REFERENCES public.asset_nodes(id) ON DELETE CASCADE
);
CREATE INDEX ix_asset_files_asset_node_id ON public.asset_files USING btree (asset_node_id);
CREATE INDEX ix_asset_files_deleted_at ON public.asset_files USING btree (deleted_at);
CREATE INDEX ix_asset_files_file_type ON public.asset_files USING btree (file_type);

-- Table Triggers

create trigger trg_asset_files_set_updated_at before
update
    on
    public.asset_files for each row execute function set_updated_at();


-- public.vw_asset_breadcrumbs fonte

CREATE OR REPLACE VIEW public.vw_asset_breadcrumbs
AS WITH RECURSIVE ancestors AS (
         SELECT n.id AS asset_node_id,
            n.id AS ancestor_id,
            n.parent_id AS ancestor_parent_id,
            n.name AS ancestor_name,
            n.node_kind AS ancestor_node_kind,
            n.code AS ancestor_code,
            n.asset_type AS ancestor_asset_type,
            n.qr_code AS ancestor_qr_code,
            0 AS depth_from_node
           FROM asset_nodes n
          WHERE n.deleted_at IS NULL
        UNION ALL
         SELECT a.asset_node_id,
            p.id AS ancestor_id,
            p.parent_id AS ancestor_parent_id,
            p.name AS ancestor_name,
            p.node_kind AS ancestor_node_kind,
            p.code AS ancestor_code,
            p.asset_type AS ancestor_asset_type,
            p.qr_code AS ancestor_qr_code,
            a.depth_from_node + 1 AS depth_from_node
           FROM ancestors a
             JOIN asset_nodes p ON p.id = a.ancestor_parent_id AND p.deleted_at IS NULL
        ), ancestors_with_depth AS (
         SELECT a.asset_node_id,
            a.ancestor_id,
            a.ancestor_name,
            a.ancestor_node_kind,
            a.ancestor_code,
            a.ancestor_asset_type,
            a.ancestor_qr_code,
            a.depth_from_node,
            max(a.depth_from_node) OVER (PARTITION BY a.asset_node_id) AS max_depth_from_node
           FROM ancestors a
        ), path_ordered AS (
         SELECT awd.asset_node_id,
            awd.ancestor_id,
            awd.ancestor_name,
            awd.ancestor_node_kind,
            awd.ancestor_code,
            awd.ancestor_asset_type,
            awd.ancestor_qr_code,
            awd.max_depth_from_node - awd.depth_from_node AS depth_from_root
           FROM ancestors_with_depth awd
        ), aggregated AS (
         SELECT p.asset_node_id,
            n.code AS asset_code,
            n.name AS asset_name,
            n.node_kind AS asset_node_kind,
            n.asset_type,
            n.qr_code AS asset_qr_code,
            string_agg(p.ancestor_name::text, ' > '::text ORDER BY p.depth_from_root) AS breadcrumb_text,
            min(
                CASE
                    WHEN p.depth_from_root = 0 THEN p.ancestor_id::text
                    ELSE NULL::text
                END)::uuid AS root_id,
            min(
                CASE
                    WHEN p.depth_from_root = 0 THEN p.ancestor_name
                    ELSE NULL::character varying
                END::text) AS root_name,
            min(
                CASE
                    WHEN p.ancestor_node_kind::text = 'SITE'::text THEN p.ancestor_id::text
                    ELSE NULL::text
                END)::uuid AS site_id,
            min(
                CASE
                    WHEN p.ancestor_node_kind::text = 'SITE'::text THEN p.ancestor_name
                    ELSE NULL::character varying
                END::text) AS site_name,
            min(
                CASE
                    WHEN p.ancestor_node_kind::text = 'MACHINE'::text THEN p.ancestor_id::text
                    ELSE NULL::text
                END)::uuid AS machine_id,
            min(
                CASE
                    WHEN p.ancestor_node_kind::text = 'MACHINE'::text THEN p.ancestor_name
                    ELSE NULL::character varying
                END::text) AS machine_name,
            max(p.depth_from_root) AS depth_from_root
           FROM path_ordered p
             JOIN asset_nodes n ON n.id = p.asset_node_id AND n.deleted_at IS NULL
          GROUP BY p.asset_node_id, n.code, n.name, n.node_kind, n.asset_type, n.qr_code
        )
 SELECT asset_node_id,
    asset_code,
    asset_name,
    asset_node_kind,
    asset_type,
    asset_qr_code,
    breadcrumb_text,
    root_id,
    root_name,
    site_id,
    site_name,
    machine_id,
    machine_name,
    depth_from_root
   FROM aggregated;


-- public.vw_asset_last_event fonte

CREATE OR REPLACE VIEW public.vw_asset_last_event
AS WITH ranked_events AS (
         SELECT n.id AS asset_node_id,
            n.code AS asset_code,
            n.name AS asset_name,
            n.node_kind AS asset_node_kind,
            n.asset_type,
            n.qr_code AS asset_qr_code,
            e.id AS last_event_id,
            e.event_type AS last_event_type,
            e.event_date AS last_event_date,
            e.title AS last_event_title,
            e.description AS last_event_description,
            e.performed_by AS last_performed_by,
            e.useful_life_days AS last_useful_life_days,
            e.next_due_date AS last_next_due_date,
            e.severity AS last_event_severity,
            e.status AS last_event_status,
            e.source AS last_event_source,
            row_number() OVER (PARTITION BY e.asset_node_id ORDER BY e.event_date DESC, e.created_at DESC, e.id DESC) AS rn
           FROM asset_events e
             JOIN asset_nodes n ON n.id = e.asset_node_id
          WHERE e.deleted_at IS NULL AND n.deleted_at IS NULL
        )
 SELECT asset_node_id,
    asset_code,
    asset_name,
    asset_node_kind,
    asset_type,
    asset_qr_code,
    last_event_id,
    last_event_type,
    last_event_date,
    last_event_title,
    last_event_description,
    last_performed_by,
    last_useful_life_days,
    last_next_due_date,
    last_event_severity,
    last_event_status,
    last_event_source
   FROM ranked_events
  WHERE rn = 1;


-- public.vw_machine_health fonte

CREATE OR REPLACE VIEW public.vw_machine_health
AS WITH RECURSIVE machines AS (
         SELECT m_1.id AS machine_id,
            m_1.code AS machine_code,
            m_1.name AS machine_name
           FROM asset_nodes m_1
          WHERE m_1.node_kind::text = 'MACHINE'::text AND m_1.deleted_at IS NULL
        ), subtree AS (
         SELECT m_1.machine_id AS root_machine_id,
            m_1.machine_id AS asset_id,
            0 AS level
           FROM machines m_1
        UNION ALL
         SELECT s.root_machine_id,
            n.id AS asset_id,
            s.level + 1 AS level
           FROM asset_nodes n
             JOIN subtree s ON n.parent_id = s.asset_id
          WHERE n.deleted_at IS NULL
        ), qr_assets AS (
         SELECT s.root_machine_id,
            s.asset_id AS qr_asset_id
           FROM subtree s
             JOIN asset_nodes n ON n.id = s.asset_id
          WHERE n.has_qr = true AND n.deleted_at IS NULL
        ), asset_last_event AS (
         SELECT e.asset_node_id,
            e.next_due_date,
            e.event_date,
            row_number() OVER (PARTITION BY e.asset_node_id ORDER BY e.event_date DESC, e.created_at DESC) AS rn
           FROM asset_events e
             JOIN qr_assets qa ON qa.qr_asset_id = e.asset_node_id
          WHERE e.deleted_at IS NULL
        ), qr_assets_with_status AS (
         SELECT qa.root_machine_id,
            qa.qr_asset_id,
            le.next_due_date,
                CASE
                    WHEN le.asset_node_id IS NULL THEN 'SEM_HISTORICO'::text
                    WHEN le.next_due_date IS NULL THEN 'SEM_HISTORICO'::text
                    WHEN le.next_due_date < now() THEN 'VENCIDO'::text
                    WHEN le.next_due_date <= (now() + '15 days'::interval) THEN 'ATENCAO'::text
                    ELSE 'OK'::text
                END AS qr_status
           FROM qr_assets qa
             LEFT JOIN asset_last_event le ON le.asset_node_id = qa.qr_asset_id AND le.rn = 1
        ), machine_aggregates AS (
         SELECT q.root_machine_id AS machine_id,
            count(*) AS total_qr_assets,
            sum(
                CASE
                    WHEN q.qr_status = 'OK'::text THEN 1
                    ELSE 0
                END) AS qr_ok,
            sum(
                CASE
                    WHEN q.qr_status = 'ATENCAO'::text THEN 1
                    ELSE 0
                END) AS qr_atencao,
            sum(
                CASE
                    WHEN q.qr_status = 'VENCIDO'::text THEN 1
                    ELSE 0
                END) AS qr_vencido,
            sum(
                CASE
                    WHEN q.qr_status = 'SEM_HISTORICO'::text THEN 1
                    ELSE 0
                END) AS qr_sem_historico
           FROM qr_assets_with_status q
          GROUP BY q.root_machine_id
        )
 SELECT m.machine_id,
    m.machine_code,
    m.machine_name,
    COALESCE(a.total_qr_assets, 0::bigint) AS total_qr_assets,
    COALESCE(a.qr_ok, 0::bigint) AS qr_ok,
    COALESCE(a.qr_atencao, 0::bigint) AS qr_atencao,
    COALESCE(a.qr_vencido, 0::bigint) AS qr_vencido,
    COALESCE(a.qr_sem_historico, 0::bigint) AS qr_sem_historico,
        CASE
            WHEN COALESCE(a.total_qr_assets, 0::bigint) = 0 THEN 0::numeric
            ELSE a.qr_ok::numeric * 100.0 / a.total_qr_assets::numeric
        END AS pct_ok,
        CASE
            WHEN COALESCE(a.total_qr_assets, 0::bigint) = 0 THEN 0::numeric
            ELSE a.qr_atencao::numeric * 100.0 / a.total_qr_assets::numeric
        END AS pct_atencao,
        CASE
            WHEN COALESCE(a.total_qr_assets, 0::bigint) = 0 THEN 0::numeric
            ELSE a.qr_vencido::numeric * 100.0 / a.total_qr_assets::numeric
        END AS pct_vencido,
        CASE
            WHEN COALESCE(a.total_qr_assets, 0::bigint) = 0 THEN 0::numeric
            ELSE a.qr_sem_historico::numeric * 100.0 / a.total_qr_assets::numeric
        END AS pct_sem_historico,
        CASE
            WHEN COALESCE(a.qr_vencido, 0::bigint) > 0 THEN 'CRITICO'::text
            WHEN COALESCE(a.qr_atencao, 0::bigint) > 0 THEN 'ATENCAO'::text
            WHEN COALESCE(a.qr_ok, 0::bigint) > 0 THEN 'OK'::text
            ELSE 'SEM_DADOS'::text
        END AS machine_health_status
   FROM machines m
     LEFT JOIN machine_aggregates a ON a.machine_id = m.machine_id;


-- public.vw_machine_qr_inventory fonte

CREATE OR REPLACE VIEW public.vw_machine_qr_inventory
AS WITH RECURSIVE machines AS (
         SELECT m.id AS machine_id,
            m.code AS machine_code,
            m.name AS machine_name,
            m.asset_type AS machine_asset_type,
            m.parent_id AS machine_parent_id,
            site_anc.id AS site_id,
            site_anc.name AS site_name
           FROM asset_nodes m
             LEFT JOIN LATERAL ( WITH RECURSIVE ancestors AS (
                         SELECT p.id,
                            p.parent_id,
                            p.name,
                            p.node_kind
                           FROM asset_nodes p
                          WHERE p.id = m.parent_id AND p.deleted_at IS NULL
                        UNION ALL
                         SELECT ap.id,
                            ap.parent_id,
                            ap.name,
                            ap.node_kind
                           FROM asset_nodes ap
                             JOIN ancestors an ON ap.id = an.parent_id
                          WHERE ap.deleted_at IS NULL
                        )
                 SELECT a.id,
                    a.name
                   FROM ancestors a
                  WHERE a.node_kind::text = 'SITE'::text
                  ORDER BY a.id
                 LIMIT 1) site_anc(id, name) ON true
          WHERE m.node_kind::text = 'MACHINE'::text AND m.deleted_at IS NULL
        ), subtree AS (
         SELECT m.machine_id,
            m.machine_code,
            m.machine_name,
            m.site_id,
            m.site_name,
            m.machine_id AS asset_node_id,
            m.machine_code AS asset_code,
            m.machine_name AS asset_name,
            'MACHINE'::character varying AS asset_node_kind,
            m.machine_asset_type AS asset_type,
            0 AS depth_from_machine,
            m.machine_name::text AS breadcrumb_text
           FROM machines m
        UNION ALL
         SELECT s_1.machine_id,
            s_1.machine_code,
            s_1.machine_name,
            s_1.site_id,
            s_1.site_name,
            n_1.id AS asset_node_id,
            n_1.code AS asset_code,
            n_1.name AS asset_name,
            n_1.node_kind AS asset_node_kind,
            n_1.asset_type,
            s_1.depth_from_machine + 1 AS depth_from_machine,
            (s_1.breadcrumb_text || ' / '::text) || n_1.name::text AS breadcrumb_text
           FROM asset_nodes n_1
             JOIN subtree s_1 ON n_1.parent_id = s_1.asset_node_id
          WHERE n_1.deleted_at IS NULL
        ), latest_events AS (
         SELECT DISTINCT ON (e.asset_node_id) e.asset_node_id,
            e.event_type AS last_event_type,
            e.event_date AS last_event_date,
            e.next_due_date
           FROM asset_events e
          WHERE e.deleted_at IS NULL
          ORDER BY e.asset_node_id, e.event_date DESC
        )
 SELECT s.machine_id,
    s.machine_code,
    s.machine_name,
    s.site_id,
    s.site_name,
    n.id AS asset_node_id,
    n.code AS asset_code,
    n.name AS asset_name,
    n.node_kind AS asset_node_kind,
    n.asset_type,
    n.qr_code,
    s.breadcrumb_text,
    s.depth_from_machine,
    le.last_event_type,
    le.last_event_date,
    le.next_due_date,
        CASE
            WHEN le.next_due_date IS NULL THEN 'SEM_HISTORICO'::text
            WHEN le.next_due_date < now() THEN 'VENCIDO'::text
            WHEN le.next_due_date <= (now() + '15 days'::interval) THEN 'ATENCAO'::text
            ELSE 'OK'::text
        END AS radar_status
   FROM subtree s
     JOIN asset_nodes n ON n.id = s.asset_node_id
     LEFT JOIN latest_events le ON le.asset_node_id = n.id
  WHERE n.deleted_at IS NULL AND n.has_qr = true;


-- public.vw_machine_summary fonte

CREATE OR REPLACE VIEW public.vw_machine_summary
AS WITH RECURSIVE machines AS (
         SELECT an.id AS machine_id,
            an.code AS machine_code,
            an.name AS machine_name,
            an.parent_id
           FROM asset_nodes an
          WHERE an.node_kind::text = 'MACHINE'::text AND an.deleted_at IS NULL
        ), ancestors AS (
         SELECT m_1.machine_id,
            m_1.machine_code,
            m_1.machine_name,
            m_1.parent_id AS ancestor_id,
            0 AS level
           FROM machines m_1
        UNION ALL
         SELECT a.machine_id,
            a.machine_code,
            a.machine_name,
            p.parent_id AS ancestor_id,
            a.level + 1 AS level
           FROM ancestors a
             JOIN asset_nodes p ON p.id = a.ancestor_id AND p.deleted_at IS NULL
        ), machine_site AS (
         SELECT DISTINCT ON (m_1.machine_id) m_1.machine_id,
            s.id AS site_id,
            s.name AS site_name
           FROM machines m_1
             LEFT JOIN asset_nodes s ON s.id = m_1.parent_id AND s.node_kind::text = 'SITE'::text AND s.deleted_at IS NULL
        UNION
         SELECT DISTINCT ON (a.machine_id) a.machine_id,
            s.id AS site_id,
            s.name AS site_name
           FROM ancestors a
             JOIN asset_nodes s ON s.id = a.ancestor_id AND s.node_kind::text = 'SITE'::text AND s.deleted_at IS NULL
  ORDER BY 1, 2
        ), subtree AS (
         SELECT m_1.machine_id,
            an.id AS node_id,
            an.parent_id
           FROM machines m_1
             JOIN asset_nodes an ON an.id = m_1.machine_id AND an.deleted_at IS NULL
        UNION ALL
         SELECT s.machine_id,
            an.id AS node_id,
            an.parent_id
           FROM subtree s
             JOIN asset_nodes an ON an.parent_id = s.node_id AND an.deleted_at IS NULL
        ), asset_stats AS (
         SELECT s.machine_id,
            count(*) AS total_assets,
            count(*) FILTER (WHERE an.has_qr = true) AS total_qr_assets
           FROM subtree s
             JOIN asset_nodes an ON an.id = s.node_id AND an.deleted_at IS NULL
          GROUP BY s.machine_id
        ), machine_events AS (
         SELECT s.machine_id,
            max(e.event_date) AS last_event_date
           FROM subtree s
             JOIN asset_events e ON e.asset_node_id = s.node_id AND e.deleted_at IS NULL
          GROUP BY s.machine_id
        ), asset_events_ranked AS (
         SELECT e.id,
            e.asset_node_id,
            e.event_type,
            e.event_date,
            e.title,
            e.description,
            e.performed_by,
            e.useful_life_days,
            e.next_due_date,
            e.severity,
            e.status,
            e.source,
            e.reference_type,
            e.reference_id,
            e.created_at,
            e.updated_at,
            e.deleted_at,
            row_number() OVER (PARTITION BY e.asset_node_id ORDER BY e.event_date DESC, e.created_at DESC) AS rn
           FROM asset_events e
          WHERE e.deleted_at IS NULL
        ), asset_current_event AS (
         SELECT asset_events_ranked.asset_node_id,
            asset_events_ranked.event_date,
            asset_events_ranked.next_due_date
           FROM asset_events_ranked
          WHERE asset_events_ranked.rn = 1
        ), qr_radar AS (
         SELECT s.machine_id,
            an.id AS asset_node_id,
            an.has_qr,
            ace.next_due_date,
                CASE
                    WHEN an.has_qr IS NOT TRUE THEN 'SEM_QR'::text
                    WHEN ace.next_due_date IS NULL THEN 'SEM_HISTORICO'::text
                    WHEN ace.next_due_date < now() THEN 'VENCIDO'::text
                    WHEN ace.next_due_date <= (now() + '7 days'::interval) THEN 'ATENCAO'::text
                    ELSE 'OK'::text
                END AS qr_status
           FROM subtree s
             JOIN asset_nodes an ON an.id = s.node_id AND an.deleted_at IS NULL
             LEFT JOIN asset_current_event ace ON ace.asset_node_id = an.id
          WHERE an.has_qr = true
        ), qr_agg AS (
         SELECT qr_radar.machine_id,
            count(*) AS total_qr_assets,
            count(*) FILTER (WHERE qr_radar.qr_status = 'OK'::text) AS qr_ok,
            count(*) FILTER (WHERE qr_radar.qr_status = 'ATENCAO'::text) AS qr_atencao,
            count(*) FILTER (WHERE qr_radar.qr_status = 'VENCIDO'::text) AS qr_vencido,
            count(*) FILTER (WHERE qr_radar.qr_status = 'SEM_HISTORICO'::text) AS qr_sem_historico,
            min(qr_radar.next_due_date) AS next_due_date_min
           FROM qr_radar
          GROUP BY qr_radar.machine_id
        ), machine_health AS (
         SELECT m_1.machine_id,
                CASE
                    WHEN qa_1.qr_vencido > 0 THEN 'VENCIDO'::text
                    WHEN qa_1.qr_atencao > 0 THEN 'ATENCAO'::text
                    WHEN COALESCE(qa_1.total_qr_assets, 0::bigint) = 0 OR COALESCE(qa_1.total_qr_assets, 0::bigint) = COALESCE(qa_1.qr_sem_historico, 0::bigint) THEN 'SEM_HISTORICO'::text
                    ELSE 'OK'::text
                END AS machine_health_status
           FROM machines m_1
             LEFT JOIN qr_agg qa_1 ON qa_1.machine_id = m_1.machine_id
        )
 SELECT m.machine_id,
    m.machine_code,
    m.machine_name,
    ms.site_id,
    ms.site_name,
    COALESCE(ast.total_assets, 0::bigint) AS total_assets,
    COALESCE(ast.total_qr_assets, 0::bigint) AS total_qr_assets,
    me.last_event_date,
    qa.next_due_date_min,
    mh.machine_health_status,
    COALESCE(qa.qr_ok, 0::bigint) AS qr_ok,
    COALESCE(qa.qr_atencao, 0::bigint) AS qr_atencao,
    COALESCE(qa.qr_vencido, 0::bigint) AS qr_vencido,
    COALESCE(qa.qr_sem_historico, 0::bigint) AS qr_sem_historico
   FROM machines m
     LEFT JOIN machine_site ms ON ms.machine_id = m.machine_id
     LEFT JOIN asset_stats ast ON ast.machine_id = m.machine_id
     LEFT JOIN machine_events me ON me.machine_id = m.machine_id
     LEFT JOIN qr_agg qa ON qa.machine_id = m.machine_id
     LEFT JOIN machine_health mh ON mh.machine_id = m.machine_id;


-- public.vw_machine_timeline fonte

CREATE OR REPLACE VIEW public.vw_machine_timeline
AS WITH RECURSIVE ancestor_tree AS (
         SELECT n_1.id AS node_id,
            n_1.parent_id,
            n_1.id AS ancestor_id,
            n_1.node_kind AS ancestor_kind,
            0 AS depth
           FROM asset_nodes n_1
          WHERE n_1.deleted_at IS NULL
        UNION ALL
         SELECT at.node_id,
            p.parent_id,
            p.id AS ancestor_id,
            p.node_kind AS ancestor_kind,
            at.depth + 1 AS depth
           FROM ancestor_tree at
             JOIN asset_nodes p ON at.parent_id = p.id
          WHERE p.deleted_at IS NULL
        ), machine_per_node AS (
         SELECT ranked.node_id,
            ranked.ancestor_id AS machine_id
           FROM ( SELECT at.node_id,
                    at.ancestor_id,
                    at.depth,
                    row_number() OVER (PARTITION BY at.node_id ORDER BY at.depth) AS rn
                   FROM ancestor_tree at
                  WHERE at.ancestor_kind::text = 'MACHINE'::text) ranked
          WHERE ranked.rn = 1
        ), machine_site AS (
         SELECT ranked.machine_id,
            ranked.site_id
           FROM ( SELECT m_1.machine_id,
                    at2.ancestor_id AS site_id,
                    at2.depth,
                    row_number() OVER (PARTITION BY m_1.machine_id ORDER BY at2.depth) AS rn
                   FROM machine_per_node m_1
                     JOIN ancestor_tree at2 ON at2.node_id = m_1.machine_id
                  WHERE at2.ancestor_kind::text = 'SITE'::text AND at2.depth > 0) ranked
          WHERE ranked.rn = 1
        )
 SELECT e.id AS event_id,
    e.event_type,
    e.event_date,
    e.title AS event_title,
    e.description AS event_description,
    e.performed_by,
    e.useful_life_days,
    e.next_due_date,
    e.severity AS event_severity,
    e.status AS event_status,
    e.source AS event_source,
    n.id AS asset_node_id,
    n.code AS asset_code,
    n.name AS asset_name,
    n.node_kind AS asset_node_kind,
    n.asset_type,
    n.qr_code AS asset_qr_code,
    m.machine_id,
    mn.code AS machine_code,
    mn.name AS machine_name,
    s.site_id,
    sn.code AS site_code,
    sn.name AS site_name
   FROM asset_events e
     JOIN asset_nodes n ON e.asset_node_id = n.id AND n.deleted_at IS NULL
     JOIN machine_per_node m ON m.node_id = n.id
     JOIN asset_nodes mn ON mn.id = m.machine_id AND mn.deleted_at IS NULL
     LEFT JOIN machine_site s ON s.machine_id = m.machine_id
     LEFT JOIN asset_nodes sn ON sn.id = s.site_id AND sn.deleted_at IS NULL
  WHERE e.deleted_at IS NULL;


-- public.vw_machine_tree_nodes fonte

CREATE OR REPLACE VIEW public.vw_machine_tree_nodes
AS WITH RECURSIVE machine_roots AS (
         SELECT an.id AS machine_id,
            an.code AS machine_code,
            an.name AS machine_name
           FROM asset_nodes an
          WHERE an.node_kind::text = 'MACHINE'::text AND an.deleted_at IS NULL
        ), machine_subtree AS (
         SELECT mr.machine_id,
            mr.machine_code,
            mr.machine_name,
            an.id AS asset_node_id,
            an.parent_id,
            an.code AS asset_code,
            an.name AS asset_name,
            an.node_kind AS asset_node_kind,
            an.asset_type,
            an.qr_code AS asset_qr_code,
            an.has_qr,
            0 AS depth_from_machine,
            true AS is_machine_root
           FROM machine_roots mr
             JOIN asset_nodes an ON an.id = mr.machine_id
          WHERE an.deleted_at IS NULL
        UNION ALL
         SELECT ms.machine_id,
            ms.machine_code,
            ms.machine_name,
            child.id AS asset_node_id,
            child.parent_id,
            child.code AS asset_code,
            child.name AS asset_name,
            child.node_kind AS asset_node_kind,
            child.asset_type,
            child.qr_code AS asset_qr_code,
            child.has_qr,
            ms.depth_from_machine + 1 AS depth_from_machine,
            false AS is_machine_root
           FROM machine_subtree ms
             JOIN asset_nodes child ON child.parent_id = ms.asset_node_id
          WHERE child.deleted_at IS NULL
        )
 SELECT machine_id,
    machine_code,
    machine_name,
    asset_node_id,
    parent_id,
    asset_code,
    asset_name,
    asset_node_kind,
    asset_type,
    asset_qr_code,
    has_qr,
    depth_from_machine,
    is_machine_root
   FROM machine_subtree;


-- public.vw_site_health fonte

CREATE OR REPLACE VIEW public.vw_site_health
AS WITH machine_with_site AS (
         SELECT mh.machine_id,
            mh.machine_health_status AS health_status,
            s.id AS site_id,
            s.code AS site_code,
            s.name AS site_name
           FROM vw_machine_health mh
             JOIN asset_nodes m ON m.id = mh.machine_id AND m.deleted_at IS NULL AND m.node_kind::text = 'MACHINE'::text
             JOIN LATERAL ( WITH RECURSIVE ancestors AS (
                         SELECT n.id,
                            n.parent_id,
                            n.code,
                            n.name,
                            n.node_kind,
                            0 AS depth
                           FROM asset_nodes n
                          WHERE n.id = m.id AND n.deleted_at IS NULL
                        UNION ALL
                         SELECT p.id,
                            p.parent_id,
                            p.code,
                            p.name,
                            p.node_kind,
                            a_1.depth + 1 AS depth
                           FROM asset_nodes p
                             JOIN ancestors a_1 ON p.id = a_1.parent_id
                          WHERE p.deleted_at IS NULL
                        )
                 SELECT a.id,
                    a.code,
                    a.name
                   FROM ancestors a
                  WHERE a.node_kind::text = 'SITE'::text
                  ORDER BY a.depth
                 LIMIT 1) s ON true
        ), site_agg AS (
         SELECT machine_with_site.site_id,
            machine_with_site.site_code,
            machine_with_site.site_name,
            count(*) AS total_machines,
            count(*) FILTER (WHERE machine_with_site.health_status = 'OK'::text) AS machines_ok,
            count(*) FILTER (WHERE machine_with_site.health_status = 'ATENCAO'::text) AS machines_atencao,
            count(*) FILTER (WHERE machine_with_site.health_status = 'CRITICO'::text) AS machines_critico,
            count(*) FILTER (WHERE machine_with_site.health_status = 'SEM_DADOS'::text) AS machines_sem_dados
           FROM machine_with_site
          GROUP BY machine_with_site.site_id, machine_with_site.site_code, machine_with_site.site_name
        )
 SELECT site_id,
    site_code,
    site_name,
    total_machines,
    machines_ok,
    machines_atencao,
    machines_critico,
    machines_sem_dados,
        CASE
            WHEN total_machines > 0 THEN machines_ok::numeric * 100.0 / total_machines::numeric
            ELSE NULL::numeric
        END AS pct_machines_ok,
        CASE
            WHEN total_machines > 0 THEN machines_atencao::numeric * 100.0 / total_machines::numeric
            ELSE NULL::numeric
        END AS pct_machines_atencao,
        CASE
            WHEN total_machines > 0 THEN machines_critico::numeric * 100.0 / total_machines::numeric
            ELSE NULL::numeric
        END AS pct_machines_critico,
        CASE
            WHEN total_machines > 0 THEN machines_sem_dados::numeric * 100.0 / total_machines::numeric
            ELSE NULL::numeric
        END AS pct_machines_sem_dados
   FROM site_agg sa;



-- DROP FUNCTION public.armor(bytea);

CREATE OR REPLACE FUNCTION public.armor(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$
;

-- DROP FUNCTION public.armor(bytea, _text, _text);

CREATE OR REPLACE FUNCTION public.armor(bytea, text[], text[])
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$
;

-- DROP FUNCTION public.crypt(text, text);

CREATE OR REPLACE FUNCTION public.crypt(text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_crypt$function$
;

-- DROP FUNCTION public.dearmor(text);

CREATE OR REPLACE FUNCTION public.dearmor(text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_dearmor$function$
;

-- DROP FUNCTION public.decrypt(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.decrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt$function$
;

-- DROP FUNCTION public.decrypt_iv(bytea, bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.decrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt_iv$function$
;

-- DROP FUNCTION public.digest(text, text);

CREATE OR REPLACE FUNCTION public.digest(text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$
;

-- DROP FUNCTION public.digest(bytea, text);

CREATE OR REPLACE FUNCTION public.digest(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$
;

-- DROP FUNCTION public.encrypt(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.encrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt$function$
;

-- DROP FUNCTION public.encrypt_iv(bytea, bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.encrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt_iv$function$
;

-- DROP FUNCTION public.fips_mode();

CREATE OR REPLACE FUNCTION public.fips_mode()
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_check_fipsmode$function$
;

-- DROP FUNCTION public.gen_random_bytes(int4);

CREATE OR REPLACE FUNCTION public.gen_random_bytes(integer)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_random_bytes$function$
;

-- DROP FUNCTION public.gen_random_uuid();

CREATE OR REPLACE FUNCTION public.gen_random_uuid()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/pgcrypto', $function$pg_random_uuid$function$
;

-- DROP FUNCTION public.gen_salt(text);

CREATE OR REPLACE FUNCTION public.gen_salt(text)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt$function$
;

-- DROP FUNCTION public.gen_salt(text, int4);

CREATE OR REPLACE FUNCTION public.gen_salt(text, integer)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt_rounds$function$
;

-- DROP FUNCTION public.hmac(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.hmac(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$
;

-- DROP FUNCTION public.hmac(text, text, text);

CREATE OR REPLACE FUNCTION public.hmac(text, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$
;

-- DROP FUNCTION public.pgp_armor_headers(in text, out text, out text);

CREATE OR REPLACE FUNCTION public.pgp_armor_headers(text, OUT key text, OUT value text)
 RETURNS SETOF record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_armor_headers$function$
;

-- DROP FUNCTION public.pgp_key_id(bytea);

CREATE OR REPLACE FUNCTION public.pgp_key_id(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_key_id_w$function$
;

-- DROP FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
;

-- DROP FUNCTION public.pgp_pub_decrypt(bytea, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
;

-- DROP FUNCTION public.pgp_pub_decrypt(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
;

-- DROP FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_pub_encrypt(text, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt(text, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$
;

-- DROP FUNCTION public.pgp_pub_encrypt(text, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt(text, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$
;

-- DROP FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_sym_decrypt(bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt(bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$
;

-- DROP FUNCTION public.pgp_sym_decrypt(bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt(bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$
;

-- DROP FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_sym_decrypt_bytea(bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_sym_encrypt(text, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt(text, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$
;

-- DROP FUNCTION public.pgp_sym_encrypt(text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt(text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$
;

-- DROP FUNCTION public.pgp_sym_encrypt_bytea(bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$
;

-- DROP FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;