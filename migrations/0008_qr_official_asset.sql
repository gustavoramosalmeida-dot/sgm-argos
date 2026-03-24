-- QR oficial por ativo: public_code sequencial + auditoria de resolução pública

CREATE SEQUENCE IF NOT EXISTS public.sgm_asset_public_code_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 999999
  NO CYCLE;

ALTER TABLE public.asset_nodes
  ADD COLUMN IF NOT EXISTS public_code varchar(15) NULL,
  ADD COLUMN IF NOT EXISTS qr_generated_at timestamptz NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_asset_nodes_public_code
  ON public.asset_nodes (public_code)
  WHERE public_code IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_asset_nodes_public_code_resolve
  ON public.asset_nodes (public_code)
  WHERE deleted_at IS NULL AND public_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.qr_resolve_audits (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  public_code varchar(15) NOT NULL,
  asset_id uuid NULL,
  user_id varchar(255) NULL,
  outcome varchar(32) NOT NULL,
  requested_at timestamptz DEFAULT now() NOT NULL,
  request_origin text NULL,
  selected_context jsonb NULL,
  metadata jsonb NULL,
  CONSTRAINT qr_resolve_audits_pkey PRIMARY KEY (id),
  CONSTRAINT qr_resolve_audits_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.asset_nodes (id) ON DELETE SET NULL,
  CONSTRAINT qr_resolve_audits_outcome_check CHECK (
    (outcome)::text = ANY (
      ARRAY['resolved'::character varying, 'not_found'::character varying, 'unauthenticated'::character varying, 'unauthorized'::character varying]::text[]
    )
  )
);

CREATE INDEX IF NOT EXISTS ix_qr_resolve_audits_public_code ON public.qr_resolve_audits (public_code);
CREATE INDEX IF NOT EXISTS ix_qr_resolve_audits_requested_at ON public.qr_resolve_audits (requested_at DESC);
