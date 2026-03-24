-- Autenticação web SGM: utilizadores com senha hasheada (bcryptjs no app Node)

CREATE TABLE IF NOT EXISTS public.sgm_users (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  username varchar(190) NOT NULL,
  email varchar(320) NULL,
  password_hash varchar(255) NOT NULL,
  display_name varchar(255) NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  role varchar(64) DEFAULT 'admin'::character varying NOT NULL,
  collaborator_id uuid NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  last_login_at timestamptz NULL,
  deleted_at timestamptz NULL,
  CONSTRAINT sgm_users_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sgm_users_username_active
  ON public.sgm_users (lower((username)::text))
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_sgm_users_email_active
  ON public.sgm_users (lower((email)::text))
  WHERE deleted_at IS NULL AND email IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_sgm_users_deleted_at ON public.sgm_users USING btree (deleted_at);

DROP TRIGGER IF EXISTS trg_sgm_users_set_updated_at ON public.sgm_users;
CREATE TRIGGER trg_sgm_users_set_updated_at
  BEFORE UPDATE ON public.sgm_users
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();
