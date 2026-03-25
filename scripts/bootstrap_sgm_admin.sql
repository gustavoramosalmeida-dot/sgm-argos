-- Bootstrap inicial: utilizador administrador SGM (PostgreSQL / EC2).
-- Idempotente: não insere se já existir linha ativa (deleted_at IS NULL) com o mesmo
-- username ou email (evita violação dos índices únicos parciais).
-- Senha em texto claro: 12345678 — trocar por uma senha forte em produção.
-- password_hash: bcrypt cost 10 (bcryptjs). Sem pgcrypto (compatível com servidores sem contrib).
-- O UPDATE seguinte alinha a senha do admin existente ao mesmo hash (ex.: após bootstrap antigo).
-- Validação: SELECT final confirma o registo do admin.

INSERT INTO public.sgm_users (
  username,
  email,
  password_hash,
  display_name,
  is_active,
  role,
  collaborator_id,
  created_at,
  updated_at,
  last_login_at,
  deleted_at
)
SELECT
  'admin',
  'admin@sgm.local',
  '$2a$10$OPviDc3sn/TrZ0JMw9Dkbu8nGtC3neQBsVMOktctrJXYWlIW5a66O',
  'Administrador',
  true,
  'admin',
  NULL::uuid,
  now(),
  now(),
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM public.sgm_users u
  WHERE u.deleted_at IS NULL
    AND (
      lower(u.username) = lower('admin')
      OR (
        u.email IS NOT NULL
        AND lower(btrim(u.email)) = lower('admin@sgm.local')
      )
    )
);

UPDATE public.sgm_users
SET
  password_hash = '$2a$10$OPviDc3sn/TrZ0JMw9Dkbu8nGtC3neQBsVMOktctrJXYWlIW5a66O',
  updated_at = now()
WHERE lower(username) = lower('admin')
  AND deleted_at IS NULL;

-- Validação: confirmar que o admin existe e está ativo / não apagado
SELECT
  id,
  username,
  email,
  display_name,
  is_active,
  role,
  collaborator_id,
  created_at,
  updated_at,
  last_login_at,
  deleted_at
FROM public.sgm_users
WHERE lower(username) = lower('admin')
  AND deleted_at IS NULL;
