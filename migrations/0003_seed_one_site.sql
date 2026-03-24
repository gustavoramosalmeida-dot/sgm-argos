-- Seed: garantir ao menos uma planta (SITE) para a tela Plantas
-- Só insere se ainda não existir nenhum SITE.

INSERT INTO public.asset_nodes (
  id,
  parent_id,
  code,
  name,
  description,
  node_kind,
  status,
  has_qr
)
SELECT
  'a944b47c-30ef-405a-9661-b0b633c04dc0'::uuid,
  NULL,
  'PLANTA-001',
  'Bravo Tapeçaria — Produção',
  'Planta industrial principal - setor de produção.',
  'SITE',
  'ACTIVE',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.asset_nodes
  WHERE node_kind = 'SITE' AND deleted_at IS NULL
);
